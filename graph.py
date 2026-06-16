class Graph:
    def __init__(self):
        self.nodes = {}              # node id  ->  (lat, lon)
        self.adj   = {}              # node id  ->  [(neighbour, weight), ...]

    def add_node(self, node_id, lat, lon):
        self.nodes[node_id] = (lat, lon)
        self.adj.setdefault(node_id, [])

    def add_edge(self, u, v, weight, two_way=True):
        self.adj[u].append((v, weight))
        if two_way:
            self.adj[v].append((u, weight))

    def neighbors(self, node_id):
        return self.adj.get(node_id, [])
