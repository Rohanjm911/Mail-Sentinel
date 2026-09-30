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
    <div className="apple-card p-8 text-center flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-[#ff453a]/15 border border-[#ff453a]/30 text-[#ff453a] flex items-center justify-center shadow-lg shadow-[#ff453a]/10">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div className="space-y-1.5">
        <h4 className="text-base font-semibold text-white tracking-tight">
          {title}
        </h4>
        <p className="text-xs text-[#86868b] max-w-md mx-auto leading-relaxed">
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="apple-btn-secondary inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-white transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
};
