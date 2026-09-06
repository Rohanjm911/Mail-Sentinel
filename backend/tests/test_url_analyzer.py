"""
Tests for URL threat analyzer service.
"""
import pytest
from app.services.url_analyzer import URLAnalyzerService

def test_safe_url():
    url_data = {"url": "https://github.com/company/project", "anchor_text": "GitHub"}
    res = URLAnalyzerService.analyze_single_url(url_data)
    assert res["risk_score"] < 25
    assert res["status"] == "SAFE"

def test_phishing_url_brand_and_credential():
    url_data = {
        "url": "http://paypal-security-update.xyz/login?user=target",
        "anchor_text": "Verify Your Account"
    }
    res = URLAnalyzerService.analyze_single_url(url_data)
    assert res["risk_score"] >= 60
    assert res["status"] in ("HIGH", "CRITICAL")
    assert any("brand" in f.lower() or "impersonation" in f.lower() for f in res["flags"])
    assert any("credential" in f.lower() or "login" in f.lower() for f in res["flags"])

def test_ip_address_url():
    url_data = {"url": "http://192.168.1.100:8080/secure/update", "anchor_text": "Click Here"}
    res = URLAnalyzerService.analyze_single_url(url_data)
    assert res["risk_score"] >= 40
    assert any("ip address" in f.lower() for f in res["flags"])

def test_anchor_text_mismatch():
    url_data = {"url": "http://evil-attacker-site.com/steal", "anchor_text": "https://www.paypal.com/signin"}
    res = URLAnalyzerService.analyze_single_url(url_data)
    assert res["risk_score"] >= 50
    assert any("anchor" in f.lower() or "mismatch" in f.lower() for f in res["flags"])

def test_aggregate_analyzer():
    url_list = [
        {"url": "https://google.com", "anchor_text": "Google"},
        {"url": "http://secure-update-paypal.xyz/auth", "anchor_text": "Update"}
    ]
    res = URLAnalyzerService.analyze(url_list)
    assert res["count"] == 2
    assert res["risk_score"] >= 60
    assert len(res["findings"]) > 0
