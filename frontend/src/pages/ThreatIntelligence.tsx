import React, { useEffect, useState } from "react";
import { Radio, Search, KeyRound } from "lucide-react";
import { ScanService } from "../services/api";
import { LoadingState } from "../components/LoadingState";
import type { ThreatIntelProvider } from "../types/scan";

export const ThreatIntelligence: React.FC = () => {
  const [providers, setProviders] = useState<ThreatIntelProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState<"url" | "domain" | "ip">("url");
  const [searchValue, setSearchValue] = useState("");
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const res = await ScanService.getThreatIntelStatus();
        setProviders(res.providers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    try {
      setLookupLoading(true);
      setLookupResult(null);
      const res = await ScanService.lookupIOC(searchType, searchValue.trim());
      setLookupResult(res);
    } catch (err: any) {
      alert("Lookup error: " + (err?.response?.data?.error?.message || err.message));
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold font-mono text-[#f8fafc] tracking-tight">
          External Threat Intelligence Feeds
        </h1>
        <p className="text-xs text-[#94a3b8] font-mono leading-relaxed">
          Modular adapters for third-party intelligence feeds. Mail Sentinel functions completely autonomously without external keys.
        </p>
      </div>

      {/* Provider Status Cards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#94a3b8]" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#cbd5e1]">
            Feed Adapters Status
          </h2>
        </div>

        {loading ? (
          <LoadingState message="Checking Feed Adapters..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {providers.map((p) => {
              const isConfigured = p.configured;
              return (
                <div
                  key={p.name}
                  className="bg-[#121824] border border-[#1e293b] rounded-lg p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold font-mono text-[#f8fafc]">
                      {p.name}
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isConfigured ? "bg-[#10b981]" : "bg-[#64748b]"
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[11px] font-mono text-[#64748b]">Status</div>
                    <div
                      className={`text-xs font-mono font-semibold px-2 py-1 rounded border ${
                        isConfigured
                          ? "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30"
                          : "bg-[#0b0f17] text-[#94a3b8] border-[#1e293b]"
                      }`}
                    >
                      {p.status}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1e293b] text-[10px] font-mono text-[#64748b]">
                    {isConfigured
                      ? "Active for live IOC reputation lookups"
                      : "Optional integration; zero external dependencies required"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive IOC Reputation Lookup Tool */}
      <div className="bg-[#121824] border border-[#1e293b] rounded-lg p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold font-mono text-[#f8fafc] tracking-wide">
            Indicator of Compromise (IOC) Lookup
          </h3>
          <p className="text-xs text-[#94a3b8] font-mono mt-0.5">
            Query configured threat intelligence feeds for a URL, domain, or IP address.
          </p>
        </div>

        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as any)}
            className="px-3 py-2 bg-[#0b0f17] border border-[#1e293b] rounded text-xs font-mono text-[#cbd5e1] focus:outline-none focus:border-[#334155]"
          >
            <option value="url">URL</option>
            <option value="domain">Domain</option>
            <option value="ip">IP Address</option>
          </select>

          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={`Enter ${searchType} to check reputation (e.g. suspicious-domain.com)...`}
            className="flex-1 px-3 py-2 bg-[#0b0f17] border border-[#1e293b] rounded text-xs font-mono text-[#cbd5e1] placeholder-[#64748b] focus:outline-none focus:border-[#334155]"
          />

          <button
            type="submit"
            disabled={lookupLoading}
            className="px-4 py-2 rounded bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-xs font-mono font-semibold text-[#f8fafc] flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{lookupLoading ? "Querying..." : "Query Feeds"}</span>
          </button>
        </form>

        {/* Lookup Results Display */}
        {lookupResult && (
          <div className="p-4 bg-[#0b0f17] border border-[#1e293b] rounded-lg space-y-3 mt-4">
            <div className="text-xs font-mono text-[#94a3b8]">
              Results for <strong className="text-[#f8fafc]">{lookupResult.ioc}</strong>:
            </div>
            <div className="space-y-2">
              {Object.entries(lookupResult.results || {}).map(([prov, data]: [string, any]) => (
                <div
                  key={prov}
                  className="p-3 bg-[#121824] border border-[#1e293b] rounded flex items-center justify-between text-xs font-mono"
                >
                  <span className="font-semibold text-[#f8fafc]">{prov}</span>
                  <span className="text-[#94a3b8]">{data?.status || "Threat Intelligence: Not Configured"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Security Architecture Notice */}
      <div className="p-5 bg-[#0b0f17] border border-[#1e293b] rounded-lg space-y-2 text-xs font-mono text-[#94a3b8]">
        <div className="flex items-center gap-2 text-[#f8fafc] font-semibold">
          <KeyRound className="w-4 h-4 text-[#f59e0b]" />
          <span>Threat Intelligence Architecture Guidelines (Section 15)</span>
        </div>
        <p className="leading-relaxed text-[#64748b]">
          To activate external threat intelligence lookups, configure environment variables in your local backend <code className="text-[#cbd5e1]">.env</code> file (e.g. <code className="text-[#cbd5e1]">VIRUSTOTAL_API_KEY</code>, <code className="text-[#cbd5e1]">URLHAUS_API_KEY</code>). Keys are strictly handled on the backend and are never transmitted to or exposed in the frontend client. When not configured, Mail Sentinel uses its self-contained local ML detection and heuristic risk engine.
        </p>
      </div>
    </div>
  );
};
