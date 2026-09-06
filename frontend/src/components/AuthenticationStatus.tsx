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
        <span className="px-2.5 py-1 rounded border border-[#10b981]/30 bg-[#10b981]/15 text-[#10b981] font-mono font-bold text-xs">
          PASS
        </span>
      );
    }
    if (norm === "FAIL") {
      return (
        <span className="px-2.5 py-1 rounded border border-[#ef4444]/30 bg-[#ef4444]/15 text-[#ef4444] font-mono font-bold text-xs">
          FAIL
        </span>
      );
    }
    if (norm === "SOFTFAIL" || norm === "NEUTRAL") {
      return (
        <span className="px-2.5 py-1 rounded border border-[#f59e0b]/30 bg-[#f59e0b]/15 text-[#f59e0b] font-mono font-bold text-xs">
          {norm}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded border border-[#1e293b] bg-[#0b0f17] text-[#94a3b8] font-mono text-xs">
        {norm === "NONE" ? "NONE" : norm === "UNKNOWN" ? "UNKNOWN" : "Not Available"}
      </span>
    );
  };

  return (
    <div className="bg-[#121824] border border-[#1e293b] rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
        <div>
          <h3 className="text-sm font-semibold font-mono text-[#f8fafc]">
            Email Authentication Results
          </h3>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Source: <span className="font-mono text-[#cbd5e1]">{auth.source || "Parsed Header Analysis"}</span>
          </p>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0b0f17] border border-[#1e293b] text-[#64748b]">
          Passive Inspection
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* SPF */}
        <div className="p-3.5 rounded bg-[#0b0f17] border border-[#1e293b] flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-[#f8fafc]">SPF</div>
            <div className="text-[10px] text-[#64748b]">Sender Policy Framework</div>
          </div>
          {getBadge(auth.spf)}
        </div>

        {/* DKIM */}
        <div className="p-3.5 rounded bg-[#0b0f17] border border-[#1e293b] flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-[#f8fafc]">DKIM</div>
            <div className="text-[10px] text-[#64748b]">DomainKeys Identified Mail</div>
          </div>
          {getBadge(auth.dkim)}
        </div>

        {/* DMARC */}
        <div className="p-3.5 rounded bg-[#0b0f17] border border-[#1e293b] flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-[#f8fafc]">DMARC</div>
            <div className="text-[10px] text-[#64748b]">Domain Auth & Reporting</div>
          </div>
          {getBadge(auth.dmarc)}
        </div>
      </div>
    </div>
  );
};
