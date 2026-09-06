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
      <div className="p-8">
        <LoadingState message="Generating Security Telemetry Report..." submessage="Compiling executive intelligence summaries..." />
      </div>
    );
  }

  const phishPct = Math.round((stats.phishing_detected / Math.max(1, stats.total_scans)) * 100);
  const safePct = Math.round((stats.safe_emails / Math.max(1, stats.total_scans)) * 100);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/25 text-sky-400 font-bold uppercase">
              Executive Analytics
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight font-sans">
            Security &amp; Threat Reports
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Executive threat intelligence summaries, forensic risk ratios, and downloadable PDF dossiers.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportJSON}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-sm border border-sky-400/30 flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Forensic JSON Dossier</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="cyber-card rounded-2xl p-6 space-y-2 border border-slate-800">
          <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">Attack Detection Rate</div>
          <div className="text-4xl font-extrabold font-mono text-red-400">{phishPct}%</div>
          <p className="text-xs text-slate-400 font-sans pt-1">
            {stats.phishing_detected} of {stats.total_scans} analyzed items flagged as threats.
          </p>
        </div>

        <div className="cyber-card rounded-2xl p-6 space-y-2 border border-slate-800">
          <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">Clean &amp; Verified Ratio</div>
          <div className="text-4xl font-extrabold font-mono text-emerald-400">{safePct}%</div>
          <p className="text-xs text-slate-400 font-sans pt-1">
            {stats.safe_emails} messages confirmed legitimate or low risk.
          </p>
        </div>

        <div className="cyber-card rounded-2xl p-6 space-y-2 border border-slate-800">
          <div className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">Mean Risk Index</div>
          <div className="text-4xl font-extrabold font-mono text-amber-400">{stats.average_risk} <span className="text-sm font-normal text-slate-400">/ 100</span></div>
          <p className="text-xs text-slate-400 font-sans pt-1">
            Composite risk score averaged across all inspected messages.
          </p>
        </div>
      </div>

      {/* Executive PDF Whitepaper Dossiers */}
      <div className="cyber-card rounded-2xl p-6 md:p-7 space-y-4 border border-slate-800">
        <div className="border-b border-slate-800/80 pb-3">
          <h3 className="text-sm font-bold font-mono text-slate-100 tracking-wide uppercase flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Official Platform Documentation &amp; SOC Whitepapers</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Publication-quality PDF specifications and playbooks generated directly from the Mail Sentinel core.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#090e1a] border border-[#1e2d4a] flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-bold text-slate-100 font-mono">System Architecture &amp; Workflow</div>
              <p className="text-[11px] text-slate-400 mt-1 font-sans">
                Comprehensive 3-page guide with multi-engine weights and latency benchmark charts.
              </p>
            </div>
            <div className="text-[11px] font-mono text-sky-400 flex items-center gap-1">
              <FileDown className="w-3.5 h-3.5" />
              <span>Available in project root: How_The_Project_Works.pdf</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#090e1a] border border-[#1e2d4a] flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-bold text-slate-100 font-mono">User Manual &amp; SOC Playbook</div>
              <p className="text-[11px] text-slate-400 mt-1 font-sans">
                Operational analyst guide with risk gauges, threat landscape graphs, and SLA funnels.
              </p>
            </div>
            <div className="text-[11px] font-mono text-sky-400 flex items-center gap-1">
              <FileDown className="w-3.5 h-3.5" />
              <span>Available in project root: How_To_Use_It.pdf</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#090e1a] border border-[#1e2d4a] flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-bold text-slate-100 font-mono">Project Overview &amp; Tech Stack</div>
              <p className="text-[11px] text-slate-400 mt-1 font-sans">
                Technical specification with ROC curve, scikit-learn ML benchmarks, and privacy design.
              </p>
            </div>
            <div className="text-[11px] font-mono text-sky-400 flex items-center gap-1">
              <FileDown className="w-3.5 h-3.5" />
              <span>Available in project root: Project_Overview_With_Tech_Stack.pdf</span>
            </div>
          </div>
        </div>
      </div>

      {/* Threat Distribution Bars */}
      <div className="cyber-card rounded-2xl p-6 md:p-7 space-y-4 border border-slate-800">
        <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wide flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-sky-400" />
          <span>SOC Threat Detection Ratio</span>
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-red-400 font-semibold">Phishing &amp; Malicious Attacks</span>
              <span className="text-slate-100 font-bold">{phishPct}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#090e1a] rounded-full border border-[#1e2d4a] overflow-hidden">
              <div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: `${phishPct}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-emerald-400 font-semibold">Clean &amp; Verified Inboxes</span>
              <span className="text-slate-100 font-bold">{safePct}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#090e1a] rounded-full border border-[#1e2d4a] overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${safePct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
