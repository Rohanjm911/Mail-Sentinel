"""
Threat Intelligence Manager for Mail Sentinel.
Provides unified interface across all configured threat intelligence feeds.
"""
from typing import Dict, Any, List
from app.services.threat_intelligence.virustotal import VirusTotalAdapter
from app.services.threat_intelligence.urlhaus import URLhausAdapter
from app.services.threat_intelligence.phishtank import PhishTankAdapter, AbuseIPDBAdapter

class ThreatIntelligenceManager:
    def __init__(self):
        self.adapters = [
            VirusTotalAdapter(),
            URLhausAdapter(),
            PhishTankAdapter(),
            AbuseIPDBAdapter()
        ]

    def get_provider_statuses(self) -> List[Dict[str, Any]]:
        """Returns the configuration status of each provider."""
        return [
            {
                "name": adapter.provider_name,
                "provider": adapter.provider_name,
                "configured": adapter.is_configured,
                "status": "Ready / Active" if adapter.is_configured else "Threat Intelligence: Not Configured"
            }
            for adapter in self.adapters
        ]

    async def lookup_ioc(self, ioc_type: str, value: str) -> Dict[str, Any]:
        """
        Queries all adapters for a specific indicator of compromise (url, ip, domain).
        """
        results = {}
        for adapter in self.adapters:
            if not adapter.is_configured:
                results[adapter.provider_name] = {
                    "status": "Threat Intelligence: Not Configured",
                    "configured": False,
                    "data": None
                }
                continue

            if ioc_type == "url":
                results[adapter.provider_name] = await adapter.lookup_url(value)
            elif ioc_type == "ip":
                results[adapter.provider_name] = await adapter.lookup_ip(value)
            elif ioc_type == "domain":
                results[adapter.provider_name] = await adapter.lookup_domain(value)

        return results

threat_intel_manager = ThreatIntelligenceManager()
