"""
Header analysis service for Mail Sentinel.
Analyzes email transport headers, Received chain hops, Return-Path consistency,
and flags missing standard RFC 5322 headers.
Never fabricates missing values; explicitly marks them as 'Not Available'.
"""
import re
from typing import Dict, Any, List, Optional

IP_IN_RECEIVED_REGEX = re.compile(r'\[(?P<ip>(?:\d{1,3}\.){3}\d{1,3})\]')

class HeaderAnalyzerService:
    @staticmethod
    def analyze(headers: Dict[str, Any], sender_domain: str = "") -> Dict[str, Any]:
        """
        Analyzes headers dictionary extracted from MIME or raw input.
        """
        findings: List[Dict[str, str]] = []
        risk_score = 0

        # Normalization: case-insensitive header lookup helper
        lower_headers = {k.lower(): v for k, v in headers.items()}

        date_val = lower_headers.get("date")
        message_id = lower_headers.get("message-id")
        return_path = lower_headers.get("return-path")
        reply_to = lower_headers.get("reply-to")
        auth_results = lower_headers.get("authentication-results")
        received_raw = lower_headers.get("received")

        # 1. Missing Standard RFC 5322 Headers
        missing_critical_headers = []
        if not date_val:
            missing_critical_headers.append("Date")
        if not message_id:
            missing_critical_headers.append("Message-ID")

        if missing_critical_headers:
            risk_score += 20
            findings.append({
                "type": "MISSING_RFC_HEADERS",
                "severity": "MEDIUM",
                "title": f"Missing Standard Headers ({', '.join(missing_critical_headers)})",
                "description": f"Standard email envelope headers ({', '.join(missing_critical_headers)}) are missing, which frequently occurs in automated mass-phishing tools.",
                "evidence": f"Missing: {', '.join(missing_critical_headers)}"
            })

        # 2. Return-Path Mismatch
        return_path_domain = ""
        if return_path:
            return_path_str = str(return_path).strip(' <>"\'')
            if "@" in return_path_str:
                return_path_domain = return_path_str.split("@", 1)[1].lower().strip(" >")
            
            if sender_domain and return_path_domain:
                if sender_domain != return_path_domain and not return_path_domain.endswith(f".{sender_domain}") and not sender_domain.endswith(f".{return_path_domain}"):
                    risk_score += 25
                    findings.append({
                        "type": "RETURN_PATH_MISMATCH",
                        "severity": "MEDIUM",
                        "title": "Return-Path vs From Domain Inconsistency",
                        "description": f"The bounce address (Return-Path: '{return_path_domain}') does not match the sender domain ('{sender_domain}').",
                        "evidence": f"From: {sender_domain} | Return-Path: {return_path_domain}"
                    })

        # 3. Received Chain Routing Analysis
        received_hops: List[str] = []
        if received_raw:
            if isinstance(received_raw, list):
                received_hops = [str(h) for h in received_raw]
            else:
                received_hops = [str(received_raw)]

        extracted_hop_ips = []
        for hop in received_hops:
            matches = IP_IN_RECEIVED_REGEX.findall(hop)
            for ip in matches:
                extracted_hop_ips.append(ip)

        if received_hops and len(received_hops) == 1 and not auth_results:
            risk_score += 15
            findings.append({
                "type": "SUSPICIOUS_SINGLE_HOP",
                "severity": "LOW",
                "title": "Direct Single-Hop Mail Transfer",
                "description": "The message appears to have been injected directly into the recipient server with minimal relay hops.",
                "evidence": f"Hops count: 1"
            })

        risk_score = min(100, risk_score)
        status = "SAFE"
        if risk_score >= 50:
            status = "HIGH"
        elif risk_score >= 20:
            status = "SUSPICIOUS"

        return {
            "risk_score": risk_score,
            "status": status,
            "date": str(date_val) if date_val else "Not Available",
            "message_id": str(message_id) if message_id else "Not Available",
            "return_path": str(return_path) if return_path else "Not Available",
            "reply_to": str(reply_to) if reply_to else "Not Available",
            "hop_count": len(received_hops),
            "relay_ips": extracted_hop_ips,
            "findings": findings
        }
