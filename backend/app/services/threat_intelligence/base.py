"""
Base class and interfaces for Threat Intelligence adapters in Mail Sentinel.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class ThreatIntelligenceAdapter(ABC):
    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Name of the threat intelligence provider."""
        pass

    @property
    @abstractmethod
    def is_configured(self) -> bool:
        """Returns True if required credentials / environment variables are set."""
        pass

    @abstractmethod
    async def lookup_url(self, url: str) -> Dict[str, Any]:
        """Query URL reputation."""
        pass

    @abstractmethod
    async def lookup_ip(self, ip: str) -> Dict[str, Any]:
        """Query IP address reputation."""
        pass

    @abstractmethod
    async def lookup_domain(self, domain: str) -> Dict[str, Any]:
        """Query domain reputation."""
        pass
