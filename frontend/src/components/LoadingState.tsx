import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Analyzing Email Threats...",
  submessage = "Running multi-pillar security inspection (ML inference, domain spoofing, URL heuristics, RFC headers)",
}) => {
  return (
    <div className="p-12 text-center bg-[#121824] border border-[#1e293b] rounded-lg flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 text-[#94a3b8] animate-spin" />
      <div className="space-y-1">
        <h4 className="text-sm font-semibold font-mono text-[#f8fafc] tracking-wide">
          {message}
        </h4>
        <p className="text-xs text-[#64748b] max-w-md mx-auto leading-relaxed">
          {submessage}
        </p>
      </div>
      <div className="flex items-center gap-2 text-[11px] font-mono text-[#94a3b8] pt-2">
        <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
        <span>Deterministic Scoring Active</span>
      </div>
    </div>
  );
};
