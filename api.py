from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from loader import build_city_graph
from cache import cached_route, cached_isochrone
from visualizer import bfs_with_frames, dijkstra_with_frames

app = FastAPI(title="UrbanPath — Developer A")

# ── Build the city graph ONCE at startup ────────────────────────────────────
# Change source="osm", osm_path="chennai.osm" when you have the real data file
graph = build_city_graph(source="grid", rows=100, cols=100)


# ── Response shapes ──────────────────────────────────────────────────────────

class RouteOut(BaseModel):
    path:        list[int]
    distance_km: float
    algorithm:   str

class IsochroneOut(BaseModel):
    reachable: dict[str, float]   # {node_id: arrival_time_minutes}

class GraphOut(BaseModel):
    nodes: dict[str, list]        # {node_id: [lat, lon]}
    edges: list[list]             # [[u, v, weight], ...]


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/route", response_model=RouteOut)
def get_route(source: int, target: int, algo: str = "astar"):
    """
    Returns the shortest path between two nodes.
    algo = "astar" (default, faster) or "dijkstra"
    """
    if source not in graph.nodes or target not in graph.nodes:
        raise HTTPException(status_code=404, detail="Unknown start or end node")

    answer = cached_route(graph, source, target, algo)

    if not answer["path"]:
        raise HTTPException(status_code=404, detail="No route between those points")

    return RouteOut(
        path=answer["path"],
        distance_km=answer["distance_km"],
        algorithm=algo,
    )


@app.get("/isochrone", response_model=IsochroneOut)
def get_isochrone(source: int, minutes: float = 15.0):
    """
    Returns all nodes reachable from source within `minutes` travel time.
    """
    if source not in graph.nodes:
        raise HTTPException(status_code=404, detail="Unknown source node")

    result = cached_isochrone(graph, source, minutes)
    return IsochroneOut(reachable={str(k): v for k, v in result.items()})


@app.get("/graph", response_model=GraphOut)
def get_graph(lat_min: float, lat_max: float, lon_min: float, lon_max: float):
    """
    Returns the nodes and edges within a bounding box — used to draw the map.
    """
    nodes = {
        str(nid): list(coords)
        for nid, coords in graph.nodes.items()
        if lat_min <= coords[0] <= lat_max and lon_min <= coords[1] <= lon_max
    }
    node_set = set(int(k) for k in nodes)
    edges = [
        [u, v, w]
        for u in node_set
        for v, w in graph.neighbors(u)
        if v in node_set
    ]
    return GraphOut(nodes=nodes, edges=edges)


@app.get("/visualize")
def get_visualize(source: int, algo: str = "bfs", target: int = None):
    """
    Returns step-by-step frames for the Algorithm Lab.
    algo = "bfs" (default) or "dijkstra"
    """
    if source not in graph.nodes:
        raise HTTPException(status_code=404, detail="Unknown source node")

    if algo == "dijkstra":
        if target is None or target not in graph.nodes:
            raise HTTPException(status_code=400, detail="Dijkstra needs a valid target")
        frames = dijkstra_with_frames(graph, source, target)
    else:
        frames = bfs_with_frames(graph, source)

    return {"algo": algo, "frames": frames}
