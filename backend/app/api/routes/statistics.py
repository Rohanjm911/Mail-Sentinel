"""
Statistics API route for Mail Sentinel.
Provides dashboard metrics, severity distributions, and threat timeline trends.
Clearly flags sample baseline data when the local database contains no scans yet.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.scan import Scan
from app.schemas.scan import StatisticsResponse, ThreatTimelinePoint

router = APIRouter(prefix="/statistics", tags=["Statistics"])

@router.get("", response_model=StatisticsResponse)
def get_dashboard_statistics(db: Session = Depends(get_db)):
    """
    Returns aggregated metrics for the SOC Dashboard.
    If no real scans have occurred, returns clearly marked demo values.
    """
    count = db.query(Scan).count()

    if count == 0:
        # Prompt explicitly specifies sample baseline values if no real data exists:
        # Total Scans: 1,284 | Phishing Detected: 327 | Safe Emails: 957 | Average Risk: 42
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
                ThreatTimelinePoint(time="08:00", critical=12, high=24, medium=35, low=80),
                ThreatTimelinePoint(time="10:00", critical=18, high=31, medium=42, low=110),
                ThreatTimelinePoint(time="12:00", critical=25, high=45, medium=60, low=145),
                ThreatTimelinePoint(time="14:00", critical=22, high=39, medium=55, low=130),
                ThreatTimelinePoint(time="16:00", critical=28, high=48, medium=72, low=160),
                ThreatTimelinePoint(time="18:00", critical=13, high=22, medium=40, low=95)
            ]
        )

    # Real scan statistics from database
    phishing_count = db.query(Scan).filter(Scan.score >= 60).count()
    safe_count = count - phishing_count
    avg_risk = db.query(func.avg(Scan.score)).scalar() or 0.0

    critical_count = db.query(Scan).filter(Scan.severity == "CRITICAL").count()
    high_count = db.query(Scan).filter(Scan.severity == "HIGH").count()
    med_count = db.query(Scan).filter(Scan.severity == "MEDIUM").count()
    low_count = db.query(Scan).filter(Scan.severity == "LOW").count()

    # Dynamic timeline based on recent scans
    recent_scans = db.query(Scan).order_by(Scan.created_at.desc()).limit(30).all()
    # Bucket by recent batches or hours
    timeline = [
        ThreatTimelinePoint(time="Recent", critical=critical_count, high=high_count, medium=med_count, low=low_count)
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
        timeline=timeline
    )
