"""
Sender analysis service for Mail Sentinel.
Detects display-name spoofing, typosquatting/homoglyphs against high-value brands,
Reply-To address inconsistencies, syntax anomalies, and suspicious domain patterns.
"""
import re
from typing import Dict, Any, List, Optional

FREE_MAIL_DOMAINS = {
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com", 
    "aol.com", "icloud.com", "protonmail.com", "proton.me", "mail.com", "zoho.com"
}

HIGH_VALUE_BRANDS = [
    "paypal", "microsoft", "google", "apple", "amazon", "netflix", 
    "chase", "bankofamerica", "wellsfargo", "docusign", "dropbox", 
    "dhl", "fedex", "coinbase", "okta", "zoom", "stripe", "github"
]

EMAIL_HEADER_REGEX = re.compile(r'^(?:(?P<name>.*?)\s*)?<(?P<email>[^>]+)>$|^(?P<raw_email>[^\s@]+@[^\s@]+)$')

def levenshtein_distance(s1: str, s2: str) -> int:
    """Calculates classic Levenshtein edit distance."""
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

class SenderAnalyzerService:
    @staticmethod
    def parse_address(raw_sender: str) -> Dict[str, str]:
        """
        Parses display name and email address from RFC header like:
        "PayPal Support" <support@paypal-auth.com> or just support@paypal.com
        """
        clean = raw_sender.strip()
        match = EMAIL_HEADER_REGEX.match(clean)
        display_name = ""
        email_addr = ""

        if match:
            display_name = (match.group("name") or "").strip(' "\'')
            email_addr = (match.group("email") or match.group("raw_email") or "").strip()
        else:
            # Fallback split
            if "<" in clean and ">" in clean:
                parts = clean.split("<")
                display_name = parts[0].strip(' "\'')
                email_addr = parts[1].split(">")[0].strip()
            else:
                email_addr = clean

        domain = ""
        local_part = ""
        if "@" in email_addr:
            parts = email_addr.split("@", 1)
            local_part = parts[0].strip()
            domain = parts[1].strip().lower()

        return {
            "raw": clean,
            "display_name": display_name,
            "email": email_addr,
            "local_part": local_part,
            "domain": domain
        }

    @staticmethod
    def analyze(sender_raw: Optional[str] = None, reply_to_raw: Optional[str] = None, raw_sender: Optional[str] = None) -> Dict[str, Any]:
        """
        Performs comprehensive sender analysis.
        Returns risk points, status, and explainable findings.
        """
        effective_sender = sender_raw or raw_sender or ""
        findings: List[Dict[str, str]] = []
        risk_score = 0  # 0 to 100 for this category

        sender = SenderAnalyzerService.parse_address(effective_sender)
        domain = sender["domain"]
        display_name = sender["display_name"].lower()
        local_part = sender["local_part"].lower()

        # 1. Syntax Check
        if not sender["email"] or not domain or "." not in domain:
            risk_score += 40
            findings.append({
                "type": "INVALID_SENDER_SYNTAX",
                "severity": "HIGH",
                "title": "Invalid Sender Syntax",
                "description": f"The sender address '{sender_raw}' is malformed or missing a valid domain.",
                "evidence": sender_raw
            })

        # 2. Free-mail domain evaluation
        is_freemail = domain in FREE_MAIL_DOMAINS
        uses_freemail_for_org = False

        # 3. Brand Impersonation & Display-Name Spoofing
        detected_brand: Optional[str] = None
        for brand in HIGH_VALUE_BRANDS:
            if brand in display_name or brand in local_part:
                detected_brand = brand
                break

        if detected_brand:
            # Check if domain actually belongs to the brand
            # e.g., paypal.com vs paypal-security.xyz or paypal@gmail.com
            brand_legit_domain = f"{detected_brand}.com"
            is_official_domain = domain == brand_legit_domain or domain.endswith(f".{brand_legit_domain}")

            if not is_official_domain:
                if is_freemail:
                    risk_score += 45
                    uses_freemail_for_org = True
                    findings.append({
                        "type": "FREEMAIL_BRAND_IMPERSONATION",
                        "severity": "HIGH",
                        "title": f"Brand Impersonation via Free-Mail Provider",
                        "description": f"The sender claims to represent '{detected_brand.capitalize()}' in display name/user part but uses a free public email provider ({domain}).",
                        "evidence": f"Display: '{sender['display_name']}' | Domain: {domain}"
                    })
                else:
                    risk_score += 50
                    findings.append({
                        "type": "DISPLAY_NAME_SPOOFING",
                        "severity": "HIGH",
                        "title": f"Display Name Spoofing Detected",
                        "description": f"The sender's display name claims to be '{detected_brand.capitalize()}', but the underlying sender domain is '{domain}'.",
                        "evidence": f"Display: '{sender['display_name']}' | Actual Domain: {domain}"
                    })

        # 4. Domain Typosquatting / Homoglyphs / Similarity Check
        # Check if the domain itself is a lookalike of a brand domain
        domain_without_tld = domain.split(".")[0] if "." in domain else domain
        for brand in HIGH_VALUE_BRANDS:
            dist = levenshtein_distance(domain_without_tld, brand)
            # If distance is 1 or 2, and length is close, likely typosquatting
            if 1 <= dist <= 2 and abs(len(domain_without_tld) - len(brand)) <= 2:
                risk_score += 40
                findings.append({
                    "type": "TYPOSQUATTING_DOMAIN",
                    "severity": "HIGH",
                    "title": f"Lookalike / Typosquatted Domain Detected",
                    "description": f"Domain '{domain}' is deceptively similar to target brand '{brand.capitalize()}' (Levenshtein distance: {dist}).",
                    "evidence": f"Sender Domain: {domain} vs Brand: {brand}.com"
                })
                break

        # 5. Punycode / IDN indicators
        if "xn--" in domain:
            risk_score += 35
            findings.append({
                "type": "PUNYCODE_DOMAIN",
                "severity": "MEDIUM",
                "title": "Internationalized / Punycode Domain",
                "description": f"Domain '{domain}' uses Punycode encoding, a common tactic for homograph attacks.",
                "evidence": domain
            })

        # 6. Suspicious characters in local part or domain
        if re.search(r'[\$\%\^\&\*\(\)\=\+\{\}\[\]\|\\\;\"\'\<\>]', sender["email"]):
            risk_score += 25
            findings.append({
                "type": "SUSPICIOUS_CHARACTERS",
                "severity": "MEDIUM",
                "title": "Suspicious Characters in Sender Address",
                "description": "Sender address contains non-standard or obfuscated characters.",
                "evidence": sender["email"]
            })

        # 7. Reply-To Mismatch Analysis
        reply_to = SenderAnalyzerService.parse_address(reply_to_raw) if reply_to_raw else None
        if reply_to and reply_to["email"]:
            if reply_to["domain"] != domain:
                # Significant mismatch
                if reply_to["domain"] in FREE_MAIL_DOMAINS and domain not in FREE_MAIL_DOMAINS:
                    risk_score += 40
                    findings.append({
                        "type": "REPLY_TO_MISMATCH",
                        "severity": "HIGH",
                        "title": "Critical Reply-To / From Domain Mismatch",
                        "description": f"The email was sent from corporate domain '{domain}', but replies are routed to a private free-mail address '{reply_to['email']}'.",
                        "evidence": f"From: {sender['email']} | Reply-To: {reply_to['email']}"
                    })
                else:
                    risk_score += 20
                    findings.append({
                        "type": "REPLY_TO_DOMAIN_DIFFERENCE",
                        "severity": "MEDIUM",
                        "title": "Reply-To Address Mismatch",
                        "description": f"Replies are routed to a different domain ('{reply_to['domain']}') than the sender ('{domain}').",
                        "evidence": f"From: {sender['email']} | Reply-To: {reply_to['email']}"
                    })

        # Cap category risk score at 100
        risk_score = min(100, risk_score)

        status = "SAFE"
        if risk_score >= 60:
            status = "CRITICAL" if risk_score >= 80 else "HIGH"
        elif risk_score >= 30:
            status = "SUSPICIOUS"

        return {
            "parsed_sender": sender,
            "reply_to": reply_to,
            "risk_score": risk_score,
            "status": status,
            "is_freemail": is_freemail,
            "detected_brand": detected_brand,
            "findings": findings
        }
