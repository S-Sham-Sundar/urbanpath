import math


def haversine(lat1, lon1, lat2, lon2):
    """
    Straight-line distance between two GPS points on Earth's surface.
    Returns distance in kilometres.
    Used as the admissible heuristic for A*.
    """
    R = 6371.0                                    # Earth's radius in km
    p1, p2  = math.radians(lat1), math.radians(lat2)
    dphi    = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + \
        math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))
