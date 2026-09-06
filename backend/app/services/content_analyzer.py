"""
Content and NLP heuristics analyzer for Mail Sentinel.
Extracts explainable social-engineering indicators: urgency, coercive threats,
credential harvesting, fake financial notices, and account suspensions.
"""
import re
from typing import Dict, Any, List

INDICATOR_PATTERNS = {
    "URGENCY": {
        "title": "Urgency & Time-Pressure Tactics",
        "severity": "HIGH",
        "weight": 20,
        "keywords": [
            r"\burgent\b", r"\bimmediate(?:ly)?\b", r"\baction required\b", 
            r"\bwithin 24 hours?\b", r"\bwithin 12 hours?\b", r"\bwithin 2 hours?\b",
            r"\bfinal notice\b", r"\bfinal reminder\b", r"\bexpires today\b",
            r"\btime[-\s]sensitive\b", r"\bdo not delay\b", r"\bclose of business today\b"
        ]
    },
    "FEAR_COERCION": {
        "title": "Fear & Coercive Disruption Threats",
        "severity": "HIGH",
        "weight": 25,
        "keywords": [
            r"\baccount (?:has been |will be )?(?:suspended|restricted|blocked|frozen|locked)\b",
            r"\bpermanent(?:ly)? (?:deactivated|closed|deleted)\b",
            r"\bunauthorized (?:sign-in|login|access|transaction|attempt)\b",
            r"\blegal (?:action|proceedings|arbitration)\b",
            r"\blaw enforcement\b", r"\basset liquidation\b", r"\bpayroll withheld\b"
        ]
    },
    "CREDENTIAL_HARVESTING": {
        "title": "Credential & Sensitive Data Harvesting Lures",
        "severity": "CRITICAL",
        "weight": 35,
        "keywords": [
            r"\bverify your (?:account|identity|credentials|password|card)\b",
            r"\benter your (?:password|pin|credentials|passcode|ssn)\b",
            r"\bconfirm your (?:billing|card details|banking details)\b",
            r"\b(?:12-word|recovery) seed phrase\b",
            r"\bupdate your (?:login|payment details)\b",
            r"\bprovide your (?:social security number|credit card number)\b"
        ]
    },
    "FINANCIAL_LURES": {
        "title": "Financial Transaction & Fake Invoice Lures",
        "severity": "HIGH",
        "weight": 20,
        "keywords": [
            r"\bwire transfer\b", r"\bpast due invoice\b", r"\boverdue invoice\b",
            r"\bunclaimed (?:refund|tax rebate|funds)\b", r"\bdirect deposit update\b",
            r"\bautomatic renewal of \$\d+\b", r"\bdebited from your account\b"
        ]
    },
    "PRIZE_SCAM": {
        "title": "Reward / Prize / Lottery Scam Indicators",
        "severity": "MEDIUM",
        "weight": 20,
        "keywords": [
            r"\byou have won\b", r"\bselected for (?:a prize|reward)\b",
            r"\bcongratulations (?:winner|user)\b", r"\bfree bonus\b",
            r"\bexclusive bitcoin giveaway\b"
        ]
    }
}

class ContentAnalyzerService:
    @staticmethod
    def analyze(subject: str, body: str) -> Dict[str, Any]:
        """
        Scans subject and body for social-engineering and psychological manipulation patterns.
        """
        full_text = f"{subject}\n\n{body}"
        detected_categories: List[str] = []
        matched_indicators: List[Dict[str, Any]] = []
        findings: List[Dict[str, str]] = []
        total_risk_score = 0

        for cat_key, config in INDICATOR_PATTERNS.items():
            category_matches = []
            for pattern in config["keywords"]:
                found = re.findall(pattern, full_text, re.IGNORECASE)
                if found:
                    category_matches.extend(found)

            if category_matches:
                unique_matches = list(dict.fromkeys(category_matches))[:4]
                detected_categories.append(cat_key)
                total_risk_score += config["weight"]

                matched_indicators.append({
                    "category": cat_key,
                    "title": config["title"],
                    "severity": config["severity"],
                    "matches": unique_matches
                })

                findings.append({
                    "type": f"CONTENT_{cat_key}",
                    "severity": config["severity"],
                    "title": config["title"],
                    "description": f"Content contains language patterns characteristic of {config['title'].lower()}.",
                    "evidence": f"Detected phrases: {', '.join(unique_matches)}"
                })

        total_risk_score = min(100, total_risk_score)
        
        status = "SAFE"
        if total_risk_score >= 60:
            status = "CRITICAL" if total_risk_score >= 80 else "HIGH"
        elif total_risk_score >= 25:
            status = "SUSPICIOUS"

        return {
            "risk_score": total_risk_score,
            "status": status,
            "detected_categories": detected_categories,
            "indicators": matched_indicators,
            "findings": findings
        }
