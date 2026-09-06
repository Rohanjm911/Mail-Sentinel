"""
PhishTank and AbuseIPDB Threat Intelligence adapters for Mail Sentinel.
Adheres to zero-fabrication and clear 'Not Configured' status if credentials are unset.
"""
import httpx
from typing import Dict, Any
from app.core.config import settings
from app.services.threat_intelligence.base import ThreatIntelligenceAdapter

class PhishTankAdapter(ThreatIntelligenceAdapter):
    @property
    def provider_name(self) -> str:
        return "PhishTank"

    @property
    def is_configured(self) -> bool:
        return bool(settings.PHISHTANK_API_KEY and settings.PHISHTANK_API_KEY.strip())

    async def lookup_url(self, url: str) -> Dict[str, Any]:
        if not self.is_configured:
            return {
                "provider": self.provider_name,
                "status": "Threat Intelligence: Not Configured",
                "configured": False,
                "data": None
            }
        try:
            data = {
                "url": url,
                "format": "json",
                "app_key": settings.PHISHTANK_API_KEY
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post("https://checkurl.phishtank.com/checkurl/", data=data)
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
            "status": "IP lookup not supported by PhishTank",
            "configured": self.is_configured,
            "data": None
        }

    async def lookup_domain(self, domain: str) -> Dict[str, Any]:
        return await self.lookup_url(f"http://{domain}")

class AbuseIPDBAdapter(ThreatIntelligenceAdapter):
    @property
    def provider_name(self) -> str:
        return "AbuseIPDB"

    @property
    def is_configured(self) -> bool:
        return bool(settings.ABUSEIPDB_API_KEY and settings.ABUSEIPDB_API_KEY.strip())

    async def lookup_url(self, url: str) -> Dict[str, Any]:
        return {
            "provider": self.provider_name,
            "status": "URL lookup not supported by AbuseIPDB (use IP)",
            "configured": self.is_configured,
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
            headers = {
                "Key": settings.ABUSEIPDB_API_KEY,
                "Accept": "application/json"
            }
            params = {
                "ipAddress": ip,
                "maxAgeInDays": "90"
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get("https://api.abuseipdb.com/api/v2/check", headers=headers, params=params)
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
        return {
            "provider": self.provider_name,
            "status": "Domain lookup not supported by AbuseIPDB (IP required)",
            "configured": self.is_configured,
            "data": None
        }
