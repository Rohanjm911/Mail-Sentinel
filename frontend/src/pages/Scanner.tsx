import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, FileCode, Clipboard, AlertCircle } from "lucide-react";
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
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold font-mono text-[#f8fafc] tracking-tight">
          Email Security Scanner
        </h1>
        <p className="text-xs text-[#94a3b8] font-mono leading-relaxed">
          Analyze an email for phishing indicators, suspicious URLs, authentication anomalies, and social-engineering patterns.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-[#ef4444]/15 border border-[#ef4444]/40 rounded-lg text-xs font-mono text-[#ef4444] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Scanner Container */}
      <div className="bg-[#121824] border border-[#1e293b] rounded-lg overflow-hidden">
        {/* Input Mode Tabs */}
        <div className="flex border-b border-[#1e293b] bg-[#0b0f17]">
          <button
            type="button"
            onClick={() => setActiveTab("paste")}
            className={`flex-1 py-3 px-4 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border-b-2 ${
              activeTab === "paste"
                ? "border-[#f8fafc] text-[#f8fafc] bg-[#121824]"
                : "border-transparent text-[#94a3b8] hover:text-[#cbd5e1] hover:bg-[#121824]/50"
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Paste Email</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-3 px-4 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border-b-2 ${
              activeTab === "upload"
                ? "border-[#f8fafc] text-[#f8fafc] bg-[#121824]"
                : "border-transparent text-[#94a3b8] hover:text-[#cbd5e1] hover:bg-[#121824]/50"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Upload .EML</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <LoadingState
              message="Processing Security Telemetry..."
              submessage="Executing local TF-IDF classification, token extraction, heuristic analysis, and risk synthesis."
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
              <div className="p-4 bg-[#0b0f17] border border-[#1e293b] rounded-md space-y-2 text-xs font-mono text-[#94a3b8]">
                <div className="flex items-center gap-2 text-[#cbd5e1] font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                  <span>RFC 5322 Sandboxed Inspection Protocol:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[#64748b] pl-1">
                  <li>HTML payloads are stripped of embedded JavaScript, iframes, and external tracking pixels.</li>
                  <li>Attachments are parsed for MIME headers and double-extensions without binary execution.</li>
                  <li>Extracted hyperlinks are normalized and analyzed passively without initiating outbound network requests.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
