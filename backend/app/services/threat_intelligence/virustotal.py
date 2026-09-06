"""
VirusTotal Threat Intelligence adapter.
Requires VIRUSTOTAL_API_KEY environment variable.
"""
import httpx
from typing import Dict, Any
from app.core.config import settings
from app.services.threat_intelligence.base import ThreatIntelligenceAdapter

class VirusTotalAdapter(ThreatIntelligenceAdapter):
    @property
    def provider_name(self) -> str:
        return "VirusTotal"

    @property
    def is_configured(self) -> bool:
        return bool(settings.VIRUSTOTAL_API_KEY and settings.VIRUSTOTAL_API_KEY.strip())

    async def lookup_url(self, url: str) -> Dict[str, Any]:
        if not self.is_configured:
            return {
                "provider": self.provider_name,
                "status": "Threat Intelligence: Not Configured",
                "configured": False,
                "data": None
            }

        headers = {"x-apikey": settings.VIRUSTOTAL_API_KEY}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    "https://www.virustotal.com/api/v3/urls",
                    data={"url": url},
                    headers=headers
                )
                if resp.status_code in (200, 201):
                    return {
                        "provider": self.provider_name,
                        "status": "Configured",
                        "configured": True,
                        "data": resp.json()
                    }
                return {
                    "provider": self.provider_name,
                    "status": f"Error: HTTP {resp.status_code}",
                    "configured": True,
                    "data": None
                }
        except Exception as e:
            return {
                "provider": self.provider_name,
                "status": f"Query Error: {str(e)}",
                "configured": True,
                "data": None
            }

    async def lookup_ip(self, ip: str) -> Dict[str, Any]:
        if not self.is_configured:
            return {
                "provider": self.provider_name,
                "status": "Threat Intelligence: Not Configured",
                "configured": False,
                "data": None
            }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"https://www.virustotal.com/api/v3/ip_addresses/{ip}",
                    headers={"x-apikey": settings.VIRUSTOTAL_API_KEY}
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

    async def lookup_domain(self, domain: str) -> Dict[str, Any]:
        if not self.is_configured:
            return {
                "provider": self.provider_name,
                "status": "Threat Intelligence: Not Configured",
                "configured": False,
                "data": None
            }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    f"https://www.virustotal.com/api/v3/domains/{domain}",
                    headers={"x-apikey": settings.VIRUSTOTAL_API_KEY}
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
