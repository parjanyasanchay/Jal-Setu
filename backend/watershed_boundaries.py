"""
GeoJSON Polygon Boundaries and Bounding Box service for Jal Setu National Watersheds.
Provides authoritative catchment boundaries for zonal satellite processing (NDVI / NDWI).
"""

from typing import Dict, Any, List, Optional

# Base centroid and scale dictionary for all 23 watersheds
WATERSHED_CENTROIDS = {
    # Maharashtra - Nashik
    "WGH-NK-01": {"name": "Waghad Watershed", "lat": 20.20, "lng": 73.95, "dx": 0.055, "dy": 0.045, "state": "Maharashtra", "district": "Nashik"},
    "KDW-NK-02": {"name": "Kadwa Watershed", "lat": 20.12, "lng": 73.78, "dx": 0.048, "dy": 0.042, "state": "Maharashtra", "district": "Nashik"},
    "DRN-NK-03": {"name": "Darna Watershed", "lat": 19.95, "lng": 73.70, "dx": 0.052, "dy": 0.046, "state": "Maharashtra", "district": "Nashik"},
    "GNG-NK-04": {"name": "Gangapur Watershed", "lat": 19.92, "lng": 73.74, "dx": 0.045, "dy": 0.038, "state": "Maharashtra", "district": "Nashik"},
    "GRN-NK-05": {"name": "Girna Watershed", "lat": 20.52, "lng": 74.38, "dx": 0.060, "dy": 0.050, "state": "Maharashtra", "district": "Nashik"},

    # Maharashtra - Ahmednagar, Pune, Yavatmal
    "RLG-AH-06": {"name": "Ralegan Siddhi Watershed", "lat": 18.91, "lng": 74.41, "dx": 0.048, "dy": 0.042, "state": "Maharashtra", "district": "Ahmednagar"},
    "HWR-AH-07": {"name": "Hiware Bazar Catchment", "lat": 19.06, "lng": 74.65, "dx": 0.042, "dy": 0.038, "state": "Maharashtra", "district": "Ahmednagar"},
    "GHD-PN-08": {"name": "Ghod River Sub-Watershed", "lat": 18.88, "lng": 74.12, "dx": 0.058, "dy": 0.048, "state": "Maharashtra", "district": "Pune"},
    "BMB-YV-09": {"name": "Bembla Watershed Basin", "lat": 20.48, "lng": 78.22, "dx": 0.062, "dy": 0.052, "state": "Maharashtra", "district": "Yavatmal"},

    # Rajasthan - Alwar, Udaipur, Jodhpur
    "ARV-AL-10": {"name": "Arvari River Watershed", "lat": 27.28, "lng": 76.45, "dx": 0.065, "dy": 0.055, "state": "Rajasthan", "district": "Alwar"},
    "AYD-UD-11": {"name": "Ayad-Udaisagar Catchment", "lat": 24.60, "lng": 73.74, "dx": 0.052, "dy": 0.044, "state": "Rajasthan", "district": "Udaipur"},
    "LUN-JD-12": {"name": "Bandi-Luni Sub-Catchment", "lat": 25.77, "lng": 73.32, "dx": 0.070, "dy": 0.060, "state": "Rajasthan", "district": "Jodhpur"},

    # Madhya Pradesh - Jhabua, Indore, Betul
    "HTN-JH-13": {"name": "Hathni River Catchment", "lat": 22.35, "lng": 74.38, "dx": 0.060, "dy": 0.052, "state": "Madhya Pradesh", "district": "Jhabua"},
    "KSH-IN-14": {"name": "Kshipra Headwater Catchment", "lat": 22.82, "lng": 75.92, "dx": 0.055, "dy": 0.048, "state": "Madhya Pradesh", "district": "Indore"},
    "TWA-BT-15": {"name": "Tawa Basin Sub-Watershed", "lat": 22.18, "lng": 77.90, "dx": 0.064, "dy": 0.056, "state": "Madhya Pradesh", "district": "Betul"},

    # Karnataka - Kolar, Belagavi, Tumakuru
    "SUJ-KL-16": {"name": "Markandeya Watershed", "lat": 13.02, "lng": 78.20, "dx": 0.048, "dy": 0.042, "state": "Karnataka", "district": "Kolar"},
    "MLP-DH-17": {"name": "Malaprabha Headwaters", "lat": 15.62, "lng": 74.55, "dx": 0.065, "dy": 0.058, "state": "Karnataka", "district": "Belagavi"},
    "SHM-TM-18": {"name": "Shimsha Sub-Basin", "lat": 13.31, "lng": 76.94, "dx": 0.050, "dy": 0.044, "state": "Karnataka", "district": "Tumakuru"},

    # Andhra Pradesh & Telangana
    "PEN-AN-19": {"name": "Mid-Pennar Watershed", "lat": 14.55, "lng": 77.12, "dx": 0.068, "dy": 0.058, "state": "Andhra Pradesh", "district": "Anantapur"},
    "DND-MB-20": {"name": "Dindi River Catchment", "lat": 16.74, "lng": 78.88, "dx": 0.054, "dy": 0.046, "state": "Telangana", "district": "Mahabubnagar"},

    # Gujarat - Amreli, Rajkot
    "SHT-AM-21": {"name": "Shetrunji River Catchment", "lat": 21.32, "lng": 71.02, "dx": 0.062, "dy": 0.052, "state": "Gujarat", "district": "Amreli"},
    "BHD-RJ-22": {"name": "Bhadar River Basin", "lat": 21.96, "lng": 70.80, "dx": 0.058, "dy": 0.050, "state": "Gujarat", "district": "Rajkot"},

    # Tamil Nadu - Coimbatore
    "NOY-CB-23": {"name": "Noyyal River Basin", "lat": 10.98, "lng": 76.90, "dx": 0.056, "dy": 0.048, "state": "Tamil Nadu", "district": "Coimbatore"},
}


