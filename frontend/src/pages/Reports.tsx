import React, { useEffect, useState } from "react";
import { Download, FileText, FileDown, BarChart2 } from "lucide-react";
import { ScanService } from "../services/api";
import { LoadingState } from "../components/LoadingState";
import type { DashboardStatistics } from "../types/scan";

export const Reports: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await ScanService.getStatistics();
        if (!ignore) {
          setStats(data);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    fetchStats();
    return () => {
      ignore = true;
    };
  }, []);

  const handleExportJSON = () => {
    if (!stats) return;
    const blob = new Blob([JSON.stringify(stats, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mail_sentinel_telemetry_dossier_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !stats) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <LoadingState message="Generating Security Telemetry Report..." submessage="Compiling executive intelligence summaries..." />
      </div>
    );
  }

  const phishPct = Math.round((stats.phishing_detected / Math.max(1, stats.total_scans)) * 100);
  const safePct = Math.round((stats.safe_emails / Math.max(1, stats.total_scans)) * 100);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 md:px-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#64d2ff]/10 border border-[#64d2ff]/25 text-[#64d2ff] font-semibold uppercase">
              Executive Analytics
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Security &amp; Threat Reports
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Executive threat intelligence summaries, forensic risk ratios, and downloadable PDF dossiers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportJSON}
          className="apple-btn-primary px-5 py-2.5 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>Export Forensic JSON Dossier</span>
        </button>
      </div>

      {/* Summary KPI Cards (Apple Fitness Metric style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="apple-card p-6 space-y-2">
          <div className="text-xs font-medium text-white/50 uppercase tracking-tight">Attack Detection Rate</div>
          <div className="text-4xl font-extrabold font-mono text-[#ff453a]">{phishPct}%</div>
          <p className="text-xs text-white/50 pt-1 font-normal">
            {stats.phishing_detected} of {stats.total_scans} analyzed items flagged as threats.
          </p>
        </div>

        <div className="apple-card p-6 space-y-2">
          <div className="text-xs font-medium text-white/50 uppercase tracking-tight">Clean &amp; Verified Ratio</div>
          <div className="text-4xl font-extrabold font-mono text-[#30d158]">{safePct}%</div>
          <p className="text-xs text-white/50 pt-1 font-normal">
            {stats.safe_emails} messages confirmed legitimate or low risk.
          </p>
        </div>

        <div className="apple-card p-6 space-y-2">
          <div className="text-xs font-medium text-white/50 uppercase tracking-tight">Mean Risk Index</div>
          <div className="text-4xl font-extrabold font-mono text-[#ff9f0a]">{stats.average_risk} <span className="text-sm font-normal text-white/40">/ 100</span></div>
          <p className="text-xs text-white/50 pt-1 font-normal">
            Composite risk score averaged across all inspected messages.
          </p>
        </div>
      </div>

      {/* Executive PDF Whitepaper Dossiers */}
      <div className="apple-card p-6 md:p-8 space-y-5">
        <div className="border-b border-white/[0.08] pb-4">
          <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0a84ff]" />
            <span>Official Platform Documentation &amp; SOC Whitepapers</span>
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            Publication-quality PDF specifications and playbooks generated directly from the Mail Sentinel core.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-semibold text-white">System Architecture &amp; Workflow</div>
              <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
                Comprehensive 3-page guide with multi-engine weights and latency benchmark charts.
              </p>
            </div>
            <div className="text-[11px] font-mono text-[#0a84ff] flex items-center gap-1.5 pt-2 border-t border-white/[0.06]">
              <FileDown className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">How_The_Project_Works.pdf</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-semibold text-white">User Manual &amp; SOC Playbook</div>
              <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
                Operational analyst guide with risk gauges, threat landscape graphs, and SLA funnels.
              </p>
            </div>
            <div className="text-[11px] font-mono text-[#0a84ff] flex items-center gap-1.5 pt-2 border-t border-white/[0.06]">
              <FileDown className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">How_To_Use_It.pdf</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-semibold text-white">Project Overview &amp; Tech Stack</div>
              <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
                Technical specification with ROC curve, scikit-learn ML benchmarks, and privacy design.
              </p>
            </div>
            <div className="text-[11px] font-mono text-[#0a84ff] flex items-center gap-1.5 pt-2 border-t border-white/[0.06]">
              <FileDown className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Project_Overview_With_Tech_Stack.pdf</span>
            </div>
          </div>
        </div>
      </div>

      {/* Threat Distribution Bars (Apple Style Progress) */}
      <div className="apple-card p-6 md:p-8 space-y-5">
        <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[#bf5af2]" />
          <span>SOC Threat Detection Ratio</span>
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#ff453a] font-medium">Phishing &amp; Malicious Attacks</span>
              <span className="text-white font-bold font-mono">{phishPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#ff453a] to-[#ff9f0a] rounded-full transition-all duration-500" style={{ width: `${phishPct}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#30d158] font-medium">Clean &amp; Verified Inboxes</span>
              <span className="text-white font-bold font-mono">{safePct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#30d158] to-[#64d2ff] rounded-full transition-all duration-500" style={{ width: `${safePct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
