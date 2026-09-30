import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { animate, stagger } from "animejs";
import {
  ArrowLeft,
  Calendar,
  Layers,
  AlertOctagon,
  CheckCircle2,
  Paperclip,
  Copy,
  Check,
  Cpu,
  Mail,
  ShieldCheck,
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
  const [copiedId, setCopiedId] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleRetry = async () => {
    const validId = id;
    if (!validId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await ScanService.getScan(validId);
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

  const handleCopyScanId = () => {
    if (scan?.id) {
      navigator.clipboard.writeText(scan.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  useEffect(() => {
    if (!id) return;
    const validId = id;
    let ignore = false;
    async function load() {
      try {
        const data = await ScanService.getScan(validId);
        if (!ignore) {
          setScan(data);
          setError(null);
          setLoading(false);
        }
      } catch (err: any) {
        if (!ignore) {
          setError(
            err?.response?.data?.error?.message ||
              "Could not retrieve security findings."
          );
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    if (!loading && scan && resultsRef.current) {
      const items = resultsRef.current.querySelectorAll(".anime-finding");
      if (items.length > 0) {
        animate(items, {
          translateY: [12, 0],
          opacity: [0, 1],
          delay: stagger(60),
          ease: "outQuad",
          duration: 400,
        });
      }
    }
  }, [loading, scan]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <LoadingState
          message="Synthesizing Forensic Telemetry..."
          submessage="Correlating multi-engine scoring, extracted IOCs, and explainability findings..."
        />
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <ErrorState
          title="Analysis Not Found"
          message={error || "Could not locate report."}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  const mlPct = Math.round((scan.ml_analysis?.phishing_probability || 0) * 100);

  return (
    <div ref={resultsRef} className="max-w-7xl mx-auto px-6 py-8 md:px-8 space-y-8">
      {/* Top Header Bar */}
      <div className="anime-finding flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <Link
            to="/scan"
            className="p-2.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.12] transition-colors"
            title="Scan another message"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#0a84ff]/10 border border-[#0a84ff]/25 text-[#0a84ff] font-semibold uppercase">
                Forensic Dossier
              </span>
              <span className="text-xs font-mono text-white/40">ID: {scan.id.substring(0, 8)}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
              Email Security Analysis Report
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleCopyScanId}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] text-xs font-mono text-white/80 hover:text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <span>{scan.id.substring(0, 18)}...</span>
            {copiedId ? <Check className="w-3.5 h-3.5 text-[#30d158]" /> : <Copy className="w-3.5 h-3.5 text-white/40" />}
          </button>
        </div>
      </div>

      {/* Top Grid: Threat Assessment & Target Message Metadata */}
      <div className="anime-finding grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score Radial Centerpiece */}
        <div className="lg:col-span-1">
          <RiskScore
            score={scan.score}
            severity={scan.severity}
            confidence={scan.confidence}
          />
        </div>

        {/* Target Message Metadata Card */}
        <div className="lg:col-span-2 apple-card p-6 md:p-7 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/60 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0a84ff]" />
                <span>Target Message Telemetry</span>
              </span>
              <div className="flex items-center gap-1.5 text-xs text-white/50 bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.08]">
                <Calendar className="w-3.5 h-3.5 text-white/40" />
                <span>{new Date(scan.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-white/40 w-24 shrink-0 font-medium">SUBJECT:</span>
                <span className="text-white font-semibold break-words">{scan.subject}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-white/40 w-24 shrink-0 font-medium">FROM:</span>
                <span className="text-white/80 font-mono break-all">{scan.sender}</span>
              </div>
              {scan.recipient && (
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-white/40 w-24 shrink-0 font-medium">TO:</span>
                  <span className="text-white/80 font-mono break-all">{scan.recipient}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pillars Status Summary Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-4 border-t border-white/[0.08] text-center">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] text-white/40 uppercase font-medium">ML Classifier</div>
              <div className="text-xs font-semibold text-white mt-0.5">
                {mlPct}% Phish
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] text-white/40 uppercase font-medium">URL Analysis</div>
              <div
                className={`text-xs font-semibold mt-0.5 ${
                  (scan.url_analysis?.risk_score || 0) >= 60
                    ? "text-[#ff453a]"
                    : (scan.url_analysis?.risk_score || 0) >= 25
                    ? "text-[#ff9f0a]"
                    : "text-[#30d158]"
                }`}
              >
                {scan.url_analysis?.status || "SAFE"}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] text-white/40 uppercase font-medium">Sender Domain</div>
              <div
                className={`text-xs font-semibold mt-0.5 ${
                  (scan.sender_analysis?.risk_score || 0) >= 40
                    ? "text-[#ff453a]"
                    : (scan.sender_analysis?.risk_score || 0) >= 20
                    ? "text-[#ff9f0a]"
                    : "text-[#30d158]"
                }`}
              >
                {scan.sender_analysis?.status || "SAFE"}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] text-white/40 uppercase font-medium">Header Hops</div>
              <div className="text-xs font-semibold text-white mt-0.5">
                {(scan.header_analysis?.risk_score || 0) > 0 ? "Anomalies" : "Clean"}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] col-span-2 sm:col-span-1">
              <div className="text-[10px] text-white/40 uppercase font-medium">Auth Status</div>
              <div
                className={`text-xs font-semibold mt-0.5 ${
                  scan.authentication?.spf === "FAIL" || scan.authentication?.dmarc === "FAIL"
                    ? "text-[#ff453a]"
                    : scan.authentication?.spf === "PASS"
                    ? "text-[#30d158]"
                    : "text-white/60"
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

      {/* Explainable SOC Rationale Cards */}
      <div className="apple-card p-6 md:p-7 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/[0.08]">
          <AlertOctagon className="w-4 h-4 text-[#ff453a]" />
          <h3 className="text-sm font-semibold text-white tracking-tight uppercase">
            Explainable SOC Findings &amp; Rationale
          </h3>
        </div>

        {scan.reasons && scan.reasons.length > 0 ? (
          <ul className="space-y-2 text-xs">
            {scan.reasons.map((reason, idx) => (
              <li
                key={idx}
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-white/80 flex items-start gap-3"
              >
                <span className="text-[#ff453a] font-bold shrink-0 mt-0.5">▶</span>
                <span className="leading-relaxed font-normal">{reason}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 bg-[#30d158]/10 border border-[#30d158]/25 rounded-2xl text-xs text-[#30d158] flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>No malicious flags identified. Message exhibits routine, legitimate communication patterns.</span>
          </div>
        )}
      </div>

      {/* Multi-Pillar Technical Inspections */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#0a84ff]" />
          <h3 className="text-sm font-semibold text-white tracking-tight uppercase">
            Multi-Pillar Forensic Technical Inspections
          </h3>
        </div>

        <div className="space-y-4">
          {/* Pillar 1: Sender Analysis */}
          <FindingCard
            categoryTitle="Sender & Domain Spoofing Analysis"
            categoryStatus={scan.sender_analysis?.status || "SAFE"}
            statusLevel={
              (scan.sender_analysis?.risk_score || 0) >= 60
                ? "CRITICAL"
                : (scan.sender_analysis?.risk_score || 0) >= 30
                ? "HIGH"
                : "SAFE"
            }
            findings={scan.sender_analysis?.findings || []}
            emptyMessage="Sender address syntax is valid and domain is verified with zero brand lookalike indicators."
          />

          {/* Pillar 2: Content & NLP Analysis */}
          <FindingCard
            categoryTitle="Content, NLP & Social Engineering Analysis"
            categoryStatus={`${mlPct}% Phishing Probability`}
            statusLevel={mlPct >= 75 ? "CRITICAL" : mlPct >= 50 ? "HIGH" : "SAFE"}
            findings={scan.content_analysis?.findings || []}
            emptyMessage="No psychological coercion triggers, urgency markers, or credential-harvesting phrases identified."
          />

          {/* Explainable Top ML Feature Tokens */}
          {scan.ml_analysis?.top_features && scan.ml_analysis.top_features.length > 0 && (
            <div className="p-5 rounded-2xl apple-card space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Cpu className="w-4 h-4 text-[#0a84ff]" />
                <span>Active ML Model Predictive Signals (TF-IDF Feature Coefficients):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {scan.ml_analysis.top_features.map((feat, i) => (
                  <span
                    key={i}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono border flex items-center gap-1.5 ${
                      feat.weight > 0
                        ? "bg-[#ff453a]/15 border-[#ff453a]/30 text-[#ff453a]"
                        : "bg-[#30d158]/15 border-[#30d158]/30 text-[#30d158]"
                    }`}
                  >
                    <span className="font-semibold">"{feat.feature}"</span>
                    <span className="text-[10px] text-white/50 font-normal">
                      (weight: {feat.weight > 0 ? `+${feat.weight.toFixed(2)}` : feat.weight.toFixed(2)})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Authentication Analysis */}
          <AuthenticationStatus auth={scan.authentication} />

          {/* URL Analysis & Table */}
          <div className="space-y-3">
            <div className="text-xs text-white/80 flex items-center justify-between font-medium">
              <span>Extracted Hyperlinks ({scan.url_analysis?.count || 0} links):</span>
              <span className="text-white/40 text-[11px]">Passive Analysis (Zero Outbound HTTP Connections)</span>
            </div>
            <URLTable urls={scan.url_analysis?.urls || []} />
          </div>

          {/* Attachment Inspection */}
          <div className="p-6 rounded-2xl apple-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-[#0a84ff]" />
                <h4 className="text-xs font-semibold text-white uppercase tracking-tight">
                  Attachment Inspection ({scan.attachment_analysis?.count || 0} files)
                </h4>
              </div>
              <span className="text-xs text-white/40">Zero-Execution Policy</span>
            </div>

            {scan.attachment_analysis?.attachments && scan.attachment_analysis.attachments.length > 0 ? (
              <div className="space-y-2">
                {scan.attachment_analysis.attachments.map((att, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white font-mono">{att.filename}</div>
                      <div className="text-[11px] text-white/45 mt-0.5">
                        Type: {att.mime_type || "application/octet-stream"} • Size: {(att.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${
                        att.risk_level === "CRITICAL"
                          ? "bg-[#ff453a]/15 text-[#ff453a] border-[#ff453a]/30"
                          : att.risk_level === "HIGH"
                          ? "bg-[#ff9f0a]/15 text-[#ff9f0a] border-[#ff9f0a]/30"
                          : "bg-[#30d158]/15 text-[#30d158] border-[#30d158]/30"
                      }`}
                    >
                      {att.risk_level}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#30d158] flex items-center gap-2 p-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>No attachments found in this email message.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended SOC Actions */}
      <div className="apple-card p-6 md:p-7 space-y-4">
        <h3 className="text-sm font-semibold text-white tracking-tight uppercase flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#30d158]" />
          <span>Recommended SOC Incident Response Actions</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scan.recommendations && scan.recommendations.length > 0 ? (
            scan.recommendations.map((rec, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/80 space-y-1.5"
              >
                <div className="text-[10px] font-semibold text-[#0a84ff] uppercase tracking-wider">
                  Action 0{i + 1}
                </div>
                <div className="leading-relaxed font-normal">{rec}</div>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs text-[#30d158]">
              No remediation required.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
