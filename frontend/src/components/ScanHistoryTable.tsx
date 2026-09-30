import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Trash2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { SeverityBadge } from "./SeverityBadge";
import type { ScanSummary } from "../types/scan";

interface ScanHistoryTableProps {
  scans: ScanSummary[];
  onDelete?: (id: string) => void;
  isCompact?: boolean;
}

export const ScanHistoryTable: React.FC<ScanHistoryTableProps> = ({
  scans,
  onDelete,
  isCompact = false,
}) => {
  if (!scans || scans.length === 0) {
    return (
      <div className="p-10 text-center bg-white/[0.02] border border-white/[0.08] rounded-3xl text-xs text-white/50 space-y-3">
        <p>No historical security telemetry recorded yet.</p>
        <Link
          to="/scan"
          className="apple-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium"
        >
          <span>Launch Your First Email Scan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const displayScans = isCompact ? scans.slice(0, 5) : scans;

  return (
    <div className="overflow-x-auto rounded-3xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-2xl shadow-xl">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-white/[0.08] bg-white/[0.04] text-white/45 uppercase tracking-wider text-[10px] font-semibold">
            <th className="p-4 pl-5">Target Subject</th>
            <th className="p-4">Sender Origin</th>
            <th className="p-4">Threat Score</th>
            <th className="p-4">Verdict</th>
            <th className="p-4">Analyzed</th>
            <th className="p-4 pr-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.05]">
          {displayScans.map((scan) => {
            const isPhish = scan.score >= 60;
            let scoreColor = "text-[#30d158]";
            if (scan.score >= 80) scoreColor = "text-[#ff453a]";
            else if (scan.score >= 60) scoreColor = "text-[#ff9f0a]";
            else if (scan.score >= 30) scoreColor = "text-[#ffd60a]";

            return (
              <tr key={scan.id} className="hover:bg-white/[0.04] transition-colors group">
                <td className="p-4 pl-5 max-w-xs truncate">
                  <div className="flex items-center gap-3">
                    {isPhish ? (
                      <div className="w-7 h-7 rounded-lg bg-[#ff453a]/15 border border-[#ff453a]/25 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-3.5 h-3.5 text-[#ff453a]" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-[#30d158]/15 border border-[#30d158]/25 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158]" />
                      </div>
                    )}
                    <div className="truncate">
                      <Link
                        to={`/results/${scan.id}`}
                        className="font-medium text-white hover:text-[#0a84ff] transition-colors truncate block"
                      >
                        {scan.subject || "Untitled Email"}
                      </Link>
                      <span className="text-[10px] font-mono text-white/40 block mt-0.5">
                        ID: {scan.id.substring(0, 8)}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="p-4 max-w-[200px] truncate">
                  <span className="text-white/80 font-mono text-xs truncate block" title={scan.sender}>
                    {scan.sender || "Unknown"}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold font-mono ${scoreColor}`}>
                      {scan.score}
                    </span>
                    <span className="text-[11px] text-white/35 font-mono">/100</span>
                  </div>
                </td>

                <td className="p-4">
                  <SeverityBadge severity={scan.severity} size="sm" />
                </td>

                <td className="p-4 text-white/50 text-xs">
                  {scan.time_ago || "recently"}
                </td>

                <td className="p-4 pr-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/results/${scan.id}`}
                      className="px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-white/80 hover:text-white text-xs font-medium transition-all"
                    >
                      Dossier
                    </Link>
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(scan.id)}
                        className="p-1.5 rounded-full text-white/40 hover:text-[#ff453a] hover:bg-[#ff453a]/15 transition-all cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
