import React, { useEffect, useState } from "react";
import { Search, Filter, RefreshCw } from "lucide-react";
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

  const fetchScans = async () => {
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
    fetchScans();
  }, [selectedSeverity]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this scan record?")) {
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
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-[#f8fafc] tracking-tight">
            Scan History
          </h1>
          <p className="text-xs text-[#94a3b8] font-mono mt-0.5">
            Audit logs and forensic records of all analyzed emails.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchScans}
          className="px-3 py-1.5 rounded bg-[#121824] hover:bg-[#161f2e] border border-[#1e293b] text-xs font-mono text-[#cbd5e1] hover:text-[#f8fafc] flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#121824] border border-[#1e293b] rounded-lg flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by sender or subject..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#0b0f17] border border-[#1e293b] rounded text-xs font-mono text-[#cbd5e1] placeholder-[#64748b] focus:outline-none focus:border-[#334155]"
          />
        </div>

        {/* Severity filter pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-mono text-[#64748b] mr-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Severity:
          </span>
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSelectedSeverity(sev)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                selectedSeverity === sev
                  ? "bg-[#1e293b] text-[#f8fafc] border border-[#334155] font-bold"
                  : "bg-[#0b0f17] text-[#94a3b8] hover:text-[#cbd5e1] border border-[#1e293b]"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading Scan Logs..." submessage="Fetching records from database..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchScans} />
      ) : (
        <ScanHistoryTable scans={filteredScans} onDelete={handleDelete} />
      )}
    </div>
  );
};
