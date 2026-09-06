export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Finding {
  id?: string;
  category: string;
  severity: SeverityLevel;
  title: string;
  description: string;
  evidence?: string;
}

export interface URLItem {
  id?: string;
  url: string;
  domain?: string;
  protocol?: string;
  risk_score: number;
  status: string;
  flags: string[];
}

export interface AttachmentItem {
  id?: string;
  filename: string;
  mime_type?: string;
  size: number;
  risk_level: string;
  flags: string[];
}

export interface AuthenticationResults {
  spf: string; // PASS, FAIL, SOFTFAIL, NEUTRAL, NONE, UNKNOWN
  dkim: string;
  dmarc: string;
  source: string;
  status: string;
  details?: Record<string, string>;
  findings?: Finding[];
}

export interface SenderAnalysis {
  parsed_sender: {
    raw: string;
    display_name: string;
    email: string;
    local_part: string;
    domain: string;
  };
  reply_to?: {
    raw: string;
    display_name: string;
    email: string;
    local_part: string;
    domain: string;
  } | null;
  risk_score: number;
  status: string;
  is_freemail: boolean;
  detected_brand?: string | null;
  findings: Finding[];
}

export interface MLAnalysis {
  is_phishing: boolean;
  prediction?: number;
  phishing_probability: number;
  legitimate_probability: number;
  confidence: number;
  top_features: Array<{
    feature: string;
    weight: number;
    contribution: number;
  }>;
  top_tokens?: string[];
  model_status: string;
}

export interface ScanDetail {
  id: string;
  created_at: string;
  score: number;
  severity: SeverityLevel;
  confidence: number;
  sender: string;
  subject: string;
  recipient?: string;
  ml_score?: number;
  reasons: string[];
  recommendations: string[];
  component_scores: {
    ml: number;
    url: number;
    sender: number;
    content: number;
    header: number;
    auth: number;
    attachment: number;
  };
  sender_analysis: SenderAnalysis;
  url_analysis: {
    urls: URLItem[];
    count: number;
    risk_score: number;
    status: string;
    findings: Finding[];
  };
  content_analysis: {
    risk_score: number;
    detected_categories: string[];
    signals: Record<string, any>;
    findings: Finding[];
  };
  header_analysis: {
    risk_score: number;
    extracted_headers: Record<string, string>;
    findings: Finding[];
  };
  authentication: AuthenticationResults;
  attachment_analysis: {
    attachments: AttachmentItem[];
    count: number;
    risk_score: number;
    status: string;
    findings: Finding[];
  };
  ml_analysis: MLAnalysis;
  findings: Finding[];
  urls: URLItem[];
  attachments: AttachmentItem[];
}

export interface ScanSummary {
  id: string;
  created_at: string;
  score: number;
  severity: SeverityLevel;
  confidence: number;
  sender: string;
  subject: string;
  recipient?: string;
  url_count: number;
  attachment_count: number;
  time_ago: string;
}

export interface ScanHistoryResponse {
  total: number;
  items: ScanSummary[];
}

export interface ScoreHistoryPoint {
  id: string;
  scan_num: number;
  label: string;
  subject: string;
  sender: string;
  score: number;
  severity: SeverityLevel;
  time: string;
  confidence: number;
}

export interface EngineTelemetryPoint {
  engine: string;
  score: number;
  weight: number;
}

export interface DashboardStatistics {
  total_scans: number;
  phishing_detected: number;
  safe_emails: number;
  average_risk: number;
  is_sample_data: boolean;
  severity_breakdown: Record<string, number>;
  threat_trends: Array<{
    date: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
    time?: string;
  }>;
  timeline?: Array<{
    time: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
    date?: string;
  }>;
  score_history: ScoreHistoryPoint[];
  engine_telemetry: EngineTelemetryPoint[];
  recent_scans: ScanSummary[];
}

export interface ThreatIntelProvider {
  name: string;
  provider: string;
  configured: boolean;
  status: string;
  description?: string;
}

export interface IOCIndicator {
  category: string;
  severity: SeverityLevel;
  title: string;
  description: string;
  evidence?: string;
}

export interface IOCAnalysis {
  ioc: string;
  type: "url" | "domain" | "ip";
  verdict: string;
  severity: SeverityLevel;
  risk_score: number;
  confidence: number;
  summary: string;
  indicators: IOCIndicator[];
  telemetry: Record<string, any>;
  recommendations: string[];
}

export interface IOCLookupResponse {
  ioc: string;
  type: string;
  analysis?: IOCAnalysis;
  results?: Record<string, {
    provider: string;
    status: string;
    configured: boolean;
    data: any;
  }>;
}
