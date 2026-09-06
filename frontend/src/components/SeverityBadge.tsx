import React from "react";
import type { SeverityLevel } from "../types/scan";

interface SeverityBadgeProps {
  severity: SeverityLevel | string;
  size?: "sm" | "md" | "lg";
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = "md" }) => {
  const norm = (severity || "LOW").toUpperCase();

  let styles = "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30";
  let label = "SAFE / LOW";

  if (norm === "CRITICAL") {
    styles = "bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30";
    label = "CRITICAL";
  } else if (norm === "HIGH") {
    styles = "bg-[#f97316]/15 text-[#f97316] border-[#f97316]/30";
    label = "HIGH";
  } else if (norm === "MEDIUM") {
    styles = "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30";
    label = "MEDIUM";
  } else if (norm === "LOW" || norm === "SAFE") {
    styles = "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30";
    label = "SAFE";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs tracking-wider",
    md: "px-2.5 py-1 text-xs font-semibold tracking-wider",
    lg: "px-3 py-1.5 text-sm font-bold tracking-widest",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border uppercase font-mono ${styles} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};
