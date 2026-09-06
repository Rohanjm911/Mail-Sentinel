"""
Mail Sentinel Local Indicator of Compromise (IOC) Threat Analysis Engine.
Performs deterministic, multi-vector threat intelligence and risk analysis on URLs, domains, and IP addresses.
Operates 100% on-premises without requiring external cloud API keys.
"""
import re
import math
import socket
import ipaddress
from urllib.parse import urlparse
from typing import Dict, Any, List, Optional, Tuple

socket.setdefaulttimeout(1.0)

HIGH_RISK_TLDS = {
    "xyz", "top", "buzz", "club", "work", "icu", "tk", "ml", "ga", "cf", "gq",
    "country", "stream", "bid", "download", "racing", "accountant", "date",
    "faith", "loan", "party", "review", "trade", "vip", "win", "click", "rest",
    "fit", "gdn", "mom", "casa", "surf", "monster", "cfd", "sbs", "bond"
}

DYNAMIC_DNS_PROVIDERS = {
    "duckdns.org", "ngrok.io", "ngrok-free.app", "serveo.net", "localtunnel.me",
    "pagekite.me", "no-ip.com", "hopto.org", "zapto.org", "ddns.net", "sytes.net",
    "bounceme.net", "myftp.biz", "myvnc.com", "freeddns.org", "glitch.me", "workers.dev"
}

BRAND_TARGETS = [
    "paypal", "microsoft", "google", "apple", "amazon", "netflix", "chase",
    "wellsfargo", "bankofamerica", "meta", "facebook", "instagram", "linkedin",
    "dhl", "fedex", "usps", "irs", "coinbase", "binance", "metamask", "citibank",
    "americanexpress", "dropbox", "onedrive", "adobe", "telegram", "whatsapp"
]

CREDENTIAL_PATH_KEYWORDS = [
    "login", "signin", "sign-in", "log-in", "verify", "verification", "account",
    "update", "auth", "authenticate", "restore", "secure", "security", "banking",
    "wallet", "password", "passwd", "reset", "oauth", "confirm", "confirmation",
    "session", "validate", "validation", "security-check", "recover", "recovery"
]

def calculate_entropy(text: str) -> float:
    """Calculates Shannon entropy of a string."""
    if not text:
        return 0.0
    prob = [float(text.count(c)) / len(text) for c in set(text)]
    return -sum(p * math.log2(p) for p in prob)

