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
    <div className="max-w-4xl mx-auto px-6 py-8 md:px-8 space-y-6">
      {/* Apple Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.12] flex items-center justify-center p-2 shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] shrink-0">
            <img src="/logo.png" alt="Mail Sentinel Logo" className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(10,132,255,0.4)]" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#0a84ff]/10 border border-[#0a84ff]/25 text-[#0a84ff] font-semibold uppercase">
                Forensic Ingestion
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              Email Security Scanner
            </h1>
            <p className="text-xs text-white/50 leading-relaxed">
              Multi-vector analysis for deceptive lures, brand spoofing, numerical IP hosts, and psychological coercion.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#30d158] bg-[#30d158]/10 border border-[#30d158]/25 px-3.5 py-1.5 rounded-full shrink-0 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Local Air-Gapped Engine</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#ff453a]/10 border border-[#ff453a]/30 rounded-2xl text-xs text-[#ff453a] flex items-center gap-3 backdrop-blur-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Scanner Apple Card */}
      <div className="apple-card p-6 md:p-8 space-y-6">
        {/* Apple Segmented Pill Switch */}
        <div className="flex justify-center">
          <div className="apple-segmented-container w-full max-w-md p-1">
            <button
              type="button"
              onClick={() => setActiveTab("paste")}
              className={`flex-1 py-2 px-4 text-xs font-medium flex items-center justify-center gap-2 rounded-full transition-all cursor-pointer ${
                activeTab === "paste"
                  ? "apple-segmented-item-active"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste Email Content</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`flex-1 py-2 px-4 text-xs font-medium flex items-center justify-center gap-2 rounded-full transition-all cursor-pointer ${
                activeTab === "upload"
                  ? "apple-segmented-item-active"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Upload RFC 5322 .EML</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
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
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-xs text-white/50">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Lock className="w-4 h-4 text-[#30d158]" />
                  <span>RFC 5322 Sandboxed Inspection Protocol:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-white/60 pl-1 text-[11px]">
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
