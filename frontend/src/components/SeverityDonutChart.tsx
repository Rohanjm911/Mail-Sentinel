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
    color: "#ff453a",
    pillClass: "bg-[#ff453a]/10 text-[#ff453a] border-[#ff453a]/25",
    icon: ShieldAlert,
  },
  {
    key: "HIGH",
    label: "High Threat",
    color: "#ff9f0a",
    pillClass: "bg-[#ff9f0a]/10 text-[#ff9f0a] border-[#ff9f0a]/25",
    icon: AlertTriangle,
  },
  {
    key: "MEDIUM",
    label: "Suspicious",
    color: "#ffd60a",
    pillClass: "bg-[#ffd60a]/10 text-[#ffd60a] border-[#ffd60a]/25",
    icon: AlertCircle,
  },
  {
    key: "LOW",
    label: "Verified Safe",
    color: "#30d158",
    pillClass: "bg-[#30d158]/10 text-[#30d158] border-[#30d158]/25",
    icon: ShieldCheck,
  },
];

const CustomDonutTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="apple-glass rounded-2xl p-3 shadow-2xl border border-white/[0.12] text-xs min-w-[150px]">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
          <span className="font-semibold text-white">{data.name}</span>
        </div>
        <div className="flex justify-between items-center text-white/50 text-[11px]">
          <span>Incidents:</span>
          <span className="font-semibold text-white">{data.value}</span>
        </div>
        <div className="flex justify-between items-center text-white/50 text-[11px] mt-1">
          <span>Distribution:</span>
          <span className="font-semibold text-[#0a84ff]">{data.payload.percentage}%</span>
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

  const displayData =
    chartData.length > 0
      ? chartData
      : [{ name: "No Telemetry", key: "NONE", value: 1, color: "rgba(255,255,255,0.1)", percentage: 100 }];

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Apple Activity Ring Donut */}
      <div className="relative w-full h-44 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomDonutTooltip />} />
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={54}
              outerRadius={74}
              paddingAngle={chartData.length > 1 ? 5 : 0}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {displayData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="transition-all duration-300 hover:opacity-85"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Donut Stat */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold tracking-tight text-white leading-tight">
            {totalScans}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
            Total Scans
          </span>
        </div>
      </div>

      {/* Apple Styled Legend Grid */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/[0.06] text-xs">
        {SEVERITY_CONFIG.map((cfg) => {
          const count = breakdown[cfg.key] || 0;
          const pct = Math.round((count / safeTotal) * 100);
          const Icon = cfg.icon;

          return (
            <div
              key={cfg.key}
              className={`flex items-center justify-between p-2.5 rounded-xl border ${cfg.pillClass} transition-all`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: cfg.color }} />
                <span className="text-[11px] font-medium truncate">{cfg.key}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="font-semibold text-white">{count}</span>
                <span className="text-[10px] text-white/50 ml-1 font-mono">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
