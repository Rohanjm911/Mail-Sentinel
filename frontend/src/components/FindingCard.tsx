import React, { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle, ShieldAlert, CheckCircle2, Copy, Check } from "lucide-react";
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyEvidence = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  let borderClass = "border-[#1e2d4a]";
  let sideAccent = "bg-emerald-500";
  if (statusLevel === "CRITICAL") {
    borderClass = "border-red-500/40 glow-badge-critical";
    sideAccent = "bg-red-500";
  } else if (statusLevel === "HIGH") {
    borderClass = "border-orange-500/40";
    sideAccent = "bg-orange-500";
  } else if (statusLevel === "SUSPICIOUS") {
    borderClass = "border-amber-500/40";
    sideAccent = "bg-amber-500";
  }

  return (
    <div className={`relative cyber-card rounded-xl overflow-hidden border ${borderClass} transition-all duration-200`}>
      {/* Colored Left Accent Strip */}
      <div className={`absolute top-0 bottom-0 left-0 w-1 ${sideAccent}`} />

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 pl-5 flex items-center justify-between text-left hover:bg-[#15223b]/60 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {icon ? (
            <div className="text-sky-400 p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/25">
              {icon}
            </div>
          ) : statusLevel === "SAFE" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-red-400" />
          )}
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
              {categoryTitle}
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Engine Status: <span className="font-semibold text-slate-200">{categoryStatus}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SeverityBadge severity={statusLevel} size="sm" />
          <div className="text-slate-400 p-1 rounded hover:bg-slate-800">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="p-5 border-t border-[#1e2d4a] bg-[#090e1a]/80 space-y-3 pl-5">
          {findings.length === 0 ? (
            <div className="flex items-center gap-2.5 text-xs font-mono text-emerald-400 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{emptyMessage}</span>
            </div>
          ) : (
            findings.map((f, i) => {
              const findingKey = f.id || `finding-${i}`;
              return (
                <div
                  key={findingKey}
                  className="p-3.5 rounded-xl bg-[#0f172a] border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-100 font-mono">
                        {f.title}
                      </span>
                    </div>
                    <SeverityBadge severity={f.severity} size="sm" />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {f.description}
                  </p>

                  {f.evidence && (
                    <div className="mt-2 text-[11px] font-mono text-slate-300 bg-[#070b14] p-2.5 rounded-lg border border-slate-800 flex items-start justify-between gap-2 break-all">
                      <div>
                        <span className="text-sky-400 font-semibold mr-1.5">EVIDENCE:</span>
                        <span>{f.evidence}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyEvidence(findingKey, f.evidence || "")}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 shrink-0 cursor-pointer"
                        title="Copy Evidence to Clipboard"
                      >
                        {copiedId === findingKey ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
