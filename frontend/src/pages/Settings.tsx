import React, { useState } from "react";
import { Sliders, Shield, Cpu, Lock, CheckCircle2, Save } from "lucide-react";

export const Settings: React.FC = () => {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [engineSettings, setEngineSettings] = useState({
    lowMax: 29,
    mediumMax: 59,
    highMax: 79,
    criticalMin: 80,
    mlWeight: 0.25,
    passiveUrlAnalysis: true,
    allowExternalThreatIntel: true,
    maxUploadSizeBytes: 10485760, // 10MB
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.08] border border-white/[0.1] text-white/70 font-semibold uppercase">
              Preferences
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-[#0a84ff]" />
            <span>Platform Configuration</span>
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Configure deterministic risk scoring thresholds, detection engine parameters, and threat analysis policies.
          </p>
        </div>
        {saveSuccess && (
          <div className="flex items-center gap-2 text-xs font-semibold text-[#30d158] bg-[#30d158]/10 border border-[#30d158]/25 px-4 py-2 rounded-full backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4" />
            <span>Preferences Saved to Session</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Risk Thresholds (macOS System Preference Card) */}
        <div className="apple-card p-6 md:p-7 space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#0a84ff]/15 border border-[#0a84ff]/25 text-[#0a84ff]">
                <Shield className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-semibold text-white tracking-tight">
                Deterministic Risk Scoring Thresholds
              </h2>
            </div>
            <span className="text-[10px] font-mono text-white/40">Core Engine V1.0</span>
          </div>

          <p className="text-xs text-white/50 leading-relaxed font-normal">
            Mail Sentinel evaluates email threat telemetry on a normalized 0–100 scale across 6 security pillars.
            The classification buckets determine the alert severity assigned to security incidents.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
            <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#30d158]">Safe / Low</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#30d158]/15 text-[#30d158] border border-[#30d158]/30 font-bold">
                  0 – 29
                </span>
              </div>
              <p className="text-[11px] text-white/45">Routine legitimate communication. Nominal score.</p>
            </div>

            <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#ffd60a]">Suspicious</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ffd60a]/15 text-[#ffd60a] border border-[#ffd60a]/30 font-bold">
                  30 – 59
                </span>
              </div>
              <p className="text-[11px] text-white/45">Minor anomalies detected (e.g. tracking URL, Reply-To).</p>
            </div>

            <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#ff9f0a]">High Risk</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ff9f0a]/15 text-[#ff9f0a] border border-[#ff9f0a]/30 font-bold">
                  60 – 79
                </span>
              </div>
              <p className="text-[11px] text-white/45">Strong indicators (brand typosquatting, urgency tactics).</p>
            </div>

            <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#ff453a]">Critical</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ff453a]/15 text-[#ff453a] border border-[#ff453a]/30 font-bold">
                  80 – 100
                </span>
              </div>
              <p className="text-[11px] text-white/45">Active threat vectors (credential harvester, executable).</p>
            </div>
          </div>
        </div>

        {/* Machine Learning Engine Tuning */}
        <div className="apple-card p-6 md:p-7 space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#bf5af2]/15 border border-[#bf5af2]/25 text-[#bf5af2]">
                <Cpu className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-semibold text-white tracking-tight">
                Machine Learning Model Weight Allocation
              </h2>
            </div>
            <span className="text-xs font-mono font-semibold text-white">
              {Math.round(engineSettings.mlWeight * 100)}% Influence
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs text-white/60">
              <span>Rule-Based Heuristic Weight: {Math.round((1 - engineSettings.mlWeight) * 100)}%</span>
              <span>TF-IDF Classifier Weight: {Math.round(engineSettings.mlWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.5"
              step="0.05"
              value={engineSettings.mlWeight}
              onChange={(e) =>
                setEngineSettings({ ...engineSettings, mlWeight: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-[#0071e3]"
            />
            <p className="text-[11px] text-white/40 leading-relaxed">
              Default is calibrated to 25% ML weight to ensure complete explainability while deterministic security rules govern high-impact threat scoring.
            </p>
          </div>
        </div>

        {/* Operational Security Policies (Apple iOS Toggles) */}
        <div className="apple-card p-6 md:p-7 space-y-5">
          <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-4">
            <div className="p-2 rounded-xl bg-[#30d158]/15 border border-[#30d158]/25 text-[#30d158]">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Operational Security Policies
            </h2>
          </div>

          <div className="space-y-4 divide-y divide-white/[0.06]">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-semibold text-white block">
                  Passive URL &amp; Link Reputation Inspection
                </span>
                <p className="text-[11px] text-white/50">
                  Analyze links lexically without making outbound HTTP socket connections to untrusted servers.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEngineSettings({
                    ...engineSettings,
                    passiveUrlAnalysis: !engineSettings.passiveUrlAnalysis,
                  })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  engineSettings.passiveUrlAnalysis ? "bg-[#30d158]" : "bg-white/[0.15]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    engineSettings.passiveUrlAnalysis ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-semibold text-white block">
                  External Threat Intelligence Lookup (Passive DNS &amp; Feeds)
                </span>
                <p className="text-[11px] text-white/50">
                  Allow integration with passive external threat feeds when backend API keys are present.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEngineSettings({
                    ...engineSettings,
                    allowExternalThreatIntel: !engineSettings.allowExternalThreatIntel,
                  })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  engineSettings.allowExternalThreatIntel ? "bg-[#30d158]" : "bg-white/[0.15]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    engineSettings.allowExternalThreatIntel ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="apple-btn-primary px-8 py-3 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
