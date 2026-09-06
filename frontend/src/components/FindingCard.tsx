import React, { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle, ShieldAlert, CheckCircle2 } from "lucide-react";
import { SeverityBadge } from "./SeverityBadge";
import type { Finding } from "../types/scan";

interface FindingCardProps {
  categoryTitle: string;
  categoryStatus: string;
  statusLevel?: "SAFE" | "SUSPICIOUS" | "HIGH" | "CRITICAL";
  findings: Finding[];
  emptyMessage?: string;
  icon?: React.ReactNode;
}

export const FindingCard: React.FC<FindingCardProps> = ({
  categoryTitle,
  categoryStatus,
  statusLevel = "SAFE",
  findings,
  emptyMessage = "No security anomalies detected.",
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(findings.length > 0);

  let borderClass = "border-[#1e293b]";
  let headerBg = "bg-[#121824]";
  if (statusLevel === "CRITICAL") {
    borderClass = "border-[#ef4444]/40";
  } else if (statusLevel === "HIGH") {
    borderClass = "border-[#f97316]/40";
  } else if (statusLevel === "SUSPICIOUS") {
    borderClass = "border-[#f59e0b]/40";
  }

  return (
    <div className={`bg-[#121824] border ${borderClass} rounded-lg overflow-hidden transition-colors`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 flex items-center justify-between text-left hover:bg-[#161f2e] transition-colors cursor-pointer ${headerBg}`}
      >
        <div className="flex items-center gap-3">
          {icon ? (
            <div className="text-[#94a3b8]">{icon}</div>
          ) : statusLevel === "SAFE" ? (
            <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-[#ef4444]" />
          )}
          <div>
            <h3 className="text-sm font-semibold text-[#f8fafc] font-mono tracking-wide">
              {categoryTitle}
            </h3>
            <span className="text-xs text-[#94a3b8] font-mono">
              Status: <span className="font-semibold text-[#cbd5e1]">{categoryStatus}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SeverityBadge severity={statusLevel} size="sm" />
          <div className="text-[#64748b]">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-[#1e293b] bg-[#0b0f17]/50 space-y-3">
          {findings.length === 0 ? (
            <div className="flex items-center gap-2 text-xs font-mono text-[#10b981]">
              <CheckCircle2 className="w-4 h-4" />
              <span>{emptyMessage}</span>
            </div>
          ) : (
            findings.map((f, i) => (
              <div
                key={f.id || i}
                className="p-3 rounded bg-[#121824] border border-[#1e293b] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#ef4444]" />
                    <span className="text-xs font-bold text-[#f8fafc] font-mono">
                      {f.title}
                    </span>
                  </div>
                  <SeverityBadge severity={f.severity} size="sm" />
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  {f.description}
                </p>
                {f.evidence && (
                  <div className="mt-2 pt-2 border-t border-[#1e293b] text-[11px] font-mono text-[#cbd5e1] bg-[#0b0f17] p-2 rounded border border-[#1e293b] break-all">
                    <span className="text-[#64748b] mr-1">EVIDENCE:</span>
                    {f.evidence}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
