import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { ShieldAlert, AlertTriangle, AlertCircle, ShieldCheck } from "lucide-react";

interface SeverityDonutChartProps {
  breakdown: Record<string, number>;
  totalScans: number;
}

const SEVERITY_CONFIG = [
  {
    key: "CRITICAL",
    label: "Critical Alert",
    color: "#ef4444",
    bgClass: "bg-red-500/15 text-red-400 border-red-500/30",
    icon: ShieldAlert,
  },
  {
    key: "HIGH",
    label: "High Threat",
    color: "#f97316",
    bgClass: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    icon: AlertTriangle,
  },
  {
    key: "MEDIUM",
    label: "Suspicious (Med)",
    color: "#f59e0b",
    bgClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    icon: AlertCircle,
  },
  {
    key: "LOW",
    label: "Verified Safe",
    color: "#10b981",
    bgClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: ShieldCheck,
  },
];

const CustomDonutTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="cyber-glass rounded-xl p-3 shadow-2xl border border-slate-700/80 text-xs font-mono min-w-[140px]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
          <span className="font-bold text-slate-100">{data.name}</span>
        </div>
        <div className="flex justify-between items-center text-slate-400 text-[11px]">
          <span>Incidents:</span>
          <span className="font-bold text-slate-200">{data.value}</span>
        </div>
        <div className="flex justify-between items-center text-slate-400 text-[11px] mt-0.5">
          <span>Share:</span>
          <span className="font-bold text-sky-400">{data.payload.percentage}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export const SeverityDonutChart: React.FC<SeverityDonutChartProps> = ({
  breakdown,
  totalScans,
}) => {
  const safeTotal = Math.max(1, totalScans);
  
  const chartData = SEVERITY_CONFIG.map((cfg) => {
    const count = breakdown[cfg.key] || 0;
    const pct = Math.round((count / safeTotal) * 100);
    return {
      name: cfg.label,
      key: cfg.key,
      value: count,
      color: cfg.color,
      percentage: pct,
    };
  }).filter((item) => item.value > 0);

  // If all are 0 (fresh db), show placeholder ring
  const displayData = chartData.length > 0 
    ? chartData 
    : [{ name: "No Data", key: "NONE", value: 1, color: "#334155", percentage: 100 }];

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Donut Chart Visual */}
      <div className="relative w-full h-44 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomDonutTooltip />} />
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={chartData.length > 1 ? 4 : 0}
              dataKey="value"
              stroke="none"
            >
              {displayData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Badge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-extrabold font-mono text-slate-100 leading-tight">
            {totalScans}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Total Tests
          </span>
        </div>
      </div>

      {/* Legend Grid with Live Counts */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
        {SEVERITY_CONFIG.map((cfg) => {
          const count = breakdown[cfg.key] || 0;
          const pct = Math.round((count / safeTotal) * 100);
          const Icon = cfg.icon;

          return (
            <div
              key={cfg.key}
              className={`flex items-center justify-between p-2 rounded-lg border ${cfg.bgClass} transition-all`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: cfg.color }} />
                <span className="text-[11px] truncate">{cfg.key}</span>
              </div>
              <div className="text-right shrink-0 font-bold">
                <span className="text-slate-100">{count}</span>
                <span className="text-[10px] text-slate-400 ml-1">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
