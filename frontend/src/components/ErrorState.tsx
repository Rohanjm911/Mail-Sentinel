import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Analysis Error",
  message,
  onRetry,
}) => {
  return (
    <div className="p-8 bg-[#121824] border border-[#ef4444]/40 rounded-lg text-center flex flex-col items-center justify-center space-y-4">
      <div className="p-3 rounded-full bg-[#ef4444]/15 border border-[#ef4444]/30 text-[#ef4444]">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold font-mono text-[#f8fafc]">
          {title}
        </h4>
        <p className="text-xs text-[#94a3b8] max-w-md mx-auto leading-relaxed">
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#1e293b] hover:bg-[#334155] text-xs font-mono text-[#f8fafc] border border-[#1e293b] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
};
