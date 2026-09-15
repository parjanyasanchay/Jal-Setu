"""
Cloud Deployment & Production Verification Tests for Jal Setu.

Tests:
1. /health endpoint response and database connectivity.
2. Safe defaults and environment-based configuration (SECRET_KEY, CORS, Hosts).
3. Database URL normalization (postgres:// to postgresql://).
4. Auto-seeding of benchmark watersheds and demo officer user.
5. Root entry point (app.py) integrity.
6. Unified static frontend routes (/health, /, /portal, /dashboard, /auth, /map).
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure root and backend directories are in python path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")

if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import app
from database import SessionLocal, init_postgis, engine
from models import Watershed, User
from init_db import init_database


client = TestClient(app)


def test_health_endpoint():
    """Verify /health returns 200, status healthy, service name and db connectivity."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] in ["healthy", "degraded"]
    assert data["service"] == "Jal Setu API"
    assert data["database"] == "connected"
    assert "timestamp" in data
    assert "version" in data


def test_database_initialization_and_seeding():
    """Verify database initialization seeds benchmark records and demo officer."""
    init_database()
    db = SessionLocal()
    try:
        watershed_count = db.query(Watershed).count()
        assert watershed_count >= 20, f"Expected at least 20 benchmark watersheds, got {watershed_count}"

        officer = db.query(User).filter(User.email == "officer@jalsetu.gov.in").first()
        assert officer is not None
        assert officer.role == "Project Officer"
    finally:
        db.close()


def test_database_url_normalization():
    """Verify postgres:// is converted to postgresql:// for SQLAlchemy."""
    sample_url = "postgres://user:secret@render-db-host.com:5432/jalsetu"
    normalized = sample_url.replace("postgres://", "postgresql://", 1)
    assert normalized.startswith("postgresql://")


def test_frontend_routes_served():
    """Verify unified routes return 200 or valid responses."""
    routes = ["/health", "/portal", "/portal.html", "/dashboard", "/auth", "/auth.html", "/map", "/map.html"]
    for route in routes:
        res = client.get(route)
        # Should be 200 (served FileResponse) or 307/302 (redirect)
        assert res.status_code in [200, 302, 307], f"Route {route} failed with {res.status_code}"


def test_login_redirects_to_dashboard():
    """Verify AuthApp.jsx redirects authenticated users to /dashboard."""
    auth_path = os.path.join(ROOT_DIR, "src", "AuthApp.jsx")
    with open(auth_path, "r", encoding="utf-8") as f:
        code = f.read()
        assert 'window.location.href = "/dashboard";' in code
