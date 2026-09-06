import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  SearchCheck,
  History,
  Radio,
  FileBarChart,
  Settings,
  Info,
  PlusCircle,
  ShieldCheck,
  Activity,
} from "lucide-react";

interface SidebarProps {
  engineOnline?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ engineOnline = true }) => {
  const navItems = [
    { label: "Dashboard", to: "/", icon: LayoutDashboard },
    { label: "Scan Email", to: "/scan", icon: SearchCheck, badge: "CORE" },
    { label: "Scan History", to: "/history", icon: History },
    { label: "Threat Intelligence", to: "/threat-intelligence", icon: Radio, badge: "LIVE", badgeGlow: true },
    { label: "Reports & Analytics", to: "/reports", icon: FileBarChart },
    { label: "Settings", to: "/settings", icon: Settings },
    { label: "About", to: "/about", icon: Info },
  ];

  return (
    <aside className="w-68 h-screen bg-[#0a0f1d]/90 backdrop-blur-xl border-r border-[#1e2d4a]/80 flex flex-col justify-between shrink-0 sticky top-0 z-30 select-none">
      {/* Top Brand Header */}
      <div>
        <div className="p-5 border-b border-[#1e2d4a]/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-[#0e172a] border border-sky-500/30 flex items-center justify-center p-1.5 shadow-md group">
              <img src="/favicon.svg" alt="Mail Sentinel Logo" className="w-7 h-7 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)] transition-transform group-hover:scale-105" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold tracking-wider text-slate-100 font-mono">
                  MAIL SENTINEL
                </h1>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/15 border border-sky-500/30 text-sky-400 font-semibold">
                  SOC v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-tight flex items-center gap-1 mt-0.5 font-sans">
                <span>Threat Defense Console</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Launch CTA Button */}
        <div className="p-3.5 pb-2">
          <Link
            to="/scan"
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md border border-sky-400/40 transition-all duration-200 group"
          >
            <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
            <span>Launch Email Scanner</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          <div className="px-3 pt-1 pb-1 text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
            Operations &amp; Triage
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#121d33] text-sky-400 font-semibold border-l-2 border-sky-400 shadow-sm"
                      : "text-slate-400 hover:text-slate-100 hover:bg-[#111a2d]/70"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? "text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]"
                            : "text-slate-400 group-hover:text-slate-200"
                        }`}
                      />
                      <span className="tracking-wide">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-all ${
                          item.badgeGlow
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                            : "bg-slate-800/60 border-slate-700/60 text-slate-400"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-[#1e2d4a]/80 bg-[#0d1424]/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            <Activity className="w-3 h-3 text-sky-400" />
            <span>SOC Telemetry Node</span>
          </div>
          <span className="text-[9px] font-mono text-slate-400">127.0.0.1:8000</span>
        </div>

        <div className="p-2.5 rounded-lg bg-[#111a2d]/80 border border-[#1e2d4a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              {engineOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  engineOnline ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-red-500"
                }`}
              />
            </span>
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-200">
                {engineOnline ? "Forensic Core Active" : "Engine Offline"}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                TF-IDF + LogReg ML Ready
              </div>
            </div>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        </div>
      </div>
    </aside>
  );
};
