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
  BookOpen,
} from "lucide-react";

interface SidebarProps {
  engineOnline?: boolean;
  onOpenGuide?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ engineOnline = true, onOpenGuide }) => {
  const navItems = [
    {
      label: "Dashboard",
      to: "/",
      icon: LayoutDashboard,
      tint: "bg-[#0a84ff]/15 text-[#0a84ff] border-[#0a84ff]/30",
    },
    {
      label: "Scan Email",
      to: "/scan",
      icon: SearchCheck,
      badge: "CORE",
      tint: "bg-[#5e5ce6]/15 text-[#5e5ce6] border-[#5e5ce6]/30",
    },
    {
      label: "Scan History",
      to: "/history",
      icon: History,
      tint: "bg-[#bf5af2]/15 text-[#bf5af2] border-[#bf5af2]/30",
    },
    {
      label: "Threat Intelligence",
      to: "/threat-intelligence",
      icon: Radio,
      badge: "LIVE",
      badgeGlow: true,
      tint: "bg-[#ff9f0a]/15 text-[#ff9f0a] border-[#ff9f0a]/30",
    },
    {
      label: "Reports & Analytics",
      to: "/reports",
      icon: FileBarChart,
      tint: "bg-[#64d2ff]/15 text-[#64d2ff] border-[#64d2ff]/30",
    },
    {
      label: "Settings",
      to: "/settings",
      icon: Settings,
      tint: "bg-white/[0.1] text-white/80 border-white/[0.15]",
    },
    {
      label: "About",
      to: "/about",
      icon: Info,
      tint: "bg-[#30d158]/15 text-[#30d158] border-[#30d158]/30",
    },
  ];

  return (
    <aside className="w-68 h-screen bg-black/45 backdrop-blur-2xl border-r border-white/[0.08] flex flex-col justify-between shrink-0 sticky top-0 z-30 select-none shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      {/* Top Brand Header */}
      <div>
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl bg-white/[0.05] border border-white/[0.12] flex items-center justify-center p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] group shrink-0">
              <img
                src="/logo.png"
                alt="Mail Sentinel Logo"
                className="w-full h-full object-contain drop-shadow-[0_2px_10px_rgba(10,132,255,0.4)] transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold tracking-tight text-white">
                  Mail Sentinel
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] border border-white/[0.1] text-white/70 font-medium">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-white/45 tracking-tight flex items-center gap-1 mt-0.5">
                <span>Threat Defense Console</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Launch Apple Pill Button */}
        <div className="p-3.5 pb-2">
          <Link
            to="/scan"
            className="apple-btn-primary w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium tracking-tight shadow-md group"
          >
            <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
            <span>New Email Scan</span>
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="p-3 space-y-1">
          <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-widest text-white/35 font-semibold">
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
                  `group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/[0.12] text-white shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)] border border-white/[0.08]"
                      : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                          isActive
                            ? item.tint
                            : "bg-white/[0.04] border-white/[0.06] text-white/50 group-hover:text-white/80"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="tracking-tight truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full border transition-all ${
                          item.badgeGlow
                            ? "bg-[#30d158]/15 border-[#30d158]/30 text-[#30d158] shadow-[0_0_8px_rgba(48,209,88,0.25)]"
                            : "bg-white/[0.06] border-white/[0.08] text-white/50"
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

          {/* Interactive How to Use Guide trigger */}
          {onOpenGuide && (
            <button
              type="button"
              onClick={onOpenGuide}
              className="w-full mt-2 group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/[0.06] border border-dashed border-white/[0.12] hover:border-[#0a84ff]/40 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#0a84ff]/15 border border-[#0a84ff]/30 text-[#0a84ff] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span className="tracking-tight text-white font-medium">How to Use</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#0a84ff]/20 text-[#0a84ff] font-semibold">
                GUIDE
              </span>
            </button>
          )}
        </nav>
      </div>

      {/* Footer System Status Widget (macOS Control Center style) */}
      <div className="p-3.5 border-t border-white/[0.06] bg-black/20">
        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-white/50 uppercase tracking-wider font-semibold">
              <Activity className="w-3 h-3 text-[#0a84ff]" />
              <span>Core Engine</span>
            </div>
            <span className="text-[9px] font-mono text-white/40">127.0.0.1:8000</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {engineOnline && (
                  <span className="radar-live-dot absolute inline-flex h-full w-full rounded-full bg-[#30d158] opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    engineOnline ? "bg-[#30d158]" : "bg-[#ff453a]"
                  }`}
                />
              </span>
              <div className="text-left">
                <div className="text-xs font-medium text-white/90">
                  {engineOnline ? "Online & Guarding" : "Engine Offline"}
                </div>
                <div className="text-[10px] text-white/40 font-mono">
                  Local ML Classifier
                </div>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-[#30d158] shrink-0" />
          </div>
        </div>
      </div>
    </aside>
  );
};
