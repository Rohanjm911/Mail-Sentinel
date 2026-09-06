"""
Authentication analysis service for Mail Sentinel.
Evaluates SPF, DKIM, and DMARC verification records extracted from email headers.
Distinguishes header-declared results from independent active lookups.
"""
from typing import Dict, Any, List

class AuthenticationAnalyzerService:
    @staticmethod
    def analyze(auth_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyzes SPF, DKIM, and DMARC states.
        Possible states: PASS, FAIL, SOFTFAIL, NEUTRAL, NONE, UNKNOWN
        """
        spf = auth_data.get("spf", "UNKNOWN").upper()
        dkim = auth_data.get("dkim", "UNKNOWN").upper()
        dmarc = auth_data.get("dmarc", "UNKNOWN").upper()
        source_note = auth_data.get("source_note", "Extracted from message headers.")

        findings: List[Dict[str, str]] = []
        risk_score = 0

        # DMARC Evaluation
        if dmarc == "FAIL":
            risk_score += 50
            findings.append({
                "type": "DMARC_AUTHENTICATION_FAILURE",
                "severity": "CRITICAL",
                "title": "DMARC Policy Failure",
                "description": "The sender domain failed DMARC validation. The sender domain's published security policy indicates this message is likely spoofed or unauthorized.",
                "evidence": f"DMARC status: FAIL"
            })
        elif dmarc == "NONE":
            # Informational if no DMARC
            pass

        # SPF Evaluation
        if spf == "FAIL":
            risk_score += 40
            findings.append({
                "type": "SPF_AUTHENTICATION_FAILURE",
                "severity": "HIGH",
                "title": "SPF Validation Failed",
                "description": "The sending server IP address is not authorized by the domain's SPF record to transmit mail.",
                "evidence": f"SPF status: FAIL"
            })
        elif spf == "SOFTFAIL":
            risk_score += 20
            findings.append({
                "type": "SPF_SOFTFAIL",
                "severity": "MEDIUM",
                "title": "SPF SoftFail Warning",
                "description": "The sending IP address is not explicitly authorized under the domain's SPF policy (~all).",
                "evidence": f"SPF status: SOFTFAIL"
            })

        # DKIM Evaluation
        if dkim == "FAIL":
            risk_score += 35
            findings.append({
                "type": "DKIM_SIGNATURE_FAILURE",
                "severity": "HIGH",
                "title": "DKIM Cryptographic Signature Failure",
                "description": "The cryptographic signature attached to the message body/headers failed verification or was altered in transit.",
                "evidence": f"DKIM status: FAIL"
            })

        risk_score = min(100, risk_score)
        
        status = "PASSED"
        if risk_score >= 50 or dmarc == "FAIL" or spf == "FAIL":
            status = "FAILED"
        elif risk_score >= 20 or spf == "SOFTFAIL":
            status = "SUSPICIOUS"
        elif spf == "NONE" and dkim == "NONE":
            status = "UNCONFIGURED"

        return {
            "spf": spf,
            "dkim": dkim,
            "dmarc": dmarc,
            "risk_score": risk_score,
            "status": status,
            "source_note": source_note,
            "findings": findings
        }
