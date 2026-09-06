"""
Passive URL threat analyzer for Mail Sentinel.
Evaluates extracted links for phishing indicators, deceptive domains, IP hosts,
and credential-harvesting patterns WITHOUT visiting any external endpoint.
"""
import re
from urllib.parse import urlparse, parse_qs, unquote
from typing import Dict, Any, List, Optional

SUSPICIOUS_TLDS = {
    ".xyz", ".top", ".tk", ".buzz", ".club", ".work", ".icu", 
    ".cf", ".ml", ".ga", ".gq", ".click", ".site", ".link", 
    ".online", ".surf", ".monster", ".info", ".biz", ".country"
}

CREDENTIAL_PATHS = {
    "login", "signin", "verify", "verification", "security", "account", 
    "update", "auth", "banking", "password", "reset", "wallet", "claim", 
    "dispute", "cancel", "unlock", "confirm", "portal", "sso"
}

HIGH_VALUE_BRANDS = [
    "paypal", "microsoft", "google", "apple", "amazon", "netflix", 
    "chase", "bankofamerica", "wellsfargo", "docusign", "dropbox", 
    "dhl", "fedex", "coinbase", "okta", "zoom", "stripe", "github"
]

IP_HOST_REGEX = re.compile(r'^(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?$')

class URLAnalyzerService:
    @staticmethod
    def analyze_single_url(url_item: Dict[str, Any]) -> Dict[str, Any]:
        raw_url = url_item.get("url", "").strip()
        anchor_text = url_item.get("anchor_text", "").strip()
        
        # Ensure scheme for parsing
        parse_target = raw_url
        if not parse_target.startswith(("http://", "https://")):
            parse_target = "http://" + parse_target

        try:
            parsed = urlparse(parse_target)
        except Exception:
            return {
                "url": raw_url,
                "anchor_text": anchor_text,
                "domain": "Invalid",
                "risk_score": 75,
                "status": "MALFORMED",
                "flags": ["Malformed or unparseable URL"]
            }

        hostname = (parsed.hostname or "").lower()
        path = unquote(parsed.path or "").lower()
        query = unquote(parsed.query or "").lower()
        scheme = parsed.scheme.lower()

        flags: List[str] = []
        score = 0

        # 1. IP Address as Host
        if IP_HOST_REGEX.match(hostname):
            score += 45
            flags.append("Host is a raw IP address instead of a domain name")

        # 2. Suspicious / Abused TLD
        tld_found = None
        for tld in SUSPICIOUS_TLDS:
            if hostname.endswith(tld):
                score += 25
                tld_found = tld
                flags.append(f"Uses high-abuse top-level domain ({tld})")
                break

        # 3. Protocol Security
        if scheme == "http":
            score += 15
            flags.append("Insecure HTTP protocol (no TLS/HTTPS encryption)")

        # 4. Excessive Length
        if len(raw_url) > 120:
            score += 20
            flags.append(f"Excessive URL length ({len(raw_url)} chars, common in obfuscation)")
        elif len(raw_url) > 75:
            score += 10
            flags.append(f"Elevated URL length ({len(raw_url)} chars)")

        # 5. Excessive Subdomains
        subdomains = hostname.split(".")
        if len(subdomains) > 4 and not IP_HOST_REGEX.match(hostname):
            score += 20
            flags.append(f"High subdomain depth ({len(subdomains)-2} subdomains)")

        # 6. Credential Harvesting Paths
        found_cred_paths = [p for p in CREDENTIAL_PATHS if f"/{p}" in path or f"-{p}" in path or f"/{p}" in query]
        if found_cred_paths:
            score += 25
            flags.append(f"Credential-harvesting path keywords detected: {', '.join(found_cred_paths)}")

        # 7. Brand Impersonation in Domain or Subdomain
        found_brand = None
        for brand in HIGH_VALUE_BRANDS:
            if brand in hostname:
                brand_domain = f"{brand}.com"
                # Check if it's the genuine brand domain
                if hostname != brand_domain and not hostname.endswith(f".{brand_domain}"):
                    score += 40
                    found_brand = brand
                    flags.append(f"Brand impersonation: domain '{hostname}' includes '{brand.capitalize()}' but is not an official domain")
                    break

        # 8. Anchor Text vs Destination Mismatch (Classic Phishing)
        # e.g., anchor text says "https://paypal.com" but href points to "http://evil.com"
        if anchor_text:
            anchor_lower = anchor_text.lower()
            if "http://" in anchor_lower or "https://" in anchor_lower or ".com" in anchor_lower or ".org" in anchor_lower:
                for brand in HIGH_VALUE_BRANDS:
                    if brand in anchor_lower and (not found_brand or found_brand != brand):
                        if brand not in hostname:
                            score += 50
                            flags.append(f"Severe link mismatch: Display text references '{brand.capitalize()}' but destination links to '{hostname}'")
                            break

        # 9. Open Redirect Parameters
        redirect_params = ["url", "redirect", "r", "next", "dest", "target", "link"]
        qs = parse_qs(parsed.query)
        for param in redirect_params:
            if param in qs:
                score += 15
                flags.append(f"Contains potential open-redirect parameter '?{param}='")
                break

        # 10. Punycode
        if "xn--" in hostname:
            score += 30
            flags.append("Contains Punycode (internationalized homograph tactic)")

        # Cap score
        score = min(100, score)

        status = "SAFE"
        if score >= 60:
            status = "CRITICAL" if score >= 80 else "HIGH"
        elif score >= 25:
            status = "SUSPICIOUS"

        return {
            "url": raw_url,
            "anchor_text": anchor_text,
            "domain": hostname or "N/A",
            "protocol": scheme,
            "risk_score": score,
            "status": status,
            "flags": flags
        }

    @staticmethod
    def analyze(url_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyzes all URLs in the email.
        """
        if not url_list:
            return {
                "urls": [],
                "count": 0,
                "risk_score": 0,
                "status": "SAFE",
                "findings": []
            }

        analyzed_urls = [URLAnalyzerService.analyze_single_url(u) for u in url_list]
        max_score = max((u["risk_score"] for u in analyzed_urls), default=0)
        high_risk_urls = [u for u in analyzed_urls if u["risk_score"] >= 60]
        suspicious_urls = [u for u in analyzed_urls if 25 <= u["risk_score"] < 60]

        findings: List[Dict[str, str]] = []
        if high_risk_urls:
            findings.append({
                "type": "HIGH_RISK_URL_DETECTED",
                "severity": "CRITICAL" if max_score >= 80 else "HIGH",
                "title": f"High Risk Phishing URL Detected ({len(high_risk_urls)} found)",
                "description": f"Found {len(high_risk_urls)} links exhibiting strong phishing indicators such as brand impersonation, deceptive TLDs, or credential harvesting paths.",
                "evidence": f"Top flag: {high_risk_urls[0]['url']} ({'; '.join(high_risk_urls[0]['flags'])})"
            })
        elif suspicious_urls:
            findings.append({
                "type": "SUSPICIOUS_URL_DETECTED",
                "severity": "MEDIUM",
                "title": f"Suspicious Links Detected ({len(suspicious_urls)} found)",
                "description": f"Found {len(suspicious_urls)} links with mild risk signals (e.g., HTTP protocol, uncommon TLDs).",
                "evidence": f"Sample: {suspicious_urls[0]['url']}"
            })

        status = "SAFE"
        if max_score >= 60:
            status = "CRITICAL" if max_score >= 80 else "HIGH"
        elif max_score >= 25:
            status = "SUSPICIOUS"

        return {
            "urls": analyzed_urls,
            "count": len(analyzed_urls),
            "risk_score": max_score,
            "status": status,
            "findings": findings
        }
