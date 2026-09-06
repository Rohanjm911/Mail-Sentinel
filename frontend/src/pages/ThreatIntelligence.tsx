import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Radio,
  Search,
  KeyRound,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  RefreshCw,
  Cpu,
  Server,
  History,
  Trash2,
  Shield,
} from "lucide-react";
import { ScanService } from "../services/api";
import { LoadingState } from "../components/LoadingState";
import { SeverityBadge } from "../components/SeverityBadge";
import type { ThreatIntelProvider, IOCLookupResponse } from "../types/scan";

interface RecentSearch {
  type: "url" | "domain" | "ip";
  value: string;
  timestamp: number;
}

const PRESET_IOCS: Array<{ type: "url" | "domain" | "ip"; value: string; label: string; tag: string }> = [
  {
    type: "domain",
    value: "paypal-security-update.xyz",
    label: "paypal-security-update.xyz",
    tag: "Typosquatted Domain",
  },
  {
    type: "url",
    value: "http://192.168.1.50:8080/login/verify",
    label: "http://192.168.1.50:8080/login/verify",
    tag: "Raw IP + Credential Lure",
  },
  {
    type: "domain",
    value: "google.com",
    label: "google.com",
    tag: "Legitimate Clean Domain",
  },
  {
    type: "ip",
    value: "198.51.100.25",
    label: "198.51.100.25",
    tag: "Suspicious Test Range IP",
  },
  {
    type: "ip",
    value: "192.168.1.1",
    label: "192.168.1.1",
    tag: "RFC 1918 Private IP",
  },
];

const LOCAL_STORAGE_KEY = "mail_sentinel_ioc_history";

