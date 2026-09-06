"""
Threat Intelligence status and query routes for Mail Sentinel.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.threat_intelligence import threat_intel_manager

router = APIRouter(prefix="/threat-intel", tags=["Threat Intelligence"])

class IOCLookupRequest(BaseModel):
    type: str  # "url", "ip", "domain"
    value: str

@router.get("/status")
def get_threat_intel_status():
    """
    Returns configured statuses for external threat intelligence providers.
    Never reveals API keys.
    """
    return {
        "providers": threat_intel_manager.get_provider_statuses()
    }

@router.post("/lookup")
async def lookup_ioc(payload: IOCLookupRequest):
    """
    Queries configured threat intelligence feeds for an indicator of compromise.
    """
    results = await threat_intel_manager.lookup_ioc(payload.type.lower(), payload.value.strip())
    return {
        "ioc": payload.value,
        "type": payload.type,
        "results": results
    }
