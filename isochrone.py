from min_heap import MinHeap


def isochrone(graph, source, minutes):
    """
    Returns every node reachable from `source` within `minutes` travel time,
    along with the fastest arrival time for each.

    Edge weights are treated as travel time in minutes.
    """
    best = {source: 0}                          # fastest arrival time to each node
    heap = MinHeap()
    heap.push(0, source)

    while not heap.is_empty():
        t, u = heap.pop()                       # u = soonest-reachable unfinished node
        if t > best.get(u, float("inf")):
            continue                            # a slower, stale copy -> skip it
        for v, travel_time in graph.neighbors(u):
            arrival = t + travel_time
            if arrival <= minutes and arrival < best.get(v, float("inf")):
                best[v] = arrival
                heap.push(arrival, v)

    return best                                 # {node_id: arrival_time} for all reachable
