"""
End-to-end detection pipeline runner for Mail Sentinel.
Orchestrates parsers, security analyzers, ML inference, and risk engine.
"""
import json
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.services.email_parser import EmailParserService
from app.services.sender_analyzer import SenderAnalyzerService
from app.services.url_analyzer import URLAnalyzerService
from app.services.content_analyzer import ContentAnalyzerService
from app.services.header_analyzer import HeaderAnalyzerService
from app.services.authentication_analyzer import AuthenticationAnalyzerService
from app.services.attachment_analyzer import AttachmentAnalyzerService
from app.services.ml_service import MLService
from app.services.risk_engine import RiskEngineService
from app.models.scan import Scan, Finding, ScanURL, ScanAttachment

class ScanPipeline:
    @staticmethod
    def process_and_persist(parsed_email: Dict[str, Any], db: Session) -> Dict[str, Any]:
        """
        Executes all 7 detection pillars and persists results into the database.
        """
        sender_raw = parsed_email.get("sender", "")
        reply_to_raw = parsed_email.get("reply_to", "")
        subject = parsed_email.get("subject", "")
        body = parsed_email.get("body", "")
        raw_urls = parsed_email.get("urls", [])
        headers = parsed_email.get("headers", {})
        raw_attachments = parsed_email.get("attachments", [])
        raw_auth = parsed_email.get("authentication", {})

        # Pillar 1: Sender Analysis
        sender_res = SenderAnalyzerService.analyze(sender_raw, reply_to_raw)
        sender_domain = sender_res["parsed_sender"]["domain"]

        # Pillar 2: URL Analysis
        url_res = URLAnalyzerService.analyze(raw_urls)

        # Pillar 3: Content NLP Analysis
        content_res = ContentAnalyzerService.analyze(subject, body)

        # Pillar 4: Header Analysis
        header_res = HeaderAnalyzerService.analyze(headers, sender_domain)

        # Pillar 5: Authentication Analysis
        auth_res = AuthenticationAnalyzerService.analyze(raw_auth)

        # Pillar 6: Attachment Analysis
        attachment_res = AttachmentAnalyzerService.analyze(raw_attachments)

        # Pillar 7: Machine Learning Inference
        ml_service = MLService.get_instance()
        ml_res = ml_service.predict(subject, body)

        # Final Synthesis: Deterministic Risk Engine
        assessment = RiskEngineService.calculate_assessment(
            parsed_email=parsed_email,
            sender_analysis=sender_res,
            url_analysis=url_res,
            content_analysis=content_res,
            header_analysis=header_res,
            auth_analysis=auth_res,
            attachment_analysis=attachment_res,
            ml_analysis=ml_res
        )

        # Full analysis object for storage and instant drilldown
        full_analysis = {
            "parsed_email": {
                "sender": sender_raw,
                "recipient": parsed_email.get("recipient", ""),
                "reply_to": reply_to_raw,
                "subject": subject
            },
            "assessment": assessment,
            "sender_analysis": sender_res,
            "url_analysis": url_res,
            "content_analysis": content_res,
            "header_analysis": header_res,
            "authentication": auth_res,
            "attachment_analysis": attachment_res,
            "ml_analysis": ml_res
        }

        # Persist Scan record
        scan = Scan(
            score=assessment["score"],
            severity=assessment["severity"],
            confidence=assessment["confidence"],
            sender=sender_raw or "Unknown Sender",
            subject=subject or "No Subject",
            recipient=parsed_email.get("recipient", ""),
            ml_score=ml_res.get("phishing_probability", 0.0),
            analysis_json=json.dumps(full_analysis)
        )
        db.add(scan)
        db.flush()

        # Persist Findings
        for f in assessment["findings"]:
            finding = Finding(
                scan_id=scan.id,
                category=f.get("type", "GENERAL"),
                severity=f.get("severity", "MEDIUM"),
                title=f.get("title", ""),
                description=f.get("description", ""),
                evidence=f.get("evidence", "")
            )
            db.add(finding)

        # Persist URLs
        for u in url_res.get("urls", []):
            url_record = ScanURL(
                scan_id=scan.id,
                url=u["url"],
                domain=u.get("domain", ""),
                risk_score=u.get("risk_score", 0),
                status=u.get("status", "SAFE")
            )
            db.add(url_record)

        # Persist Attachments
        for a in attachment_res.get("attachments", []):
            att_record = ScanAttachment(
                scan_id=scan.id,
                filename=a["filename"],
                mime_type=a.get("mime_type", ""),
                size=a.get("size", 0),
                risk_level=a.get("risk_level", "LOW")
            )
            db.add(att_record)

        db.commit()
        db.refresh(scan)

        # Format complete API response
        return {
            "id": scan.id,
            "created_at": scan.created_at,
            "score": scan.score,
            "severity": scan.severity,
            "confidence": scan.confidence,
            "sender": scan.sender,
            "subject": scan.subject,
            "recipient": scan.recipient,
            "ml_score": scan.ml_score,
            "reasons": assessment["reasons"],
            "recommendations": assessment["recommendations"],
            "component_scores": assessment["component_scores"],
            "sender_analysis": sender_res,
            "url_analysis": url_res,
            "content_analysis": content_res,
            "header_analysis": header_res,
            "authentication": auth_res,
            "attachment_analysis": attachment_res,
            "ml_analysis": ml_res,
            "findings": [
                {
                    "id": f.id,
                    "category": f.category,
                    "severity": f.severity,
                    "title": f.title,
                    "description": f.description,
                    "evidence": f.evidence
                }
                for f in scan.findings
            ],
            "urls": url_res.get("urls", []),
            "attachments": attachment_res.get("attachments", [])
        }
