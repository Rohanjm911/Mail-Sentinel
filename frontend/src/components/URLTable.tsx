import React from "react";
import { ExternalLink, ShieldAlert, CheckCircle2 } from "lucide-react";
import type { URLItem } from "../types/scan";

interface URLTableProps {
  urls: URLItem[];
}

export const URLTable: React.FC<URLTableProps> = ({ urls }) => {
  if (!urls || urls.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-[#121824] border border-[#1e293b] text-xs font-mono text-[#94a3b8] flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
        <span>No URLs detected in this email.</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#1e293b] bg-[#121824]">
      <table className="w-full text-left border-collapse text-xs font-mono">
        <thead>
          <tr className="border-b border-[#1e293b] bg-[#0b0f17] text-[#94a3b8] uppercase tracking-wider text-[11px]">
            <th className="p-3 font-semibold">URL / Destination</th>
            <th className="p-3 font-semibold">Domain</th>
            <th className="p-3 font-semibold">Risk Score</th>
            <th className="p-3 font-semibold">Status</th>
            <th className="p-3 font-semibold">Flags / Heuristics</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e293b]">
          {urls.map((item, idx) => {
            const isHigh = item.risk_score >= 60;
            const isSuspicious = item.risk_score >= 25 && item.risk_score < 60;

            let scoreColor = "text-[#10b981]";
            let statusBadge = "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30";
            if (isHigh) {
              scoreColor = "text-[#ef4444]";
              statusBadge = "bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30";
            } else if (isSuspicious) {
              scoreColor = "text-[#f59e0b]";
              statusBadge = "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30";
            }

            return (
              <tr key={idx} className="hover:bg-[#161f2e] transition-colors">
                <td className="p-3 max-w-xs md:max-w-md truncate text-[#cbd5e1]">
                  <div className="flex items-center gap-1.5" title={item.url}>
                    {isHigh ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-[#ef4444] shrink-0" />
                    ) : (
                      <ExternalLink className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
                    )}
                    <span className="truncate">{item.url}</span>
                  </div>
                </td>
                <td className="p-3 text-[#94a3b8]">{item.domain || "N/A"}</td>
                <td className={`p-3 font-bold ${scoreColor}`}>
                  {item.risk_score} / 100
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold uppercase ${statusBadge}`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-3 text-[#94a3b8]">
                  {item.flags && item.flags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {item.flags.map((f, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-[#0b0f17] border border-[#1e293b] text-[10px] text-[#cbd5e1]"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[#64748b]">None</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
