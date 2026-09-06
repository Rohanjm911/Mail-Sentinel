"""
Scans API routes for Mail Sentinel.
Supports pasted email analysis, safe .eml upload analysis, retrieval, and deletion.
"""
import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.database import get_db
from app.core.config import settings
from app.models.scan import Scan
from app.schemas.scan import PasteScanRequest, ScanDetailResponse, ScanListResponse, ScanListItem
from app.services.email_parser import EmailParserService
from app.services.scan_pipeline import ScanPipeline

router = APIRouter(prefix="/scans", tags=["Scans"])

def format_time_ago(dt) -> str:
    """Helper to format relative time."""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    if dt is None:
        return "recently"
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = now - dt
    seconds = int(diff.total_seconds())
    if seconds < 60:
        return f"{max(1, seconds)} sec ago"
    minutes = seconds // 60
    if minutes < 60:
        return f"{minutes} min ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours} hr ago"
    days = hours // 24
    return f"{days} day{'s' if days > 1 else ''} ago"

@router.post("", response_model=ScanDetailResponse, status_code=status.HTTP_201_CREATED)
def scan_pasted_email(payload: PasteScanRequest, db: Session = Depends(get_db)):
    """
    Analyzes an email from manually entered or pasted form fields.
    """
    if not payload.from_address or not payload.from_address.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "INVALID_SENDER", "message": "The 'from_address' field is required."}
        )
    if not payload.body or not payload.body.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "EMPTY_BODY", "message": "Email body content is required for analysis."}
        )

    parsed = EmailParserService.parse_pasted(
        sender=payload.from_address,
        recipient=payload.to_address or "",
        subject=payload.subject,
        body=payload.body,
        reply_to=payload.reply_to,
        raw_headers=payload.raw_headers
    )

    result = ScanPipeline.process_and_persist(parsed, db)
    return result

@router.post("/upload", response_model=ScanDetailResponse, status_code=status.HTTP_201_CREATED)
async def scan_eml_upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Safely parses an uploaded RFC 5322 .eml file and executes threat analysis.
    Guarantees no arbitrary code or attachment execution.
    """
    filename = file.filename or "uploaded.eml"
    if not (filename.lower().endswith(".eml") or filename.lower().endswith(".txt")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_FILE_TYPE", "message": "Uploaded file must have an .eml extension."}
        )

    # Read uploaded content with size checking
    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail={"code": "FILE_TOO_LARGE", "message": f"File exceeds maximum permitted size ({settings.MAX_UPLOAD_SIZE_BYTES // (1024*1024)} MB)."}
        )

    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "EMPTY_FILE", "message": "The uploaded .eml file is empty."}
        )

    try:
        parsed = EmailParserService.parse_eml_bytes(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "PARSE_ERROR", "message": f"Could not parse .eml file: {str(e)}"}
        )

    result = ScanPipeline.process_and_persist(parsed, db)
    return result

@router.get("/{scan_id}", response_model=ScanDetailResponse)
def get_scan_detail(scan_id: str, db: Session = Depends(get_db)):
    """
    Retrieves full explainable threat assessment for a specific scan.
    """
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "SCAN_NOT_FOUND", "message": f"No scan found with id '{scan_id}'."}
        )

    # Parse stored analysis JSON
    analysis = {}
    analysis_raw = getattr(scan, "analysis_json", None)
    if analysis_raw:
        try:
            analysis = json.loads(str(analysis_raw))
        except Exception:
            pass

    assessment = analysis.get("assessment", {})

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
        "reasons": assessment.get("reasons", []),
        "recommendations": assessment.get("recommendations", []),
        "component_scores": assessment.get("component_scores", {}),
        "sender_analysis": analysis.get("sender_analysis", {}),
        "url_analysis": analysis.get("url_analysis", {}),
        "content_analysis": analysis.get("content_analysis", {}),
        "header_analysis": analysis.get("header_analysis", {}),
        "authentication": analysis.get("authentication", {}),
        "attachment_analysis": analysis.get("attachment_analysis", {}),
        "ml_analysis": analysis.get("ml_analysis", {}),
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
        "urls": [
            {
                "id": u.id,
                "url": u.url,
                "domain": u.domain,
                "risk_score": u.risk_score,
                "status": u.status,
                "flags": []
            }
            for u in scan.urls
        ],
        "attachments": [
            {
                "id": a.id,
                "filename": a.filename,
                "mime_type": a.mime_type,
                "size": a.size,
                "risk_level": a.risk_level,
                "flags": []
            }
            for a in scan.attachments
        ]
    }

@router.get("", response_model=ScanListResponse)
def list_scans(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns a paginated list of historical email scans.
    Supports filtering by search query and severity.
    """
    query = db.query(Scan)

    if search and search.strip():
        search_term = f"%{search.strip()}%"
        query = query.filter(
            (Scan.subject.ilike(search_term)) | 
            (Scan.sender.ilike(search_term))
        )

    if severity and severity.upper() in ("LOW", "MEDIUM", "HIGH", "CRITICAL"):
        query = query.filter(Scan.severity == severity.upper())

    total = query.count()
    items = query.order_by(desc(Scan.created_at)).offset((page - 1) * page_size).limit(page_size).all()

    formatted_items = [
        ScanListItem(
            id=str(s.id),
            created_at=s.created_at,
            score=int(s.score),
            severity=str(s.severity),
            confidence=float(s.confidence),
            sender=str(s.sender),
            subject=str(s.subject),
            time_ago=format_time_ago(s.created_at)
        )
        for s in items
    ]

    return ScanListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=formatted_items
    )

@router.delete("/{scan_id}", status_code=status.HTTP_200_OK)
def delete_scan(scan_id: str, db: Session = Depends(get_db)):
    """
    Deletes a scan and its associated findings from history.
    """
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "SCAN_NOT_FOUND", "message": f"No scan found with id '{scan_id}'."}
        )

    db.delete(scan)
    db.commit()
    return {"success": True, "message": f"Scan {scan_id} deleted successfully."}
