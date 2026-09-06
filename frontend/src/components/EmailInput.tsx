import React, { useState } from "react";
import { Send, Sparkles, ChevronDown, ChevronUp, AlertCircle, FileText, Mail } from "lucide-react";
import type { PasteScanPayload } from "../services/api";

interface EmailInputProps {
  onSubmit: (data: PasteScanPayload) => void;
  isLoading: boolean;
  onLoadSample: (sampleType: "phish1" | "phish2" | "legit1") => void;
}

export const EmailInput: React.FC<EmailInputProps> = ({
  onSubmit,
  isLoading,
  onLoadSample,
}) => {
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [rawHeaders, setRawHeaders] = useState("");
  const [showHeaders, setShowHeaders] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!fromAddress.trim()) {
      setValidationError("Sender ('From') address is required.");
      return;
    }
    if (!subject.trim()) {
      setValidationError("Subject line is required.");
      return;
    }
    if (!body.trim()) {
      setValidationError("Email body content is required.");
      return;
    }

    onSubmit({
      from_address: fromAddress.trim(),
      to_address: toAddress.trim(),
      reply_to: replyTo.trim() || undefined,
      subject: subject.trim(),
      body: body.trim(),
      raw_headers: rawHeaders.trim() || undefined,
    });
  };

  const handleSampleClick = (type: "phish1" | "phish2" | "legit1") => {
    setValidationError(null);
    onLoadSample(type);
    if (type === "phish1") {
      setFromAddress("PayPal Support Services <service-security@paypal-auth-verify.xyz>");
      setToAddress("target-employee@enterprise.corp");
      setReplyTo("credential-collector@protonmail.com");
      setSubject("URGENT: Your account access has been restricted");
      setBody(
        "Dear Customer,\n\nWe detected suspicious logins from an unrecognized IP address. To safeguard your balance, access has been temporarily limited.\n\nYou must confirm your credentials immediately by navigating to our secure verification gateway: http://paypal-auth-verify.xyz/login?account=verify-id-99812\n\nFailure to resolve this within 24 hours will lead to permanent account suspension.\n\nSincerely,\nPayPal Fraud Defense Team"
      );
    } else if (type === "phish2") {
      setFromAddress("Corporate Accounts <billing@vendor-system-invoices.top>");
      setToAddress("finance@company.com");
      setReplyTo("");
      setSubject("Overdue Invoice #INV-92813 - Immediate Action Required");
      setBody(
        "Attached is the remittance advice for invoice #INV-92813. Please verify the payment details immediately to prevent service termination.\n\nReview the document here: http://192.168.1.105:8080/portal/download?invoice=92813\n\nThank you,\nAccounts Receivable"
      );
    } else {
      setFromAddress("Engineering Lead <alex.miller@internal-domain.com>");
      setToAddress("team@internal-domain.com");
      setReplyTo("");
      setSubject("Sprint 42 Retrospective and Release Schedule");
      setBody(
        "Hi Team,\n\nThanks for everyone's hard work during yesterday's deployment. Please take a look at the release notes and meeting agenda for our team retrospective tomorrow at 2 PM.\n\nDocumentation is updated in the internal wiki.\n\nBest regards,\nAlex"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Sample Load Buttons */}
      <div className="p-3.5 bg-[#0a0f1d] border border-[#1e2d4a] rounded-xl flex flex-wrap items-center justify-between gap-2.5">
        <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5 font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>LOAD REALISTIC SYNTHETIC SAMPLES:</span>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleSampleClick("phish1")}
            className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-medium hover:bg-red-500/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span>PayPal Phish (Urgent + Link)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSampleClick("phish2")}
            className="px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-medium hover:bg-orange-500/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            <span>Invoice Scam (IP Host URL)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSampleClick("legit1")}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium hover:bg-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Routine Business Email</span>
          </button>
        </div>
      </div>

      {validationError && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-mono text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* From & To Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            From (Sender Address) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              placeholder="Display Name <sender@example.com>"
              className="w-full pl-9 pr-3 py-2.5 bg-[#0a0f1d] border border-[#1e2d4a] rounded-xl text-xs font-mono text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/30 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            To (Recipient Address)
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="target.user@company.com"
              className="w-full pl-9 pr-3 py-2.5 bg-[#0a0f1d] border border-[#1e2d4a] rounded-xl text-xs font-mono text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/30 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Reply-To Field */}
      <div className="space-y-1.5">
        <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
          Reply-To (Optional Header)
        </label>
        <input
          type="text"
          value={replyTo}
          onChange={(e) => setReplyTo(e.target.value)}
          placeholder="reply@another-domain.com (Leave empty if identical to From)"
          className="w-full px-3 py-2.5 bg-[#0a0f1d] border border-[#1e2d4a] rounded-xl text-xs font-mono text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/30 transition-all"
        />
      </div>

      {/* Subject Line */}
      <div className="space-y-1.5">
        <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
          Email Subject <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Action Required: Confirm Identity / Urgent Notification"
            className="w-full pl-9 pr-3 py-2.5 bg-[#0a0f1d] border border-[#1e2d4a] rounded-xl text-xs font-mono text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/30 transition-all"
          />
        </div>
      </div>

      {/* Body Content */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            Email Body (Plain Text or HTML) <span className="text-red-400">*</span>
          </label>
          <span className="text-[10px] font-mono text-slate-400">
            {body.length} characters
          </span>
        </div>
        <textarea
          rows={7}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Paste complete email message body here including hyperlinks, sign-offs, and disclaimer text..."
          className="w-full p-3 bg-[#0a0f1d] border border-[#1e2d4a] rounded-xl text-xs font-mono text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/30 transition-all leading-relaxed"
        />
      </div>

      {/* Optional Raw Headers Dropdown */}
      <div className="border border-[#1e2d4a] rounded-xl bg-[#0a0f1d] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowHeaders(!showHeaders)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <span>Optional Raw RFC Headers (Authentication-Results, Received, Return-Path)</span>
          {showHeaders ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showHeaders && (
          <div className="p-3.5 border-t border-[#1e2d4a] bg-[#070b14]">
            <textarea
              rows={4}
              value={rawHeaders}
              onChange={(e) => setRawHeaders(e.target.value)}
              placeholder="Received: from mail.server.com...&#10;Authentication-Results: spf=fail dkim=fail dmarc=fail..."
              className="w-full p-2.5 bg-[#0d1424] border border-[#1e2d4a] rounded-lg text-[11px] font-mono text-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500/60"
            />
          </div>
        )}
      </div>

      {/* Primary Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold shadow-md border border-sky-400/40 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{isLoading ? "Running Forensic Threat Analysis..." : "Scan Email for Phishing Threats"}</span>
        </button>
      </div>
    </form>
  );
};
