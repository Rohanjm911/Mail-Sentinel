"""
SQLAlchemy models for Mail Sentinel.
Represents Scans, Findings, URLs, and Attachments.
"""
import uuid
import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.database import Base

class Scan(Base):
    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), index=True)
    score = Column(Integer, nullable=False, index=True)
    severity = Column(String(20), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    sender = Column(String(255), nullable=False)
    subject = Column(String(500), nullable=False)
    recipient = Column(String(255), nullable=True)
    ml_score = Column(Float, nullable=True)
    
    # Stores JSON payload of complete analysis for detailed drilldown
    analysis_json = Column(Text, nullable=True)

    findings = relationship("Finding", back_populates="scan", cascade="all, delete-orphan")
    urls = relationship("ScanURL", back_populates="scan", cascade="all, delete-orphan")
    attachments = relationship("ScanAttachment", back_populates="scan", cascade="all, delete-orphan")

class Finding(Base):
    __tablename__ = "findings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    evidence = Column(Text, nullable=True)

    scan = relationship("Scan", back_populates="findings")

class ScanURL(Base):
    __tablename__ = "urls"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(Text, nullable=False)
    domain = Column(String(255), nullable=True)
    risk_score = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False)

    scan = relationship("Scan", back_populates="urls")

class ScanAttachment(Base):
    __tablename__ = "attachments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=True)
    size = Column(Integer, nullable=False, default=0)
    risk_level = Column(String(20), nullable=False)

    scan = relationship("Scan", back_populates="attachments")
