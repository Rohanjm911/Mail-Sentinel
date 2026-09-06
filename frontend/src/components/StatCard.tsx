import React, { useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { animate } from "animejs";

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
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!countRef.current) return;
    const strVal = String(value);
    const rawNum = typeof value === "number" ? value : parseFloat(strVal.replace(/,/g, ""));
    
    if (isNaN(rawNum)) {
      countRef.current.textContent = strVal;
      return;
    }

    const hasDecimal = strVal.includes(".");
    const obj = { val: 0 };

    animate(obj, {
      val: rawNum,
      ease: "outExpo",
      duration: 1100,
      onUpdate: () => {
        if (countRef.current) {
          if (hasDecimal) {
            countRef.current.textContent = obj.val.toFixed(1);
          } else {
            countRef.current.textContent = Math.round(obj.val).toLocaleString();
          }
        }
      },
    });
  }, [value]);

  let badgeStyle = "text-slate-400 bg-slate-800/60 border-slate-700/60";
  let iconGlow = "text-sky-400 bg-sky-500/10 border-sky-500/25";
  let topBarColor = "bg-sky-500";

  if (badgeType === "safe") {
    badgeStyle = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 glow-badge-safe";
    iconGlow = "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
    topBarColor = "bg-emerald-500";
  } else if (badgeType === "warning") {
    badgeStyle = "text-amber-400 bg-amber-500/10 border-amber-500/30";
    iconGlow = "text-amber-400 bg-amber-500/10 border-amber-500/25";
    topBarColor = "bg-amber-500";
  } else if (badgeType === "danger") {
    badgeStyle = "text-red-400 bg-red-500/10 border-red-500/30 glow-badge-critical";
    iconGlow = "text-red-400 bg-red-500/10 border-red-500/25";
    topBarColor = "bg-red-500";
  }

  return (
    <div className="relative overflow-hidden rounded-xl cyber-card p-5 flex flex-col justify-between group transition-transform duration-200 hover:-translate-y-0.5">
      {/* Top clean solid accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${topBarColor}`} />

      {/* Watermarked Icon in Background */}
      <Icon className="absolute -right-2 -bottom-2 w-20 h-20 text-slate-800/20 group-hover:text-slate-700/30 transition-colors pointer-events-none -z-0" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className={`p-2 rounded-lg border ${iconGlow} shadow-sm transition-transform group-hover:scale-110 duration-200`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-4 flex items-baseline justify-between">
          <div className="text-3xl font-extrabold font-mono text-slate-100 tracking-tight">
            <span ref={countRef}>{value}</span>
          </div>
          {badgeText && (
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badgeStyle}`}>
              {badgeText}
            </span>
          )}
        </div>

        {subtitle && (
          <div className="mt-2 text-xs text-slate-400 font-sans line-clamp-1">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
