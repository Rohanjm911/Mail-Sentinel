"""
Tests for email parser service (paste and .eml).
"""
import os
import pytest
from app.services.email_parser import EmailParserService

def test_parse_pasted_email():
    res = EmailParserService.parse_pasted(
        sender="Security Alert <security@paypal-auth.xyz>",
        recipient="user@company.com",
        subject="Action Required: Account Restricted",
        body="Dear customer, please verify your credentials at http://paypal-auth.xyz/login immediately.",
        reply_to="attacker@protonmail.com"
    )

    assert res["sender"] == "Security Alert <security@paypal-auth.xyz>"
    assert res["recipient"] == "user@company.com"
    assert res["reply_to"] == "attacker@protonmail.com"
    assert res["subject"] == "Action Required: Account Restricted"
    assert len(res["urls"]) >= 1
    assert "http://paypal-auth.xyz/login" in [u["url"] for u in res["urls"]]

def test_parse_eml_file():
    test_eml_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "datasets", "test_emails", "phishing_01.eml"
    )
    with open(test_eml_path, "rb") as f:
        data = f.read()

    parsed = EmailParserService.parse_eml_bytes(data)
    assert "PayPal Support Services" in parsed["sender"]
    assert "restricted" in parsed["subject"].lower()
    assert parsed["authentication"]["spf"] == "FAIL"
    assert parsed["authentication"]["dkim"] == "FAIL"
    assert parsed["authentication"]["dmarc"] == "FAIL"
    assert len(parsed["urls"]) >= 1

def test_parse_attachment_eml():
    test_eml_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "datasets", "test_emails", "phishing_02.eml"
    )
    with open(test_eml_path, "rb") as f:
        data = f.read()

    parsed = EmailParserService.parse_eml_bytes(data)
    assert len(parsed["attachments"]) == 1
    att = parsed["attachments"][0]
    assert "invoice_remittance_sep2026.pdf.exe" in att["filename"]
    assert att["extension"] == ".exe"
