"""
Tests for Jal Setu Trend and Indicator Analysis API Endpoints.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from main import app

client = TestClient(app)


def test_analysis_trends_default():
    """Verify default trends response schema and required indicator fields."""
    response = client.get("/api/analysis/trends")
    assert response.status_code == 200
    data = response.json()

    assert "watershed" in data
    assert "watershed_name" in data
    assert "indicator" in data
    assert data["indicator"] == "ndvi"
    assert "time_series" in data
    assert len(data["time_series"]) > 0

    first_point = data["time_series"][0]
    required_fields = [
        "indicator", "date", "value", "watershed", "season",
        "source", "resolution_m", "confidence", "cloud_free"
    ]
    for field in required_fields:
        assert field in first_point, f"Missing required time-series field: {field}"

    assert "metadata" in data
    assert "source" in data["metadata"]
    assert "labels" in data["metadata"]
    assert "non_technical_explanation" in data["metadata"]
    assert "causality_note" in data["metadata"]["labels"]


def test_analysis_trends_filters():
    """Verify filtering by indicator, date range, season, and watershed."""
    # Test NDWI with Kharif season
    response = client.get(
        "/api/analysis/trends?watershed_id=WGH-NK-01&indicator=ndwi&season=Kharif&start_date=2024-01-01&end_date=2025-12-31"
    )
    assert response.status_code == 200
    data = response.json()

    assert data["indicator"] == "ndwi"
    for item in data["time_series"]:
        assert item["season"] == "Kharif"
        assert item["date"] >= "2024-01-01"
        assert item["date"] <= "2025-12-31"
        assert item["indicator"] == "ndwi"


def test_analysis_trends_vci():
    """Verify VCI percentage indicator."""
    response = client.get("/api/analysis/trends?indicator=vci")
    assert response.status_code == 200
    data = response.json()
    assert data["indicator"] == "vci"
    assert data["unit"] == "Percentage (0 - 100%)"
    for item in data["time_series"]:
        assert 0.0 <= item["value"] <= 100.0


def test_analysis_summary_default():
    """Verify summary endpoint returns intervention and evidence breakdown."""
    response = client.get("/api/analysis/summary?watershed_id=WGH-NK-01")
    assert response.status_code == 200
    data = response.json()

    assert "interventions_summary" in data
    assert "verified" in data["interventions_summary"]
    assert "needs_review" in data["interventions_summary"]
    assert "inconclusive" in data["interventions_summary"]
    assert "total" in data["interventions_summary"]

    assert "evidence_coverage" in data
    assert "complete" in data["evidence_coverage"]
    assert "incomplete" in data["evidence_coverage"]
    assert "low_confidence" in data["evidence_coverage"]

    assert "indicator_stats" in data
    assert "ndvi" in data["indicator_stats"]
    assert "ndwi" in data["indicator_stats"]

    assert "metadata" in data
    assert "disclaimer" in data["metadata"]
    assert "Supporting evidence only — not proof of causality" in data["metadata"]["disclaimer"]


def test_analysis_summary_intervention_filter():
    """Verify intervention filtering on summary endpoint."""
    response = client.get("/api/analysis/summary?watershed_id=WGH-NK-01&intervention_type=Check%20Dam")
    assert response.status_code == 200
    data = response.json()

    by_type = data["interventions_summary"]["by_type"]
    assert len(by_type) == 1
    assert by_type[0]["type"] == "Check Dam"
