import React from "react";
import type { SeverityLevel } from "../types/scan";

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

  let colorClass = "text-[#10b981]";
  let borderClass = "border-[#10b981]/30";
  let barBg = "bg-[#10b981]";
  let severityLabel = "LOW RISK";

  if (norm === "CRITICAL") {
    colorClass = "text-[#ef4444]";
    borderClass = "border-[#ef4444]/30";
    barBg = "bg-[#ef4444]";
    severityLabel = "CRITICAL RISK";
  } else if (norm === "HIGH") {
    colorClass = "text-[#f97316]";
    borderClass = "border-[#f97316]/30";
    barBg = "bg-[#f97316]";
    severityLabel = "HIGH RISK";
  } else if (norm === "MEDIUM") {
    colorClass = "text-[#f59e0b]";
    borderClass = "border-[#f59e0b]/30";
    barBg = "bg-[#f59e0b]";
    severityLabel = "MEDIUM RISK";
  }

  const confidencePct = Math.round(confidence <= 1 ? confidence * 100 : confidence);

  return (
    <div className={`bg-[#121824] border ${borderClass} rounded-lg p-6 flex flex-col justify-between`}>
      <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
        <span className="text-xs font-mono uppercase tracking-widest text-[#94a3b8]">
          Threat Assessment Score
        </span>
        {showConfidence && (
          <span className="text-xs font-mono text-[#94a3b8] bg-[#0b0f17] px-2.5 py-1 rounded border border-[#1e293b]">
            Confidence: <strong className="text-[#f8fafc]">{confidencePct}%</strong>
          </span>
        )}
      </div>

      <div className="my-5 flex items-baseline gap-4">
        <div className={`text-6xl font-bold font-mono tracking-tight ${colorClass}`}>
          {score}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-mono text-[#64748b]">/ 100</span>
          <span className={`text-sm font-semibold tracking-wider uppercase font-mono ${colorClass}`}>
            {severityLabel}
          </span>
        </div>
      </div>

      {/* Determinstic Linear Progress Gauge (NO GRADIENT) */}
      <div className="space-y-1.5">
        <div className="w-full bg-[#0b0f17] rounded-sm h-2 overflow-hidden border border-[#1e293b]">
          <div
            className={`h-full ${barBg} transition-all duration-500`}
            style={{ width: `${Math.min(100, Math.max(2, score))}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-[#64748b]">
          <span>0 (SAFE)</span>
          <span>30 (MEDIUM)</span>
          <span>60 (HIGH)</span>
          <span>80+ (CRITICAL)</span>
        </div>
      </div>
    </div>
  );
};
