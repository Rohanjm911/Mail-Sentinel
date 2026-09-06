import React from "react";
import type { SeverityLevel } from "../types/scan";
import { ShieldAlert, ShieldCheck, AlertTriangle, AlertOctagon } from "lucide-react";
import { animate } from "animejs";

interface RiskScoreProps {
  score: number;
  severity: SeverityLevel | string;
  confidence: number;
  showConfidence?: boolean;
}

export const RiskScore: React.FC<RiskScoreProps> = ({
  score,
  severity,
  confidence,
  showConfidence = true,
}) => {
  const norm = (severity || "LOW").toUpperCase();

  let strokeColor = "#10b981";
  let textColor = "text-emerald-400";
  let bgBadge = "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 glow-badge-safe";
  let severityLabel = "LOW / BENIGN";
  let recommendation = "Message conforms to standard business patterns. Safe for inbox delivery.";
  let Icon = ShieldCheck;

  if (norm === "CRITICAL") {
    strokeColor = "#ef4444";
    textColor = "text-red-400";
    bgBadge = "bg-red-500/15 border-red-500/35 text-red-300 glow-badge-critical";
    severityLabel = "CRITICAL THREAT";
    recommendation = "Active attack vectors detected (credential harvesting / executable payload). Immediate drop & quarantine.";
    Icon = AlertOctagon;
  } else if (norm === "HIGH") {
    strokeColor = "#f97316";
    textColor = "text-orange-400";
    bgBadge = "bg-orange-500/15 border-orange-500/35 text-orange-300";
    severityLabel = "HIGH RISK";
    recommendation = "Strong phishing indicators found (brand spoofing / typosquatting). Quarantine message for review.";
    Icon = ShieldAlert;
  } else if (norm === "MEDIUM") {
    strokeColor = "#f59e0b";
    textColor = "text-amber-400";
    bgBadge = "bg-amber-500/15 border-amber-500/35 text-amber-300";
    severityLabel = "SUSPICIOUS / MEDIUM";
    recommendation = "Anomalies identified (urgency tactics / mismatched Reply-To). Apply warning banner to recipient.";
    Icon = AlertTriangle;
  }

  const confidencePct = Math.round(confidence <= 1 ? confidence * 100 : confidence);

  // Circular gauge math (Radius: 52, Circumference: ~326.7)
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const safeScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  const scoreRef = React.useRef<HTMLSpanElement>(null);
  const circleRef = React.useRef<SVGCircleElement>(null);

  React.useEffect(() => {
    // Animate radial arc stroke
    if (circleRef.current) {
      animate(circleRef.current, {
        strokeDashoffset: [circumference, strokeDashoffset],
        ease: "outCubic",
        duration: 1200,
      });
    }

    // Animate score number count-up
    if (scoreRef.current) {
      const counter = { val: 0 };
      animate(counter, {
        val: safeScore,
        ease: "outExpo",
        duration: 1100,
        onUpdate: () => {
          if (scoreRef.current) {
            scoreRef.current.textContent = String(Math.round(counter.val));
          }
        },
      });
    }
  }, [score, strokeDashoffset, circumference, safeScore]);

  return (
    <div className="cyber-card rounded-2xl p-6 flex flex-col justify-between h-full border border-slate-800">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${textColor}`} />
          <span>Threat Assessment</span>
        </span>
        {showConfidence && (
          <span className="text-xs font-mono text-slate-300 bg-[#0a0f1d] px-2.5 py-0.5 rounded-md border border-[#1e2d4a]">
            Confidence: <strong className="text-sky-300">{confidencePct}%</strong>
          </span>
        )}
      </div>

      {/* Radial Gauge Centerpiece */}
      <div className="my-6 flex items-center justify-around gap-4">
        {/* SVG Circular Progress Meter */}
        <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Background Track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="stroke-[#131d31]"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated Score Progress Arc with Anime.js */}
            <circle
              ref={circleRef}
              cx="60"
              cy="60"
              r={radius}
              stroke={strokeColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              strokeLinecap="round"
              fill="transparent"
              style={{
                filter: `drop-shadow(0 0 6px ${strokeColor}66)`,
              }}
            />
          </svg>

          {/* Value Inside Circle */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span ref={scoreRef} className={`text-4xl font-extrabold font-mono tracking-tight ${textColor}`}>
              {score}
            </span>
            <span className="text-[10px] font-mono text-slate-400 -mt-1 font-medium">
              SCORE / 100
            </span>
          </div>
        </div>

        {/* Severity Label & Status */}
        <div className="flex flex-col space-y-2">
          <div className={`px-3 py-1 rounded-lg border text-xs font-mono font-bold tracking-wider uppercase inline-flex items-center gap-2 ${bgBadge}`}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: strokeColor }} />
            <span>{severityLabel}</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Arbiter Formula: <span className="text-slate-300 font-semibold">6-Engine Blend</span>
          </div>
        </div>
      </div>

      {/* Linear Segment Scale */}
      <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
        <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
          <span className="text-emerald-400 font-semibold">0 Clean</span>
          <span className="text-amber-400 font-semibold">30 Suspicious</span>
          <span className="text-orange-400 font-semibold">60 High</span>
          <span className="text-red-400 font-semibold">80+ Critical</span>
        </div>
        <div className="w-full bg-[#0a0f1d] rounded-full h-2 overflow-hidden border border-[#1e2d4a] flex">
          <div className="h-full bg-emerald-500/30 w-[30%]" />
          <div className="h-full bg-amber-500/30 w-[30%]" />
          <div className="h-full bg-orange-500/30 w-[20%]" />
          <div className="h-full bg-red-500/30 w-[20%]" />
        </div>
        <p className="text-[11px] text-slate-400 mt-2 font-sans line-clamp-2">
          {recommendation}
        </p>
      </div>
    </div>
  );
};
