import React, { useState, useRef } from "react";
import { UploadCloud, FileCheck, AlertCircle, FileText, X } from "lucide-react";

interface FileUploaderProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, isLoading }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = (file: File) => {
    setErrorMessage(null);
    const validExtensions = [".eml", ".txt"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (!validExtensions.includes(ext)) {
      setErrorMessage(`Invalid file format: '${ext}'. Only standard RFC 5322 .eml messages are accepted.`);
      setSelectedFile(null);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage("File exceeds the maximum upload limit of 15 MB.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const handleAnalyzeClick = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-mono text-red-400 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative p-10 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-200 group ${
          dragOver
            ? "border-sky-400 bg-sky-500/10 shadow-xl shadow-sky-500/10 scale-[0.99]"
            : "border-[#1e2d4a] bg-[#0a0f1d]/70 hover:border-sky-500/40 hover:bg-[#111a2d]/50"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".eml,.txt"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-4 rounded-2xl bg-[#0f172a] border border-sky-500/30 text-sky-400 group-hover:scale-110 group-hover:border-sky-400 transition-all duration-200 shadow-md">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100 tracking-tight font-sans">
              Drag &amp; drop an <span className="font-mono text-sky-400">.EML</span> email file here, or click to browse
            </p>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Supports RFC 822 / 5322 .eml messages exported from Outlook, Thunderbird, or Gmail (Max 15MB)
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111a2d] border border-[#1e2d4a] text-slate-400">
              Safe Ingestion: Zero Script Execution
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111a2d] border border-[#1e2d4a] text-emerald-400">
              Local Parser
            </span>
          </div>
        </div>
      </div>

      {/* Selected File Card */}
      {selectedFile && (
        <div className="p-4 rounded-xl cyber-card border border-sky-500/30 flex items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/25 text-sky-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold font-mono text-slate-100 truncate">
                {selectedFile.name}
              </p>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                {(selectedFile.size / 1024).toFixed(1)} KB • Ready for deep multi-engine inspection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
              title="Remove File"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleAnalyzeClick}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm border border-sky-400/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{isLoading ? "Analyzing MIME Stream..." : "Inspect .EML for Threats"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
