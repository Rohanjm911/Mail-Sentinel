"""
Pydantic schemas for Mail Sentinel API requests and responses.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, model_validator

class PasteScanRequest(BaseModel):
    from_address: str = Field(default="", description="Sender email address or RFC display name")
    to_address: Optional[str] = Field(default="", description="Recipient email address")
    reply_to: Optional[str] = Field(default=None, description="Optional Reply-To address")
    subject: str = Field(..., description="Email subject line")
    body: str = Field(..., description="Plain-text or HTML email body")
    raw_headers: Optional[str] = Field(default=None, description="Optional raw headers")

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "sender" in data and not data.get("from_address"):
                data["from_address"] = data["sender"]
            elif "from" in data and not data.get("from_address"):
                data["from_address"] = data["from"]
            if "recipient" in data and not data.get("to_address"):
                data["to_address"] = data["recipient"]
            elif "to" in data and not data.get("to_address"):
                data["to_address"] = data["to"]
        return data

class FindingSchema(BaseModel):
    id: Optional[str] = None
    category: str
    severity: str
    title: str
    description: str
    evidence: Optional[str] = None

class URLSchema(BaseModel):
    id: Optional[str] = None
    url: str
    domain: Optional[str] = None
    risk_score: int
    status: str
    flags: List[str] = []

class AttachmentSchema(BaseModel):
    id: Optional[str] = None
    filename: str
    mime_type: Optional[str] = None
    size: int = 0
    risk_level: str
    flags: List[str] = []

class ScanDetailResponse(BaseModel):
    id: str
    created_at: datetime
    score: int
    severity: str
    confidence: float
    sender: str
    subject: str
    recipient: Optional[str] = None
    ml_score: Optional[float] = None
    reasons: List[str] = []
    recommendations: List[str] = []
    component_scores: Dict[str, Any] = {}
    sender_analysis: Dict[str, Any] = {}
    url_analysis: Dict[str, Any] = {}
    content_analysis: Dict[str, Any] = {}
    header_analysis: Dict[str, Any] = {}
    authentication: Dict[str, Any] = {}
    attachment_analysis: Dict[str, Any] = {}
    ml_analysis: Dict[str, Any] = {}
    findings: List[FindingSchema] = []
    urls: List[URLSchema] = []
    attachments: List[AttachmentSchema] = []

class ScanListItem(BaseModel):
    id: str
    created_at: datetime
    score: int
    severity: str
    confidence: float
    sender: str
    subject: str
    time_ago: Optional[str] = None

class ScanListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[ScanListItem]

class ThreatTimelinePoint(BaseModel):
    time: str
    critical: int
    high: int
    medium: int
    low: int

class StatisticsResponse(BaseModel):
    total_scans: int
    phishing_detected: int
    safe_emails: int
    average_risk: float
    is_sample_data: bool = False
    severity_breakdown: Dict[str, int]
    timeline: List[ThreatTimelinePoint]

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None

class StandardErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
