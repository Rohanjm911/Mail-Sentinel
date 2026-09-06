"""
Deterministic Risk Scoring & Explainability Engine for Mail Sentinel.
Fuses multi-pillar security findings (ML, Sender, URL, Content, Header, Auth, Attachment)
into a reproducible 0-100 risk score, severity band, confidence rating, and explainable reasons.
"""
from typing import Dict, Any, List

class RiskEngineService:
    @staticmethod
    def calculate_assessment(
        parsed_email: Dict[str, Any],
        sender_analysis: Dict[str, Any],
        url_analysis: Dict[str, Any],
        content_analysis: Dict[str, Any],
        header_analysis: Dict[str, Any],
        auth_analysis: Dict[str, Any],
        attachment_analysis: Dict[str, Any],
        ml_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Executes deterministic composite risk scoring and builds explainable SOC reasons.
        """
        # 1. Base Weighted Score Calculation
        ml_prob = ml_analysis.get("phishing_probability", 0.0)
        ml_component = round(ml_prob * 100 * 0.30)  # 30% weight
        url_component = round(url_analysis.get("risk_score", 0) * 0.20)  # 20% weight
        sender_component = round(sender_analysis.get("risk_score", 0) * 0.20)  # 20% weight
        content_component = round(content_analysis.get("risk_score", 0) * 0.15)  # 15% weight
        header_component = round(header_analysis.get("risk_score", 0) * 0.05)  # 5% weight
        auth_component = round(auth_analysis.get("risk_score", 0) * 0.05)  # 5% weight
        att_component = round(attachment_analysis.get("risk_score", 0) * 0.05)  # 5% weight

        raw_score = (
            ml_component +
            url_component +
            sender_component +
            content_component +
            header_component +
            auth_component +
            att_component
        )

        # 2. Heuristic Elevation / Critical Override Rules
        elevation_reasons: List[str] = []

        # Rule A: Dangerous or double extension attachment detected
        if attachment_analysis.get("risk_score", 0) >= 60:
            if raw_score < 82:
                raw_score = 82
                elevation_reasons.append("Score elevated to CRITICAL due to dangerous executable/masked attachment.")

        # Rule B: High-risk phishing URL + brand spoofing
        if url_analysis.get("risk_score", 0) >= 65 and sender_analysis.get("risk_score", 0) >= 40:
            if raw_score < 85:
                raw_score = 85
                elevation_reasons.append("Score elevated to CRITICAL due to conjunction of brand spoofing and high-risk credential URL.")

        # Rule C: DMARC/SPF failed + display name spoofing
        auth_failed = auth_analysis.get("spf") == "FAIL" or auth_analysis.get("dmarc") == "FAIL"
        if auth_failed and sender_analysis.get("risk_score", 0) >= 45:
            if raw_score < 80:
                raw_score = 80
                elevation_reasons.append("Score elevated to CRITICAL due to explicit authentication failure on spoofed domain.")

        # Rule D: High-confidence ML + Credential Harvesting path
        if ml_prob >= 0.85 and url_analysis.get("risk_score", 0) >= 40:
            if raw_score < 75:
                raw_score = 75

        # Clamp between 0 and 100
        final_score = max(0, min(100, raw_score))

        # 3. Severity Classification
        if final_score >= 80:
            severity = "CRITICAL"
        elif final_score >= 60:
            severity = "HIGH"
        elif final_score >= 30:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        # 4. Confidence Estimation
        # Confidence reflects how many corroborating signals agree
        signals = [
            ml_prob > 0.7 or ml_prob < 0.2,
            url_analysis.get("risk_score", 0) > 40 or len(url_analysis.get("urls", [])) == 0,
            sender_analysis.get("risk_score", 0) > 30 or sender_analysis.get("status") == "SAFE",
            content_analysis.get("risk_score", 0) > 30 or len(content_analysis.get("detected_categories", [])) == 0,
            auth_analysis.get("status") in ("FAILED", "PASSED")
        ]
        agreement_ratio = sum(1 for s in signals if s) / len(signals)
        confidence = round(0.70 + (agreement_ratio * 0.28), 2)

        # 5. Explainable Reasons Synthesis (strictly evidence-based)
        reasons: List[str] = []

        # Check Sender reasons
        for f in sender_analysis.get("findings", []):
            if f["severity"] in ("CRITICAL", "HIGH"):
                reasons.append(f"{f['title']}: {f['description']}")
            elif f["severity"] == "MEDIUM" and len(reasons) < 4:
                reasons.append(f"{f['title']}: {f['description']}")

        # Check URL reasons
        for f in url_analysis.get("findings", []):
            reasons.append(f"{f['title']}: {f['description']}")

        # Check Authentication reasons
        for f in auth_analysis.get("findings", []):
            reasons.append(f"{f['title']}: {f['description']}")

        # Check Attachment reasons
        for f in attachment_analysis.get("findings", []):
            reasons.append(f"{f['title']}: {f['description']}")

        # Check Content reasons
        for f in content_analysis.get("findings", []):
            reasons.append(f"{f['title']}: {f['description']}")

        # Check ML classification reason
        if ml_analysis.get("is_phishing"):
            pct = int(ml_prob * 100)
            reasons.append(f"ML text classifier classified the email as phishing with {pct}% confidence based on deceptive language patterns.")
        elif ml_prob <= 0.15 and final_score < 30:
            reasons.append(f"ML text classifier evaluated the content as legitimate with low threat probability ({int(ml_prob*100)}%).")

        if not reasons:
            if final_score < 30:
                reasons.append("No suspicious sender, URL, content, or attachment indicators detected.")
                reasons.append("Email displays attributes consistent with routine corporate or personal correspondence.")
            else:
                reasons.append("Minor anomalies detected across message headers and formatting.")

        # Deduplicate reasons while preserving order
        unique_reasons = list(dict.fromkeys(reasons))

        # 6. SOC Recommendations
        recommendations: List[str] = []
        if severity == "CRITICAL":
            recommendations.append("Immediately quarantine this email across all recipient mailboxes.")
            recommendations.append("Block the sender domain and return path at the email gateway.")
            if url_analysis.get("urls"):
                recommendations.append("Add identified phishing URLs to organization perimeter proxy/DNS blocklists.")
            if attachment_analysis.get("attachments"):
                recommendations.append("Isolate recipient endpoints to check whether attachments were downloaded or run.")
            recommendations.append("Advise recipients to reset credentials if any links were followed.")
        elif severity == "HIGH":
            recommendations.append("Flag email with external warning banner and hold in quarantine pending analyst review.")
            recommendations.append("Instruct recipient not to click any links or download attached files.")
            recommendations.append("Inspect perimeter logs for any outbound connections to listed URLs.")
        elif severity == "MEDIUM":
            recommendations.append("Apply cautionary external sender tag to the email.")
            recommendations.append("Remind recipient to independently verify unexpected requests before taking action.")
        else:
            recommendations.append("No security intervention required; normal email delivery.")

        # Aggregate all granular findings
        all_findings = (
            sender_analysis.get("findings", []) +
            url_analysis.get("findings", []) +
            header_analysis.get("findings", []) +
            auth_analysis.get("findings", []) +
            attachment_analysis.get("findings", []) +
            content_analysis.get("findings", [])
        )

        return {
            "score": final_score,
            "severity": severity,
            "confidence": confidence,
            "component_scores": {
                "ml": round(ml_prob * 100),
                "url": url_analysis.get("risk_score", 0),
                "sender": sender_analysis.get("risk_score", 0),
                "content": content_analysis.get("risk_score", 0),
                "header": header_analysis.get("risk_score", 0),
                "authentication": auth_analysis.get("risk_score", 0),
                "attachment": attachment_analysis.get("risk_score", 0)
            },
            "reasons": unique_reasons,
            "recommendations": recommendations,
            "findings": all_findings
        }
