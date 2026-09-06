"""
Statistics API route for Mail Sentinel.
Provides dashboard metrics, severity distributions, and threat timeline trends.
Clearly flags sample baseline data when the local database contains no scans yet.
"""
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.scan import Scan
from app.schemas.scan import (
    StatisticsResponse,
    ThreatTimelinePoint,
    ScoreHistoryPoint,
    EngineTelemetryPoint,
    ScanListItem
)

router = APIRouter(prefix="/statistics", tags=["Statistics"])

def format_time_ago(dt) -> str:
    """Helper to format relative time."""
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

@router.get("", response_model=StatisticsResponse)
def get_dashboard_statistics(db: Session = Depends(get_db)):
    """
    Returns aggregated metrics for the SOC Dashboard.
    If no real scans have occurred, returns clearly marked demo values.
    """
    count = db.query(Scan).count()

    if count == 0:
        # Sample baseline values if no real data exists
        return StatisticsResponse(
            total_scans=1284,
            phishing_detected=327,
            safe_emails=957,
            average_risk=42.0,
            is_sample_data=True,
            severity_breakdown={
                "CRITICAL": 118,
                "HIGH": 209,
                "MEDIUM": 382,
                "LOW": 575
            },
            timeline=[
                ThreatTimelinePoint(time="08:00", date="08:00", critical=12, high=24, medium=35, low=80),
                ThreatTimelinePoint(time="10:00", date="10:00", critical=18, high=31, medium=42, low=110),
                ThreatTimelinePoint(time="12:00", date="12:00", critical=25, high=45, medium=60, low=145),
                ThreatTimelinePoint(time="14:00", date="14:00", critical=22, high=39, medium=55, low=130),
                ThreatTimelinePoint(time="16:00", date="16:00", critical=28, high=48, medium=72, low=160),
                ThreatTimelinePoint(time="18:00", date="18:00", critical=13, high=22, medium=40, low=95)
            ],
            threat_trends=[
                ThreatTimelinePoint(time="08:00", date="08:00", critical=12, high=24, medium=35, low=80),
                ThreatTimelinePoint(time="10:00", date="10:00", critical=18, high=31, medium=42, low=110),
                ThreatTimelinePoint(time="12:00", date="12:00", critical=25, high=45, medium=60, low=145),
                ThreatTimelinePoint(time="14:00", date="14:00", critical=22, high=39, medium=55, low=130),
                ThreatTimelinePoint(time="16:00", date="16:00", critical=28, high=48, medium=72, low=160),
                ThreatTimelinePoint(time="18:00", date="18:00", critical=13, high=22, medium=40, low=95)
            ],
            score_history=[
                ScoreHistoryPoint(id="demo-1", scan_num=1, label="Test #1", subject="Urgent wire transfer", sender="ceo@exec-alerts.com", score=88, severity="CRITICAL", time="08:15", confidence=0.97),
                ScoreHistoryPoint(id="demo-2", scan_num=2, label="Test #2", subject="Quarterly budget sheet", sender="finance@company.com", score=12, severity="LOW", time="09:40", confidence=0.99),
                ScoreHistoryPoint(id="demo-3", scan_num=3, label="Test #3", subject="Reset your Office 365 password", sender="security@micosoft-verify.net", score=92, severity="CRITICAL", time="11:20", confidence=0.96),
                ScoreHistoryPoint(id="demo-4", scan_num=4, label="Test #4", subject="Invoice #48102 Payment Due", sender="billing@vendor-portal.xyz", score=74, severity="HIGH", time="13:05", confidence=0.94),
                ScoreHistoryPoint(id="demo-5", scan_num=5, label="Test #5", subject="Team Lunch Friday RSVP", sender="hr@company.com", score=8, severity="LOW", time="15:30", confidence=0.99),
                ScoreHistoryPoint(id="demo-6", scan_num=6, label="Test #6", subject="Shipping notification DHL package", sender="tracking@dhl-delivery-hub.info", score=65, severity="HIGH", time="17:10", confidence=0.91),
            ],
            engine_telemetry=[
                EngineTelemetryPoint(engine="ML NLP Model", score=68.5, weight=0.35),
                EngineTelemetryPoint(engine="URL Reputation", score=54.2, weight=0.25),
                EngineTelemetryPoint(engine="Sender Spoofing", score=45.0, weight=0.15),
                EngineTelemetryPoint(engine="Header Forensics", score=38.4, weight=0.10),
                EngineTelemetryPoint(engine="Content Triggers", score=62.0, weight=0.10),
                EngineTelemetryPoint(engine="Attachment Risk", score=22.5, weight=0.05),
            ],
            recent_scans=[]
        )

    # Real scan statistics from database
    phishing_count = db.query(Scan).filter(Scan.score >= 60).count()
    safe_count = count - phishing_count
    avg_risk = db.query(func.avg(Scan.score)).scalar() or 0.0

    critical_count = db.query(Scan).filter(Scan.severity == "CRITICAL").count()
    high_count = db.query(Scan).filter(Scan.severity == "HIGH").count()
    med_count = db.query(Scan).filter(Scan.severity == "MEDIUM").count()
    low_count = db.query(Scan).filter(Scan.severity == "LOW").count()

    # Chronological scans for trajectory / progression (last 30 scans)
    all_scans_asc = db.query(Scan).order_by(Scan.created_at.asc()).all()
    recent_scans_asc = all_scans_asc[-30:] if len(all_scans_asc) > 30 else all_scans_asc

    # 1. Individual test score trajectory
    score_history = []
    for idx, s in enumerate(recent_scans_asc, start=1):
        time_str = s.created_at.strftime("%H:%M:%S") if s.created_at else f"#{idx}"
        date_str = s.created_at.strftime("%b %d") if s.created_at else "Today"
        subj_preview = s.subject[:35] + ("..." if len(s.subject) > 35 else "") if s.subject else "Untitled Email"
        score_history.append(
            ScoreHistoryPoint(
                id=str(s.id),
                scan_num=idx,
                label=f"Test #{idx}",
                subject=subj_preview,
                sender=str(s.sender) if s.sender else "Unknown",
                score=int(s.score),
                severity=str(s.severity),
                time=f"{date_str} {time_str}",
                confidence=round(float(s.confidence), 2) if s.confidence else 0.95
            )
        )

    # 2. Cumulative / progressive incident timeline
    timeline = []
    cum_crit = 0
    cum_high = 0
    cum_med = 0
    cum_low = 0
    for idx, s in enumerate(recent_scans_asc, start=1):
        if s.severity == "CRITICAL":
            cum_crit += 1
        elif s.severity == "HIGH":
            cum_high += 1
        elif s.severity == "MEDIUM":
            cum_med += 1
        else:
            cum_low += 1
        
        t_label = f"T#{idx}"
        timeline.append(
            ThreatTimelinePoint(
                time=t_label,
                date=t_label,
                critical=cum_crit,
                high=cum_high,
                medium=cum_med,
                low=cum_low
            )
        )

    # 3. Multi-engine vector averages from real analysis payloads
    ml_scores = []
    url_scores = []
    sender_scores = []
    content_scores = []
    header_scores = []
    auth_scores = []
    attach_scores = []

    for s in recent_scans_asc:
        if s.analysis_json:
            try:
                data = json.loads(s.analysis_json)
                comp = data.get("assessment", {}).get("component_scores", {})
                if "ml" in comp:
                    ml_scores.append(float(comp["ml"]))
                if "url" in comp:
                    url_scores.append(float(comp["url"]))
                if "sender" in comp:
                    sender_scores.append(float(comp["sender"]))
                if "content" in comp:
                    content_scores.append(float(comp["content"]))
                if "header" in comp:
                    header_scores.append(float(comp["header"]))
                if "auth" in comp:
                    auth_scores.append(float(comp["auth"]))
                if "attachment" in comp:
                    attach_scores.append(float(comp["attachment"]))
            except Exception:
                pass

    def safe_avg(lst, default_val):
        return round(sum(lst) / len(lst), 1) if lst else default_val

    engine_telemetry = [
        EngineTelemetryPoint(engine="ML NLP Model", score=safe_avg(ml_scores, 18.0), weight=0.35),
        EngineTelemetryPoint(engine="URL Reputation", score=safe_avg(url_scores, 12.0), weight=0.25),
        EngineTelemetryPoint(engine="Sender Spoofing", score=safe_avg(sender_scores or auth_scores, 15.0), weight=0.15),
        EngineTelemetryPoint(engine="Header Forensics", score=safe_avg(header_scores, 10.0), weight=0.10),
        EngineTelemetryPoint(engine="Content Triggers", score=safe_avg(content_scores, 20.0), weight=0.10),
        EngineTelemetryPoint(engine="Attachment Safety", score=safe_avg(attach_scores, 5.0), weight=0.05),
    ]

    # 4. Recent scans for dashboard table (last 10)
    recent_items = db.query(Scan).order_by(Scan.created_at.desc()).limit(10).all()
    recent_scans = [
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
        for s in recent_items
    ]

    return StatisticsResponse(
        total_scans=count,
        phishing_detected=phishing_count,
        safe_emails=safe_count,
        average_risk=round(float(avg_risk), 1),
        is_sample_data=False,
        severity_breakdown={
            "CRITICAL": critical_count,
            "HIGH": high_count,
            "MEDIUM": med_count,
            "LOW": low_count
        },
        timeline=timeline,
        threat_trends=timeline,
        score_history=score_history,
        engine_telemetry=engine_telemetry,
        recent_scans=recent_scans
    )
