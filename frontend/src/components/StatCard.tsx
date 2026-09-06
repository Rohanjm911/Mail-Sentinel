import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badgeText?: string;
  badgeType?: "safe" | "warning" | "danger" | "neutral";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeType = "neutral",
}) => {
  let badgeColor = "text-[#94a3b8] bg-[#0b0f17] border-[#1e293b]";
  if (badgeType === "safe") badgeColor = "text-[#10b981] bg-[#10b981]/10 border-[#10b981]/30";
  if (badgeType === "warning") badgeColor = "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30";
  if (badgeType === "danger") badgeColor = "text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/30";

  return (
    <div className="bg-[#121824] border border-[#1e293b] rounded-lg p-5 flex flex-col justify-between hover:border-[#334155] transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-[#94a3b8]">
          {title}
        </span>
        <div className="p-2 rounded bg-[#0b0f17] border border-[#1e293b] text-[#94a3b8]">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-3xl font-bold font-mono text-[#f8fafc] tracking-tight">
          {value}
        </div>
        {badgeText && (
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${badgeColor}`}>
            {badgeText}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="mt-2 text-xs text-[#64748b] font-mono">
          {subtitle}
        </div>
      )}
    </div>
  );
};
