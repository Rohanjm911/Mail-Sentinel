import React, { useState } from "react";
import { ChevronDown, ChevronUp, ShieldAlert, CheckCircle2, Copy, Check } from "lucide-react";
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

  let iconTint = "bg-[#30d158]/15 text-[#30d158] border-[#30d158]/25";
  if (statusLevel === "CRITICAL") {
    iconTint = "bg-[#ff453a]/15 text-[#ff453a] border-[#ff453a]/25";
  } else if (statusLevel === "HIGH") {
    iconTint = "bg-[#ff9f0a]/15 text-[#ff9f0a] border-[#ff9f0a]/25";
  } else if (statusLevel === "SUSPICIOUS") {
    iconTint = "bg-[#ffd60a]/15 text-[#ffd60a] border-[#ffd60a]/25";
  }

  return (
    <div className="apple-card overflow-hidden transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 md:p-5 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3.5">
          {icon ? (
            <div className={`p-2 rounded-xl border ${iconTint}`}>
              {icon}
            </div>
          ) : statusLevel === "SAFE" ? (
            <div className="p-2 rounded-xl bg-[#30d158]/15 border border-[#30d158]/25 text-[#30d158]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-[#ff453a]/15 border border-[#ff453a]/25 text-[#ff453a]">
              <ShieldAlert className="w-4 h-4" />
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              {categoryTitle}
            </h3>
            <span className="text-xs text-white/50 font-normal">
              {categoryStatus}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.08] text-white/70 font-semibold font-mono">
            {findings.length}
          </span>
          <div className="p-1 rounded-full text-white/40 hover:text-white transition-colors">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Accordion Expanded Findings */}
      {isOpen && (
        <div className="p-5 pt-0 space-y-3 border-t border-white/[0.06] mt-2">
          {findings.length === 0 ? (
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/50 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" />
              <span>{emptyMessage}</span>
            </div>
          ) : (
            findings.map((f, idx) => (
              <div
                key={f.id || idx}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2.5 transition-all hover:bg-white/[0.05]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white tracking-tight">
                      {f.title}
                    </span>
                    {f.score_delta !== undefined && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ff453a]/15 border border-[#ff453a]/30 text-[#ff453a] font-bold">
                        +{f.score_delta} Risk
                      </span>
                    )}
                  </div>
                  <SeverityBadge severity={f.severity} size="sm" />
                </div>

                <p className="text-xs text-white/70 leading-relaxed font-normal">
                  {f.description}
                </p>

                {f.evidence && (
                  <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] uppercase font-mono text-white/40 shrink-0 font-semibold">
                        Evidence:
                      </span>
                      <code className="text-[11px] font-mono text-[#64d2ff] bg-black/40 px-2 py-1 rounded-lg border border-white/[0.08] truncate max-w-lg">
                        {f.evidence}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyEvidence(f.id || String(idx), f.evidence!)}
                      className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white/70 hover:text-white text-[10px] font-mono flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                      title="Copy exact evidence"
                    >
                      {copiedId === (f.id || String(idx)) ? (
                        <>
                          <Check className="w-3 h-3 text-[#30d158]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
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
