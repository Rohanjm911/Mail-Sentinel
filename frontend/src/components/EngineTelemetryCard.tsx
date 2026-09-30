import React from "react";
import { Cpu, Globe, Key, FileText, AlertOctagon, Paperclip } from "lucide-react";
import type { EngineTelemetryPoint } from "../types/scan";

interface EngineTelemetryCardProps {
  telemetry: EngineTelemetryPoint[];
}

const ENGINE_META: Record<string, { icon: any; desc: string; tint: string }> = {
  "ML NLP Model": {
    icon: Cpu,
    desc: "TF-IDF vectorizer + Logistic Regression classifier",
    tint: "bg-[#0a84ff]/15 text-[#0a84ff] border-[#0a84ff]/25",
  },
  "URL Reputation": {
    icon: Globe,
    desc: "Entropy, punycode, TLD reputation & lexical checks",
    tint: "bg-[#64d2ff]/15 text-[#64d2ff] border-[#64d2ff]/25",
  },
  "Sender Spoofing": {
    icon: Key,
    desc: "DKIM, SPF, DMARC alignment & display impersonation",
    tint: "bg-[#bf5af2]/15 text-[#bf5af2] border-[#bf5af2]/25",
  },
  "Header Forensics": {
    icon: FileText,
    desc: "Received chain anomalies & Return-Path verification",
    tint: "bg-[#5e5ce6]/15 text-[#5e5ce6] border-[#5e5ce6]/25",
  },
  "Content Triggers": {
    icon: AlertOctagon,
    desc: "Urgency keywords, coercion hooks & psychological lures",
    tint: "bg-[#ff9f0a]/15 text-[#ff9f0a] border-[#ff9f0a]/25",
  },
  "Attachment Safety": {
    icon: Paperclip,
    desc: "Executable extensions & sandboxed MIME inspection",
    tint: "bg-[#30d158]/15 text-[#30d158] border-[#30d158]/25",
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
          tint: "bg-white/[0.08] text-white border-white/[0.1]",
        };
        const Icon = meta.icon;

        let riskColor = "text-[#30d158]";
        let barColor = "bg-[#30d158]";
        let badgeStyle = "bg-[#30d158]/10 text-[#30d158] border-[#30d158]/25";
        let statusText = "Nominal";

        if (engine.score >= 70) {
          riskColor = "text-[#ff453a]";
          barColor = "bg-[#ff453a]";
          badgeStyle = "bg-[#ff453a]/10 text-[#ff453a] border-[#ff453a]/25";
          statusText = "Critical";
        } else if (engine.score >= 40) {
          riskColor = "text-[#ff9f0a]";
          barColor = "bg-[#ff9f0a]";
          badgeStyle = "bg-[#ff9f0a]/10 text-[#ff9f0a] border-[#ff9f0a]/25";
          statusText = "Elevated";
        }

        return (
          <div
            key={engine.engine}
            className="apple-card p-4 flex flex-col justify-between space-y-3 transition-all duration-300 hover:scale-[1.01]"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border ${meta.tint}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white tracking-tight">
                      {engine.engine}
                    </h4>
                    <span className="text-[10px] text-white/40 block">
                      {engine.status || `Weight ${(engine.weight * 100).toFixed(0)}%`}
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                  {statusText}
                </span>
              </div>

              <p className="text-[11px] text-white/50 mt-2.5 leading-relaxed line-clamp-2">
                {meta.desc}
              </p>
            </div>

            {/* Apple Progress Track */}
            <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-white/45">Risk Index:</span>
                <span className={`font-semibold font-mono ${riskColor}`}>
                  {engine.score}/100
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${Math.min(100, Math.max(0, engine.score))}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
