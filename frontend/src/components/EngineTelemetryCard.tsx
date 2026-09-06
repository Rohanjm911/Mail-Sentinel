import React from "react";
import { Cpu, Globe, Key, FileText, AlertOctagon, Paperclip } from "lucide-react";
import type { EngineTelemetryPoint } from "../types/scan";

interface EngineTelemetryCardProps {
  telemetry: EngineTelemetryPoint[];
}

const ENGINE_META: Record<string, { icon: any; desc: string }> = {
  "ML NLP Model": {
    icon: Cpu,
    desc: "TF-IDF vectorizer + Logistic Regression classifier",
  },
  "URL Reputation": {
    icon: Globe,
    desc: "Entropy, punycode, TLD reputation & blacklist checks",
  },
  "Sender Spoofing": {
    icon: Key,
    desc: "DKIM, SPF, DMARC alignment & display name spoofing",
  },
  "Header Forensics": {
    icon: FileText,
    desc: "Received chain anomalies & Return-Path mismatches",
  },
  "Content Triggers": {
    icon: AlertOctagon,
    desc: "Urgency keywords, financial hooks & social engineering",
  },
  "Attachment Safety": {
    icon: Paperclip,
    desc: "High-risk executable extensions & multi-part MIME flags",
  },
};

export const EngineTelemetryCard: React.FC<EngineTelemetryCardProps> = ({ telemetry }) => {
  if (!telemetry || telemetry.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {telemetry.map((engine) => {
        const meta = ENGINE_META[engine.engine] || {
          icon: Cpu,
          desc: "Heuristic threat evaluation layer",
        };
        const Icon = meta.icon;

        let riskColor = "text-emerald-400";
        let barColor = "bg-emerald-500";
        let badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
        let statusText = "NOMINAL";

        if (engine.score >= 70) {
          riskColor = "text-red-400";
          barColor = "bg-red-500";
          badgeStyle = "bg-red-500/10 text-red-400 border-red-500/30";
          statusText = "CRITICAL";
        } else if (engine.score >= 40) {
          riskColor = "text-orange-400";
          barColor = "bg-orange-500";
          badgeStyle = "bg-orange-500/10 text-orange-400 border-orange-500/30";
          statusText = "ELEVATED";
        } else if (engine.score >= 20) {
          riskColor = "text-amber-400";
          barColor = "bg-amber-500";
          badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/30";
          statusText = "MODERATE";
        }

        return (
          <div
            key={engine.engine}
            className="p-4 rounded-xl bg-[#090e1a]/70 border border-[#1e2d4a] hover:border-sky-500/30 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#111a2d] border border-[#1e2d4a] group-hover:border-sky-500/40 text-sky-400 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 font-mono tracking-tight">
                      {engine.engine}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Weight: {Math.round(engine.weight * 100)}%
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${badgeStyle}`}>
                  {statusText}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-1 mb-3 font-sans">
                {meta.desc}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 text-[11px]">Mean Risk Score:</span>
                <span className={`font-bold ${riskColor}`}>
                  {engine.score} <span className="text-[10px] text-slate-400 font-normal">/ 100</span>
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full h-1.5 rounded-full bg-[#0d1526] overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full ${barColor} transition-all duration-500`}
                  style={{ width: `${Math.min(100, Math.max(4, engine.score))}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
