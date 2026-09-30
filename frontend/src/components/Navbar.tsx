import React, { useState, useEffect } from "react";
import { Search, Bell, ShieldCheck, Clock, Terminal, Sparkles } from "lucide-react";

interface NavbarProps {
  title?: string;
  subtitle?: string;
  onOpenGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ title, subtitle, onOpenGuide }) => {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 px-6 md:px-8 border-b border-white/[0.08] bg-black/40 backdrop-blur-2xl flex items-center justify-between sticky top-0 z-20 transition-all select-none shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      {/* Title / Breadcrumb */}
      <div className="min-w-0 pr-4">
        {title && (
          <h2 className="text-sm md:text-base font-semibold text-white tracking-tight flex items-center gap-2 truncate">
            <span>{title}</span>
          </h2>
        )}
        {subtitle && (
          <p className="text-xs text-white/50 line-clamp-1 max-w-xl font-normal tracking-normal mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Tools & Telemetry (Apple Toolbar Pills) */}
      <div className="flex items-center gap-2.5 md:gap-3 shrink-0">
        {/* Live SOC Clock Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs font-mono text-white/80 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-[#0a84ff]" />
          <span className="text-white/40 text-[10px] uppercase font-semibold">UTC</span>
          <span className="text-white font-medium tracking-wider">{time || "--:--:--"}</span>
        </div>

        {/* Zero-Cloud Air-Gap Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#30d158]/10 border border-[#30d158]/25 text-xs font-medium text-[#30d158] shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Zero Cloud Egress</span>
        </div>

        {/* Apple Pill Search Input */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search threats, indicators..."
            className="pl-9 pr-12 py-1.5 w-60 bg-white/[0.05] border border-white/[0.08] rounded-full text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#0a84ff] focus:ring-2 focus:ring-[#0a84ff]/25 transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/[0.08] text-white/60 border border-white/[0.1]">
            ⌘K
          </kbd>
        </div>

        {/* How to Use / Interactive Guide Pill */}
        {onOpenGuide && (
          <button
            type="button"
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0a84ff]/15 hover:bg-[#0a84ff]/25 border border-[#0a84ff]/30 text-xs font-medium text-white transition-all shadow-sm cursor-pointer group"
            title="Open Interactive Platform Guide & Tour"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0a84ff] transition-transform duration-300 group-hover:rotate-12" />
            <span className="hidden sm:inline">How to Use</span>
          </button>
        )}

        {/* Interactive Swagger API Docs */}
        <a
          href="http://127.0.0.1:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs font-medium text-white/70 hover:text-white hover:bg-white/[0.1] hover:border-white/[0.15] transition-all shadow-sm"
          title="Open FastAPI Swagger Interactive Docs"
        >
          <Terminal className="w-3.5 h-3.5 text-[#0a84ff]" />
          <span className="text-[11px] font-mono">API Docs</span>
        </a>

        {/* Notifications Pill */}
        <button
          type="button"
          className="relative p-2 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.1] transition-all cursor-pointer"
          title="Incident Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0a84ff] ring-2 ring-black" />
        </button>

        {/* User Profile Pill (macOS System User style) */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/[0.08]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#bf5af2] p-[1.5px] shadow-sm">
            <div className="w-full h-full bg-black/70 rounded-full flex items-center justify-center text-white font-semibold text-xs backdrop-blur-sm">
              SA
            </div>
          </div>
          <div className="hidden lg:block text-left leading-tight">
            <div className="text-xs font-medium text-white">SOC Analyst</div>
            <div className="text-[10px] text-[#30d158] font-medium">Tier-2 Certified</div>
          </div>
        </div>
      </div>
    </header>
  );
};
