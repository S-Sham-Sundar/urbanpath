from graph import Graph
from heuristics import haversine


# ── SYNTHETIC GRID (use this while developing and testing) ──────────────────

def build_grid_city(rows, cols, base_lat=13.08, base_lon=80.27, spacing=0.001):
    """
    Builds a perfectly even grid of intersections — like graph paper.
    Default coordinates put the grid over Chennai.

    rows, cols  : how many streets in each direction
    base_lat/lon: the top-left corner of the grid
    spacing     : gap between streets in degrees (~110 m per 0.001)
    """
    graph = Graph()

    def node_id(r, c):
        return r * cols + c                       # turn (row, col) into one number

    # 1) drop an intersection at every grid point
    for r in range(rows):
        for c in range(cols):
            lat = base_lat + r * spacing
            lon = base_lon + c * spacing
            graph.add_node(node_id(r, c), lat, lon)

    # 2) join each corner to its right and bottom neighbour
    for r in range(rows):
        for c in range(cols):
            here = node_id(r, c)
            if c + 1 < cols:                      # road to the right
                right = node_id(r, c + 1)
                graph.add_edge(here, right, road_cost(graph, here, right))
            if r + 1 < rows:                      # road downward
                below = node_id(r + 1, c)
                graph.add_edge(here, below, road_cost(graph, here, below))

    return graph


def road_cost(graph, a, b):
    """Weight of a road = real-world distance between its two endpoints in km."""
    (lat1, lon1), (lat2, lon2) = graph.nodes[a], graph.nodes[b]
    return haversine(lat1, lon1, lat2, lon2)


# ── OPENSTREETMAP LOADER (use this for the live app) ────────────────────────

def load_osm(filepath):
    """
    Parses a .osm XML file and returns a filled Graph.

    OSM format:
      <node id="..." lat="..." lon="..."/>
      <way>
        <nd ref="node_id"/>  (sequence of node ids forming a road)
        <tag k="highway" v="..."/>
      </way>

    Only ways tagged as drivable roads are loaded.
    """
    import xml.etree.ElementTree as ET

    DRIVABLE = {
        "motorway", "trunk", "primary", "secondary",
        "tertiary", "residential", "unclassified", "road",
    }

    tree = ET.parse(filepath)
    root = tree.getroot()
    graph = Graph()

    # pass 1: collect all node positions
    raw_nodes = {}
    for elem in root.iter("node"):
        nid = int(elem.attrib["id"])
        raw_nodes[nid] = (float(elem.attrib["lat"]), float(elem.attrib["lon"]))

    # pass 2: add road edges for drivable ways
    for way in root.iter("way"):
        highway = None
        for tag in way.iter("tag"):
            if tag.attrib.get("k") == "highway":
                highway = tag.attrib.get("v")
        if highway not in DRIVABLE:
            continue

        node_refs = [int(nd.attrib["ref"]) for nd in way.iter("nd")]
        for nid in node_refs:
            if nid in raw_nodes and nid not in graph.nodes:
                lat, lon = raw_nodes[nid]
                graph.add_node(nid, lat, lon)

        for i in range(len(node_refs) - 1):
            u, v = node_refs[i], node_refs[i + 1]
            if u in graph.nodes and v in graph.nodes:
                graph.add_edge(u, v, road_cost(graph, u, v))

    return graph


def build_city_graph(source="grid", osm_path=None, rows=100, cols=100):
    """
    Convenience entry point used by the API.
    Pass source="osm" and osm_path="city.osm" for the real city.
    """
    if source == "osm" and osm_path:
        return load_osm(osm_path)
    return build_grid_city(rows, cols)
