"""
Trend and Indicator Analysis Service for Jal Setu.

Provides multi-temporal satellite indicator time-series (NDVI, VCI, NDWI, Water Availability),
seasonal aggregations, intervention verification statuses, evidence coverage assessments,
and explainability metadata with clear prototype/sample data attribution.
"""

from typing import Dict, Any, List, Optional
import datetime
from sqlalchemy.orm import Session
from models import Watershed, Evidence


# Benchmark seasonal cycles for Indian Agro-climatic Watersheds
# Kharif: Jun - Oct (Monsoon crop)
# Post-Monsoon: Oct - Nov (Residual moisture)
# Rabi: Nov - Mar (Winter crop, irrigation dependent)
# Zaid: Mar - Jun (Summer / pre-monsoon dry period)

SEASONS_INFO = {
    "Kharif": {"months": [6, 7, 8, 9, 10], "desc": "Southwest Monsoon / Primary cropping cycle"},
    "Post-Monsoon": {"months": [10, 11], "desc": "Transition phase / Maximum reservoir recharge"},
    "Rabi": {"months": [11, 12, 1, 2, 3], "desc": "Winter harvest / Groundwater & check dam dependence"},
    "Zaid": {"months": [3, 4, 5, 6], "desc": "Pre-monsoon summer / Peak water stress"},
}

INDICATOR_METADATA = {
    "ndvi": {
        "name": "Normalized Difference Vegetation Index (NDVI)",
        "sensor": "Sentinel-2 L2A (B08, B04)",
        "resolution_m": 10,
        "unit": "Index (-1 to +1)",
        "source": "Sentinel-2 L2A / ISRO Bhuvan (Prototype/Sample Data)",
        "explanation": "Vegetation vigor increased during the selected period. However, this change is also influenced by seasonal monsoon rainfall, crop rotation, and farmer practices.",
        "visibility_label": "Directly visible",
        "causality_note": "Supporting evidence only — not proof of causality",
    },
    "vci": {
        "name": "Vegetation Condition Index (VCI)",
        "sensor": "Sentinel-2 Multi-spectral Composite",
        "resolution_m": 10,
        "unit": "Percentage (0 - 100%)",
        "source": "Sentinel-2 L2A / NRSC Bhuvan (Prototype/Sample Data)",
        "explanation": "VCI compares current vegetation vigor against the historical multi-year envelope. Values above 50% reflect healthy condition relative to historical norms.",
        "visibility_label": "Contextually supported",
        "causality_note": "Supporting evidence only — not proof of causality",
    },
    "ndwi": {
        "name": "Normalized Difference Water Index (NDWI)",
        "sensor": "Sentinel-2 L2A (B03, B08)",
        "resolution_m": 10,
        "unit": "Index (-1 to +1)",
        "source": "Sentinel-2 L2A / ISRO Bhuvan (Prototype/Sample Data)",
        "explanation": "Surface-water levels fluctuate sharply with monsoon cycles. Storage structures retain residual water in Rabi, but regional rainfall remains the governing driver.",
        "visibility_label": "Directly visible",
        "causality_note": "Supporting evidence only — not proof of causality",
    },
    "water": {
        "name": "Surface Water & Soil Moisture Index",
        "sensor": "Sentinel-2 + Sentinel-1 Radar Proxy",
        "resolution_m": 10,
        "unit": "Index (0 to 1)",
        "source": "Sentinel-2 L2A / ISRO Bhuvan (Prototype/Sample Data)",
        "explanation": "Catchment moisture retention exhibits significant improvement in proximity to check dams and earthen bunds, though dry-season drawdown is natural.",
        "visibility_label": "Contextually supported",
        "causality_note": "Supporting evidence only — not proof of causality",
    },
}


def _get_season_for_date(dt: datetime.date) -> str:
    month = dt.month
    if month in (7, 8, 9):
        return "Kharif"
    elif month in (10,):
        return "Post-Monsoon"
    elif month in (11, 12, 1, 2):
        return "Rabi"
    else:
        return "Zaid"


