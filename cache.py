import redis
import json

# Connect once at module load; reused for every request
cache = redis.Redis(host="localhost", port=6379, decode_responses=True)

ROUTE_TTL     = 300   # route answers expire after 5 minutes
ISOCHRONE_TTL = 120   # isochrone answers expire after 2 minutes


def cached_route(graph, source, target, algo="astar"):
    """
    Returns the route between source and target, using the cache when possible.
    algo = "astar" (default) or "dijkstra"
    """
    from routing import a_star, dijkstra

    key = f"route:{source}:{target}:{algo}"
    hit = cache.get(key)
    if hit is not None:                           # we have answered this before
        return json.loads(hit)                    # turn the saved text back into data

    path, dist = (a_star if algo == "astar" else dijkstra)(graph, source, target)
    answer = {"path": path, "distance_km": round(dist, 2) if dist else None}

    cache.setex(key, ROUTE_TTL, json.dumps(answer))   # remember for 5 minutes
    return answer


def cached_isochrone(graph, source, minutes):
    """
    Returns the isochrone dict {node: arrival_time}, using the cache when possible.
    """
    from isochrone import isochrone

    key = f"isochrone:{source}:{minutes}"
    hit = cache.get(key)
    if hit is not None:
        return json.loads(hit)

    result = isochrone(graph, source, minutes)
    # Redis keys must be strings; convert int node ids
    serialisable = {str(k): v for k, v in result.items()}
    cache.setex(key, ISOCHRONE_TTL, json.dumps(serialisable))
    return result


def preload_graph(graph):
    """
    Serialize and store the adjacency list in Redis on startup so the
    API can reload it quickly without re-parsing the OSM file.
    """
    payload = {
        "nodes": {str(k): list(v) for k, v in graph.nodes.items()},
        "adj":   {str(k): v       for k, v in graph.adj.items()},
    }
    cache.set("graph:adjacency", json.dumps(payload))
