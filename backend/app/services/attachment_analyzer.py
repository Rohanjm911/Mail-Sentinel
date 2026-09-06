"""
Attachment safety inspection service for Mail Sentinel.
Passively evaluates attachment metadata: filename, extensions, MIME types, and sizes.
Strictly NEVER executes or opens untrusted attachment payloads.
"""
import re
from typing import Dict, Any, List

DANGEROUS_EXECUTABLE_EXTENSIONS = {
    ".exe", ".scr", ".bat", ".cmd", ".ps1", ".vbs", ".js", 
    ".hta", ".cpl", ".wsf", ".msc", ".jar", ".pif"
}

MACRO_OFFICE_EXTENSIONS = {
    ".docm", ".xlsm", ".pptm", ".dotm", ".xltm"
}

DISK_IMAGE_EXTENSIONS = {
    ".iso", ".img", ".vhd", ".vhdx"
}

DOUBLE_EXTENSION_REGEX = re.compile(
    r'\.(?:pdf|doc|docx|xls|xlsx|jpg|png|txt|csv)\.(?:exe|scr|vbs|js|bat|cmd|ps1|hta)$', 
    re.IGNORECASE
)

class AttachmentAnalyzerService:
    @staticmethod
    def analyze_single_attachment(att: Dict[str, Any]) -> Dict[str, Any]:
        filename = att.get("filename", "").strip()
        ext = att.get("extension", "").lower()
        mime_type = att.get("mime_type", "").lower()
        size = att.get("size", 0)

        flags: List[str] = []
        score = 0
        risk_level = "LOW"

        # 1. Double Extension Detection (e.g. invoice.pdf.exe)
        if DOUBLE_EXTENSION_REGEX.search(filename):
            score += 70
            flags.append("Double extension detected (e.g., masking an executable as a document/image)")
            risk_level = "CRITICAL"

        # 2. Dangerous Executable or Script Extensions
        elif ext in DANGEROUS_EXECUTABLE_EXTENSIONS:
            score += 60
            flags.append(f"Direct executable/script extension ({ext}) rarely legitimate via email")
            risk_level = "HIGH"

        # 3. Macro-Enabled Document
        elif ext in MACRO_OFFICE_EXTENSIONS:
            score += 35
            flags.append(f"Macro-enabled document format ({ext}) capable of executing arbitrary VBA payload")
            risk_level = "SUSPICIOUS"

        # 4. Disk Image Container
        elif ext in DISK_IMAGE_EXTENSIONS:
            score += 35
            flags.append(f"Disk image container format ({ext}) frequently used to bypass mark-of-the-web filters")
            risk_level = "SUSPICIOUS"

        # 5. Mismatched MIME type vs Extension
        if ext in (".pdf", ".docx", ".xlsx") and "application/x-msdownload" in mime_type:
            score += 50
            flags.append("MIME type indicates Windows PE binary while file extension mimics office document")
            risk_level = "CRITICAL"

        score = min(100, score)

        return {
            "filename": filename,
            "extension": ext,
            "mime_type": mime_type,
            "size": size,
            "risk_score": score,
            "risk_level": risk_level,
            "flags": flags
        }

    @staticmethod
    def analyze(attachments: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyzes attachment list without executing.
        """
        if not attachments:
            return {
                "attachments": [],
                "count": 0,
                "risk_score": 0,
                "status": "SAFE",
                "findings": []
            }

        analyzed_list = [AttachmentAnalyzerService.analyze_single_attachment(a) for a in attachments]
        max_score = max((a["risk_score"] for a in analyzed_list), default=0)
        critical_atts = [a for a in analyzed_list if a["risk_score"] >= 60]
        suspicious_atts = [a for a in analyzed_list if 30 <= a["risk_score"] < 60]

        findings: List[Dict[str, str]] = []
        if critical_atts:
            findings.append({
                "type": "DANGEROUS_ATTACHMENT_DETECTED",
                "severity": "CRITICAL" if max_score >= 70 else "HIGH",
                "title": f"Potentially Dangerous Attachment ({critical_atts[0]['filename']})",
                "description": f"Attachment '{critical_atts[0]['filename']}' exhibits high-risk characteristics: {'; '.join(critical_atts[0]['flags'])}. Do not execute or download.",
                "evidence": f"File: {critical_atts[0]['filename']} ({critical_atts[0]['mime_type']}, {critical_atts[0]['size']} bytes)"
            })
        elif suspicious_atts:
            findings.append({
                "type": "SUSPICIOUS_ATTACHMENT_DETECTED",
                "severity": "MEDIUM",
                "title": f"Suspicious Attachment Format ({suspicious_atts[0]['filename']})",
                "description": f"Attachment uses formats capable of running embedded macros or scripts: {'; '.join(suspicious_atts[0]['flags'])}.",
                "evidence": f"File: {suspicious_atts[0]['filename']}"
            })

        status = "SAFE"
        if max_score >= 60:
            status = "CRITICAL" if max_score >= 70 else "HIGH"
        elif max_score >= 30:
            status = "SUSPICIOUS"

        return {
            "attachments": analyzed_list,
            "count": len(analyzed_list),
            "risk_score": max_score,
            "status": status,
            "findings": findings
        }