def _generate_deterministic_observations(
    watershed_id: str,
    base_val: float,
    current_val: float,
    indicator: str
) -> List[Dict[str, Any]]:
    """
    Generates a realistic, deterministic multi-temporal observation series
    from 2024-01-15 to 2026-09-08 based on the watershed's baseline and current values.
    """
    # Hash seed to keep numbers stable and realistic per watershed
    seed = sum(ord(c) for c in watershed_id)

    # Observation sample dates spanning 2024 to 2026 across all seasons
    dates = [
        "2024-01-18", "2024-03-22", "2024-05-15", "2024-08-10", "2024-10-25", "2024-12-14",
        "2025-02-18", "2025-04-20", "2025-07-28", "2025-09-16", "2025-11-20",
        "2026-01-22", "2026-03-30", "2026-06-12", "2026-08-14", "2026-09-08"
    ]

    total_steps = len(dates)
    results = []

    for idx, d_str in enumerate(dates):
        dt = datetime.date.fromisoformat(d_str)
        season = _get_season_for_date(dt)

        # Baseline progression with seasonal variation
        progress = idx / (total_steps - 1)
        interpolated = base_val + (current_val - base_val) * progress

        # Seasonal adjustment factor
        if indicator in ("ndvi", "vci"):
            if season == "Kharif":
                seasonal_boost = 0.08
            elif season == "Post-Monsoon":
                seasonal_boost = 0.05
            elif season == "Rabi":
                seasonal_boost = 0.02
            else:  # Zaid / Summer dry
                seasonal_boost = -0.06
        else:  # ndwi or water
            if season == "Kharif":
                seasonal_boost = 0.12
            elif season == "Post-Monsoon":
                seasonal_boost = 0.09
            elif season == "Rabi":
                seasonal_boost = 0.01
            else:  # Zaid
                seasonal_boost = -0.10

        # Deterministic micro-variation
        micro = ((seed * (idx + 3)) % 17 - 8) / 400.0
        val = round(interpolated + seasonal_boost + micro, 2)

        # Bounds check
        if indicator == "vci":
            val = round(max(20.0, min(95.0, val * 100 if val < 1.0 else val)), 1)
        elif indicator in ("ndvi", "ndwi", "water"):
            val = round(max(0.15, min(0.92, val)), 2)

        cloud_pct = round(3.5 + ((seed + idx * 7) % 130) / 10.0, 1)  # 3.5% to 16.5%
        cloud_free = round(100.0 - cloud_pct, 1)

        results.append({
            "indicator": indicator,
            "date": d_str,
            "value": val,
            "watershed": watershed_id,
            "season": season,
            "source": "Sentinel-2 L2A",
            "resolution_m": 10,
            "confidence": "High" if cloud_free > 90 else "Medium",
            "cloud_free": cloud_free,
        })

    return results


