import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { animate, stagger } from "animejs";
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  ArrowRight,
  Info,
  Radio,
  FileSearch,
  BarChart3,
  Cpu,
  RefreshCw,
  PieChart as PieIcon,
  Layers,
} from "lucide-react";
import { ScanService } from "../services/api";
import { StatCard } from "../components/StatCard";
import { ThreatChart } from "../components/ThreatChart";
import { SeverityDonutChart } from "../components/SeverityDonutChart";
import { EngineTelemetryCard } from "../components/EngineTelemetryCard";
import { ScanHistoryTable } from "../components/ScanHistoryTable";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import type { DashboardStatistics, ScanSummary } from "../types/scan";

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const fetchStats = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const data = await ScanService.getStatistics();
      setStats(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err: any) {
      if (showLoading) {
        setError(err?.response?.data?.error?.message || "Failed to connect to Mail Sentinel backend service.");
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const handleManualSync = async () => {
    setIsRefreshing(true);
    await fetchStats(false);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    let ignore = false;
    
    async function load() {
      try {
        const data = await ScanService.getStatistics();
        if (!ignore) {
          setStats(data);
          setError(null);
          setLoading(false);
          setLastUpdated(new Date());
        }
      } catch (err: any) {
        if (!ignore) {
          setError(err?.response?.data?.error?.message || "Failed to connect to Mail Sentinel backend service.");
          setLoading(false);
        }
      }
    }
    load();

    // Live background polling every 6 seconds so charts update after each test scan
    const interval = setInterval(async () => {
      try {
        const data = await ScanService.getStatistics();
        if (!ignore) {
          setStats(data);
          setLastUpdated(new Date());
        }
      } catch {
        // Maintain active stats in background
      }
    }, 6000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  // Anime.js staggered entrance animation
  useEffect(() => {
    if (!loading && stats && dashboardRef.current) {
      const items = dashboardRef.current.querySelectorAll(".anime-entry");
      if (items.length > 0) {
        animate(items, {
          translateY: [14, 0],
          opacity: [0, 1],
          delay: stagger(65),
          ease: "outQuad",
          duration: 450,
        });
      }
    }
  }, [loading, stats]);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState message="Connecting to SOC Security Telemetry..." submessage="Initializing local PostgreSQL / SQLite datastore..." />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8">
        <ErrorState
          title="Telemetry Data Unavailable"
          message={error || "Could not retrieve system dashboard metrics."}
          onRetry={() => fetchStats(true)}
        />
      </div>
    );
  }

  // Format recent scans for table
  const formattedRecentScans: ScanSummary[] = (stats.recent_scans || []).map((s: any) => ({
    id: s.id,
    created_at: typeof s.created_at === "string" ? s.created_at : new Date(s.created_at).toISOString(),
    score: s.score,
    severity: s.severity,
    confidence: s.confidence || 0.95,
    sender: s.sender,
    subject: s.subject,
    recipient: s.recipient,
    url_count: s.url_count || 0,
    attachment_count: s.attachment_count || 0,
    time_ago: s.time_ago || "recently",
  }));

  return (
    <div ref={dashboardRef} className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero SOC Posture Banner */}
      <div className="anime-entry relative overflow-hidden rounded-2xl bg-[#0d1424] border border-sky-500/30 p-6 shadow-md shadow-black/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                SOC DEFENSE POSTURE: GUARD ACTIVE
              </span>
              <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/50">
                LIVE TELEMETRY SYNC
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 tracking-tight">
              Enterprise Email Phishing Defense Console
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl font-sans">
              Real-time multi-engine heuristic telemetry, explainable TF-IDF classification, and zero-day threat correlation.
            </p>
          </div>

          {/* Quick Action & Sync Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#111a2d] hover:bg-[#16223b] text-slate-300 hover:text-sky-300 text-xs font-mono border border-slate-700/80 transition-all cursor-pointer"
              title="Manually sync telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-sky-400" : ""}`} />
              <span>{isRefreshing ? "Syncing..." : "Sync"}</span>
            </button>
            <Link
              to="/scan"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm border border-sky-400/30 transition-all"
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>Scan Email</span>
            </Link>
            <Link
              to="/threat-intelligence"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#152238] hover:bg-[#1a2b47] text-sky-300 text-xs font-semibold border border-sky-500/30 transition-all"
            >
              <Radio className="w-3.5 h-3.5 text-sky-400" />
              <span>Lookup IOC</span>
            </Link>
          </div>
        </div>

        {/* Engine Telemetry Ticker */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>ML Engine:</span>
              <span className="text-slate-200 font-semibold">TF-IDF + Logistic Reg</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Accuracy:</span>
              <span className="text-emerald-400 font-bold">98.28%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Recall:</span>
              <span className="text-amber-400 font-bold">100.0%</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400">
            Last Telemetry Update: <span className="text-slate-300 font-semibold">{lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Sample Data Disclaimer Notification */}
      {stats.is_sample_data && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2.5 text-amber-300">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>Sample Baseline Telemetry:</strong> No live user scans processed yet. Displaying baseline benchmark metrics. Run your first email scan to record live incidents.
            </span>
          </div>
          <Link
            to="/scan"
            className="px-3 py-1 rounded-lg bg-[#0a0f1d] border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 transition-all shrink-0 ml-4 font-semibold"
          >
            Launch Scanner
          </Link>
        </div>
      )}

      {/* Statistics Cards Grid */}
      <div className="anime-entry grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Scans"
          value={stats.total_scans.toLocaleString()}
          subtitle="Processed message inspections"
          icon={Activity}
          badgeText={stats.is_sample_data ? "DEMO" : "LIVE"}
          badgeType="neutral"
        />
        <StatCard
          title="Phishing Detected"
          value={stats.phishing_detected.toLocaleString()}
          subtitle="High & Critical threat alerts"
          icon={ShieldAlert}
          badgeText={`${Math.round((stats.phishing_detected / Math.max(1, stats.total_scans)) * 100)}%`}
          badgeType="danger"
        />
        <StatCard
          title="Safe Emails"
          value={stats.safe_emails.toLocaleString()}
          subtitle="Verified legitimate messages"
          icon={ShieldCheck}
          badgeText={`${Math.round((stats.safe_emails / Math.max(1, stats.total_scans)) * 100)}%`}
          badgeType="safe"
        />
        <StatCard
          title="Average Risk"
          value={`${stats.average_risk} / 100`}
          subtitle="Across all telemetry scans"
          icon={AlertTriangle}
          badgeText={stats.average_risk >= 60 ? "ELEVATED" : "MODERATE"}
          badgeType={stats.average_risk >= 60 ? "danger" : "warning"}
        />
      </div>

      {/* Dynamic Graphs Section: Live Threat Trajectory & Severity Distribution */}
      <div className="anime-entry grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Sequential Scan Score Trajectory */}
        <div className="lg:col-span-2 cyber-card rounded-2xl p-6 md:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
                  REAL-TIME SCAN RISK TRAJECTORY
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                Consecutive threat scores (0–100) mapped per email test scan. Updates dynamically with each test.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#080c14] border border-[#1e2d4a] text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Auto-Updating</span>
              </span>
            </div>
          </div>

          <ThreatChart
            scoreHistory={stats.score_history}
            threatTrends={stats.threat_trends || stats.timeline}
          />
        </div>

        {/* Right Column (1 Col): Incident Severity Breakdown Donut */}
        <div className="cyber-card rounded-2xl p-6 md:p-7 flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
                SEVERITY BREAKDOWN
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Proportional distribution of classified incident severities.
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <SeverityDonutChart
              breakdown={stats.severity_breakdown || {}}
              totalScans={stats.total_scans}
            />
          </div>
        </div>
      </div>

      {/* Multi-Vector Engine Threat Telemetry */}
      {stats.engine_telemetry && stats.engine_telemetry.length > 0 && (
        <div className="anime-entry cyber-card rounded-2xl p-6 md:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
                  MULTI-ENGINE THREAT TELEMETRY
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                Mean heuristic risk scores calculated across specialized detection vector engines.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-[#080c14] border border-[#1e2d4a] text-slate-400 hidden sm:inline-block">
              6 Detection Layers
            </span>
          </div>

          <EngineTelemetryCard telemetry={stats.engine_telemetry} />
        </div>
      )}

      {/* Recent Scans Section */}
      <div className="anime-entry cyber-card rounded-2xl p-6 md:p-7 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
              RECENT ANALYZED MESSAGES
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Latest analyzed communications, forensic risk scores, and extracted IOC detections.
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs font-mono font-semibold text-sky-400 hover:text-sky-300 inline-flex items-center gap-1.5 transition-colors p-1.5 rounded-lg hover:bg-sky-500/10"
          >
            <span>View Full Audit Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ScanHistoryTable scans={formattedRecentScans} isCompact={true} />
      </div>
    </div>
  );
};
