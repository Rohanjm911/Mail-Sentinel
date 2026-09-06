"""
Threat Intelligence Manager for Mail Sentinel.
Provides unified interface across all configured threat intelligence feeds,
featuring the on-premises Mail Sentinel Local Threat Engine as the primary analyzer.
"""
from typing import Dict, Any, List
from app.services.threat_intelligence.base import ThreatIntelligenceAdapter
from app.services.threat_intelligence.virustotal import VirusTotalAdapter
from app.services.threat_intelligence.urlhaus import URLhausAdapter
from app.services.threat_intelligence.phishtank import PhishTankAdapter, AbuseIPDBAdapter
from app.services.threat_intelligence.ioc_analyzer import local_ioc_analyzer

class MailSentinelLocalAdapter(ThreatIntelligenceAdapter):
    @property
    def provider_name(self) -> str:
        return "Mail Sentinel Local Threat Engine"

    @property
    def is_configured(self) -> bool:
        return True

    async def lookup_url(self, url: str) -> Dict[str, Any]:
        result = local_ioc_analyzer.analyze("url", url)
        return {
            "provider": self.provider_name,
            "status": "Analyzed / Active",
            "configured": True,
            "data": result
        }

    async def lookup_ip(self, ip: str) -> Dict[str, Any]:
        result = local_ioc_analyzer.analyze("ip", ip)
        return {
            "provider": self.provider_name,
            "status": "Analyzed / Active",
            "configured": True,
            "data": result
        }

    async def lookup_domain(self, domain: str) -> Dict[str, Any]:
        result = local_ioc_analyzer.analyze("domain", domain)
        return {
            "provider": self.provider_name,
            "status": "Analyzed / Active",
            "configured": True,
            "data": result
        }

class ThreatIntelligenceManager:
    def __init__(self):
        self.local_adapter = MailSentinelLocalAdapter()
        self.external_adapters = [
            VirusTotalAdapter(),
            URLhausAdapter(),
            PhishTankAdapter(),
            AbuseIPDBAdapter()
        ]

    def get_provider_statuses(self) -> List[Dict[str, Any]]:
        """Returns the configuration status of each provider."""
        statuses = [
            {
                "name": self.local_adapter.provider_name,
                "provider": self.local_adapter.provider_name,
                "configured": True,
                "status": "Ready / Active (Built-in)",
                "description": "On-premises multi-vector lexical, heuristic, and homoglyph intelligence engine."
            }
        ]
        for adapter in self.external_adapters:
            statuses.append({
                "name": adapter.provider_name,
                "provider": adapter.provider_name,
                "configured": adapter.is_configured,
                "status": "Ready / Active" if adapter.is_configured else "Threat Intelligence: Not Configured",
                "description": f"External feed integration for {adapter.provider_name}."
            })
        return statuses

    async def lookup_ioc(self, ioc_type: str, value: str) -> Dict[str, Any]:
        """
        Queries all adapters for a specific indicator of compromise (url, ip, domain).
        Always provides full local analysis and reports external provider states.
        """
        # 1. Authoritative local analysis
        local_result = local_ioc_analyzer.analyze(ioc_type, value)
        
        # 2. Query external providers
        provider_results = {
            self.local_adapter.provider_name: {
                "provider": self.local_adapter.provider_name,
                "status": "Analyzed / Active",
                "configured": True,
                "data": local_result
            }
        }

        for adapter in self.external_adapters:
            if not adapter.is_configured:
                provider_results[adapter.provider_name] = {
                    "provider": adapter.provider_name,
                    "status": "Threat Intelligence: Not Configured",
                    "configured": False,
                    "data": None
                }
                continue

            try:
                if ioc_type == "url":
                    provider_results[adapter.provider_name] = await adapter.lookup_url(value)
                elif ioc_type == "ip":
                    provider_results[adapter.provider_name] = await adapter.lookup_ip(value)
                elif ioc_type == "domain":
                    provider_results[adapter.provider_name] = await adapter.lookup_domain(value)
            except Exception as e:
                provider_results[adapter.provider_name] = {
                    "provider": adapter.provider_name,
                    "status": f"Error: {str(e)}",
                    "configured": True,
                    "data": None
                }

        return {
            "analysis": local_result,
            "providers": provider_results
        }

threat_intel_manager = ThreatIntelligenceManager()
