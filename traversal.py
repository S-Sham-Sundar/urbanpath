from collections import deque


def bfs(graph, source):
    """
    Breadth-first search — explores in rings outward from source.
    Returns nodes in the order they were visited.
    """
    visited = {source}
    queue   = deque([source])      # a plain queue: first in, first out
    order   = []
    while queue:
        u = queue.popleft()        # take the oldest waiting node
        order.append(u)
        for v, _ in graph.neighbors(u):
            if v not in visited:
                visited.add(v)
                queue.append(v)    # newcomers wait at the back
    return order


def dfs(graph, source):
    """
    Depth-first search — dives down one path as far as it goes, then backtracks.
    Returns nodes in the order they were visited.
    """
    visited = set()
    order   = []
    stack   = [source]
    while stack:
        u = stack.pop()            # take the most recently added node
        if u in visited:
            continue
        visited.add(u)
        order.append(u)
        for v, _ in graph.neighbors(u):
            if v not in visited:
                stack.append(v)
    return order