def levenshtein_distance(s1: str, s2: str) -> int:
    """Computes Levenshtein edit distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]

def normalize_homoglyphs(text: str) -> str:
    """Normalizes common leetspeak character substitutions."""
    mapping = {
        '0': 'o', '1': 'l', '3': 'e', '4': 'a', '5': 's',
        '7': 't', '8': 'b', '@': 'a', '$': 's', '!': 'i',
        'vv': 'w', 'rn': 'm'
    }
    normalized = text.lower()
    for char, rep in mapping.items():
        normalized = normalized.replace(char, rep)
    return normalized

def check_brand_typosquatting(domain: str) -> Optional[Tuple[str, str, int]]:
    """
    Checks if domain impersonates any known brand.
    Returns (brand_name, matched_token, edit_distance) or None.
    """
    parts = domain.lower().split('.')
    domain_body = parts[0] if len(parts) > 1 else domain.lower()
    subtokens = re.split(r'[-_]', domain_body)
    
    # Check normalized tokens
    for token in [domain_body] + subtokens:
        normalized_token = normalize_homoglyphs(token)
        for brand in BRAND_TARGETS:
            if token == brand:
                continue # Exact match is official (unless accompanied by suspicious subdomains)
            
            # Check leetspeak transformation
            if normalized_token == brand:
                return (brand, token, 1)
            
            # Check Levenshtein distance
            dist = levenshtein_distance(token, brand)
            if 1 <= dist <= 2 and len(brand) >= 4:
                return (brand, token, dist)
                
            # Check if brand is embedded with suspicious prefixes/suffixes (e.g. paypal-verify)
            if brand in token and len(token) > len(brand):
                return (brand, token, 0)

    return None

class LocalIOCAnalyzer:
    """Analyzes IOCs locally using deterministic cybersecurity heuristics."""

    def analyze(self, ioc_type: str, value: str) -> Dict[str, Any]:
        ioc_type = ioc_type.lower().strip()
        value = value.strip()
        
        if ioc_type == "url":
            return self._analyze_url(value)
        elif ioc_type == "ip":
            return self._analyze_ip(value)
        elif ioc_type == "domain":
            return self._analyze_domain(value)
        else:
            # Fallback auto-detection
            if "://" in value or "/" in value:
                return self._analyze_url(value)
            elif re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', value):
                return self._analyze_ip(value)
            else:
                return self._analyze_domain(value)

    def _analyze_url(self, url: str) -> Dict[str, Any]:
        if not re.match(r'^[a-zA-Z]+://', url):
            url_to_parse = f"http://{url}"
        else:
            url_to_parse = url

        parsed = urlparse(url_to_parse)
        netloc = parsed.netloc or ""
        path = parsed.path or ""
        query = parsed.query or ""
        
        # Strip port from netloc
        host = netloc.split(':')[0].strip().lower()
        port = netloc.split(':')[1] if ':' in netloc else None
        scheme = parsed.scheme.lower() if parsed.scheme else "http"

        score = 0
        indicators = []
        recommendations = []

        # 1. Host Analysis
        is_raw_ip = bool(re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', host))
        if is_raw_ip:
            score += 35
            indicators.append({
                "category": "Host Analysis",
                "severity": "CRITICAL",
                "title": "Raw IP Address in URL",
                "description": f"The URL directly references a numerical IP address ({host}) rather than a registered domain.",
                "evidence": f"Host: {host}"
            })

        # 2. Scheme & Protocol
        if scheme == "http" and not is_raw_ip:
            score += 15
            indicators.append({
                "category": "Transport Security",
                "severity": "MEDIUM",
                "title": "Unencrypted HTTP Protocol",
                "description": "The URL uses plain HTTP without TLS encryption, exposing transmitted credentials to interception.",
                "evidence": f"Scheme: {scheme}"
            })

        # 3. Non-standard Ports
        if port and port not in ("80", "443"):
            score += 20
            indicators.append({
                "category": "Port Analysis",
                "severity": "HIGH",
                "title": f"Non-Standard Port ({port})",
                "description": f"The URL attempts to connect to port {port}, a technique frequently used to bypass standard web proxy inspection.",
                "evidence": f"Port: {port}"
            })

        # 4. Domain / TLD Analysis
        tld = host.split('.')[-1] if '.' in host else ""
        if tld in HIGH_RISK_TLDS:
            score += 25
            indicators.append({
                "category": "TLD Reputation",
                "severity": "HIGH",
                "title": f"High-Risk TLD (.{tld})",
                "description": f"The domain uses the '.{tld}' top-level domain, which has statistically elevated abuse and spam rates.",
                "evidence": f"TLD: .{tld}"
            })

        # 5. Dynamic DNS
        for ddns in DYNAMIC_DNS_PROVIDERS:
            if host == ddns or host.endswith(f".{ddns}"):
                score += 30
                indicators.append({
                    "category": "Dynamic DNS",
                    "severity": "HIGH",
                    "title": "Free Dynamic DNS Host",
                    "description": f"The URL is hosted on a dynamic DNS or tunnel service ({ddns}), commonly abused for short-lived phishing campaigns.",
                    "evidence": f"Provider: {ddns}"
                })
                break

        # 6. Typosquatting / Homoglyph
        brand_match = check_brand_typosquatting(host)
        if brand_match:
            brand, token, dist = brand_match
            score += 40
            indicators.append({
                "category": "Brand Impersonation",
                "severity": "CRITICAL",
                "title": f"Targeted Brand Impersonation ({brand.upper()})",
                "description": f"The domain structure appears designed to impersonate {brand.title()} using character substitution or deceptive prefixes.",
                "evidence": f"Target: {brand} | Matched Token: {token} | Distance: {dist}"
            })

        # 7. Path / Query Heuristics
        matched_keywords = [kw for kw in CREDENTIAL_PATH_KEYWORDS if kw in path.lower() or kw in query.lower()]
        if matched_keywords:
            score += 25
            indicators.append({
                "category": "Credential Harvesting",
                "severity": "HIGH",
                "title": "Credential & Verification Path Lures",
                "description": f"URL path or parameters contain high-risk authentication keywords: {', '.join(matched_keywords[:4])}.",
                "evidence": f"Path: {path} | Keywords: {', '.join(matched_keywords)}"
            })

        # 8. Punycode
        if "xn--" in host:
            score += 30
            indicators.append({
                "category": "IDN Spoofing",
                "severity": "HIGH",
                "title": "Punycode / Internationalized Domain Detected",
                "description": "The domain uses Punycode encoding, frequently used in homograph attacks to mimic legitimate character sets.",
                "evidence": f"Host: {host}"
            })

        # 9. Subdomain Depth
        subdomain_count = len(host.split('.')) - 2 if len(host.split('.')) > 2 else 0
        if subdomain_count >= 3:
            score += 20
            indicators.append({
                "category": "Domain Structure",
                "severity": "MEDIUM",
                "title": "Excessive Subdomain Stacking",
                "description": f"Domain contains {subdomain_count} nested subdomains, a pattern used to hide malicious domains inside legitimate-looking labels.",
                "evidence": f"Subdomains: {subdomain_count}"
            })

        # Final score calculation & bounding
        final_score = min(100, score)
        verdict, severity = self._compute_verdict(final_score)
        
        # Recommendations
        if final_score >= 60:
            recommendations.append("Block this URL and destination host across corporate proxy filters and firewalls.")
            recommendations.append("If credentials were submitted to this URL, immediately initiate password resets and revoke active sessions.")
        elif final_score >= 30:
            recommendations.append("Exercise caution. Inspect destination certificates and verify domain authenticity out-of-band.")
        else:
            recommendations.append("No active malicious indicators detected by local heuristic analysis.")

        return {
            "ioc": url,
            "type": "url",
            "verdict": verdict,
            "severity": severity,
            "risk_score": final_score,
            "confidence": 0.94 if final_score > 60 else (0.90 if final_score < 30 else 0.85),
            "summary": self._generate_summary("URL", final_score, verdict, indicators),
            "indicators": indicators,
            "telemetry": {
                "host": host,
                "scheme": scheme,
                "port": port or ("443" if scheme == "https" else "80"),
                "path": path,
                "is_raw_ip": is_raw_ip,
                "tld": tld,
                "entropy": round(calculate_entropy(host), 2),
                "matched_keywords": matched_keywords
            },
            "recommendations": recommendations
        }

    def _analyze_domain(self, domain: str) -> Dict[str, Any]:
        domain = domain.lower().strip()
        # Remove any protocol or path if accidentally entered
        if "://" in domain:
            domain = urlparse(domain).netloc.split(':')[0]
        if "/" in domain:
            domain = domain.split('/')[0]

        score = 0
        indicators = []
        recommendations = []

        # 1. TLD Analysis
        parts = domain.split('.')
        tld = parts[-1] if len(parts) > 1 else ""
        if tld in HIGH_RISK_TLDS:
            score += 30
            indicators.append({
                "category": "TLD Reputation",
                "severity": "HIGH",
                "title": f"High-Risk TLD (.{tld})",
                "description": f"The top-level domain '.{tld}' is associated with elevated rates of phishing, spam, and cybercrime.",
                "evidence": f"TLD: .{tld}"
            })

        # 2. Dynamic DNS
        for ddns in DYNAMIC_DNS_PROVIDERS:
            if domain == ddns or domain.endswith(f".{ddns}"):
                score += 35
                indicators.append({
                    "category": "Dynamic DNS",
                    "severity": "HIGH",
                    "title": "Dynamic DNS / Tunnel Service",
                    "description": f"The domain is hosted on a free dynamic DNS provider ({ddns}), commonly used by attackers for evasive infrastructure.",
                    "evidence": f"Provider: {ddns}"
                })
                break

        # 3. Brand Typosquatting / Impersonation
        brand_match = check_brand_typosquatting(domain)
        if brand_match:
            brand, token, dist = brand_match
            score += 45
            indicators.append({
                "category": "Brand Impersonation",
                "severity": "CRITICAL",
                "title": f"Brand Typosquatting Target: {brand.upper()}",
                "description": f"The domain appears crafted to mimic {brand.title()} via lexical alteration or homoglyph substitution.",
                "evidence": f"Target: {brand} | Matched: {token} | Edit Distance: {dist}"
            })

        # 4. Phishing Keywords in Domain
        kw_hits = [kw for kw in CREDENTIAL_PATH_KEYWORDS if kw in domain]
        if kw_hits:
            score += 25
            indicators.append({
                "category": "Suspicious Naming",
                "severity": "HIGH",
                "title": "Suspicious Security Keywords in Domain",
                "description": f"Domain name embeds high-risk deceptive keywords: {', '.join(kw_hits[:3])}.",
                "evidence": f"Keywords: {', '.join(kw_hits)}"
            })

        # 5. Punycode
        if "xn--" in domain:
            score += 30
            indicators.append({
                "category": "IDN Homograph",
                "severity": "HIGH",
                "title": "Punycode IDN Encoding Detected",
                "description": "Domain contains Punycode representation, often used in homograph attacks to substitute visually identical Unicode glyphs.",
                "evidence": f"Domain: {domain}"
            })

        # 6. Entropy & Length
        entropy = calculate_entropy(domain)
        if entropy > 4.2 and len(domain) > 15:
            score += 20
            indicators.append({
                "category": "Algorithmic Generation",
                "severity": "MEDIUM",
                "title": "High Entropy / Possible DGA",
                "description": "Domain name exhibits elevated character entropy, a pattern characteristic of Domain Generation Algorithms (DGA).",
                "evidence": f"Entropy: {entropy:.2f} | Length: {len(domain)}"
            })

        # 7. Passive DNS Resolution Check
        resolved_ips = []
        try:
            # Safe passive DNS check
            resolved_ips = socket.gethostbyname_ex(domain)[2]
        except Exception:
            pass

        final_score = min(100, score)
        verdict, severity = self._compute_verdict(final_score)

        if final_score >= 60:
            recommendations.append("Sinkhole or block domain resolution at enterprise recursive DNS resolvers.")
            recommendations.append("Add domain to perimeter security appliance deny-lists.")
        elif final_score >= 30:
            recommendations.append("Monitor outbound DNS queries to this domain for anomalous activity.")
        else:
            recommendations.append("No active threat indicators detected for this domain.")

        return {
            "ioc": domain,
            "type": "domain",
            "verdict": verdict,
            "severity": severity,
            "risk_score": final_score,
            "confidence": 0.95 if final_score > 60 else (0.90 if final_score < 30 else 0.85),
            "summary": self._generate_summary("Domain", final_score, verdict, indicators),
            "indicators": indicators,
            "telemetry": {
                "domain": domain,
                "tld": tld,
                "entropy": round(entropy, 2),
                "resolved_ips": resolved_ips[:5],
                "is_resolvable": bool(resolved_ips)
            },
            "recommendations": recommendations
        }

    def _analyze_ip(self, ip_str: str) -> Dict[str, Any]:
        ip_str = ip_str.strip()
        score = 0
        indicators = []
        recommendations = []

        is_valid = False
        is_private = False
        is_loopback = False
        is_multicast = False

        try:
            ip_obj = ipaddress.ip_address(ip_str)
            is_valid = True
            is_private = ip_obj.is_private
            is_loopback = ip_obj.is_loopback
            is_multicast = ip_obj.is_multicast
        except ValueError:
            pass

        if not is_valid:
            return {
                "ioc": ip_str,
                "type": "ip",
                "verdict": "INVALID",
                "severity": "LOW",
                "risk_score": 0,
                "confidence": 1.0,
                "summary": "Invalid IP address syntax.",
                "indicators": [{
                    "category": "Syntax",
                    "severity": "LOW",
                    "title": "Malformed IP Address",
                    "description": "The provided value does not conform to valid IPv4 or IPv6 standards.",
                    "evidence": ip_str
                }],
                "telemetry": {"valid": False},
                "recommendations": ["Verify IP address format."]
            }

        if is_private or is_loopback:
            indicators.append({
                "category": "Network Routing",
                "severity": "LOW",
                "title": "Private / Internal RFC 1918 Address",
                "description": "This IP belongs to private non-routable address space or local loopback.",
                "evidence": f"Private: {is_private}, Loopback: {is_loopback}"
            })
            score = 10
        else:
            # Public IP analysis
            # Suspicious known ranges / Heuristics
            octets = ip_str.split('.')
            if len(octets) == 4:
                first_octet = int(octets[0])
                # Unassigned or historically abusive ranges
                if first_octet in (0, 100, 198):
                    score += 20
                    indicators.append({
                        "category": "IP Allocation",
                        "severity": "MEDIUM",
                        "title": "Shared / Test Address Space",
                        "description": "IP belongs to special-purpose or carrier-grade address allocations.",
                        "evidence": f"Octet 1: {first_octet}"
                    })

        # Passive PTR record check
        ptr_record = None
        try:
            ptr_record = socket.gethostbyaddr(ip_str)[0]
            indicators.append({
                "category": "Reverse DNS",
                "severity": "LOW",
                "title": "Reverse DNS (PTR) Resolved",
                "description": f"Reverse lookup resolved to host: {ptr_record}",
                "evidence": f"PTR: {ptr_record}"
            })
        except Exception:
            ptr_record = "None (No PTR record)"

        final_score = min(100, score)
        verdict, severity = self._compute_verdict(final_score)

        if final_score >= 60:
            recommendations.append("Block ingress and egress traffic to this IP at the border firewall.")
        else:
            recommendations.append("Evaluate surrounding ASN and reputational feeds before taking blocking action.")

        return {
            "ioc": ip_str,
            "type": "ip",
            "verdict": verdict,
            "severity": severity,
            "risk_score": final_score,
            "confidence": 0.88,
            "summary": f"IP address evaluated: {ip_str}. {('Private/Local address.' if is_private else 'Public routable IP address.')}",
            "indicators": indicators,
            "telemetry": {
                "ip": ip_str,
                "is_private": is_private,
                "is_loopback": is_loopback,
                "reverse_dns": ptr_record
            },
            "recommendations": recommendations
        }

    def _compute_verdict(self, score: int) -> Tuple[str, str]:
        if score >= 80:
            return ("CRITICAL THREAT", "CRITICAL")
        elif score >= 60:
            return ("HIGH RISK", "HIGH")
        elif score >= 30:
            return ("SUSPICIOUS", "MEDIUM")
        else:
            return ("CLEAN / SAFE", "LOW")

    def _generate_summary(self, ioc_category: str, score: int, verdict: str, indicators: List[Dict[str, Any]]) -> str:
        if not indicators:
            return f"No malicious patterns or threat indicators detected for this {ioc_category}."
        
        top_indicator = indicators[0]['title']
        if score >= 60:
            return f"High risk {ioc_category.lower()} detected. Primary threat indicator: {top_indicator}. {len(indicators)} security finding(s) cataloged."
        elif score >= 30:
            return f"Suspicious {ioc_category.lower()} attributes observed. Finding: {top_indicator}."
        else:
            return f"Routine {ioc_category.lower()}. Minor or benign indicators detected."

local_ioc_analyzer = LocalIOCAnalyzer()
