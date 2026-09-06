"""
Core application configuration and settings for Mail Sentinel.
Environment-based secrets and safe defaults.
"""
import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True, extra="allow")

    PROJECT_NAME: str = "Mail Sentinel"
    TAGLINE: str = "Detect the Threat. Protect the Inbox."
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Environment & Debug
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")

    # Database: Default to PostgreSQL with SQLite fallback capability
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:postgres@localhost:5432/mail_sentinel"
    )
    SQLITE_FALLBACK_URL: str = "sqlite:///./mail_sentinel.db"

    # Security & Limits
    MAX_UPLOAD_SIZE_BYTES: int = 15 * 1024 * 1024  # 15 MB max .eml upload
    ALLOWED_EXTENSIONS: List[str] = [".eml", ".txt"]
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Threat Intelligence API Keys (optional, never exposed to client)
    VIRUSTOTAL_API_KEY: str = os.getenv("VIRUSTOTAL_API_KEY", "")
    URLHAUS_API_KEY: str = os.getenv("URLHAUS_API_KEY", "")
    PHISHTANK_API_KEY: str = os.getenv("PHISHTANK_API_KEY", "")
    ABUSEIPDB_API_KEY: str = os.getenv("ABUSEIPDB_API_KEY", "")

    # ML Artifacts Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ML_ARTIFACTS_DIR: str = os.path.join(BASE_DIR, "..", "ml", "artifacts")
    TFIDF_PATH: str = os.path.join(ML_ARTIFACTS_DIR, "tfidf.joblib")
    MODEL_PATH: str = os.path.join(ML_ARTIFACTS_DIR, "phishing_model.joblib")

settings = Settings()
