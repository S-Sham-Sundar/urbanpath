"""
Unit tests for the UrbanPath routing engine.
Run with:  pytest test_routing.py -v
"""
import pytest
from graph import Graph
from min_heap import MinHeap
from routing import dijkstra, a_star
from traversal import bfs, dfs
from isochrone import isochrone
from loader import build_grid_city


# ── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture
def tiny():
    """A 3-node graph: 1 -5-> 2 -3-> 3, and a direct but expensive 1 -20-> 3."""
    g = Graph()
    for n in (1, 2, 3):
        g.add_node(n, 0.0, 0.0)
    g.add_edge(1, 2, 5)
    g.add_edge(2, 3, 3)
    g.add_edge(1, 3, 20)   # tempting but expensive direct road
    return g


@pytest.fixture
def sample_city():
    """A small 10×10 grid city — large enough for meaningful tests."""
    return build_grid_city(rows=10, cols=10)


# ── MinHeap ──────────────────────────────────────────────────────────────────

def test_heap_pops_smallest_first():
    h = MinHeap()
    for value in (5, 1, 9, 3):
        h.push(value, value)
    assert [h.pop()[0] for _ in range(4)] == [1, 3, 5, 9]


def test_heap_is_empty():
    h = MinHeap()
    assert h.is_empty()
    h.push(1, "a")
    assert not h.is_empty()
    h.pop()
    assert h.is_empty()


# ── Dijkstra ─────────────────────────────────────────────────────────────────

def test_dijkstra_picks_cheaper_indirect_path(tiny):
    path, dist = dijkstra(tiny, 1, 3)
    assert path == [1, 2, 3]   # 5+3=8, not the direct 20
    assert dist == 8


def test_dijkstra_same_node(tiny):
    path, dist = dijkstra(tiny, 1, 1)
    assert path == [1]
    assert dist == 0


def test_dijkstra_no_path():
    g = Graph()
    g.add_node(1, 0, 0)
    g.add_node(2, 0, 0)
    # no edge between them
    path, dist = dijkstra(g, 1, 2)
    assert path == []
    assert dist is None


# ── A* ───────────────────────────────────────────────────────────────────────

def test_astar_matches_dijkstra(sample_city):
    """A* must return the exact same route as Dijkstra on the same graph."""
    src, tgt = 0, 80
    path_d, dist_d = dijkstra(sample_city, src, tgt)
    path_a, dist_a = a_star(sample_city, src, tgt)
    assert path_d == path_a
    assert abs(dist_d - dist_a) < 1e-9


def test_astar_cheaper_indirect_path(tiny):
    path, dist = a_star(tiny, 1, 3)
    assert path == [1, 2, 3]
    assert dist == 8


# ── BFS / DFS ────────────────────────────────────────────────────────────────

def test_bfs_visits_all_nodes(sample_city):
    order = bfs(sample_city, 0)
    assert len(order) == 100   # 10x10 grid


def test_dfs_visits_all_nodes(sample_city):
    order = dfs(sample_city, 0)
    assert len(order) == 100


# ── Isochrone ────────────────────────────────────────────────────────────────

def test_isochrone_includes_source(sample_city):
    result = isochrone(sample_city, 0, minutes=999)
    assert 0 in result
    assert result[0] == 0


def test_isochrone_budget_respected(sample_city):
    budget = 0.05
    result = isochrone(sample_city, 0, minutes=budget)
    for arrival in result.values():
        assert arrival <= budget
