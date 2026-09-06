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
              "Could not retrieve scan results. Record may have been purged."
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

  // Anime.js entrance animation for results sections
  useEffect(() => {
    if (!loading && scan && resultsRef.current) {
      const items = resultsRef.current.querySelectorAll(".anime-finding");
      if (items.length > 0) {
        animate(items, {
          translateY: [16, 0],
          opacity: [0, 1],
          delay: stagger(60),
          ease: "outQuad",
          duration: 480,
        });
      }
    }
  }, [loading, scan]);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState
          message="Retrieving Threat Findings Dossier..."
          submessage="Compiling explainable multi-pillar forensic evidence from persistent storage..."
        />
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="p-8">
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
    <div ref={resultsRef} className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="anime-finding flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <Link
            to="/scan"
            className="p-2 rounded-xl bg-[#111a2d] border border-[#1e2d4a] text-slate-300 hover:text-sky-300 hover:border-sky-500/40 transition-colors"
            title="Scan another message"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/25 text-sky-400 font-bold uppercase">
                Forensic Dossier
              </span>
              <span className="text-xs font-mono text-slate-400">ID: {scan.id.substring(0, 8)}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-100 tracking-tight font-sans mt-0.5">
              Email Security Analysis Report
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleCopyScanId}
            className="px-3 py-1.5 rounded-lg bg-[#111a2d] border border-[#1e2d4a] hover:border-sky-500/40 text-xs font-mono text-slate-300 hover:text-sky-300 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <span>{scan.id.substring(0, 18)}...</span>
            {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
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
        <div className="lg:col-span-2 cyber-card rounded-2xl p-6 md:p-7 flex flex-col justify-between space-y-5 border border-slate-800">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400" />
                <span>Target Message Telemetry</span>
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-[#0a0f1d] px-2.5 py-1 rounded-md border border-[#1e2d4a]">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(scan.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 p-2 rounded-lg bg-[#0a0f1d]/60 border border-[#1e2d4a]/50">
                <span className="text-slate-400 w-24 shrink-0 font-semibold">SUBJECT:</span>
                <span className="text-slate-100 font-bold break-words">{scan.subject}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 p-2 rounded-lg bg-[#0a0f1d]/60 border border-[#1e2d4a]/50">
                <span className="text-slate-400 w-24 shrink-0 font-semibold">FROM:</span>
                <span className="text-slate-300 break-all">{scan.sender}</span>
              </div>
              {scan.recipient && (
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 p-2 rounded-lg bg-[#0a0f1d]/60 border border-[#1e2d4a]/50">
                  <span className="text-slate-400 w-24 shrink-0 font-semibold">TO:</span>
                  <span className="text-slate-300 break-all">{scan.recipient}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pillars Status Summary Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-4 border-t border-slate-800/80 text-center">
            <div className="p-2.5 rounded-xl bg-[#0a0f1d] border border-[#1e2d4a]">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">ML Classifier</div>
              <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                {mlPct}% Phish
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0a0f1d] border border-[#1e2d4a]">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">URL Analysis</div>
              <div
                className={`text-xs font-mono font-bold mt-0.5 ${
                  (scan.url_analysis?.risk_score || 0) >= 60
                    ? "text-red-400"
                    : (scan.url_analysis?.risk_score || 0) >= 25
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {scan.url_analysis?.status || "SAFE"}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0a0f1d] border border-[#1e2d4a]">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Sender Domain</div>
              <div
                className={`text-xs font-mono font-bold mt-0.5 ${
                  (scan.sender_analysis?.risk_score || 0) >= 40
                    ? "text-red-400"
                    : (scan.sender_analysis?.risk_score || 0) >= 20
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {scan.sender_analysis?.status || "SAFE"}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0a0f1d] border border-[#1e2d4a]">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Header Hops</div>
              <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
                {(scan.header_analysis?.risk_score || 0) > 0 ? "Anomalies" : "Conformant"}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0a0f1d] border border-[#1e2d4a] col-span-2 sm:col-span-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Auth Status</div>
              <div
                className={`text-xs font-mono font-bold mt-0.5 ${
                  scan.authentication?.spf === "FAIL" || scan.authentication?.dmarc === "FAIL"
                    ? "text-red-400"
                    : scan.authentication?.spf === "PASS"
                    ? "text-emerald-400"
                    : "text-slate-400"
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
      <div className="cyber-card rounded-2xl p-6 md:p-7 space-y-3.5 border border-slate-800">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800/80">
          <AlertOctagon className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-bold font-mono text-slate-100 tracking-wide uppercase">
            Explainable SOC Findings &amp; Rationale
          </h3>
        </div>

        {scan.reasons && scan.reasons.length > 0 ? (
          <ul className="space-y-2 text-xs font-mono">
            {scan.reasons.map((reason, idx) => (
              <li
                key={idx}
                className="p-3 rounded-xl bg-[#090e1a] border border-slate-800 text-slate-300 flex items-start gap-2.5"
              >
                <span className="text-red-400 font-bold shrink-0 mt-0.5">▶</span>
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs font-mono text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>No malicious flags identified. Message exhibits routine, legitimate communication patterns.</span>
          </div>
        )}
      </div>

      {/* Multi-Pillar Technical Inspections */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold font-mono text-slate-100 tracking-wide uppercase">
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
            <div className="p-5 rounded-xl cyber-card border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-100">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>Active ML Model Predictive Signals (TF-IDF Feature Coefficients):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {scan.ml_analysis.top_features.map((feat, i) => (
                  <span
                    key={i}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono border flex items-center gap-1.5 ${
                      feat.weight > 0
                        ? "bg-red-500/15 border-red-500/35 text-red-300"
                        : "bg-emerald-500/15 border-emerald-500/35 text-emerald-300"
                    }`}
                  >
                    <span className="font-bold">"{feat.feature}"</span>
                    <span className="text-[10px] text-slate-400 font-normal">
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
          <div className="space-y-2.5">
            <div className="text-xs font-mono font-bold text-slate-200 flex items-center justify-between">
              <span>Extracted Hyperlinks ({scan.url_analysis?.count || 0} links):</span>
              <span className="text-slate-400 font-normal">Passive Analysis (Zero Outbound HTTP Connections)</span>
            </div>
            <URLTable urls={scan.url_analysis?.urls || []} />
          </div>

          {/* Attachment Inspection */}
          <div className="p-6 rounded-xl cyber-card border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-mono font-bold text-slate-100 uppercase">
                  Attachment Inspection ({scan.attachment_analysis?.count || 0} files)
                </h4>
              </div>
              <span className="text-xs font-mono text-slate-400">Zero-Execution Policy</span>
            </div>

            {scan.attachment_analysis?.attachments && scan.attachment_analysis.attachments.length > 0 ? (
              <div className="space-y-2">
                {scan.attachment_analysis.attachments.map((att, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-[#090e1a] border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="font-semibold text-slate-100">{att.filename}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Type: {att.mime_type || "application/octet-stream"} • Size: {(att.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border ${
                        att.risk_level === "CRITICAL"
                          ? "bg-red-500/15 text-red-400 border-red-500/30"
                          : att.risk_level === "HIGH"
                          ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                          : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {att.risk_level}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs font-mono text-emerald-400 flex items-center gap-2 p-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>No attachments found in this email message.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended SOC Actions */}
      <div className="cyber-card rounded-2xl p-6 md:p-7 space-y-3.5 border border-slate-800">
        <h3 className="text-sm font-bold font-mono text-slate-100 tracking-wide uppercase flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Recommended SOC Incident Response Actions</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {scan.recommendations && scan.recommendations.length > 0 ? (
            scan.recommendations.map((rec, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-[#090e1a] border border-slate-800 text-xs font-mono text-slate-300 space-y-1.5"
              >
                <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                  ACTION 0{i + 1}
                </div>
                <div className="leading-relaxed">{rec}</div>
              </div>
            ))
          ) : (
            <div className="p-3.5 rounded-xl bg-[#090e1a] border border-slate-800 text-xs font-mono text-emerald-400">
              No remediation required.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