def get_trend_analysis(
    db: Session,
    watershed_id: Optional[str] = None,
    indicator: str = "ndvi",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    season: Optional[str] = "ALL",
    intervention_type: Optional[str] = "ALL"
) -> Dict[str, Any]:
    """
    Computes time-series trend data with filters, metadata, and explainability disclaimers.
    """
    indicator_clean = indicator.lower() if indicator else "ndvi"
    if indicator_clean not in INDICATOR_METADATA:
        indicator_clean = "ndvi"

    # Fetch watershed model or pick first
    ws = None
    if watershed_id and watershed_id != "ALL":
        ws = db.query(Watershed).filter(Watershed.watershed_id == watershed_id).first()
    if not ws:
        ws = db.query(Watershed).first()

    ws_id = ws.watershed_id if ws else "WGH-NK-01"
    ws_name = f"{ws.name} ({ws.district}, {ws.state})" if ws else "Waghad Watershed (Nashik, Maharashtra)"

    # Establish baseline and current benchmark targets
    if indicator_clean == "ndvi":
        base_val = float(ws.base_ndvi) if ws and ws.base_ndvi is not None else 0.46
        current_val = float(ws.ndvi) if ws and ws.ndvi is not None else 0.58
    elif indicator_clean == "vci":
        base_val = 58.0
        current_val = 74.0
    elif indicator_clean == "ndwi":
        base_val = float(ws.base_water) if ws and ws.base_water is not None else 0.48
        current_val = float(ws.water_index) if ws and ws.water_index is not None else 0.64
    else:  # water availability
        base_val = 0.45
        current_val = 0.62

    # Generate multi-date time series
    raw_series = _generate_deterministic_observations(ws_id, base_val, current_val, indicator_clean)

    # Filter by date range
    filtered = []
    for item in raw_series:
        if start_date and item["date"] < start_date:
            continue
        if end_date and item["date"] > end_date:
            continue
        if season and season.upper() != "ALL" and item["season"].upper() != season.upper():
            continue
        filtered.append(item)

    meta = INDICATOR_METADATA[indicator_clean]

    # Calculate aggregate summary stats
    latest_val = filtered[-1]["value"] if filtered else current_val
    earliest_val = filtered[0]["value"] if filtered else base_val
    delta = round(latest_val - earliest_val, 2)
    pct_change = f"{'+' if delta >= 0 else ''}{round((delta / earliest_val) * 100, 1)}%" if earliest_val != 0 else "0.0%"

    avg_cloud_free = round(sum(i["cloud_free"] for i in filtered) / len(filtered), 1) if filtered else 92.5

    return {
        "watershed": ws_id,
        "watershed_name": ws_name,
        "indicator": indicator_clean,
        "indicator_name": meta["name"],
        "unit": meta["unit"],
        "baseline_value": base_val,
        "current_value": latest_val,
        "change_delta": delta,
        "change_percentage": pct_change,
        "time_series": filtered,
        "observation_count": len(filtered),
        "metadata": {
            "source": meta["source"],
            "resolution_m": meta["resolution_m"],
            "selected_season": season or "ALL",
            "selected_intervention": intervention_type or "ALL",
            "valid_data_info": f"Cloud-free pixels avg {avg_cloud_free}% (threshold > 80%)",
            "confidence_level": f"{ws.confidence if ws else 82}% composite confidence",
            "labels": {
                "visibility": meta["visibility_label"],
                "support": "Contextually supported by local watershed topology",
                "resolution_limitation": "Structures < 10m not resolvable at standard optical resolution",
                "causality_note": meta["causality_note"],
            },
            "non_technical_explanation": meta["explanation"],
            "attribution": "ISRO Bhuvan / NRSC Open Geospatial Archive & Copernicus Sentinel-2. Prototype/Sample Data.",
        }
    }


