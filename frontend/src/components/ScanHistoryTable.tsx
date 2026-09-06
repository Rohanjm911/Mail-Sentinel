import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Trash2, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
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
      <div className="p-10 text-center bg-[#090e1a]/60 border border-[#1e2d4a] rounded-xl text-xs font-mono text-slate-400 space-y-3">
        <p>No historical security telemetry recorded yet.</p>
        <Link
          to="/scan"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-sm border border-sky-400/30 transition-all"
        >
          <span>Launch Your First Email Scan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#1e2d4a] bg-[#090e1a]/80 shadow-lg">
      <table className="w-full text-left border-collapse text-xs font-mono">
        <thead>
          <tr className="border-b border-[#1e2d4a] bg-[#0d1424] text-slate-400 uppercase tracking-wider text-[10px]">
            <th className="p-3.5 pl-4 font-bold">Subject / Target Message</th>
            <th className="p-3.5 font-bold">Sender Identity</th>
            <th className="p-3.5 font-bold">Risk Score</th>
            <th className="p-3.5 font-bold">SOC Verdict</th>
            <th className="p-3.5 font-bold">Logged</th>
            <th className="p-3.5 pr-4 font-bold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e2d4a]/70">
          {scans.map((scan) => {
            const isPhish = scan.score >= 60;
            let scoreColor = "text-emerald-400";
            if (scan.score >= 80) scoreColor = "text-red-400";
            else if (scan.score >= 60) scoreColor = "text-orange-400";
            else if (scan.score >= 30) scoreColor = "text-amber-400";

            return (
              <tr key={scan.id} className="hover:bg-[#121c33]/70 transition-colors group">
                <td className="p-3.5 pl-4 max-w-xs truncate">
                  <div className="flex items-center gap-2.5">
                    {isPhish ? (
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span className="font-semibold text-slate-100 truncate group-hover:text-sky-300 transition-colors">
                      {scan.subject || "Untitled Email"}
                    </span>
                  </div>
                </td>
                <td className="p-3.5 max-w-xs truncate text-slate-400 font-sans">
                  {scan.sender || "Unknown"}
                </td>
                <td className="p-3.5">
                  <span className={`font-bold font-mono text-sm ${scoreColor}`}>
                    {scan.score}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono"> / 100</span>
                </td>
                <td className="p-3.5">
                  <SeverityBadge severity={scan.severity} size="sm" />
                </td>
                <td className="p-3.5 text-slate-400">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{scan.time_ago || "recently"}</span>
                  </span>
                </td>
                <td className="p-3.5 pr-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/results/${scan.id}`}
                      className="px-3 py-1.5 rounded-lg bg-[#111a2d] border border-[#1e2d4a] text-slate-300 hover:text-sky-300 hover:border-sky-500/40 hover:bg-[#16223b] transition-all inline-flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <span>Analyze</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    {!isCompact && onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(scan.id)}
                        className="p-1.5 rounded-lg bg-[#111a2d] border border-[#1e2d4a] text-slate-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete record from persistence"
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
