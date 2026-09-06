import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

interface ThreatDataPoint {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface ThreatChartProps {
  data: ThreatDataPoint[];
}

export const ThreatChart: React.FC<ThreatChartProps> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#64748b"
            tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
            tickLine={{ stroke: "#1e293b" }}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
            tickLine={{ stroke: "#1e293b" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#121824",
              borderColor: "#1e293b",
              borderRadius: "6px",
              color: "#f8fafc",
              fontFamily: "monospace",
              fontSize: "12px",
              boxShadow: "none",
            }}
            cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: "12px",
              fontFamily: "monospace",
              fontSize: "11px",
              color: "#94a3b8",
            }}
          />
          <Bar dataKey="critical" name="Critical" fill="#ef4444" stackId="a" />
          <Bar dataKey="high" name="High" fill="#f97316" stackId="a" />
          <Bar dataKey="medium" name="Medium" fill="#f59e0b" stackId="a" />
          <Bar dataKey="low" name="Low / Safe" fill="#10b981" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
