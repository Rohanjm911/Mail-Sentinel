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
      <div className="p-8 text-center bg-[#121824] border border-[#1e293b] rounded-lg text-xs font-mono text-[#94a3b8] space-y-2">
        <p>No recent scans found.</p>
        <Link
          to="/scan"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1e293b] text-[#f8fafc] hover:bg-[#334155] transition-colors"
        >
          <span>Scan an Email</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#1e293b] bg-[#121824]">
      <table className="w-full text-left border-collapse text-xs font-mono">
        <thead>
          <tr className="border-b border-[#1e293b] bg-[#0b0f17] text-[#94a3b8] uppercase tracking-wider text-[11px]">
            <th className="p-3 font-semibold">Subject / Email</th>
            <th className="p-3 font-semibold">Sender</th>
            <th className="p-3 font-semibold">Risk Score</th>
            <th className="p-3 font-semibold">Status</th>
            <th className="p-3 font-semibold">Time</th>
            <th className="p-3 font-semibold text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e293b]">
          {scans.map((scan) => {
            const isPhish = scan.score >= 60;
            let scoreColor = "text-[#10b981]";
            if (scan.score >= 80) scoreColor = "text-[#ef4444]";
            else if (scan.score >= 60) scoreColor = "text-[#f97316]";
            else if (scan.score >= 30) scoreColor = "text-[#f59e0b]";

            return (
              <tr key={scan.id} className="hover:bg-[#161f2e] transition-colors">
                <td className="p-3 max-w-xs truncate">
                  <div className="flex items-center gap-2">
                    {isPhish ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-[#ef4444] shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                    )}
                    <span className="font-semibold text-[#f8fafc] truncate">
                      {scan.subject || "No Subject"}
                    </span>
                  </div>
                </td>
                <td className="p-3 max-w-xs truncate text-[#94a3b8]">
                  {scan.sender || "Unknown"}
                </td>
                <td className={`p-3 font-bold ${scoreColor}`}>
                  {scan.score} / 100
                </td>
                <td className="p-3">
                  <SeverityBadge severity={scan.severity} size="sm" />
                </td>
                <td className="p-3 text-[#64748b]">
                  {scan.time_ago || "recently"}
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/results/${scan.id}`}
                      className="px-2.5 py-1 rounded bg-[#0b0f17] border border-[#1e293b] text-[#cbd5e1] hover:text-[#f8fafc] hover:border-[#334155] transition-colors inline-flex items-center gap-1 text-[11px]"
                    >
                      <span>Analyze</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    {!isCompact && onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(scan.id)}
                        className="p-1 rounded bg-[#0b0f17] border border-[#1e293b] text-[#64748b] hover:text-[#ef4444] hover:border-[#ef4444]/40 transition-colors"
                        title="Delete record"
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