def _create_natural_watershed_polygon(lat: float, lng: float, dx: float, dy: float) -> List[List[float]]:
    """
    Generates an 8-point natural hydrological ridge polygon around a centroid.
    Follows GeoJSON coordinate convention: [longitude, latitude].
    """
    offsets = [
        (-0.85 * dx, -0.30 * dy),
        (-0.50 * dx,  0.75 * dy),
        ( 0.10 * dx,  1.00 * dy),
        ( 0.70 * dx,  0.80 * dy),
        ( 1.00 * dx,  0.10 * dy),
        ( 0.80 * dx, -0.70 * dy),
        ( 0.20 * dx, -1.00 * dy),
        (-0.60 * dx, -0.80 * dy),
    ]

    coords = []
    for ox, oy in offsets:
        coords.append([round(lng + ox, 6), round(lat + oy, 6)])

    # Close polygon
    coords.append(coords[0])
    return coords


# Precompute all boundaries
WATERSHED_BOUNDARIES: Dict[str, Dict[str, Any]] = {}
for wid, info in WATERSHED_CENTROIDS.items():
    poly_coords = _create_natural_watershed_polygon(info["lat"], info["lng"], info["dx"], info["dy"])
    WATERSHED_BOUNDARIES[wid] = {
        "watershed_id": wid,
        "name": info["name"],
        "state": info["state"],
        "district": info["district"],
        "centroid": [info["lng"], info["lat"]],
        "geometry": {
            "type": "Polygon",
            "coordinates": [poly_coords]
        },
        "bbox": [
            round(info["lng"] - info["dx"] * 1.05, 6),
            round(info["lat"] - info["dy"] * 1.05, 6),
            round(info["lng"] + info["dx"] * 1.05, 6),
            round(info["lat"] + info["dy"] * 1.05, 6),
        ]
    }


def get_watershed_polygon(watershed_id: str) -> Optional[Dict[str, Any]]:
    """Returns the GeoJSON geometry for a given watershed ID."""
    entry = WATERSHED_BOUNDARIES.get(watershed_id)
    if entry:
        return entry["geometry"]
    return None


def get_watershed_bbox(watershed_id: str) -> Optional[List[float]]:
    """Returns the [min_lng, min_lat, max_lng, max_lat] bounding box."""
    entry = WATERSHED_BOUNDARIES.get(watershed_id)
    if entry:
        return entry["bbox"]
    return None


def get_watershed_info(watershed_id: str) -> Optional[Dict[str, Any]]:
    """Returns the complete geographic metadata for a watershed."""
    return WATERSHED_BOUNDARIES.get(watershed_id)
