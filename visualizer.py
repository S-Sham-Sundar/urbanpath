from collections import deque
from min_heap import MinHeap


def bfs_with_frames(graph, source):
    """
    Runs BFS and records a snapshot after each step.
    Returns a list of frames the frontend can play as an animation.
    """
    visited = {source}
    queue   = deque([source])
    frames  = []

    while queue:
        u = queue.popleft()
        newly_added = []
        for v, _ in graph.neighbors(u):
            if v not in visited:
                visited.add(v)
                queue.append(v)
                newly_added.append(v)

        frames.append({                    # one snapshot the screen can draw
            "current": u,
            "added":   newly_added,
            "queue":   list(queue),        # copy — so later steps don't overwrite this
            "visited": list(visited),
        })

    return frames


def dijkstra_with_frames(graph, source, target):
    """
    Runs Dijkstra and records a snapshot after each node is settled.
    Returns a list of frames the frontend can play as an animation.
    """
    dist    = {source: 0}
    prev    = {}
    visited = set()
    heap    = MinHeap()
    heap.push(0, source)
    frames  = []

    while not heap.is_empty():
        d, u = heap.pop()
        if u in visited:
            continue
        visited.add(u)

        newly_relaxed = []
        for v, weight in graph.neighbors(u):
            new_cost = d + weight
            if v not in dist or new_cost < dist[v]:
                dist[v] = new_cost
                prev[v] = u
                heap.push(new_cost, v)
                newly_relaxed.append(v)

        frames.append({
            "current":        u,
            "relaxed":        newly_relaxed,
            "visited":        list(visited),
            "dist_snapshot":  dict(dist),
        })

        if u == target:
            break

    return frames