export const ThreatIntelligence: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState<ThreatIntelProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState<"url" | "domain" | "ip">(() => {
    const t = searchParams.get("type");
    return t === "domain" || t === "ip" ? t : "url";
  });
  const [searchValue, setSearchValue] = useState<string>(() => {
    return searchParams.get("ioc") || "";
  });
  const [lookupResult, setLookupResult] = useState<IOCLookupResponse | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const clearHistory = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error("Could not clear recent search history:", e);
    }
  };

  const runLookup = React.useCallback(async (type: "url" | "domain" | "ip", val: string) => {
    const cleaned = val.trim();
    if (!cleaned) return;

    try {
      setLookupLoading(true);
      setLookupError(null);
      const res = await ScanService.lookupIOC(type, cleaned);
      setLookupResult(res);
      setRecentSearches((prev) => {
        const updated = [
          { type, value: cleaned, timestamp: Date.now() },
          ...prev.filter((item) => item.value !== cleaned),
        ].slice(0, 8);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error("Could not save recent search:", e);
        }
        return updated;
      });
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.error?.message ||
        err?.message ||
        "An unexpected error occurred during IOC analysis.";
      setLookupError(errMsg);
      setLookupResult(null);
    } finally {
      setLookupLoading(false);
    }
  }, []);

  // Load feed provider statuses on mount
  useEffect(() => {
    let ignore = false;
    async function fetchStatus() {
      try {
        const res = await ScanService.getThreatIntelStatus();
        if (!ignore) {
          setProviders(res.providers || []);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load threat intel status:", err);
          setLoading(false);
        }
      }
    }

    fetchStatus();
    return () => {
      ignore = true;
    };
  }, []);

  // Check URL query parameters on mount or param changes
  useEffect(() => {
    const iocParam = searchParams.get("ioc");
    const typeParam = searchParams.get("type");

    if (iocParam && iocParam.trim()) {
      const queryVal = iocParam.trim();
      const validTypes: Array<"url" | "domain" | "ip"> = ["url", "domain", "ip"];
      const resolvedType = validTypes.includes(typeParam as any)
        ? (typeParam as "url" | "domain" | "ip")
        : "url";

      let ignore = false;
      async function query() {
        try {
          const res = await ScanService.lookupIOC(resolvedType, queryVal);
          if (!ignore) {
            setLookupResult(res);
            setLookupError(null);
            setLookupLoading(false);
          }
        } catch (err: any) {
          if (!ignore) {
            const errMsg =
              err?.response?.data?.error?.message ||
              err?.message ||
              "An unexpected error occurred during IOC analysis.";
            setLookupError(errMsg);
            setLookupResult(null);
            setLookupLoading(false);
          }
        }
      }
      query();
      return () => {
        ignore = true;
      };
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    // Update query params to allow bookmarking / sharing
    setSearchParams({ ioc: searchValue.trim(), type: searchType });
    runLookup(searchType, searchValue.trim());
  };

  const handleSelectPreset = (preset: { type: "url" | "domain" | "ip"; value: string }) => {
    setSearchType(preset.type);
    setSearchValue(preset.value);
    setSearchParams({ ioc: preset.value, type: preset.type });
    runLookup(preset.type, preset.value);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const analysis = lookupResult?.analysis;

  // Compute color scheme based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[#ef4444]";
    if (score >= 60) return "text-[#f97316]";
    if (score >= 30) return "text-[#f59e0b]";
    return "text-[#10b981]";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return "bg-[#ef4444]";
    if (score >= 60) return "bg-[#f97316]";
    if (score >= 30) return "bg-[#f59e0b]";
    return "bg-[#10b981]";
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-[#121824] border border-[#1e293b]">
            <Radio className="w-5 h-5 text-[#38bdf8]" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-mono text-[#f8fafc] tracking-tight">
              Indicator of Compromise (IOC) Threat Intelligence
            </h1>
            <p className="text-xs text-[#94a3b8] font-mono leading-relaxed mt-0.5">
              Deterministic multi-vector forensic evaluation of URLs, domains, and IP addresses. Operates fully on-premises with optional cloud feed integration.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive IOC Reputation Lookup Tool */}
      <div className="bg-[#121824] border border-[#1e293b] rounded-lg p-6 space-y-5 shadow-sm">
        <div>
          <h2 className="text-sm font-bold font-mono text-[#f8fafc] tracking-wide flex items-center gap-2">
            <Search className="w-4 h-4 text-[#38bdf8]" />
            <span>Interactive IOC Reputation Analyzer</span>
          </h2>
          <p className="text-xs text-[#94a3b8] font-mono mt-0.5">
            Query lexical heuristics, brand typosquatting, IDN homoglyphs, dynamic DNS records, and configured threat feeds.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as any)}
            className="px-3.5 py-2.5 bg-[#0b0f17] border border-[#1e293b] rounded text-xs font-mono text-[#cbd5e1] focus:outline-none focus:border-[#38bdf8] transition-colors"
          >
            <option value="url">URL</option>
            <option value="domain">Domain</option>
            <option value="ip">IP Address</option>
          </select>

          <div className="relative flex-1">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={
                searchType === "url"
                  ? "Enter URL (e.g. http://192.168.1.1/login or https://suspicious.xyz)..."
                  : searchType === "domain"
                  ? "Enter Domain (e.g. paypal-verify.com or account-update.top)..."
                  : "Enter IPv4/IPv6 address (e.g. 198.51.100.25)..."
              }
              className="w-full px-3.5 py-2.5 bg-[#0b0f17] border border-[#1e293b] rounded text-xs font-mono text-[#cbd5e1] placeholder-[#64748b] focus:outline-none focus:border-[#38bdf8] transition-colors pr-8"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#64748b] hover:text-[#cbd5e1]"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={lookupLoading || !searchValue.trim()}
            className="px-5 py-2.5 rounded bg-[#1e293b] hover:bg-[#2e3e57] border border-[#38bdf8]/40 hover:border-[#38bdf8] text-xs font-mono font-semibold text-[#f8fafc] flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {lookupLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#38bdf8]" />
                <span>Analyzing IOC...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Investigate IOC</span>
              </>
            )}
          </button>
        </form>

        {/* Quick-test Presets */}
        <div className="space-y-2 pt-1 border-t border-[#1e293b]/70">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748b] flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-[#38bdf8]" />
            <span>Sample Test Indicators (Click to Run):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_IOCS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="group flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0b0f17] hover:bg-[#162032] border border-[#1e293b] hover:border-[#38bdf8]/50 text-[11px] font-mono text-[#94a3b8] hover:text-[#f8fafc] transition-all cursor-pointer"
              >
                <span className="px-1 py-0.2 text-[9px] rounded bg-[#1e293b] text-[#38bdf8] group-hover:bg-[#38bdf8]/20">
                  {p.type.toUpperCase()}
                </span>
                <span className="font-semibold text-[#cbd5e1]">{p.label}</span>
                <span className="text-[10px] text-[#64748b]">({p.tag})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Search History */}
        {recentSearches.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]/50 text-xs font-mono">
            <div className="flex items-center gap-2 text-[#64748b] overflow-x-auto py-1">
              <History className="w-3 h-3 text-[#64748b] shrink-0" />
              <span className="text-[10px] uppercase text-[#64748b] shrink-0">Recent:</span>
              <div className="flex items-center gap-1.5 flex-nowrap">
                {recentSearches.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(item)}
                    className="px-2 py-0.5 rounded bg-[#0b0f17] hover:bg-[#1a2333] border border-[#1e293b] text-[10px] text-[#cbd5e1] hover:text-[#38bdf8] whitespace-nowrap transition-colors"
                  >
                    {item.value}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={clearHistory}
              className="text-[10px] text-[#64748b] hover:text-[#ef4444] flex items-center gap-1 shrink-0 ml-2"
              title="Clear search history"
            >
              <Trash2 className="w-2.5 h-2.5" />
              <span>Clear</span>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {lookupError && (
          <div className="p-4 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 text-xs font-mono text-[#ef4444] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{lookupError}</span>
          </div>
        )}
      </div>

      {/* Full Forensic Analysis Results Section */}
      {lookupResult && analysis && (
        <div className="space-y-6">
          {/* Executive Assessment Banner */}
          <div className="bg-[#121824] border border-[#1e293b] rounded-lg p-6 space-y-5 shadow-md">
            {/* Top Bar: IOC details + Verdict + Copy */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-[#1e293b]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#0b0f17] border border-[#1e293b] text-[#38bdf8] font-bold">
                    {lookupResult.type.toUpperCase()} INDICATOR
                  </span>
                  <SeverityBadge severity={analysis.severity} size="md" />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-base sm:text-lg font-bold font-mono text-[#f8fafc] break-all">
                    {lookupResult.ioc}
                  </span>
                  <button
                    onClick={() => copyToClipboard(lookupResult.ioc)}
                    className="p-1 rounded hover:bg-[#1e293b] text-[#64748b] hover:text-[#f8fafc] transition-colors"
                    title="Copy IOC to clipboard"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-[#10b981]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Threat Score & Verdict Metrics */}
              <div className="flex items-center gap-6 bg-[#0b0f17] border border-[#1e293b] px-5 py-3 rounded-lg self-start lg:self-auto">
                <div className="space-y-0.5 text-center">
                  <div className="text-[10px] font-mono uppercase text-[#64748b]">VERDICT</div>
                  <div
                    className={`text-sm font-mono font-black tracking-wider ${getScoreColor(
                      analysis.risk_score
                    )}`}
                  >
                    {analysis.verdict}
                  </div>
                </div>

                <div className="h-8 w-[1px] bg-[#1e293b]" />

                <div className="space-y-0.5 text-center">
                  <div className="text-[10px] font-mono uppercase text-[#64748b]">RISK SCORE</div>
                  <div
                    className={`text-sm font-mono font-black ${getScoreColor(analysis.risk_score)}`}
                  >
                    {analysis.risk_score} <span className="text-[10px] text-[#64748b]">/ 100</span>
                  </div>
                </div>

                <div className="h-8 w-[1px] bg-[#1e293b]" />

                <div className="space-y-0.5 text-center">
                  <div className="text-[10px] font-mono uppercase text-[#64748b]">CONFIDENCE</div>
                  <div className="text-sm font-mono font-bold text-[#f8fafc]">
                    {Math.round((analysis.confidence || 0.9) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Score Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#94a3b8]">Threat Risk Scale</span>
                <span className={`font-bold font-mono ${getScoreColor(analysis.risk_score)}`}>
                  {analysis.risk_score >= 80
                    ? "CRITICAL DANGER"
                    : analysis.risk_score >= 60
                    ? "HIGH RISK"
                    : analysis.risk_score >= 30
                    ? "SUSPICIOUS / ELEVATED"
                    : "BENIGN / LOW RISK"}
                </span>
              </div>
              <div className="w-full h-2 bg-[#0b0f17] rounded-full overflow-hidden border border-[#1e293b]">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${getScoreBarColor(
                    analysis.risk_score
                  )}`}
                  style={{ width: `${Math.max(4, analysis.risk_score)}%` }}
                />
              </div>
            </div>

            {/* Executive Synthesis Summary */}
            <div className="p-4 rounded-lg bg-[#0b0f17] border border-[#1e293b] space-y-1.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#38bdf8] flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Executive Threat Intelligence Synthesis</span>
              </div>
              <p className="text-xs font-mono text-[#cbd5e1] leading-relaxed">
                {analysis.summary}
              </p>
            </div>
          </div>

          {/* Grid: Indicators of Compromise & Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Security Findings & Indicators */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#ef4444]" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#cbd5e1]">
                    Identified Security Findings ({analysis.indicators?.length || 0})
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[#64748b]">
                  Mail Sentinel Local Engine
                </span>
              </div>

              {!analysis.indicators || analysis.indicators.length === 0 ? (
                <div className="p-6 rounded-lg bg-[#121824] border border-[#1e293b] text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#10b981] mx-auto" />
                  <div className="text-xs font-mono font-bold text-[#f8fafc]">
                    No Active Malicious Indicators Detected
                  </div>
                  <p className="text-[11px] font-mono text-[#94a3b8] max-w-md mx-auto">
                    The indicator did not trigger any brand typosquatting, IDN homoglyphs, high-risk TLDs, dynamic DNS hosts, or raw IP transport flags.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analysis.indicators.map((ind, idx) => (
                    <div
                      key={idx}
                      className="bg-[#121824] border border-[#1e293b] rounded-lg p-4 space-y-2.5 transition-all hover:border-[#334155]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#0b0f17] border border-[#1e293b] text-[#94a3b8]">
                              {ind.category}
                            </span>
                            <SeverityBadge severity={ind.severity} size="sm" />
                          </div>
                          <h4 className="text-xs font-mono font-bold text-[#f8fafc] pt-1">
                            {ind.title}
                          </h4>
                        </div>
                      </div>

                      <p className="text-xs font-mono text-[#94a3b8] leading-relaxed">
                        {ind.description}
                      </p>

                      {ind.evidence && (
                        <div className="pt-2">
                          <div className="text-[10px] font-mono text-[#64748b] uppercase mb-1">
                            Forensic Evidence:
                          </div>
                          <div className="px-3 py-1.5 rounded bg-[#0b0f17] border border-[#1e293b] text-[11px] font-mono text-[#38bdf8] break-all">
                            {ind.evidence}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Actionable Recommendations */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div className="bg-[#121824] border border-[#1e293b] rounded-lg p-5 space-y-3 mt-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#10b981]" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#cbd5e1]">
                      SOC Containment & Mitigation Recommendations
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-xs font-mono text-[#cbd5e1] leading-relaxed"
                      >
                        <Check className="w-3.5 h-3.5 text-[#10b981] shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right 1 Col: Forensic Technical Telemetry */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#38bdf8]" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#cbd5e1]">
                  Technical Telemetry
                </h3>
              </div>

              <div className="bg-[#121824] border border-[#1e293b] rounded-lg p-5 space-y-4 text-xs font-mono">
                {analysis.telemetry && (
                  <div className="space-y-3 divide-y divide-[#1e293b]">
                    {Object.entries(analysis.telemetry).map(([key, val]) => {
                      let displayVal = String(val);
                      if (Array.isArray(val)) {
                        displayVal = val.length > 0 ? val.join(", ") : "None";
                      } else if (typeof val === "boolean") {
                        displayVal = val ? "YES (True)" : "NO (False)";
                      } else if (val === null || val === undefined) {
                        displayVal = "N/A";
                      }

                      return (
                        <div key={key} className="pt-2 first:pt-0 space-y-0.5">
                          <div className="text-[10px] text-[#64748b] uppercase tracking-wider">
                            {key.replace(/_/g, " ")}
                          </div>
                          <div className="text-[#cbd5e1] font-semibold break-all">
                            {displayVal}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Feed Multi-Adapter Status Table */}
              <div className="bg-[#121824] border border-[#1e293b] rounded-lg p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-[#94a3b8]" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#cbd5e1]">
                      Intelligence Feeds
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#64748b]">
                    {Object.keys(lookupResult.results || {}).length} Providers
                  </span>
                </div>

                <div className="space-y-2">
                  {Object.entries(lookupResult.results || {}).map(([prov, data]: [string, any]) => {
                    const isConfigured = data?.configured;
                    return (
                      <div
                        key={prov}
                        className="p-2.5 bg-[#0b0f17] border border-[#1e293b] rounded flex items-center justify-between text-xs font-mono"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-[#f8fafc] text-[11px]">{prov}</div>
                          <div className="text-[10px] text-[#64748b]">
                            {data?.status || (isConfigured ? "Active" : "Not Configured")}
                          </div>
                        </div>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                            isConfigured
                              ? "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30"
                              : "bg-[#1e293b] text-[#94a3b8] border-[#334155]"
                          }`}
                        >
                          {isConfigured ? "ONLINE" : "OPTIONAL"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provider Status Cards (Always Visible) */}
      <div className="space-y-3 pt-4 border-t border-[#1e293b]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#94a3b8]" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#cbd5e1]">
              Configured Intelligence Feed Adapters
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#64748b]">
            Zero External API Keys Required for Operation
          </span>
        </div>

        {loading ? (
          <LoadingState message="Checking Threat Intelligence Adapters..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {providers.map((p) => {
              const isConfigured = p.configured;
              return (
                <div
                  key={p.name}
                  className="bg-[#121824] border border-[#1e293b] rounded-lg p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-[#f8fafc] truncate" title={p.name}>
                      {p.name}
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isConfigured ? "bg-[#10b981]" : "bg-[#64748b]"
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-mono text-[#64748b]">Status</div>
                    <div
                      className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border truncate ${
                        isConfigured
                          ? "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30"
                          : "bg-[#0b0f17] text-[#94a3b8] border-[#1e293b]"
                      }`}
                      title={p.status}
                    >
                      {p.status}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1e293b] text-[9px] font-mono text-[#64748b] leading-snug">
                    {isConfigured
                      ? "Active for live IOC reputation lookups"
                      : "Optional integration; Mail Sentinel works autonomously without external keys"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security Architecture Notice */}
      <div className="p-5 bg-[#0b0f17] border border-[#1e293b] rounded-lg space-y-2 text-xs font-mono text-[#94a3b8]">
        <div className="flex items-center gap-2 text-[#f8fafc] font-semibold">
          <KeyRound className="w-4 h-4 text-[#f59e0b]" />
          <span>Threat Intelligence Architecture Guidelines</span>
        </div>
        <p className="leading-relaxed text-[#64748b]">
          To activate external cloud threat feeds (e.g. VirusTotal, URLhaus, PhishTank, AbuseIPDB), add your API keys to the backend <code className="text-[#cbd5e1]">.env</code> file (e.g. <code className="text-[#cbd5e1]">VIRUSTOTAL_API_KEY=...</code>). All external credentials remain secure on the backend server and are never exposed to the browser client. When external keys are absent, Mail Sentinel's on-premises deterministic intelligence engine evaluates all indicators locally with zero external network dependencies.
        </p>
      </div>
    </div>
  );
};
