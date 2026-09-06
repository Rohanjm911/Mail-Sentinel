import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  ArrowRight,
  Info,
} from "lucide-react";
import { ScanService } from "../services/api";
import { StatCard } from "../components/StatCard";
import { ThreatChart } from "../components/ThreatChart";
import { ScanHistoryTable } from "../components/ScanHistoryTable";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import type { DashboardStatistics } from "../types/scan";

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ScanService.getStatistics();
      setStats(data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Failed to connect to Mail Sentinel backend service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState message="Loading SOC Security Telemetry..." submessage="Connecting to local PostgreSQL / SQLite datastore..." />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8">
        <ErrorState
          title="Telemetry Data Unavailable"
          message={error || "Could not retrieve system dashboard metrics."}
          onRetry={fetchStats}
        />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Sample Data Disclaimer Notification */}
      {stats.is_sample_data && (
        <div className="p-3 bg-[#121824] border border-[#f59e0b]/40 rounded-lg flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-[#f59e0b]">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              <strong>Sample Baseline Telemetry:</strong> No user scans have been executed yet. Displaying standard benchmark samples. Run your first email scan to record live metrics.
            </span>
          </div>
          <Link
            to="/scan"
            className="px-2.5 py-1 rounded bg-[#0b0f17] border border-[#1e293b] text-[#f8fafc] hover:border-[#f59e0b] transition-colors shrink-0 ml-4"
          >
            Launch Scanner
          </Link>
        </div>
      )}

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          subtitle="High & Critical severity"
          icon={ShieldAlert}
          badgeText={`${Math.round((stats.phishing_detected / Math.max(1, stats.total_scans)) * 100)}%`}
          badgeType="danger"
        />
        <StatCard
          title="Safe Emails"
          value={stats.safe_emails.toLocaleString()}
          subtitle="Verified or Low risk"
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

      {/* Threat Overview Section */}
      <div className="bg-[#121824] border border-[#1e293b] rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold font-mono text-[#f8fafc] tracking-wide">
              Threat Overview
            </h3>
            <p className="text-xs text-[#94a3b8] font-mono mt-0.5">
              Email risk distribution and incident levels over recent 7-day period.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0b0f17] border border-[#1e293b] text-[#64748b]">
              7-Day Window
            </span>
          </div>
        </div>

        <ThreatChart data={stats.threat_trends} />
      </div>

      {/* Recent Scans Section */}
      <div className="bg-[#121824] border border-[#1e293b] rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold font-mono text-[#f8fafc] tracking-wide">
              Recent Scans
            </h3>
            <p className="text-xs text-[#94a3b8] font-mono mt-0.5">
              Latest analyzed messages and active IOC detections.
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs font-mono text-[#cbd5e1] hover:text-[#f8fafc] inline-flex items-center gap-1 transition-colors"
          >
            <span>View Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ScanHistoryTable scans={stats.recent_scans} isCompact={true} />
      </div>
    </div>
  );
};
