import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Layers,
  AlertOctagon,
  CheckCircle2,
  Paperclip,
} from "lucide-react";
import { ScanService } from "../services/api";
import { RiskScore } from "../components/RiskScore";
import { FindingCard } from "../components/FindingCard";
import { URLTable } from "../components/URLTable";
import { AuthenticationStatus } from "../components/AuthenticationStatus";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import type { ScanDetail } from "../types/scan";

export const Results: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [scan, setScan] = useState<ScanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScanDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await ScanService.getScan(id);
      setScan(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
          "Could not retrieve scan results. Record may have been purged."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScanDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState
          message="Retrieving Threat Findings..."
          submessage="Compiling explainable security evidence from database..."
        />
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="p-8">
        <ErrorState
          title="Scan Not Found"
          message={error || "The requested scan could not be located."}
          onRetry={fetchScanDetail}
        />
      </div>
    );
  }

  const mlPct = Math.round((scan.ml_analysis?.phishing_probability || 0) * 100);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/history"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scan History</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#64748b]">Scan ID:</span>
          <span className="text-xs font-mono text-[#cbd5e1] bg-[#121824] px-2.5 py-1 rounded border border-[#1e293b]">
            {scan.id}
          </span>
        </div>
      </div>

      {/* Top Section: Threat Assessment & Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Score Card */}
        <div className="lg:col-span-1">
          <RiskScore
            score={scan.score}
            severity={scan.severity}
            confidence={scan.confidence}
          />
        </div>

        {/* Email Metadata Overview */}
        <div className="lg:col-span-2 bg-[#121824] border border-[#1e293b] rounded-lg p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
              <span className="text-xs font-mono uppercase tracking-widest text-[#94a3b8]">
                Target Message Metadata
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#64748b]">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(scan.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                <span className="text-[#64748b] w-20 shrink-0">SUBJECT:</span>
                <span className="text-[#f8fafc] font-semibold break-words">
                  {scan.subject}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                <span className="text-[#64748b] w-20 shrink-0">FROM:</span>
                <span className="text-[#cbd5e1] break-all">{scan.sender}</span>
              </div>
              {scan.recipient && (
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                  <span className="text-[#64748b] w-20 shrink-0">TO:</span>
                  <span className="text-[#cbd5e1] break-all">{scan.recipient}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pillars Status Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-4 border-t border-[#1e293b] text-center">
            <div className="p-2 rounded bg-[#0b0f17] border border-[#1e293b]">
              <div className="text-[10px] font-mono text-[#64748b]">ML MODEL</div>
              <div className="text-xs font-mono font-bold text-[#f8fafc] mt-0.5">
                {mlPct}% Phish
              </div>
            </div>
            <div className="p-2 rounded bg-[#0b0f17] border border-[#1e293b]">
              <div className="text-[10px] font-mono text-[#64748b]">URL ANALYSIS</div>
              <div
                className={`text-xs font-mono font-bold mt-0.5 ${
                  scan.url_analysis?.risk_score >= 60
                    ? "text-[#ef4444]"
                    : scan.url_analysis?.risk_score >= 25
                    ? "text-[#f59e0b]"
                    : "text-[#10b981]"
                }`}
              >
                {scan.url_analysis?.status || "SAFE"}
              </div>
            </div>
            <div className="p-2 rounded bg-[#0b0f17] border border-[#1e293b]">
              <div className="text-[10px] font-mono text-[#64748b]">SENDER</div>
              <div
                className={`text-xs font-mono font-bold mt-0.5 ${
                  scan.sender_analysis?.risk_score >= 40
                    ? "text-[#ef4444]"
                    : scan.sender_analysis?.risk_score >= 20
                    ? "text-[#f59e0b]"
                    : "text-[#10b981]"
                }`}
              >
                {scan.sender_analysis?.status || "SAFE"}
              </div>
            </div>
            <div className="p-2 rounded bg-[#0b0f17] border border-[#1e293b]">
              <div className="text-[10px] font-mono text-[#64748b]">HEADERS</div>
              <div className="text-xs font-mono font-bold text-[#cbd5e1] mt-0.5">
                {scan.header_analysis?.risk_score > 0 ? "Anomalies" : "Standard"}
              </div>
            </div>
            <div className="p-2 rounded bg-[#0b0f17] border border-[#1e293b] col-span-2 sm:col-span-1">
              <div className="text-[10px] font-mono text-[#64748b]">AUTH STATUS</div>
              <div
                className={`text-xs font-mono font-bold mt-0.5 ${
                  scan.authentication?.spf === "FAIL" || scan.authentication?.dmarc === "FAIL"
                    ? "text-[#ef4444]"
                    : scan.authentication?.spf === "PASS"
                    ? "text-[#10b981]"
                    : "text-[#94a3b8]"
                }`}
              >
                {scan.authentication?.spf === "FAIL" || scan.authentication?.dmarc === "FAIL"
                  ? "Failed"
                  : scan.authentication?.spf === "PASS"
                  ? "Verified"
                  : "Unspecified"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explainable Security Reasons */}
      <div className="bg-[#121824] border border-[#1e293b] rounded-lg p-6 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[#1e293b]">
          <AlertOctagon className="w-4 h-4 text-[#ef4444]" />
          <h3 className="text-sm font-bold font-mono text-[#f8fafc] tracking-wide">
            Explainable SOC Findings & Rationale
          </h3>
        </div>

        {scan.reasons && scan.reasons.length > 0 ? (
          <ul className="space-y-2 text-xs font-mono">
            {scan.reasons.map((reason, idx) => (
              <li
                key={idx}
                className="p-2.5 rounded bg-[#0b0f17] border border-[#1e293b] text-[#cbd5e1] flex items-start gap-2"
              >
                <span className="text-[#ef4444] font-bold">▶</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-3 bg-[#0b0f17] border border-[#1e293b] rounded text-xs font-mono text-[#10b981] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>No malicious flags identified. Message exhibits normal email patterns.</span>
          </div>
        )}
      </div>

      {/* Structured Security Pillars (Findings Section) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#94a3b8]" />
          <h3 className="text-sm font-bold font-mono text-[#f8fafc] tracking-wide">
            Multi-Pillar Technical Inspections
          </h3>
        </div>

        <div className="space-y-3">
          {/* Sender Analysis */}
          <FindingCard
            categoryTitle="Sender & Domain Spoofing Analysis"
            categoryStatus={scan.sender_analysis?.status || "SAFE"}
            statusLevel={
              scan.sender_analysis?.risk_score >= 60
                ? "CRITICAL"
                : scan.sender_analysis?.risk_score >= 30
                ? "HIGH"
                : "SAFE"
            }
            findings={scan.sender_analysis?.findings || []}
            emptyMessage="Sender address syntax is valid and domain is verified with no brand lookalike indicators."
          />

          {/* Content & NLP Analysis */}
          <FindingCard
            categoryTitle="Content, NLP & Social Engineering Analysis"
            categoryStatus={`${mlPct}% Phishing Probability`}
            statusLevel={mlPct >= 75 ? "CRITICAL" : mlPct >= 50 ? "HIGH" : "SAFE"}
            findings={scan.content_analysis?.findings || []}
            emptyMessage="No social-engineering triggers, urgency markers, or credential-harvesting phrases identified."
          />

          {/* Top Token Explanations */}
          {scan.ml_analysis?.top_features && scan.ml_analysis.top_features.length > 0 && (
            <div className="p-4 rounded-lg bg-[#121824] border border-[#1e293b] space-y-2">
              <div className="text-xs font-mono font-semibold text-[#f8fafc]">
                Top Active ML Model Signals (TF-IDF Coefficients):
              </div>
              <div className="flex flex-wrap gap-2">
                {scan.ml_analysis.top_features.map((feat, i) => (
                  <span
                    key={i}
                    className={`px-2 py-1 rounded text-xs font-mono border ${
                      feat.weight > 0
                        ? "bg-[#ef4444]/15 border-[#ef4444]/30 text-[#ef4444]"
                        : "bg-[#10b981]/15 border-[#10b981]/30 text-[#10b981]"
                    }`}
                  >
                    "{feat.feature}" (weight: {feat.weight.toFixed(2)})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Authentication Analysis */}
          <AuthenticationStatus auth={scan.authentication} />

          {/* URL Analysis & Table */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-semibold text-[#f8fafc] flex items-center justify-between">
              <span>Extracted Hyperlinks ({scan.url_analysis?.count || 0} links):</span>
              <span className="text-[#64748b]">Passive Analysis (No HTTP GET execution)</span>
            </div>
            <URLTable urls={scan.url_analysis?.urls || []} />
          </div>

          {/* Attachment Analysis */}
          <div className="p-5 rounded-lg bg-[#121824] border border-[#1e293b] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-[#94a3b8]" />
                <h4 className="text-xs font-mono font-bold text-[#f8fafc]">
                  Attachment Inspection ({scan.attachment_analysis?.count || 0} files)
                </h4>
              </div>
              <span className="text-xs font-mono text-[#64748b]">Zero-Execution Policy</span>
            </div>

            {scan.attachment_analysis?.attachments && scan.attachment_analysis.attachments.length > 0 ? (
              <div className="space-y-2">
                {scan.attachment_analysis.attachments.map((att, i) => (
                  <div
                    key={i}
                    className="p-3 rounded bg-[#0b0f17] border border-[#1e293b] flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="font-semibold text-[#f8fafc]">{att.filename}</div>
                      <div className="text-[10px] text-[#64748b]">
                        Type: {att.mime_type || "application/octet-stream"} | Size: {(att.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold uppercase border ${
                        att.risk_level === "CRITICAL"
                          ? "bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30"
                          : att.risk_level === "HIGH"
                          ? "bg-[#f97316]/15 text-[#f97316] border-[#f97316]/30"
                          : "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30"
                      }`}
                    >
                      {att.risk_level}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs font-mono text-[#10b981] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>No attachments found in this email message.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SOC Recommendations */}
      <div className="bg-[#121824] border border-[#1e293b] rounded-lg p-6 space-y-3">
        <h3 className="text-sm font-bold font-mono text-[#f8fafc] tracking-wide">
          Recommended SOC Actions & Next Steps
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scan.recommendations && scan.recommendations.length > 0 ? (
            scan.recommendations.map((rec, i) => (
              <div
                key={i}
                className="p-3 rounded bg-[#0b0f17] border border-[#1e293b] text-xs font-mono text-[#cbd5e1]"
              >
                <div className="text-[10px] text-[#64748b] uppercase mb-1">Action 0{i + 1}</div>
                {rec}
              </div>
            ))
          ) : (
            <div className="p-3 rounded bg-[#0b0f17] border border-[#1e293b] text-xs font-mono text-[#10b981]">
              No remediation required.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
