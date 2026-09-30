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

  let strokeColor = "#30d158";
  let textColor = "text-[#30d158]";
  let bgBadge = "bg-[#30d158]/15 border-[#30d158]/30 text-[#30d158] glow-badge-safe";
  let severityLabel = "Low / Benign";
  let recommendation = "Message conforms to standard business patterns. Safe for inbox delivery.";
  let Icon = ShieldCheck;

  if (norm === "CRITICAL") {
    strokeColor = "#ff453a";
    textColor = "text-[#ff453a]";
    bgBadge = "bg-[#ff453a]/15 border-[#ff453a]/35 text-[#ff453a] glow-badge-critical";
    severityLabel = "Critical Threat";
    recommendation = "Active attack vectors detected (credential harvesting / executable payload). Immediate drop & quarantine.";
    Icon = AlertOctagon;
  } else if (norm === "HIGH") {
    strokeColor = "#ff9f0a";
    textColor = "text-[#ff9f0a]";
    bgBadge = "bg-[#ff9f0a]/15 border-[#ff9f0a]/35 text-[#ff9f0a]";
    severityLabel = "High Risk";
    recommendation = "Strong phishing indicators found (brand spoofing / typosquatting). Quarantine message for review.";
    Icon = ShieldAlert;
  } else if (norm === "MEDIUM") {
    strokeColor = "#ffd60a";
    textColor = "text-[#ffd60a]";
    bgBadge = "bg-[#ffd60a]/15 border-[#ffd60a]/35 text-[#ffd60a]";
    severityLabel = "Suspicious / Medium";
    recommendation = "Anomalies identified (urgency tactics / mismatched Reply-To). Apply warning banner to recipient.";
    Icon = AlertTriangle;
  }

  const confidencePct = Math.round(confidence <= 1 ? confidence * 100 : confidence);

  // Apple Watch Activity Ring Math (Radius: 56, Circumference: ~351.86)
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const safeScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  const scoreRef = React.useRef<HTMLSpanElement>(null);
  const circleRef = React.useRef<SVGCircleElement>(null);

  React.useEffect(() => {
    if (!circleRef.current || !scoreRef.current) return;

    // Animate circular ring
    animate(circleRef.current, {
      strokeDashoffset: [circumference, strokeDashoffset],
      ease: "outExpo",
      duration: 1400,
    });

    // Animate number count
    const obj = { val: 0 };
    animate(obj, {
      val: safeScore,
      ease: "outExpo",
      duration: 1200,
      onUpdate: () => {
        if (scoreRef.current) {
          scoreRef.current.textContent = Math.round(obj.val).toString();
        }
      },
    });
  }, [safeScore, strokeDashoffset, circumference]);

  return (
    <div className="apple-card p-6 md:p-7 flex flex-col justify-between space-y-6 h-full">
      {/* Title & Tag */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
          Deterministic Threat Assessment
        </span>
        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border backdrop-blur-md ${bgBadge}`}>
          {severityLabel}
        </span>
      </div>

      {/* Apple Watch Radial Ring Meter */}
      <div className="flex flex-col items-center justify-center my-2">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 136 136">
            {/* Background Track */}
            <circle
              cx="68"
              cy="68"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="11"
              fill="none"
            />
            {/* Progress Stroke */}
            <circle
              ref={circleRef}
              cx="68"
              cy="68"
              r={radius}
              stroke={strokeColor}
              strokeWidth="11"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              strokeLinecap="round"
              fill="none"
              style={{
                filter: `drop-shadow(0 0 8px ${strokeColor}66)`,
              }}
            />
          </svg>

          {/* Center Digital Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              ref={scoreRef}
              className={`text-4xl font-extrabold font-mono tracking-tight ${textColor}`}
            >
              0
            </span>
            <span className="text-[10px] uppercase font-semibold text-white/40 tracking-wider mt-0.5">
              Score / 100
            </span>
          </div>
        </div>
      </div>

      {/* Confidence Bar & Recommendation */}
      <div className="space-y-4 pt-2 border-t border-white/[0.08]">
        {showConfidence && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/50 font-medium">Model Certainty:</span>
              <span className="font-semibold text-white font-mono">{confidencePct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden p-0.5">
              <div
                className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-[#0a84ff] to-[#64d2ff]"
                style={{ width: `${confidencePct}%` }}
              />
            </div>
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-start gap-3">
          <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${textColor}`} />
          <p className="text-xs text-white/70 leading-relaxed font-normal">
            {recommendation}
          </p>
        </div>
      </div>
    </div>
  );
};
