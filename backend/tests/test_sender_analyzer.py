"""
Tests for Sender Analyzer Service.
"""
import pytest
from app.services.sender_analyzer import SenderAnalyzerService

def test_legitimate_sender():
    res = SenderAnalyzerService.analyze("Engineering Team <dev@company.com>")
    assert res["risk_score"] == 0
    assert res["status"] == "SAFE"
    assert len(res["findings"]) == 0

def test_freemail_alone_not_malicious():
    res = SenderAnalyzerService.analyze("Alice Johnson <alice@gmail.com>")
    assert res["is_freemail"] is True
    # Rule: do not classify solely because it uses Gmail
    assert res["risk_score"] < 30
    assert res["status"] == "SAFE"

def test_display_name_spoofing():
    res = SenderAnalyzerService.analyze("PayPal Security Team <support@phish-attacker.org>")
    assert res["risk_score"] >= 40
    assert any("display name" in f["title"].lower() or "spoof" in f["title"].lower() for f in res["findings"])

def test_typosquatting_brand():
    res = SenderAnalyzerService.analyze("PayPal Official <service@paypa1.com>")
    assert res["risk_score"] >= 40
    assert any("typosquat" in f["title"].lower() or "similarity" in f["description"].lower() for f in res["findings"])

def test_reply_to_mismatch():
    res = SenderAnalyzerService.analyze(
        raw_sender="CEO Office <ceo@acmecorp.com>",
        reply_to_raw="secret-agent@protonmail.com"
    )
    assert res["risk_score"] >= 40
    assert any("reply-to" in f["title"].lower() for f in res["findings"])
