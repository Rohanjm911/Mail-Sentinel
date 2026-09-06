"""
Tests for ML inference service (TF-IDF + Logistic Regression).
"""
import pytest
from app.services.ml_service import MLService

def test_ml_service_singleton_loaded():
    service = MLService.get_instance()
    assert service.is_available() is True

def test_ml_service_predict_phishing():
    service = MLService.get_instance()
    subject = "URGENT: Your account has been suspended! Verify immediately"
    body = "Dear customer, our security systems detected unauthorized access. Click here immediately to restore access or your account will be permanently closed."
    
    result = service.predict(subject=subject, body=body)
    assert result["phishing_probability"] > 0.50
    assert result["prediction"] == 1
    assert "top_tokens" in result
    assert len(result["top_tokens"]) > 0

def test_ml_service_predict_legitimate():
    service = MLService.get_instance()
    subject = "Weekly Engineering Sync Agenda"
    body = "Hi team, please find attached the meeting notes from yesterday's retrospective and our sprint backlog for next week."
    
    result = service.predict(subject=subject, body=body)
    assert result["phishing_probability"] < 0.50
    assert result["prediction"] == 0
