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
        <div className="p-3.5 bg-[#ff453a]/10 border border-[#ff453a]/30 rounded-2xl text-xs text-[#ff453a] flex items-center gap-2.5 backdrop-blur-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Apple Styled Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative p-10 md:p-12 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all duration-300 group ${
          dragOver
            ? "border-[#0a84ff] bg-[#0a84ff]/10 shadow-2xl scale-[0.99]"
            : "border-white/[0.12] bg-white/[0.02] hover:border-white/[0.25] hover:bg-white/[0.04]"
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
          <div className="p-4 rounded-3xl bg-white/[0.05] border border-white/[0.1] text-[#0a84ff] group-hover:scale-105 group-hover:border-[#0a84ff]/40 transition-all duration-300 shadow-md">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white tracking-tight font-sans">
              Drag &amp; drop an <span className="font-mono text-[#0a84ff]">.EML</span> file here, or click to browse
            </p>
            <p className="text-xs text-white/50 mt-1">
              Supports RFC 822 / 5322 .eml messages exported from Outlook, Thunderbird, or Gmail (Max 15MB)
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/50 font-medium">
              Zero Script Execution
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#30d158]/10 border border-[#30d158]/25 text-[#30d158] font-medium">
              Air-Gapped Ingestion
            </span>
          </div>
        </div>
      </div>

      {/* Selected File Card */}
      {selectedFile && (
        <div className="p-4 rounded-2xl apple-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-[#0a84ff]/15 border border-[#0a84ff]/25 text-[#0a84ff] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate font-mono">
                {selectedFile.name}
              </p>
              <p className="text-[11px] text-white/50 mt-0.5 font-mono">
                {(selectedFile.size / 1024).toFixed(1)} KB • Ready for deep multi-engine inspection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
              className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/[0.1] transition-colors"
              title="Remove File"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleAnalyzeClick}
              disabled={isLoading}
              className="apple-btn-primary px-5 py-2 text-xs flex items-center gap-2 font-medium"
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
