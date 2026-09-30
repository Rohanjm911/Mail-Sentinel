import React, { useEffect, useState } from "react";
import { Search, Filter, RefreshCw, X } from "lucide-react";
import { ScanService } from "../services/api";
import { ScanHistoryTable } from "../components/ScanHistoryTable";
import { LoadingState } from "../components/LoadingState";
import { ErrorState } from "../components/ErrorState";
import type { ScanSummary } from "../types/scan";

export const History: React.FC = () => {
  const [scans, setScans] = useState<ScanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ScanService.getScans(50, 0, selectedSeverity);
      setScans(data.items);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Failed to load scan history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await ScanService.getScans(50, 0, selectedSeverity);
        if (!ignore) {
          setScans(data.items);
          setError(null);
          setLoading(false);
        }
      } catch (err: any) {
        if (!ignore) {
          setError(err?.response?.data?.error?.message || "Failed to load scan history.");
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [selectedSeverity]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this forensic scan record?")) {
      return;
    }
    try {
      await ScanService.deleteScan(id);
      setScans(scans.filter((s) => s.id !== id));
    } catch (err: any) {
      alert("Failed to delete record: " + (err?.response?.data?.error?.message || err.message));
    }
  };

  const filteredScans = scans.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.subject && s.subject.toLowerCase().includes(q)) ||
      (s.sender && s.sender.toLowerCase().includes(q)) ||
      (s.recipient && s.recipient.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 md:px-8 space-y-6">
      {/* Apple Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#bf5af2]/10 border border-[#bf5af2]/25 text-[#bf5af2] font-semibold uppercase">
              Incident Audit Trail
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Scan History &amp; Incident Log
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Audit trail of analyzed messages, threat scores, extracted IOCs, and remediation actions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="apple-btn-secondary px-4 py-2 text-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#0a84ff]" : ""}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filter and Search Bar (Apple Toolbar) */}
      <div className="apple-card p-4 md:p-5 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by sender address, subject, or domain..."
            className="w-full pl-10 pr-9 py-2 bg-white/[0.04] border border-white/[0.08] rounded-full text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#0a84ff] focus:ring-2 focus:ring-[#0a84ff]/25 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Apple Segmented Severity Pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-white/40 mr-1 flex items-center gap-1 shrink-0 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          <div className="apple-segmented-container p-1">
            {[
              { label: "All", value: "ALL" },
              { label: "Critical", value: "CRITICAL" },
              { label: "High", value: "HIGH" },
              { label: "Medium", value: "MEDIUM" },
              { label: "Safe", value: "LOW" },
            ].map((sev) => (
              <button
                key={sev.value}
                type="button"
                onClick={() => setSelectedSeverity(sev.value)}
                className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer font-medium ${
                  selectedSeverity === sev.value
                    ? "apple-segmented-item-active"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {sev.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading Forensic Audit Trail..." submessage="Fetching records from local database..." />
      ) : error ? (
        <ErrorState message={error} onRetry={handleRefresh} />
      ) : (
        <ScanHistoryTable scans={filteredScans} onDelete={handleDelete} />
      )}
    </div>
  );
};
