"""
Unit and Integration Tests for Ask Jal Setu Grounded AI Chatbot.

Verifies:
1. Successful chatbot response with a selected watershed.
2. English and Hindi responses.
3. Missing watershed data handling.
4. Ollama/API unavailable fallback (returns useful rule-based explanation instead of error).
5. Response containing the correct evidence status (Verified, Needs Review, Inconclusive).
6. No API key exposed in frontend code or files.
7. Chatbot refusing to invent unavailable information.
"""

import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure backend directory is in python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app
from database import SessionLocal
from models import Watershed
from llm_provider import RuleBasedExplainer, OllamaProvider


client = TestClient(app)


def test_successful_chatbot_response_with_selected_watershed():
    """1. Test successful chatbot response with a selected watershed (e.g. Waghad)."""
    payload = {
        "question": "Why does this watershed need review?",
        "watershed_id": "waghad",
        "intervention_id": None,
        "language": "English"
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "answer" in data
    assert "status" in data
    assert "sources" in data
    assert "recommended_action" in data

    # Verify structured 4-part explanation
    answer = data["answer"]
    assert "1. What we observed" in answer
    assert "2. What it may mean" in answer
    assert "3. What cannot be confirmed" in answer
    assert "4. Recommended next action" in answer

    # Verify sources
    assert len(data["sources"]) >= 2
    assert any("Watershed record" in s for s in data["sources"])
    assert any("Satellite observation date" in s for s in data["sources"])


def test_english_and_hindi_responses():
    """2. Test English and Hindi responses."""
    # English response
    en_payload = {
        "question": "What does NDVI mean?",
        "watershed_id": "WGH-NK-01",
        "language": "English"
    }
    en_res = client.post("/api/chat", json=en_payload)
    assert en_res.status_code == 200
    en_data = en_res.json()
    assert "What we observed" in en_data["answer"]
    assert "What cannot be confirmed" in en_data["answer"]

    # Hindi response
    hi_payload = {
        "question": "NDVI का क्या अर्थ है?",
        "watershed_id": "WGH-NK-01",
        "language": "Hindi"
    }
    hi_res = client.post("/api/chat", json=hi_payload)
    assert hi_res.status_code == 200
    hi_data = hi_res.json()
    assert "1. हमने क्या देखा" in hi_data["answer"]
    assert "2. इसका क्या अर्थ हो सकता है" in hi_data["answer"]
    assert "3. क्या पुष्टि नहीं की जा सकती" in hi_data["answer"]
    assert "4. अनुशंसित अगला कदम" in hi_data["answer"]


def test_missing_watershed_data():
    """3. Test missing watershed data."""
    payload = {
        "question": "Explain this watershed",
        "watershed_id": "NON_EXISTENT_WATERSHED_XYZ",
        "language": "English"
    }
    res = client.post("/api/chat", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["status"] == "Inconclusive"
    assert "This information is not available in the current records" in data["answer"]
    assert len(data["sources"]) == 0


def test_ollama_unavailable_fallback():
    """4. Test Ollama/API unavailable fallback returns useful rule-based explanation instead of error."""
    # Point Ollama to an unreachable port
    os.environ["LLM_PROVIDER"] = "ollama"
    os.environ["OLLAMA_BASE_URL"] = "http://localhost:59999"

    payload = {
        "question": "What should the officer inspect next?",
        "watershed_id": "WGH-NK-01",
        "language": "English"
    }
    res = client.post("/api/chat", json=payload)
    assert res.status_code == 200  # Must not return 500 error!
    data = res.json()

    assert data["status"] in ["Verified", "Needs Review", "Inconclusive"]
    assert "1. What we observed" in data["answer"]
    assert "2. What it may mean" in data["answer"]
    assert "3. What cannot be confirmed" in data["answer"]
    assert "4. Recommended next action" in data["answer"]
    assert "Collect a recent geo-tagged field photograph" in data["recommended_action"]


def test_response_contains_correct_evidence_status():
    """5. Response containing the correct evidence status (Verified, Needs Review, or Inconclusive)."""
    # Test Waghad
    payload = {
        "question": "Why does this site need review?",
        "watershed_id": "WGH-NK-01",
        "language": "English"
    }
    res = client.post("/api/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["Verified", "Needs Review", "Inconclusive"]
    assert data["status"] == "Needs Review"


def test_no_api_key_exposed_in_frontend_code():
    """6. Ensure no API keys or secret tokens are exposed in frontend code or static files."""
    frontend_dir = os.path.join(os.path.dirname(backend_dir), "src")
    forbidden_patterns = ["sk-proj-", "Bearer ", "AIzaSy", "ghp_"]

    for root, _, files in os.walk(frontend_dir):
        for fname in files:
            if fname.endswith((".js", ".jsx", ".html", ".ts", ".tsx")):
                fpath = os.path.join(root, fname)
                with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    for pattern in forbidden_patterns:
                        assert pattern not in content, f"Sensitive pattern {pattern} found in {fpath}"


def test_chatbot_refuses_to_invent_unavailable_information():
    """7. Chatbot refusing to invent unavailable information."""
    payload = {
        "question": "What is the secret underground water tank built in 1850?",
        "watershed_id": "INVALID_ID_9999",
        "language": "English"
    }
    res = client.post("/api/chat", json=payload)
    assert res.status_code == 200
    data = res.json()

    # Must refuse to invent information
    assert "This information is not available in the current records" in data["answer"]
