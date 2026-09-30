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

    const interval = setInterval(async () => {
      try {
        const data = await ScanService.getStatistics();
        if (!ignore) {
          setStats(data);
          setLastUpdated(new Date());
        }
      } catch {
        // Keep stats active
      }
    }, 6000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  // Anime.js entrance animation
  useEffect(() => {
    if (!loading && stats && dashboardRef.current) {
      const items = dashboardRef.current.querySelectorAll(".anime-entry");
      if (items.length > 0) {
        animate(items, {
          translateY: [12, 0],
          opacity: [0, 1],
          delay: stagger(60),
          ease: "outQuad",
          duration: 400,
        });
      }
    }
  }, [loading, stats]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <LoadingState message="Connecting to SOC Security Telemetry..." submessage="Initializing local PostgreSQL / SQLite datastore..." />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <ErrorState
          title="Telemetry Data Unavailable"
          message={error || "Could not retrieve system dashboard metrics."}
          onRetry={() => fetchStats(true)}
        />
      </div>
    );
  }

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
    <div ref={dashboardRef} className="max-w-7xl mx-auto px-6 py-8 md:px-8 space-y-8">
      {/* Apple Hero SOC Posture Banner */}
      <div className="anime-entry apple-card relative overflow-hidden p-6 md:p-8">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white/[0.05] border border-white/[0.12] flex items-center justify-center p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] shrink-0 group">
              <img
                src="/logo.png"
                alt="Mail Sentinel Insignia"
                className="w-full h-full object-contain drop-shadow-[0_4px_16px_rgba(10,132,255,0.4)] transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#30d158]/10 border border-[#30d158]/25 text-[11px] font-semibold text-[#30d158]">
                  <span className="radar-live-dot w-2 h-2 rounded-full bg-[#30d158]" />
                  <span>Defense Guard Active</span>
                </span>
                <span className="text-[11px] text-white/50 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08]">
                  Live Local Telemetry
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white font-sans">
                Enterprise Email Phishing Defense
              </h2>
              <p className="text-xs text-white/60 max-w-2xl font-normal leading-relaxed">
                Deterministic heuristic detection, local explainable TF-IDF classification, and zero-trust credential harvesting protection.
              </p>
            </div>
          </div>

          {/* Apple Action Pills */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isRefreshing}
              className="apple-btn-secondary px-4 py-2 text-xs flex items-center gap-2 cursor-pointer shadow-sm"
              title="Manually sync telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#0a84ff]" : ""}`} />
              <span>{isRefreshing ? "Syncing..." : "Sync"}</span>
            </button>
            <Link
              to="/scan"
              className="apple-btn-primary px-5 py-2 text-xs flex items-center gap-2 font-medium"
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>Scan Email</span>
            </Link>
            <Link
              to="/threat-intelligence"
              className="apple-btn-secondary px-4 py-2 text-xs flex items-center gap-2"
            >
              <Radio className="w-3.5 h-3.5 text-[#ff9f0a]" />
              <span>Lookup IOC</span>
            </Link>
          </div>
        </div>

        {/* Engine Telemetry Ticker (Apple macOS System Specs style) */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#0a84ff]" />
              <span className="text-white/50">Engine:</span>
              <span className="text-white font-medium">TF-IDF + Logistic Reg</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#30d158]" />
              <span className="text-white/50">Benchmark Accuracy:</span>
              <span className="text-[#30d158] font-semibold font-mono">98.28%</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#ff9f0a]" />
              <span className="text-white/50">Recall:</span>
              <span className="text-[#ff9f0a] font-semibold font-mono">100.0%</span>
            </div>
          </div>
          <div className="text-[11px] text-white/40">
            Last Updated: <span className="text-white/70 font-mono font-medium">{lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Sample Data Disclaimer Notification */}
      {stats.is_sample_data && (
        <div className="p-4 rounded-2xl bg-[#ff9f0a]/10 border border-[#ff9f0a]/25 flex items-center justify-between text-xs backdrop-blur-md">
          <div className="flex items-center gap-3 text-[#ff9f0a]">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              <strong>Sample Baseline Telemetry:</strong> No live user scans processed yet. Displaying baseline benchmark metrics. Run your first email scan to record live incidents.
            </span>
          </div>
          <Link
            to="/scan"
            className="px-3.5 py-1.5 rounded-full bg-white/[0.1] border border-[#ff9f0a]/40 text-[#ff9f0a] hover:bg-[#ff9f0a]/20 transition-all shrink-0 ml-4 font-semibold text-xs"
          >
            Launch Scanner
          </Link>
        </div>
      )}

      {/* Apple Statistics Cards Grid */}
      <div className="anime-entry grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Scans"
          value={stats.total_scans.toLocaleString()}
          subtitle="Processed email inspections"
          icon={Activity}
          badgeText={stats.is_sample_data ? "DEMO" : "LIVE"}
          badgeType="neutral"
        />
        <StatCard
          title="Phishing Detected"
          value={stats.phishing_detected.toLocaleString()}
          subtitle="High & Critical alerts"
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

      {/* Dynamic Graphs Section */}
      <div className="anime-entry grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Threat Trajectory */}
        <div className="lg:col-span-2 apple-card p-6 md:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#0a84ff]" />
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  Real-time Scan Risk Trajectory
                </h3>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Consecutive threat scores (0–100) mapped per email test scan.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-[#30d158]/10 border border-[#30d158]/25 text-[#30d158] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-pulse" />
                <span>Live Feed</span>
              </span>
            </div>
          </div>

          <ThreatChart
            scoreHistory={stats.score_history}
            threatTrends={stats.threat_trends || stats.timeline}
          />
        </div>

        {/* Right Column (1 Col): Severity Breakdown Donut */}
        <div className="apple-card p-6 md:p-7 flex flex-col justify-between space-y-4">
          <div className="border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#bf5af2]" />
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Severity Breakdown
              </h3>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              Proportional incident distribution.
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
        <div className="anime-entry apple-card p-6 md:p-7 space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#64d2ff]" />
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  Multi-Engine Threat Telemetry
                </h3>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Mean heuristic risk scores calculated across specialized detection vector engines.
              </p>
            </div>
            <span className="text-[11px] px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60 hidden sm:inline-block font-medium">
              6 Detection Layers
            </span>
          </div>

          <EngineTelemetryCard telemetry={stats.engine_telemetry} />
        </div>
      )}

      {/* Recent Scans Section */}
      <div className="anime-entry apple-card p-6 md:p-7 space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Recent Analyzed Messages
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Latest analyzed communications, forensic risk scores, and extracted IOC detections.
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs font-medium text-[#0a84ff] hover:text-[#64d2ff] inline-flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-full hover:bg-white/[0.06]"
          >
            <span>View Full Audit Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ScanHistoryTable scans={formattedRecentScans} isCompact />
      </div>
    </div>
  );
};
