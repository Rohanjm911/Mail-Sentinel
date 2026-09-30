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

    let scoreBadge = "bg-[#30d158]/15 text-[#30d158] border-[#30d158]/30";
    if (data.score >= 80) scoreBadge = "bg-[#ff453a]/15 text-[#ff453a] border-[#ff453a]/30";
    else if (data.score >= 60) scoreBadge = "bg-[#ff9f0a]/15 text-[#ff9f0a] border-[#ff9f0a]/30";
    else if (data.score >= 30) scoreBadge = "bg-[#ffd60a]/15 text-[#ffd60a] border-[#ffd60a]/30";

    return (
      <div className="apple-glass rounded-2xl p-4 shadow-2xl border border-white/[0.12] text-xs max-w-[280px]">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-2.5">
          <div className="flex items-center gap-1.5 font-semibold text-white">
            {isPhish ? (
              <ShieldAlert className="w-3.5 h-3.5 text-[#ff453a] shrink-0" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158] shrink-0" />
            )}
            <span>{data.label || `Scan #${data.scan_num}`}</span>
          </div>
          <span className="text-[10px] text-white/40 font-mono">{data.time}</span>
        </div>

        <div className="space-y-1.5 mb-2.5">
          <div>
            <span className="text-[10px] text-white/40 block uppercase tracking-wider font-medium">Subject:</span>
            <p className="text-white text-xs font-medium truncate" title={data.subject}>
              {data.subject || "Untitled Email"}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-white/40 block uppercase tracking-wider font-medium">Sender:</span>
            <p className="text-white/70 text-xs font-mono truncate" title={data.sender}>
              {data.sender || "Unknown Origin"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
          <span className="text-white/50 text-[11px]">Threat Score:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-mono text-white">{data.score}/100</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${scoreBadge}`}>
              {data.severity}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const VolumeTrendTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="apple-glass rounded-2xl p-3.5 shadow-2xl border border-white/[0.12] text-xs min-w-[170px]">
        <div className="font-semibold text-white border-b border-white/[0.08] pb-1.5 mb-2 font-mono">
          {label}
        </div>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-white/60">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-semibold text-white font-mono">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const ThreatChart: React.FC<ThreatChartProps> = ({
  scoreHistory = [],
  threatTrends = [],
}) => {
  const [viewMode, setViewMode] = useState<"trajectory" | "volume">("trajectory");

  const hasScoreHistory = scoreHistory && scoreHistory.length > 0;
  const hasThreatTrends = threatTrends && threatTrends.length > 0;

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Apple Sub-header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs text-white/50 font-normal">
          {viewMode === "trajectory"
            ? "Sequential Email Test Trajectory (Real-time telemetry)"
            : "Rolling Threat Volume Breakdown"}
        </span>

        {/* Apple Segmented Pill Switch */}
        <div className="apple-segmented-container self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("trajectory")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs transition-all cursor-pointer ${
              viewMode === "trajectory"
                ? "apple-segmented-item-active"
                : "text-white/60 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Score Trajectory</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("volume")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs transition-all cursor-pointer ${
              viewMode === "volume"
                ? "apple-segmented-item-active"
                : "text-white/60 hover:text-white"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
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
                <defs>
                  <linearGradient id="appleTrajectoryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0a84ff" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0a84ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "-apple-system, sans-serif" }}
                  tickLine={{ stroke: "rgba(255,255,255,0.08)" }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 60, 75, 100]}
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "-apple-system, sans-serif" }}
                  tickLine={{ stroke: "rgba(255,255,255,0.08)" }}
                />
                <Tooltip content={<ScoreTrajectoryTooltip />} />
                {/* Reference line for Phishing Threshold */}
                <ReferenceLine
                  y={60}
                  stroke="#ff453a"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: "Phishing Threshold (60+)",
                    fill: "#ff453a",
                    fontSize: 10,
                    position: "insideTopRight",
                    fontFamily: "-apple-system, sans-serif",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#0a84ff"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#appleTrajectoryGradient)"
                  dot={{ r: 4, fill: "#0a84ff", stroke: "#ffffff", strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: "#0071e3", stroke: "#ffffff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/40 text-xs rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <p>No sequential scan telemetry available yet.</p>
              <p className="text-[11px] text-white/30 mt-1">Run email scans to generate a threat trajectory graph.</p>
            </div>
          )}
        </div>
      )}

      {/* Volume View (Stacked/Grouped Bar Chart) */}
      {viewMode === "volume" && (
        <div className="w-full h-72">
          {hasThreatTrends ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={threatTrends}
                margin={{ top: 15, right: 20, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "-apple-system, sans-serif" }}
                  tickLine={{ stroke: "rgba(255,255,255,0.08)" }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "-apple-system, sans-serif" }}
                  tickLine={{ stroke: "rgba(255,255,255,0.08)" }}
                />
                <Tooltip content={<VolumeTrendTooltip />} />
                <Bar dataKey="critical" name="Critical" fill="#ff453a" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="high" name="High" fill="#ff9f0a" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="medium" name="Medium" fill="#ffd60a" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="low" name="Safe" fill="#30d158" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/40 text-xs rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <p>No historical threat trend data available yet.</p>
              <p className="text-[11px] text-white/30 mt-1">Run email scans to populate cumulative volume.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
