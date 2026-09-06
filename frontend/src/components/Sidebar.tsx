import React from "react";
import { NavLink } from "react-router-dom";
import {
  ShieldAlert,
  LayoutDashboard,
  SearchCheck,
  History,
  Radio,
  FileBarChart,
  Settings,
  Info,
} from "lucide-react";

interface SidebarProps {
  engineOnline?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ engineOnline = true }) => {
  const navItems = [
    { label: "Dashboard", to: "/", icon: LayoutDashboard },
    { label: "Scan Email", to: "/scan", icon: SearchCheck },
    { label: "Scan History", to: "/history", icon: History },
    { label: "Threat Intelligence", to: "/threat-intelligence", icon: Radio },
    { label: "Reports", to: "/reports", icon: FileBarChart },
    { label: "Settings", to: "/settings", icon: Settings },
    { label: "About", to: "/about", icon: Info },
  ];

  return (
    <aside className="w-64 h-screen bg-[#0b0f17] border-r border-[#1e293b] flex flex-col justify-between shrink-0 sticky top-0">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-[#1e293b] flex items-center gap-3">
          <div className="p-2 rounded bg-[#121824] border border-[#1e293b] text-[#cbd5e1]">
            <ShieldAlert className="w-5 h-5 text-[#f8fafc]" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-mono tracking-wider text-[#f8fafc]">
              MAIL SENTINEL
            </h1>
            <p className="text-[10px] font-mono text-[#64748b] tracking-tight">
              Threat Analysis Platform
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-mono font-medium transition-colors ${
                    isActive
                      ? "bg-[#121824] text-[#f8fafc] border border-[#1e293b]"
                      : "text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#121824]/60"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-[#1e293b] bg-[#121824]/40">
        <div className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider mb-1.5">
          System Status
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              engineOnline ? "bg-[#10b981]" : "bg-[#ef4444]"
            }`}
          />
          <span className="text-[#cbd5e1]">
            {engineOnline ? "Detection Engine Online" : "Engine Offline"}
          </span>
        </div>
        <div className="text-[10px] font-mono text-[#64748b] mt-1">
          Local ML Inference Ready
        </div>
      </div>
    </aside>
  );
};
