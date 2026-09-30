import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink, ShieldAlert, CheckCircle2, Radio } from "lucide-react";
import type { URLItem } from "../types/scan";

interface URLTableProps {
  urls: URLItem[];
}

export const URLTable: React.FC<URLTableProps> = ({ urls }) => {
  if (!urls || urls.length === 0) {
    return (
      <div className="p-4 rounded-2xl apple-card text-xs text-white/50 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
        <span>No URLs detected in this email.</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-2xl shadow-xl">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-white/[0.08] bg-white/[0.04] text-white/45 uppercase tracking-wider text-[10px] font-semibold">
            <th className="p-4 pl-5">URL / Destination</th>
            <th className="p-4">Domain</th>
            <th className="p-4">Risk Score</th>
            <th className="p-4">Status</th>
            <th className="p-4">Flags / Heuristics</th>
            <th className="p-4 pr-5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.05]">
          {urls.map((item, idx) => {
            const isHigh = item.risk_score >= 60;
            const isSuspicious = item.risk_score >= 25 && item.risk_score < 60;

            let scoreColor = "text-[#30d158]";
            let statusBadge = "bg-[#30d158]/15 text-[#30d158] border-[#30d158]/30";
            if (isHigh) {
              scoreColor = "text-[#ff453a]";
              statusBadge = "bg-[#ff453a]/15 text-[#ff453a] border-[#ff453a]/30";
            } else if (isSuspicious) {
              scoreColor = "text-[#ffd60a]";
              statusBadge = "bg-[#ffd60a]/15 text-[#ffd60a] border-[#ffd60a]/30";
            }

            return (
              <tr key={idx} className="hover:bg-white/[0.04] transition-colors group">
                <td className="p-4 pl-5 max-w-xs md:max-w-md truncate text-white/90">
                  <div className="flex items-center gap-2" title={item.url}>
                    {isHigh ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-[#ff453a] shrink-0" />
                    ) : (
                      <ExternalLink className="w-3.5 h-3.5 text-white/40 shrink-0" />
                    )}
                    <span className="truncate font-mono text-[11px]">{item.url}</span>
                  </div>
                </td>
                <td className="p-4 text-white/60 font-mono text-xs">{item.domain || "N/A"}</td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className={`font-bold ${scoreColor}`}>{item.risk_score}</span>
                    <span className="text-white/30 text-[10px]">/ 100</span>
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${statusBadge}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="p-4">
                  {item.flags && item.flags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {item.flags.map((flag, fIdx) => (
                        <span
                          key={fIdx}
                          className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[10px] text-white/70"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-white/40 text-[11px]">Clean</span>
                  )}
                </td>
                <td className="p-4 pr-5 text-right">
                  <Link
                    to={`/threat-intelligence?ioc=${encodeURIComponent(item.url)}&type=url`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white/80 hover:text-white text-xs font-medium transition-all"
                  >
                    <Radio className="w-3 h-3 text-[#ff9f0a]" />
                    <span>Lookup</span>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
