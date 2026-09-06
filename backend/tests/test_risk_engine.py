"""
Tests for deterministic Risk Scoring Engine.
"""
import pytest
from app.services.risk_engine import RiskEngineService

def test_low_risk_clean_email():
    assessment = RiskEngineService.calculate_assessment(
        parsed_email={"sender": "team@company.com", "subject": "Daily Standup"},
        sender_analysis={"risk_score": 0, "status": "SAFE", "findings": []},
        url_analysis={"risk_score": 0, "status": "SAFE", "urls": [], "findings": []},
        content_analysis={"risk_score": 5, "detected_categories": [], "findings": []},
        header_analysis={"risk_score": 0, "findings": []},
        auth_analysis={"risk_score": 0, "status": "PASSED", "spf": "PASS", "dkim": "PASS", "dmarc": "PASS", "findings": []},
        attachment_analysis={"risk_score": 0, "status": "CLEAN", "findings": []},
        ml_analysis={"phishing_probability": 0.05, "prediction": 0, "top_tokens": []}
    )

    assert assessment["score"] < 30
    assert assessment["severity"] == "LOW"
    assert assessment["confidence"] >= 0.70
    assert len(assessment["recommendations"]) > 0

def test_critical_risk_elevation_executable_attachment():
    assessment = RiskEngineService.calculate_assessment(
        parsed_email={"sender": "billing@external.com", "subject": "Invoice"},
        sender_analysis={"risk_score": 20, "status": "SUSPICIOUS", "findings": []},
        url_analysis={"risk_score": 10, "status": "SAFE", "urls": [], "findings": []},
        content_analysis={"risk_score": 20, "detected_categories": ["INVOICE_BILLING"], "findings": []},
        header_analysis={"risk_score": 0, "findings": []},
        auth_analysis={"risk_score": 0, "status": "NONE", "findings": []},
        attachment_analysis={
            "risk_score": 90,
            "status": "CRITICAL",
            "findings": [{
                "title": "Double Extension Executable",
                "description": "Attachment invoice.pdf.exe is an executable masked as a PDF document.",
                "severity": "CRITICAL",
                "evidence": "invoice.pdf.exe"
            }]
        },
        ml_analysis={"phishing_probability": 0.40, "prediction": 0, "top_tokens": []}
    )

    # Heuristic override elevates dangerous attachments to >= 82 (CRITICAL)
    assert assessment["score"] >= 80
    assert assessment["severity"] == "CRITICAL"
    assert any("attachment" in r.lower() for r in assessment["reasons"])

def test_critical_risk_url_and_brand_spoofing():
    assessment = RiskEngineService.calculate_assessment(
        parsed_email={"sender": "security@paypa1-support.org", "subject": "Account Suspended"},
        sender_analysis={
            "risk_score": 75,
            "status": "CRITICAL",
            "findings": [{
                "title": "Brand Impersonation Detected",
                "description": "Spoofing PayPal brand.",
                "severity": "HIGH",
                "evidence": "paypa1-support.org"
            }]
        },
        url_analysis={
            "risk_score": 85,
            "status": "CRITICAL",
            "findings": [{
                "title": "Credential Verification Link",
                "description": "Directs to fake login portal.",
                "severity": "CRITICAL",
                "evidence": "http://paypa1-support.org/login"
            }]
        },
        content_analysis={"risk_score": 60, "detected_categories": ["URGENCY", "CREDENTIAL_HARVESTING"], "findings": []},
        header_analysis={"risk_score": 20, "findings": []},
        auth_analysis={"risk_score": 80, "status": "FAILED", "spf": "FAIL", "dkim": "FAIL", "dmarc": "FAIL", "findings": []},
        attachment_analysis={"risk_score": 0, "status": "CLEAN", "findings": []},
        ml_analysis={"phishing_probability": 0.95, "prediction": 1, "top_tokens": ["urgent", "account", "login"]}
    )

    assert assessment["score"] >= 80
    assert assessment["severity"] == "CRITICAL"
    assert assessment["confidence"] >= 0.85
    assert len(assessment["reasons"]) >= 2
