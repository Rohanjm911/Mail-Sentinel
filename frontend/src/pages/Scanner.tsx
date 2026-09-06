import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, FileCode, Clipboard, AlertCircle, Lock } from "lucide-react";
import { ScanService, type PasteScanPayload } from "../services/api";
import { EmailInput } from "../components/EmailInput";
import { FileUploader } from "../components/FileUploader";
import { LoadingState } from "../components/LoadingState";

export const Scanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"paste" | "upload">("paste");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePasteSubmit = async (payload: PasteScanPayload) => {
    try {
      setLoading(true);
      setError(null);
      const result = await ScanService.scanPasted(payload);
      navigate(`/results/${result.id}`);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
          "Failed to complete email scan. Please check that the backend service is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const result = await ScanService.uploadEml(file);
      navigate(`/results/${result.id}`);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
          "Failed to parse uploaded .eml file. Untrusted input could not be validated."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/25 text-sky-400 font-bold uppercase">
              Forensic Ingestion Module
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight font-sans">
            Email Security Scanner
          </h1>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Multi-vector analysis for deceptive lures, brand spoofing, numerical IP hosts, and psychological urgency coercion.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-xl shrink-0">
          <ShieldCheck className="w-4 h-4" />
          <span>Local Air-Gapped Engine</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-mono text-red-400 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Scanner Container */}
      <div className="cyber-card rounded-2xl overflow-hidden border border-slate-800">
        {/* Input Mode Tabs */}
        <div className="flex p-2 bg-[#090e1b] border-b border-[#1e2d4a] gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("paste")}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "paste"
                ? "bg-[#121d33] text-sky-400 border border-sky-500/40 shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#111a2d]/60 border border-transparent"
            }`}
          >
            <Clipboard className="w-4 h-4" />
            <span>Paste Email Contents</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === "upload"
                ? "bg-[#121d33] text-sky-400 border border-sky-500/40 shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#111a2d]/60 border border-transparent"
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Upload RFC 5322 .EML</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
          {loading ? (
            <LoadingState
              message="Executing Forensic Threat Pipeline..."
              submessage="Processing local TF-IDF classification, token extraction, heuristic parsing, and risk synthesis."
            />
          ) : activeTab === "paste" ? (
            <EmailInput
              onSubmit={handlePasteSubmit}
              isLoading={loading}
              onLoadSample={() => {}}
            />
          ) : (
            <div className="space-y-6">
              <FileUploader onUpload={handleFileUpload} isLoading={loading} />

              {/* Information Box on Safe EML parsing */}
              <div className="p-4 rounded-xl bg-[#090e1b] border border-[#1e2d4a] space-y-2.5 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>RFC 5322 Sandboxed Inspection Protocol:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                  <li>HTML payloads are stripped of embedded JavaScript, tracking beacons, and execution vectors.</li>
                  <li>Attachments are parsed for MIME headers and double-extensions without launching binary code.</li>
                  <li>Extracted hyperlinks are normalized and analyzed purely via deterministic lexical heuristics.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
