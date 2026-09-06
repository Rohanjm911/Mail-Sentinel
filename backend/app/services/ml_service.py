"""
Machine Learning inference service for Mail Sentinel.
Loads pre-trained TF-IDF + Logistic Regression artifacts and provides local, explainable predictions.
"""
import os
import joblib
import numpy as np
from typing import Dict, Any, List, Optional
from app.core.config import settings
from ml.preprocess import combine_subject_body

class MLService:
    _instance: Optional["MLService"] = None

    def __init__(self):
        self.vectorizer = None
        self.model = None
        self.loaded = False
        self._load_artifacts()

    @classmethod
    def get_instance(cls) -> "MLService":
        if cls._instance is None:
            cls._instance = MLService()
        return cls._instance

    def _load_artifacts(self):
        tfidf_path = settings.TFIDF_PATH
        model_path = settings.MODEL_PATH

        if os.path.exists(tfidf_path) and os.path.exists(model_path):
            try:
                self.vectorizer = joblib.load(tfidf_path)
                self.model = joblib.load(model_path)
                self.loaded = True
            except Exception as e:
                print(f"[MLService] Error loading ML artifacts: {e}")
                self.loaded = False
        else:
            print(f"[MLService] Artifacts not found at {tfidf_path} or {model_path}")
            self.loaded = False

    def predict(self, subject: str, body: str) -> Dict[str, Any]:
        """
        Runs local inference on subject and body.
        Returns prediction, probability, confidence, and top contributing n-grams.
        """
        if not self.loaded or self.vectorizer is None or self.model is None:
            return {
                "is_phishing": False,
                "phishing_probability": 0.0,
                "legitimate_probability": 1.0,
                "confidence": 0.0,
                "top_features": [],
                "model_status": "UNLOADED"
            }

        cleaned_text = combine_subject_body(subject, body)
        if not cleaned_text.strip():
            return {
                "is_phishing": False,
                "phishing_probability": 0.0,
                "legitimate_probability": 1.0,
                "confidence": 1.0,
                "top_features": [],
                "model_status": "EMPTY_INPUT"
            }

        # Vectorize
        X_vec = self.vectorizer.transform([cleaned_text])
        
        # Predict probability
        probs = self.model.predict_proba(X_vec)[0]
        p_legit = float(probs[0])
        p_phish = float(probs[1])

        is_phishing = p_phish >= 0.5
        confidence = float(max(p_legit, p_phish))

        # Explainability: Extract active n-grams with highest positive coefficients
        feature_names = np.array(self.vectorizer.get_feature_names_out())
        coefs = self.model.coef_[0]

        # Non-zero indices in sparse vector
        row_indices = X_vec.indices
        row_values = X_vec.data

        feature_contributions = []
        for idx, val in zip(row_indices, row_values):
            weight = float(coefs[idx])
            contrib = float(weight * val)
            feature_contributions.append({
                "feature": feature_names[idx],
                "weight": weight,
                "contribution": contrib
            })

        # Sort by contribution
        feature_contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)
        top_features = feature_contributions[:6]

        return {
            "is_phishing": is_phishing,
            "prediction": 1 if is_phishing else 0,
            "phishing_probability": round(p_phish, 4),
            "legitimate_probability": round(p_legit, 4),
            "confidence": round(confidence, 4),
            "top_features": top_features,
            "top_tokens": [f["feature"] for f in top_features],
            "model_status": "LOADED"
        }

    def is_available(self) -> bool:
        return self.loaded
