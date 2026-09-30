import React from "react";
import type { SeverityLevel } from "../types/scan";

interface SeverityBadgeProps {
  severity: SeverityLevel | string;
  size?: "sm" | "md" | "lg";
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = "md" }) => {
  const norm = (severity || "LOW").toUpperCase();

  let styles = "bg-[#30d158]/15 text-[#30d158] border-[#30d158]/30";
  let dotColor = "bg-[#30d158]";
  let label = "Safe / Clean";

  if (norm === "CRITICAL") {
    styles = "bg-[#ff453a]/15 text-[#ff453a] border-[#ff453a]/30 shadow-[0_0_12px_rgba(255,69,58,0.2)]";
    dotColor = "bg-[#ff453a]";
    label = "Critical";
  } else if (norm === "HIGH") {
    styles = "bg-[#ff9f0a]/15 text-[#ff9f0a] border-[#ff9f0a]/30 shadow-[0_0_12px_rgba(255,159,10,0.2)]";
    dotColor = "bg-[#ff9f0a]";
    label = "High Threat";
  } else if (norm === "MEDIUM") {
    styles = "bg-[#ffd60a]/15 text-[#ffd60a] border-[#ffd60a]/30 shadow-[0_0_12px_rgba(255,214,10,0.2)]";
    dotColor = "bg-[#ffd60a]";
    label = "Suspicious";
  } else if (norm === "LOW" || norm === "SAFE") {
    styles = "bg-[#30d158]/15 text-[#30d158] border-[#30d158]/30 shadow-[0_0_12px_rgba(48,209,88,0.2)]";
    dotColor = "bg-[#30d158]";
    label = "Verified Safe";
  }

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-[10px] font-semibold tracking-tight",
    md: "px-3 py-1 text-xs font-semibold tracking-tight",
    lg: "px-3.5 py-1.5 text-xs font-bold tracking-normal",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md ${styles} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
      <span>{label}</span>
    </span>
  );
};
