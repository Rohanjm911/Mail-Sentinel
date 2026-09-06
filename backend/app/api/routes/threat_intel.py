"""
Threat Intelligence status and query routes for Mail Sentinel.
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.services.threat_intelligence import threat_intel_manager

router = APIRouter(prefix="/threat-intel", tags=["Threat Intelligence"])

class IOCLookupRequest(BaseModel):
    type: str = Field(..., description="Type of indicator: 'url', 'domain', or 'ip'")
    value: str = Field(..., description="The indicator value to analyze")

@router.get("/status")
def get_threat_intel_status():
    """
    Returns configured statuses for all threat intelligence providers.
    Includes the built-in local analysis engine and external feed adapters.
    Never reveals API keys.
    """
    return {
        "providers": threat_intel_manager.get_provider_statuses()
    }

@router.post("/lookup")
async def lookup_ioc(payload: IOCLookupRequest):
    """
    Queries threat intelligence engine for an indicator of compromise.
    Executes local multi-vector heuristics and external configured feeds.
    """
    clean_val = payload.value.strip()
    clean_type = payload.type.lower().strip()

    if not clean_val:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "EMPTY_IOC", "message": "Indicator value cannot be empty."}
        )

    if clean_type not in ("url", "domain", "ip"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_IOC_TYPE", "message": "IOC type must be 'url', 'domain', or 'ip'."}
        )

    res = await threat_intel_manager.lookup_ioc(clean_type, clean_val)
    return {
        "ioc": clean_val,
        "type": clean_type,
        "analysis": res.get("analysis", {}),
        "results": res.get("providers", {})
    }
