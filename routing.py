from min_heap import MinHeap
from heuristics import haversine


def reconstruct_path(prev, source, target):
    if target != source and target not in prev:
        return []                          # the goal was never reached
    path = [target]
    while path[-1] != source:
        path.append(prev[path[-1]])        # hop to the place we came from
    path.reverse()                         # we walked goal -> start, so flip it
    return path


def dijkstra(graph, source, target):
    dist    = {source: 0}        # cheapest cost found so far to each node
    prev    = {}                 # the node we arrived from (to rebuild the path)
    visited = set()              # nodes we are completely finished with
    heap    = MinHeap()
    heap.push(0, source)         # begin at the source, cost 0

    while not heap.is_empty():
        d, u = heap.pop()        # u is the cheapest unfinished node
        if u in visited:
            continue             # an old, worse copy of u -> ignore it
        visited.add(u)
        if u == target:
            break                # reached the goal, no need to explore more

        for v, weight in graph.neighbors(u):
            new_cost = d + weight
            if v not in dist or new_cost < dist[v]:
                dist[v] = new_cost
                prev[v] = u
                heap.push(new_cost, v)

    return reconstruct_path(prev, source, target), dist.get(target)


def a_star(graph, source, target):
    g_score = {source: 0}                       # real cost from start to a node
    prev, visited = {}, set()
    heap = MinHeap()
    tlat, tlon = graph.nodes[target]            # where the goal sits on Earth
    heap.push(0, source)

    while not heap.is_empty():
        _, u = heap.pop()
        if u in visited:
            continue
        visited.add(u)
        if u == target:
            break

        for v, weight in graph.neighbors(u):
            tentative = g_score[u] + weight
            if v not in g_score or tentative < g_score[v]:
                g_score[v] = tentative
                prev[v] = u
                vlat, vlon = graph.nodes[v]
                guess = haversine(vlat, vlon, tlat, tlon)   # distance left to goal
                heap.push(tentative + guess, v)             # cost so far + guess

    return reconstruct_path(prev, source, target), g_score.get(target)
