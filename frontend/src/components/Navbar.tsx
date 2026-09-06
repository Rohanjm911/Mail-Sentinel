import React from "react";
import { Search, Bell, User, ShieldCheck } from "lucide-react";

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  subtitle,
}) => {
  return (
    <header className="h-16 px-8 border-b border-[#1e293b] bg-[#0b0f17]/90 backdrop-blur-none flex items-center justify-between sticky top-0 z-20">
      <div>
        {title && (
          <h2 className="text-base font-bold font-mono text-[#f8fafc] tracking-tight">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-xs text-[#94a3b8] font-mono mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Search */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
          <input
            type="text"
            placeholder="Search scans, IOCs, domains..."
            className="pl-8 pr-3 py-1.5 w-64 bg-[#121824] border border-[#1e293b] rounded text-xs font-mono text-[#cbd5e1] placeholder-[#64748b] focus:outline-none focus:border-[#334155] transition-colors"
          />
        </div>

        {/* Local Engine Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#121824] border border-[#1e293b] text-xs font-mono text-[#94a3b8]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
          <span>Local SOC Node</span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="p-2 rounded bg-[#121824] border border-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
          title="Security Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* User profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#1e293b]">
          <div className="w-7 h-7 rounded bg-[#161f2e] border border-[#1e293b] flex items-center justify-center text-[#cbd5e1]">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-mono font-semibold text-[#f8fafc]">SOC Analyst</div>
            <div className="text-[10px] font-mono text-[#64748b]">Level 2 SecOps</div>
          </div>
        </div>
      </div>
    </header>
  );
};
