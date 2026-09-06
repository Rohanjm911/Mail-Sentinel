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
      s.subject.toLowerCase().includes(q) ||
      s.sender.toLowerCase().includes(q) ||
      (s.recipient && s.recipient.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/25 text-sky-400 font-bold uppercase">
              Incident Audit Trail
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight font-sans">
            Scan History &amp; Incident Log
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Audit trail of analyzed messages, threat scores, extracted IOCs, and remediation actions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="px-3.5 py-2 rounded-xl bg-[#111a2d] hover:bg-[#16223b] border border-[#1e2d4a] hover:border-sky-500/40 text-xs font-mono font-semibold text-slate-300 hover:text-sky-300 flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-sky-400" : ""}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 md:p-5 cyber-card rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center border border-slate-800">
        {/* Search Input */}
        <div className="relative w-full md:w-88">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by sender address, subject, or domain..."
            className="w-full pl-10 pr-9 py-2 bg-[#090e1a] border border-[#1e2d4a] rounded-xl text-xs font-mono text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/30 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Severity filter pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-mono text-slate-400 mr-1.5 flex items-center gap-1 shrink-0 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Severity:</span>
          </span>
          {[
            { label: "ALL", value: "ALL", activeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold" },
            { label: "CRITICAL", value: "CRITICAL", activeColor: "bg-red-500/20 text-red-300 border-red-500/40 font-bold" },
            { label: "HIGH", value: "HIGH", activeColor: "bg-orange-500/20 text-orange-300 border-orange-500/40 font-bold" },
            { label: "MEDIUM", value: "MEDIUM", activeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold" },
            { label: "LOW / SAFE", value: "LOW", activeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold" },
          ].map((sev) => (
            <button
              key={sev.value}
              type="button"
              onClick={() => setSelectedSeverity(sev.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border shrink-0 ${
                selectedSeverity === sev.value
                  ? sev.activeColor
                  : "bg-[#090e1a] text-slate-400 hover:text-slate-200 border-[#1e2d4a]"
              }`}
            >
              {sev.label}
            </button>
          ))}
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