def get_indicator_summary(
    db: Session,
    watershed_id: Optional[str] = None,
    intervention_type: Optional[str] = "ALL",
    season: Optional[str] = "ALL"
) -> Dict[str, Any]:
    """
    Computes summary breakdown for intervention status, evidence coverage,
    and cross-indicator performance across the selected watershed.
    """
    ws = None
    if watershed_id and watershed_id != "ALL":
        ws = db.query(Watershed).filter(Watershed.watershed_id == watershed_id).first()
    if not ws:
        ws = db.query(Watershed).first()

    ws_id = ws.watershed_id if ws else "WGH-NK-01"
    ws_name = f"{ws.name} ({ws.district}, {ws.state})" if ws else "Waghad Watershed (Nashik, Maharashtra)"

    total_interventions = ws.interventions if ws else 18
    monitored_interventions = ws.monitored if ws else 15

    # Derive intervention status breakdown
    # Verified (field inspected & satellite matched)
    # Needs Review (evidence anomaly or low confidence)
    # Inconclusive (resolution limitation or cloud coverage)
    verified_count = monitored_interventions
    needs_review_count = max(1, round(total_interventions * 0.18))
    inconclusive_count = max(1, total_interventions - verified_count - needs_review_count)
    if verified_count + needs_review_count + inconclusive_count > total_interventions:
        verified_count = total_interventions - needs_review_count - inconclusive_count

    # Breakdown by intervention type
    interventions_breakdown = [
        {"type": "Check Dam", "verified": 6, "needs_review": 1, "inconclusive": 0, "total": 7},
        {"type": "Farm Pond", "verified": 4, "needs_review": 1, "inconclusive": 1, "total": 6},
        {"type": "Continuous Contour Trenching", "verified": 3, "needs_review": 1, "inconclusive": 0, "total": 4},
        {"type": "Percolation Tank", "verified": 2, "needs_review": 1, "inconclusive": 0, "total": 3},
    ]

    # Filter breakdown if specific intervention selected
    if intervention_type and intervention_type != "ALL":
        interventions_breakdown = [
            i for i in interventions_breakdown if i["type"].lower() == intervention_type.lower()
        ]

    # Evidence coverage breakdown
    # Complete: Photo + GPS EXIF + GIS Boundary verification
    # Incomplete: Missing GPS or photo documentation
    # Low Confidence: Observation dated > 180 days or obstructed angle
    complete_evidence = max(1, round(total_interventions * 0.68))
    incomplete_evidence = max(1, round(total_interventions * 0.20))
    low_conf_evidence = max(1, total_interventions - complete_evidence - incomplete_evidence)

    # Cross-indicator performance
    ndvi_base = float(ws.base_ndvi) if ws and ws.base_ndvi is not None else 0.46
    ndvi_curr = float(ws.ndvi) if ws and ws.ndvi is not None else 0.58
    ndwi_base = float(ws.base_water) if ws and ws.base_water is not None else 0.48
    ndwi_curr = float(ws.water_index) if ws and ws.water_index is not None else 0.64

    return {
        "watershed": ws_id,
        "watershed_name": ws_name,
        "selected_season": season or "ALL",
        "selected_intervention": intervention_type or "ALL",
        "interventions_summary": {
            "verified": verified_count,
            "needs_review": needs_review_count,
            "inconclusive": inconclusive_count,
            "total": total_interventions,
            "by_type": interventions_breakdown,
        },
        "evidence_coverage": {
            "complete": complete_evidence,
            "incomplete": incomplete_evidence,
            "low_confidence": low_conf_evidence,
            "total": total_interventions,
            "categories": [
                {"label": "Complete Evidence (Photo + GPS + GIS)", "count": complete_evidence, "color": "#16a34a"},
                {"label": "Incomplete Evidence (Missing GPS/Metadata)", "count": incomplete_evidence, "color": "#f59e0b"},
                {"label": "Low-Confidence Evidence (Stale/Obstructed)", "count": low_conf_evidence, "color": "#ef4444"},
            ]
        },
        "indicator_stats": {
            "ndvi": {
                "baseline": ndvi_base,
                "current": ndvi_curr,
                "delta": round(ndvi_curr - ndvi_base, 2),
                "trend": "Positive" if ndvi_curr >= ndvi_base else "Declining"
            },
            "ndwi": {
                "baseline": ndwi_base,
                "current": ndwi_curr,
                "delta": round(ndwi_curr - ndwi_base, 2),
                "trend": "Positive" if ndwi_curr >= ndwi_base else "Declining"
            },
            "vci": {
                "value": 74.2,
                "status": "Favorable (> 60%)"
            },
            "water_availability": {
                "index": 0.62,
                "status": "Moderate-High Catchment Retention"
            }
        },
        "metadata": {
            "source": "IWMP-SRISHTI & Sentinel-2 Zonal Aggregates (Prototype/Sample Data)",
            "resolution_m": 10,
            "confidence": f"{ws.confidence if ws else 82}%",
            "disclaimer": "Supporting evidence only — not proof of causality. Field inspections and rainfall telemetry are required to validate hydrological impact.",
            "attribution": "ISRO Bhuvan & Ministry of Jal Shakti. All Waghad, Kadwa, Darna intervention values labeled as Prototype/Sample Data.",
        }
    }
