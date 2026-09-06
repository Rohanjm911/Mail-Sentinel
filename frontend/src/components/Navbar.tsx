import React, { useState, useEffect } from "react";
import { Search, Bell, ShieldCheck, Clock, Terminal } from "lucide-react";

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title, subtitle }) => {
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
    <header className="h-16 px-8 border-b border-[#1e2d4a]/80 bg-[#080c14]/85 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20 transition-all">
      {/* Title / Breadcrumb */}
      <div>
        {title && (
          <h2 className="text-sm md:text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h2>
        )}
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-xl font-sans">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Tools & Telemetry */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Live SOC Clock */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111a2d]/70 border border-[#1e2d4a] text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>SOC TIME:</span>
          <span className="text-sky-300 font-bold tracking-wider">{time || "--:--:--"}</span>
          <span className="text-[10px] text-slate-400">UTC</span>
        </div>

        {/* Zero-Cloud Privacy Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs font-medium text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Zero Cloud Egress</span>
        </div>

        {/* Quick Search Bar */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Quick search IOCs, domains, hashes..."
            className="pl-8 pr-12 py-1.5 w-64 bg-[#111a2d]/80 border border-[#1e2d4a] rounded-lg text-xs font-mono text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/30 transition-all"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1a2742] text-slate-400 border border-slate-700">
            Ctrl+K
          </kbd>
        </div>

        {/* Quick Terminal Link / API Docs */}
        <a
          href="http://127.0.0.1:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1.5 p-2 rounded-lg bg-[#111a2d]/70 border border-[#1e2d4a] text-xs font-mono text-slate-400 hover:text-sky-400 hover:border-sky-500/40 transition-all"
          title="Open FastAPI Swagger Interactive Docs"
        >
          <Terminal className="w-4 h-4" />
          <span className="text-[11px]">API</span>
        </a>

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 rounded-lg bg-[#111a2d]/70 border border-[#1e2d4a] text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-all"
          title="Incident Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-[#080c14]" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#1e2d4a]">
          <div className="w-8 h-8 rounded-lg bg-[#0e172a] border border-sky-500/40 p-0.5 shadow-sm">
            <div className="w-full h-full bg-[#11192e] rounded-[5px] flex items-center justify-center text-sky-400 font-bold font-mono text-xs">
              SA
            </div>
          </div>
          <div className="hidden lg:block text-left leading-tight">
            <div className="text-xs font-semibold text-slate-100">SOC Analyst</div>
            <div className="text-[10px] font-mono text-emerald-400 font-medium">Tier-2 Certified</div>
          </div>
        </div>
      </div>
    </header>
  );
};
