import React, { useState, useRef } from "react";
import { UploadCloud, FileCheck, AlertCircle, FileText } from "lucide-react";

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
      setErrorMessage(`Invalid file format: '${ext}'. Only standard RFC .eml files are accepted.`);
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
        <div className="p-3 bg-[#ef4444]/15 border border-[#ef4444]/40 rounded text-xs font-mono text-[#ef4444] flex items-center gap-2">
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
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-[#f8fafc] bg-[#161f2e]"
            : "border-[#1e293b] bg-[#0b0f17] hover:border-[#334155] hover:bg-[#121824]"
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
          <div className="p-3 rounded-full bg-[#121824] border border-[#1e293b] text-[#94a3b8]">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold font-mono text-[#f8fafc]">
              Drag & drop an .EML file here, or browse
            </p>
            <p className="text-xs text-[#64748b] font-mono mt-1">
              Supports RFC 822 / 5322 .eml messages (Max 15MB). Untrusted execution disabled.
            </p>
          </div>
        </div>
      </div>

      {/* Selected File Card */}
      {selectedFile && (
        <div className="p-4 rounded-lg bg-[#121824] border border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[#f8fafc]" />
            <div>
              <p className="text-xs font-semibold font-mono text-[#f8fafc]">
                {selectedFile.name}
              </p>
              <p className="text-[10px] font-mono text-[#64748b]">
                {(selectedFile.size / 1024).toFixed(1)} KB | Ready for passive parsing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAnalyzeClick}
            disabled={isLoading}
            className="px-4 py-2 rounded bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-xs font-mono font-semibold text-[#f8fafc] transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>{isLoading ? "Parsing & Inspecting..." : "Analyze .EML"}</span>
          </button>
        </div>
      )}
    </div>
  );
};
