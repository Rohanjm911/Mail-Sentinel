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
      duration: 1000,
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

  // Apple System Color Tokens for Cards
  let badgeStyle = "text-white/60 bg-white/[0.08] border-white/[0.1]";
  let iconBg = "bg-[#0a84ff]/15 text-[#0a84ff] border-[#0a84ff]/25";

  if (badgeType === "safe") {
    badgeStyle = "text-[#30d158] bg-[#30d158]/15 border-[#30d158]/30 glow-badge-safe";
    iconBg = "bg-[#30d158]/15 text-[#30d158] border-[#30d158]/30";
  } else if (badgeType === "warning") {
    badgeStyle = "text-[#ff9f0a] bg-[#ff9f0a]/15 border-[#ff9f0a]/30";
    iconBg = "bg-[#ff9f0a]/15 text-[#ff9f0a] border-[#ff9f0a]/30";
  } else if (badgeType === "danger") {
    badgeStyle = "text-[#ff453a] bg-[#ff453a]/15 border-[#ff453a]/30 glow-badge-critical";
    iconBg = "bg-[#ff453a]/15 text-[#ff453a] border-[#ff453a]/30";
  }

  return (
    <div className="apple-card relative p-5 flex flex-col justify-between group transition-all duration-300">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-white/50 tracking-tight">
            {title}
          </span>
          <div className={`p-2.5 rounded-2xl border ${iconBg} shadow-sm transition-transform duration-300 group-hover:scale-105`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <div className="text-3xl font-bold tracking-tight text-white font-sans">
            <span ref={countRef}>{value}</span>
          </div>
          {badgeText && (
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border tracking-tight ${badgeStyle}`}>
              {badgeText}
            </span>
          )}
        </div>
      </div>

      {subtitle && (
        <div className="mt-3 pt-2.5 border-t border-white/[0.06] text-xs text-white/45 font-normal tracking-tight line-clamp-1">
          {subtitle}
        </div>
      )}
    </div>
  );
};
