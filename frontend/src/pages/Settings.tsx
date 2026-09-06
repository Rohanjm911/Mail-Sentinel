import React, { useState } from 'react';
import { Sliders, Shield, Database, Cpu, Lock, CheckCircle2, Save } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-slate-400" />
            System & Engine Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure risk thresholds, detection engine parameters, and threat analysis policies.
          </p>
        </div>
        {saveSuccess && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-3 py-1.5 rounded">
            <CheckCircle2 className="w-4 h-4" />
            Preferences Saved (Local Session)
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Risk Thresholds */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-slate-200">Deterministic Risk Scoring Thresholds</h2>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Core Engine V1.0</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Mail Sentinel evaluates email threat telemetry on a normalized 0–100 scale across 6 security pillars.
            The classification buckets determine the alert severity assigned to security incidents.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-emerald-400">LOW RISK</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">0 – 29</span>
              </div>
              <p className="text-[11px] text-slate-400">Routine legitimate communication. No critical anomalies.</p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-amber-400">MEDIUM RISK</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">30 – 59</span>
              </div>
              <p className="text-[11px] text-slate-400">Minor indicators detected (e.g. tracking URL, softfail SPF).</p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-orange-400">HIGH RISK</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800">60 – 79</span>
              </div>
              <p className="text-[11px] text-slate-400">Strong phishing indicators, domain mismatches, or high ML score.</p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-red-400">CRITICAL RISK</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">80 – 100</span>
              </div>
              <p className="text-[11px] text-slate-400">Confirmed malicious payload, brand spoofing, or credential harvesting.</p>
            </div>
          </div>
        </div>

        {/* Local ML Model Specifications */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-slate-200">Local Machine Learning Pipeline</h2>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
              No External AI API Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Classifier Architecture:</span>
                <span className="font-mono text-slate-200">TF-IDF + Logistic Regression</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Vocabulary Size:</span>
                <span className="font-mono text-slate-200">3,000 N-grams (Unigrams + Bigrams)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Model Filepath:</span>
                <span className="font-mono text-slate-300">backend/ml/artifacts/phishing_model.joblib</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Vectorizer Filepath:</span>
                <span className="font-mono text-slate-300">backend/ml/artifacts/tfidf.joblib</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Test Accuracy:</span>
                <span className="font-mono text-emerald-400 font-semibold">98.28%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Test Recall (Phishing):</span>
                <span className="font-mono text-emerald-400 font-semibold">100.00%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Test Precision:</span>
                <span className="font-mono text-emerald-400 font-semibold">96.67%</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">F1-Score:</span>
                <span className="font-mono text-emerald-400 font-semibold">98.31%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Sandbox Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-slate-200">Security & Operational Policies</h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Zero-Execution Sandbox</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-800 rounded">
              <input
                type="checkbox"
                id="passiveUrl"
                checked={engineSettings.passiveUrlAnalysis}
                onChange={(e) => setEngineSettings({ ...engineSettings, passiveUrlAnalysis: e.target.checked })}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <div>
                <label htmlFor="passiveUrl" className="text-xs font-semibold text-slate-200 block cursor-pointer">
                  Passive URL Analysis (Zero Web Fetching)
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Extracted URLs are analyzed strictly via lexical, syntactic, domain, and TLD characteristics. Mail Sentinel will never execute outbound HTTP requests to untrusted links.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-800 rounded">
              <input
                type="checkbox"
                id="safeAttachment"
                checked={true}
                disabled
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <div>
                <label htmlFor="safeAttachment" className="text-xs font-semibold text-slate-200 block">
                  Attachment Safety Policy (Mandatory Hardened Rule)
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Email attachments are never executed, unpacked, or opened. Telemetry is derived strictly from filename, dual-extensions, MIME metadata, and byte sizing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-800 rounded">
              <input
                type="checkbox"
                id="bodySanitize"
                checked={true}
                disabled
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <div>
                <label htmlFor="bodySanitize" className="text-xs font-semibold text-slate-200 block">
                  Strict HTML Script & Event Handler Stripping
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  All parsed HTML content strips &lt;script&gt;, &lt;iframe&gt;, &lt;object&gt;, and inline event handlers before inspection.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Database & Storage */}
        <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-200">Database & Persistence</h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">Connected</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1.5">
              <div className="text-slate-400 font-medium">Active Database Backend:</div>
              <div className="font-mono text-slate-200">PostgreSQL (Primary) / SQLite (Fallback Active)</div>
              <p className="text-[11px] text-slate-500 pt-1">
                Zero-friction local persistence in <code className="text-slate-400">mail_sentinel.db</code> ensures offline availability.
              </p>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1.5">
              <div className="text-slate-400 font-medium">Privacy & Data Retention:</div>
              <div className="text-slate-300">Header & Metadata Only</div>
              <p className="text-[11px] text-slate-500 pt-1">
                Raw email body text is discarded after parsing. Only analytical telemetry, findings, and risk metrics are stored.
              </p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded border border-blue-500 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
