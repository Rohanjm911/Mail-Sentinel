import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { TrendingUp, BarChart2, ShieldAlert, CheckCircle2 } from "lucide-react";
import type { ScoreHistoryPoint } from "../types/scan";

interface ThreatDataPoint {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface ThreatChartProps {
  scoreHistory?: ScoreHistoryPoint[];
  threatTrends?: ThreatDataPoint[];
}

const ScoreTrajectoryTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: ScoreHistoryPoint = payload[0].payload;
    const isPhish = data.score >= 60;

    let scoreBadge = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (data.score >= 80) scoreBadge = "bg-red-500/20 text-red-400 border-red-500/30";
    else if (data.score >= 60) scoreBadge = "bg-orange-500/20 text-orange-400 border-orange-500/30";
    else if (data.score >= 30) scoreBadge = "bg-amber-500/20 text-amber-400 border-amber-500/30";

    return (
      <div className="cyber-glass rounded-xl p-3.5 shadow-2xl border border-slate-700/80 text-xs font-mono max-w-[280px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-100">
            {isPhish ? (
              <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
            <span>{data.label || `Scan #${data.scan_num}`}</span>
          </div>
          <span className="text-[10px] text-slate-400">{data.time}</span>
        </div>

        <div className="space-y-1.5 mb-2.5">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Subject:</span>
            <p className="text-slate-200 text-xs font-semibold truncate" title={data.subject}>
              {data.subject || "Untitled Email"}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Sender:</span>
            <p className="text-slate-300 text-[11px] truncate font-sans" title={data.sender}>
              {data.sender || "Unknown"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${scoreBadge}`}>
            {data.severity}
          </span>
          <div className="text-right">
            <span className="text-base font-extrabold text-slate-100">{data.score}</span>
            <span className="text-[10px] text-slate-400"> / 100</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomVolumeTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((acc: number, entry: any) => acc + (entry.value || 0), 0);
    return (
      <div className="cyber-glass rounded-xl p-3.5 shadow-2xl border border-slate-700/80 text-xs font-mono min-w-[170px]">
        <div className="text-slate-300 font-bold border-b border-slate-800 pb-1.5 mb-2 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-sky-400 font-semibold">{total} Incidents</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-400 capitalize">{entry.name}:</span>
              </div>
              <span className="font-bold text-slate-100">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Custom dot that changes color based on the test's risk score
const ScoreCustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;

  let fill = "#10b981";
  if (payload.score >= 80) fill = "#ef4444";
  else if (payload.score >= 60) fill = "#f97316";
  else if (payload.score >= 30) fill = "#f59e0b";

  return (
    <circle
      cx={cx}
      cy={cy}
      r={4.5}
      fill={fill}
      stroke="#0f172a"
      strokeWidth={2}
      className="transition-all duration-200 hover:r-6 cursor-pointer"
    />
  );
};

export const ThreatChart: React.FC<ThreatChartProps> = ({
  scoreHistory = [],
  threatTrends = [],
}) => {
  const [viewMode, setViewMode] = useState<"trajectory" | "volume">("trajectory");

  const hasScoreHistory = scoreHistory && scoreHistory.length > 0;
  const hasThreatTrends = threatTrends && threatTrends.length > 0;

  return (
    <div className="w-full flex flex-col space-y-3">
      {/* Sub-header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">
            {viewMode === "trajectory"
              ? "Sequential Email Test Threat Trajectory (Updates on every scan)"
              : "Cumulative Threat Severity Breakdown Over Rolling Time Window"}
          </span>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-0.5 bg-[#080c16] rounded-lg border border-[#1e2d4a]">
          <button
            type="button"
            onClick={() => setViewMode("trajectory")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-all ${
              viewMode === "trajectory"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>Score Trajectory</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("volume")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-all ${
              viewMode === "volume"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            <span>Severity Volume</span>
          </button>
        </div>
      </div>

      {/* Trajectory View (Score 0-100 per test) */}
      {viewMode === "trajectory" && (
        <div className="w-full h-72">
          {hasScoreHistory ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={scoreHistory}
                margin={{ top: 15, right: 20, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" opacity={0.5} vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
                  tickLine={{ stroke: "#1e2d4a" }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 60, 75, 100]}
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
                  tickLine={{ stroke: "#1e2d4a" }}
                />
                <Tooltip content={<ScoreTrajectoryTooltip />} />
                {/* Reference line for Phishing Threshold */}
                <ReferenceLine
                  y={60}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: "Phishing Alert (60+)",
                    fill: "#ef4444",
                    fontSize: 10,
                    position: "insideTopRight",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#0284c7"
                  strokeWidth={2}
                  fill="#0284c7"
                  fillOpacity={0.12}
                  dot={<ScoreCustomDot />}
                  activeDot={{ r: 6, stroke: "#38bdf8", strokeWidth: 2, fill: "#0f172a" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No test scan data logged yet. Run an email test to view score trajectory.
            </div>
          )}
        </div>
      )}

      {/* Volume View (Stacked Bars) */}
      {viewMode === "volume" && (
        <div className="w-full h-72">
          {hasThreatTrends ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={threatTrends}
                margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
                barCategoryGap="25%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" opacity={0.5} vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
                  tickLine={{ stroke: "#1e2d4a" }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
                  tickLine={{ stroke: "#1e2d4a" }}
                />
                <Tooltip content={<CustomVolumeTooltip />} cursor={{ fill: "rgba(56, 189, 248, 0.04)" }} />
                <Bar dataKey="critical" name="Critical" fill="#ef4444" stackId="a" />
                <Bar dataKey="high" name="High" fill="#f97316" stackId="a" />
                <Bar dataKey="medium" name="Medium" fill="#f59e0b" stackId="a" />
                <Bar dataKey="low" name="Low / Safe" fill="#10b981" stackId="a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No trend data recorded yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
