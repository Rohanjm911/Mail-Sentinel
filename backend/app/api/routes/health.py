"""
Health check route for Mail Sentinel.
"""
from fastapi import APIRouter
from app.core.config import settings
from app.services.ml_service import MLService

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    ml_service = MLService.get_instance()
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "detection_engine": "online",
        "ml_model_loaded": ml_service.loaded
    }
