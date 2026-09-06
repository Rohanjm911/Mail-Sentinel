"""
URLhaus Threat Intelligence adapter.
Requires URLHAUS_API_KEY environment variable.
"""
import httpx
from typing import Dict, Any
from app.core.config import settings
from app.services.threat_intelligence.base import ThreatIntelligenceAdapter

class URLhausAdapter(ThreatIntelligenceAdapter):
    @property
    def provider_name(self) -> str:
        return "URLhaus"

    @property
    def is_configured(self) -> bool:
        return bool(settings.URLHAUS_API_KEY and settings.URLHAUS_API_KEY.strip())

    async def lookup_url(self, url: str) -> Dict[str, Any]:
        if not self.is_configured:
            return {
                "provider": self.provider_name,
                "status": "Threat Intelligence: Not Configured",
                "configured": False,
                "data": None
            }
        try:
            headers = {"Auth-Key": settings.URLHAUS_API_KEY}
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    "https://urlhaus-api.abuse.ch/v1/url/",
                    data={"url": url},
                    headers=headers
                )
                return {
                    "provider": self.provider_name,
                    "status": "Configured" if resp.status_code == 200 else f"HTTP {resp.status_code}",
                    "configured": True,
                    "data": resp.json() if resp.status_code == 200 else None
                }
        except Exception as e:
            return {
                "provider": self.provider_name,
                "status": f"Error: {str(e)}",
                "configured": True,
                "data": None
            }

    async def lookup_ip(self, ip: str) -> Dict[str, Any]:
        return {
            "provider": self.provider_name,
            "status": "IP lookup not supported by URLhaus directly (use host/url)",
            "configured": self.is_configured,
            "data": None
        }

    async def lookup_domain(self, domain: str) -> Dict[str, Any]:
        if not self.is_configured:
            return {
                "provider": self.provider_name,
                "status": "Threat Intelligence: Not Configured",
                "configured": False,
                "data": None
            }
        try:
            headers = {"Auth-Key": settings.URLHAUS_API_KEY}
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    "https://urlhaus-api.abuse.ch/v1/host/",
                    data={"host": domain},
                    headers=headers
                )
                return {
                    "provider": self.provider_name,
                    "status": "Configured" if resp.status_code == 200 else f"HTTP {resp.status_code}",
                    "configured": True,
                    "data": resp.json() if resp.status_code == 200 else None
                }
        except Exception as e:
            return {
                "provider": self.provider_name,
                "status": f"Error: {str(e)}",
                "configured": True,
                "data": None
            }
