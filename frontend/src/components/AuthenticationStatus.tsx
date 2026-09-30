import React from "react";
import type { AuthenticationResults } from "../types/scan";

interface AuthenticationStatusProps {
  auth: AuthenticationResults;
}

export const AuthenticationStatus: React.FC<AuthenticationStatusProps> = ({ auth }) => {
  const getBadge = (val: string) => {
    const norm = (val || "NOT AVAILABLE").toUpperCase();

    if (norm === "PASS") {
      return (
        <span className="px-3 py-1 rounded-full border border-[#30d158]/30 bg-[#30d158]/15 text-[#30d158] font-semibold text-xs tracking-tight">
          PASS
        </span>
      );
    }
    if (norm === "FAIL") {
      return (
        <span className="px-3 py-1 rounded-full border border-[#ff453a]/30 bg-[#ff453a]/15 text-[#ff453a] font-semibold text-xs tracking-tight">
          FAIL
        </span>
      );
    }
    if (norm === "SOFTFAIL" || norm === "NEUTRAL") {
      return (
        <span className="px-3 py-1 rounded-full border border-[#ffd60a]/30 bg-[#ffd60a]/15 text-[#ffd60a] font-semibold text-xs tracking-tight">
          {norm}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.04] text-white/50 text-xs">
        {norm === "NONE" ? "NONE" : norm === "UNKNOWN" ? "UNKNOWN" : "Not Available"}
      </span>
    );
  };

  return (
    <div className="apple-card p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Email Authentication Results
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            Source: <span className="font-mono text-white/80">{auth.source || "Parsed Header Analysis"}</span>
          </p>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/50 font-medium">
          Passive Inspection
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* SPF */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-white font-mono">SPF</div>
            <div className="text-[11px] text-white/40 mt-0.5">Sender Policy Framework</div>
          </div>
          {getBadge(auth.spf)}
        </div>

        {/* DKIM */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-white font-mono">DKIM</div>
            <div className="text-[11px] text-white/40 mt-0.5">DomainKeys Identified Mail</div>
          </div>
          {getBadge(auth.dkim)}
        </div>

        {/* DMARC */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-white font-mono">DMARC</div>
            <div className="text-[11px] text-white/40 mt-0.5">Domain-based Message Auth</div>
          </div>
          {getBadge(auth.dmarc)}
        </div>
      </div>
    </div>
  );
};
