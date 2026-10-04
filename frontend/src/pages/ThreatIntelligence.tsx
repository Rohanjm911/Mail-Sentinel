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
        const filtered = prev.filter((item) => !(item.type === type && item.value === cleaned));
        const updated = [{ type, value: cleaned, timestamp: Date.now() }, ...filtered].slice(0, 8);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to save IOC search history:", e);
        }
        return updated;
      });
    } catch (err: any) {
      setLookupError(err?.response?.data?.error?.message || "Failed to analyze specified indicator.");
      setLookupResult(null);
    } finally {
      setLookupLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadAdapters() {
      try {
        setLoading(true);
        const data = await ScanService.getThreatIntelProviders();
        if (!ignore) {
          setProviders(data);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) setLoading(false);
      }
    }
    loadAdapters();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const iocParam = searchParams.get("ioc");
    const typeParam = searchParams.get("type");
    if (iocParam) {
      const validT = typeParam === "domain" || typeParam === "ip" ? typeParam : "url";
      void Promise.resolve().then(() => {
        runLookup(validT, iocParam);
      });
    }
  }, [searchParams, runLookup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[#ff453a]";
    if (score >= 60) return "text-[#ff9f0a]";
    if (score >= 30) return "text-[#ffd60a]";
    return "text-[#30d158]";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return "bg-[#ff453a]";
    if (score >= 60) return "bg-[#ff9f0a]";
    if (score >= 30) return "bg-[#ffd60a]";
    return "bg-[#30d158]";
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 md:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#ff9f0a]/15 border border-[#ff9f0a]/25 text-[#ff9f0a]">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              Threat Intelligence Console
            </h1>
            <p className="text-xs text-white/50 leading-relaxed mt-0.5">
              Deterministic multi-vector forensic evaluation of URLs, domains, and IP addresses with zero-trust local reputation synthesis.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive IOC Reputation Lookup Tool */}
      <div className="apple-card p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <Search className="w-4 h-4 text-[#0a84ff]" />
            <span>Interactive Indicator of Compromise Analyzer</span>
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            Query lexical heuristics, brand typosquatting, IDN homoglyphs, dynamic DNS records, and configured threat feeds.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as any)}
            className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#0a84ff] focus:ring-4 focus:ring-[#0a84ff]/15 transition-all"
          >
            <option value="url" className="bg-[#1c1c1e] text-white">URL</option>
            <option value="domain" className="bg-[#1c1c1e] text-white">Domain</option>
            <option value="ip" className="bg-[#1c1c1e] text-white">IP Address</option>
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
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#0a84ff] focus:ring-4 focus:ring-[#0a84ff]/15 transition-all pr-8"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-white/40 hover:text-white"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={lookupLoading || !searchValue.trim()}
            className="apple-btn-primary px-6 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-md"
          >
            {lookupLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Analyzing IOC...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Investigate Indicator</span>
              </>
            )}
          </button>
        </form>

        {/* Quick-test Presets (Apple Pills) */}
        <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
          <div className="text-[11px] uppercase tracking-wider text-white/40 flex items-center gap-1.5 font-medium">
            <Terminal className="w-3 h-3 text-[#0a84ff]" />
            <span>Sample Test Indicators (Click to Run):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_IOCS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="group flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-mono text-white/70 hover:text-white transition-all cursor-pointer"
              >
                <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-[#0a84ff]/15 text-[#0a84ff] font-semibold">
                  {p.type.toUpperCase()}
                </span>
                <span className="font-medium text-white">{p.label}</span>
                <span className="text-[10px] text-white/40">({p.tag})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Search History */}
        {recentSearches.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs font-mono">
            <div className="flex items-center gap-2 text-white/50 overflow-x-auto py-1">
              <History className="w-3 h-3 text-white/40 shrink-0" />
              <span className="text-[10px] uppercase text-white/40 shrink-0">Recent:</span>
              <div className="flex items-center gap-1.5 flex-nowrap">
                {recentSearches.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(item)}
                    className="px-2.5 py-0.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[10px] text-white/70 hover:text-[#0a84ff] whitespace-nowrap transition-colors"
                  >
                    {item.value}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={clearHistory}
              className="text-[10px] text-white/40 hover:text-[#ff453a] flex items-center gap-1 shrink-0 ml-2"
              title="Clear search history"
            >
              <Trash2 className="w-2.5 h-2.5" />
              <span>Clear</span>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {lookupError && (
          <div className="p-4 rounded-2xl bg-[#ff453a]/10 border border-[#ff453a]/30 text-xs text-[#ff453a] flex items-center gap-2.5 backdrop-blur-md">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{lookupError}</span>
          </div>
        )}
      </div>

      {/* Full Forensic Analysis Results Section */}
      {lookupResult && analysis && (
        <div className="space-y-6">
          {/* Executive Assessment Banner */}
          <div className="apple-card p-6 md:p-8 space-y-6">
            {/* Top Bar: IOC details + Verdict + Copy */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase px-2.5 py-0.5 rounded-full bg-[#0a84ff]/10 border border-[#0a84ff]/25 text-[#0a84ff] font-semibold">
                    {lookupResult.type.toUpperCase()} Indicator
                  </span>
                  <SeverityBadge severity={analysis.severity} size="md" />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-base sm:text-lg font-bold font-mono text-white break-all">
                    {lookupResult.ioc}
                  </span>
                  <button
                    onClick={() => copyToClipboard(lookupResult.ioc)}
                    className="p-1.5 rounded-full hover:bg-white/[0.1] text-white/40 hover:text-white transition-colors"
                    title="Copy IOC to clipboard"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-[#30d158]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Threat Score & Verdict Metrics */}
              <div className="flex items-center gap-6 bg-white/[0.03] border border-white/[0.08] px-6 py-3.5 rounded-2xl self-start lg:self-auto backdrop-blur-md">
                <div className="space-y-0.5 text-center">
                  <div className="text-[10px] font-semibold uppercase text-white/40">VERDICT</div>
                  <div
                    className={`text-sm font-bold tracking-tight ${getScoreColor(
                      analysis.risk_score
                    )}`}
                  >
                    {analysis.verdict}
                  </div>
                </div>

                <div className="h-8 w-[1px] bg-white/[0.08]" />

                <div className="space-y-0.5 text-center">
                  <div className="text-[10px] font-semibold uppercase text-white/40">RISK SCORE</div>
                  <div
                    className={`text-sm font-bold font-mono ${getScoreColor(analysis.risk_score)}`}
                  >
                    {analysis.risk_score} <span className="text-[10px] text-white/40 font-normal">/ 100</span>
                  </div>
                </div>

                <div className="h-8 w-[1px] bg-white/[0.08]" />

                <div className="space-y-0.5 text-center">
                  <div className="text-[10px] font-semibold uppercase text-white/40">CONFIDENCE</div>
                  <div className="text-sm font-bold font-mono text-white">
                    {Math.round((analysis.confidence || 0.9) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Score Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/50">Threat Risk Scale</span>
                <span className={`font-semibold font-mono ${getScoreColor(analysis.risk_score)}`}>
                  {analysis.risk_score >= 80
                    ? "CRITICAL DANGER"
                    : analysis.risk_score >= 60
                    ? "HIGH RISK"
                    : analysis.risk_score >= 30
                    ? "SUSPICIOUS / ELEVATED"
                    : "BENIGN / LOW RISK"}
                </span>
              </div>
              <div className="w-full h-2 bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${getScoreBarColor(
                    analysis.risk_score
                  )}`}
                  style={{ width: `${Math.max(4, analysis.risk_score)}%` }}
                />
              </div>
            </div>

            {/* Executive Synthesis Summary */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-1.5">
              <div className="text-[11px] uppercase tracking-wider text-[#0a84ff] flex items-center gap-1.5 font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Executive Threat Intelligence Synthesis</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed font-normal">
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
                  <ShieldAlert className="w-4 h-4 text-[#ff453a]" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                    Identified Security Findings ({analysis.indicators?.length || 0})
                  </h3>
                </div>
                <span className="text-[11px] text-white/40">
                  Mail Sentinel Local Engine
                </span>
              </div>

              {!analysis.indicators || analysis.indicators.length === 0 ? (
                <div className="p-8 rounded-3xl apple-card text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#30d158] mx-auto" />
                  <div className="text-xs font-semibold text-white">
                    No Active Malicious Indicators Detected
                  </div>
                  <p className="text-[11px] text-white/50 max-w-md mx-auto">
                    The indicator did not trigger any brand typosquatting, IDN homoglyphs, high-risk TLDs, dynamic DNS hosts, or raw IP transport flags.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analysis.indicators.map((ind, idx) => (
                    <div
                      key={idx}
                      className="apple-card p-5 space-y-2.5 transition-all hover:scale-[1.008]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/60">
                              {ind.category}
                            </span>
                            <SeverityBadge severity={ind.severity} size="sm" />
                          </div>
                          <h4 className="text-xs font-semibold text-white pt-1">
                            {ind.title}
                          </h4>
                        </div>
                      </div>

                      <p className="text-xs text-white/65 leading-relaxed font-normal">
                        {ind.description}
                      </p>

                      {ind.evidence && (
                        <div className="pt-2">
                          <div className="text-[10px] text-white/40 uppercase mb-1 font-mono">
                            Forensic Evidence:
                          </div>
                          <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.08] text-[11px] font-mono text-[#64d2ff] break-all">
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
                <div className="apple-card p-6 space-y-3 mt-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#30d158]" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                      SOC Containment & Mitigation Recommendations
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-xs text-white/80 leading-relaxed font-normal"
                      >
                        <Check className="w-3.5 h-3.5 text-[#30d158] shrink-0 mt-0.5" />
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
                <Cpu className="w-4 h-4 text-[#0a84ff]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                  Technical Telemetry
                </h3>
              </div>

              <div className="apple-card p-5 space-y-4 text-xs font-mono">
                {analysis.telemetry && (
                  <div className="space-y-3 divide-y divide-white/[0.06]">
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
                          <div className="text-[10px] text-white/40 uppercase tracking-wider">
                            {key.replace(/_/g, " ")}
                          </div>
                          <div className="text-white/90 font-medium break-all">
                            {displayVal}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Feed Multi-Adapter Status Table */}
              <div className="apple-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-white">
                      Intelligence Feeds
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-white/40">
                    {Object.keys(lookupResult.results || {}).length} Providers
                  </span>
                </div>

                <div className="space-y-2">
                  {Object.entries(lookupResult.results || {}).map(([prov, data]: [string, any]) => {
                    const isConfigured = data?.configured;
                    return (
                      <div
                        key={prov}
                        className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-white text-[11px] font-mono">{prov}</div>
                          <div className="text-[10px] text-white/40">
                            {data?.status || (isConfigured ? "Active" : "Not Configured")}
                          </div>
                        </div>
                        <span
                          className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border uppercase ${
                            isConfigured
                              ? "bg-[#30d158]/15 text-[#30d158] border-[#30d158]/30"
                              : "bg-white/[0.06] text-white/50 border-white/[0.08]"
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
      <div className="space-y-4 pt-4 border-t border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-white/50" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
              Configured Intelligence Feed Adapters
            </h2>
          </div>
          <span className="text-[11px] text-white/40">
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
                  className="apple-card p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white truncate font-mono" title={p.name}>
                      {p.name}
                    </span>
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isConfigured ? "bg-[#30d158] shadow-[0_0_6px_#30d158]" : "bg-white/20"
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-white/40 font-mono">Status</div>
                    <div
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border truncate ${
                        isConfigured
                          ? "bg-[#30d158]/15 text-[#30d158] border-[#30d158]/30"
                          : "bg-white/[0.04] text-white/50 border-white/[0.08]"
                      }`}
                      title={p.status}
                    >
                      {p.status}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] text-[9px] text-white/40 leading-snug">
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
      <div className="p-5 apple-card space-y-2 text-xs text-white/60">
        <div className="flex items-center gap-2 text-white font-semibold">
          <KeyRound className="w-4 h-4 text-[#ffd60a]" />
          <span>Threat Intelligence Architecture Guidelines</span>
        </div>
        <p className="leading-relaxed text-white/50 font-normal">
          To activate external cloud threat feeds (e.g. VirusTotal, URLhaus, PhishTank, AbuseIPDB), add your API keys to the backend <code className="text-white/80 font-mono bg-white/[0.06] px-1.5 py-0.5 rounded">.env</code> file (e.g. <code className="text-white/80 font-mono bg-white/[0.06] px-1.5 py-0.5 rounded">VIRUSTOTAL_API_KEY=...</code>). All external credentials remain secure on the backend server and are never exposed to the browser client. When external keys are absent, Mail Sentinel's on-premises deterministic intelligence engine evaluates all indicators locally with zero external network dependencies.
        </p>
      </div>
    </div>
  );
};
