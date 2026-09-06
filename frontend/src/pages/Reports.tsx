import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { ScanService } from "../services/api";
import { LoadingState } from "../components/LoadingState";
import type { DashboardStatistics } from "../types/scan";

export const Reports: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await ScanService.getStatistics();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleExportJSON = () => {
    if (!stats) return;
    const blob = new Blob([JSON.stringify(stats, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mail_sentinel_report_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !stats) {
    return (
      <div className="p-8">
        <LoadingState message="Generating Security Telemetry Report..." />
      </div>
    );
  }

  const phishPct = Math.round((stats.phishing_detected / Math.max(1, stats.total_scans)) * 100);
  const safePct = Math.round((stats.safe_emails / Math.max(1, stats.total_scans)) * 100);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-[#f8fafc] tracking-tight">
            Security & Threat Reports
          </h1>
          <p className="text-xs text-[#94a3b8] font-mono mt-0.5">
            Executive threat intelligence summaries, risk ratios, and audit logs.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportJSON}
          className="px-3 py-1.5 rounded bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-xs font-mono text-[#f8fafc] flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Forensic JSON</span>
        </button>
      </div>

      {/* Summary Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#121824] border border-[#1e293b] rounded-lg p-5 space-y-2">
          <div className="text-xs font-mono text-[#94a3b8] uppercase">Attack Rate</div>
          <div className="text-3xl font-bold font-mono text-[#ef4444]">{phishPct}%</div>
          <p className="text-[11px] text-[#64748b] font-mono">
            {stats.phishing_detected} of {stats.total_scans} analyzed items flagged as threats.
          </p>
        </div>

        <div className="bg-[#121824] border border-[#1e293b] rounded-lg p-5 space-y-2">
          <div className="text-xs font-mono text-[#94a3b8] uppercase">Safe Ratio</div>
          <div className="text-3xl font-bold font-mono text-[#10b981]">{safePct}%</div>
          <p className="text-[11px] text-[#64748b] font-mono">
            {stats.safe_emails} messages confirmed legitimate or low risk.
          </p>
        </div>

        <div className="bg-[#121824] border border-[#1e293b] rounded-lg p-5 space-y-2">
          <div className="text-xs font-mono text-[#94a3b8] uppercase">Composite Risk Index</div>
          <div className="text-3xl font-bold font-mono text-[#f59e0b]">{stats.average_risk} / 100</div>
          <p className="text-[11px] text-[#64748b] font-mono">
            Mean risk score across all inspected email vectors.
          </p>
        </div>
      </div>

      {/* Breakdown Details */}
      <div className="bg-[#121824] border border-[#1e293b] rounded-lg p-6 space-y-4">
        <h3 className="text-sm font-bold font-mono text-[#f8fafc]">
          SOC Threat Detection Distribution
        </h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-[#ef4444]">Phishing & Malicious Vectors</span>
              <span className="text-[#f8fafc] font-bold">{phishPct}%</span>
            </div>
            <div className="w-full h-2 bg-[#0b0f17] rounded border border-[#1e293b] overflow-hidden">
              <div className="h-full bg-[#ef4444]" style={{ width: `${phishPct}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-[#10b981]">Clean & Verified Inboxes</span>
              <span className="text-[#f8fafc] font-bold">{safePct}%</span>
            </div>
            <div className="w-full h-2 bg-[#0b0f17] rounded border border-[#1e293b] overflow-hidden">
              <div className="h-full bg-[#10b981]" style={{ width: `${safePct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
