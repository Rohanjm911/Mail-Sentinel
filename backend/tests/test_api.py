"""
Integration tests for Mail Sentinel REST API endpoints.
"""
import os
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["ml_model_loaded"] is True

def test_scan_paste_phishing():
    payload = {
        "sender": "Security Department <security@paypal-auth-verify.xyz>",
        "recipient": "victim@example.com",
        "subject": "CRITICAL: Account Access Suspended",
        "body": "Dear valued customer, your access is restricted. Click http://paypal-auth-verify.xyz/login immediately to verify your identity.",
        "reply_to": "collector@protonmail.com"
    }
    response = client.post("/api/scans", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["score"] >= 60
    assert data["severity"] in ("HIGH", "CRITICAL")
    assert data["confidence"] > 0.70
    assert len(data["reasons"]) > 0
    assert len(data["findings"]) > 0

def test_scan_paste_legitimate():
    payload = {
        "sender": "Alice Smith <alice@internal-corp.com>",
        "recipient": "bob@internal-corp.com",
        "subject": "Quarterly Planning Meeting",
        "body": "Hi Bob, attached is the presentation for our sprint planning tomorrow morning at 10 AM. Let me know if you have any questions.",
    }
    response = client.post("/api/scans", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["score"] < 40
    assert data["severity"] in ("LOW", "MEDIUM")

def test_scan_upload_eml():
    test_eml_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "datasets", "test_emails", "phishing_01.eml"
    )
    with open(test_eml_path, "rb") as f:
        file_bytes = f.read()

    response = client.post(
        "/api/scans/upload",
        files={"file": ("phishing_01.eml", file_bytes, "message/rfc822")}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["score"] >= 70
    assert data["severity"] in ("HIGH", "CRITICAL")
    assert "authentication" in data
    assert data["authentication"]["spf"] == "FAIL"

def test_get_scans_and_detail():
    # Fetch scan history
    response = client.get("/api/scans")
    assert response.status_code == 200
    history = response.json()
    assert "items" in history
    assert len(history["items"]) > 0

    first_scan_id = history["items"][0]["id"]
    detail_res = client.get(f"/api/scans/{first_scan_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == first_scan_id

def test_statistics_endpoint():
    response = client.get("/api/statistics")
    assert response.status_code == 200
    stats = response.json()
    assert "total_scans" in stats
    assert "phishing_detected" in stats
    assert "safe_emails" in stats
    assert "average_risk" in stats
    assert "is_sample_data" in stats

def test_threat_intel_status():
    response = client.get("/api/threat-intel/status")
    assert response.status_code == 200
    intel = response.json()
    assert "providers" in intel
    assert any(p["name"] == "VirusTotal" for p in intel["providers"])
