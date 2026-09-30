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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Apple Sample Preset Pills */}
      <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-white/50 flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#ffd60a]" />
          <span>Quick Sample Scenarios:</span>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleSampleClick("phish1")}
            className="px-3 py-1 rounded-full bg-[#ff453a]/10 border border-[#ff453a]/25 text-[#ff453a] text-xs font-medium hover:bg-[#ff453a]/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff453a]" />
            <span>PayPal Phish (Urgent Link)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSampleClick("phish2")}
            className="px-3 py-1 rounded-full bg-[#ff9f0a]/10 border border-[#ff9f0a]/25 text-[#ff9f0a] text-xs font-medium hover:bg-[#ff9f0a]/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff9f0a]" />
            <span>Invoice Scam (Raw IP Lure)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSampleClick("legit1")}
            className="px-3 py-1 rounded-full bg-[#30d158]/10 border border-[#30d158]/25 text-[#30d158] text-xs font-medium hover:bg-[#30d158]/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#30d158]" />
            <span>Routine Business Email</span>
          </button>
        </div>
      </div>

      {validationError && (
        <div className="p-3.5 bg-[#ff453a]/10 border border-[#ff453a]/30 rounded-2xl text-xs text-[#ff453a] flex items-center gap-2.5 backdrop-blur-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* From & To Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-white/60">
            From (Sender Address) <span className="text-[#ff453a]">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              placeholder="Display Name <sender@example.com>"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#0a84ff] focus:ring-4 focus:ring-[#0a84ff]/15 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-white/60">
            To (Recipient Address)
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="target.user@company.com"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#0a84ff] focus:ring-4 focus:ring-[#0a84ff]/15 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Reply-To Field */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-white/60">
          Reply-To (Optional Header)
        </label>
        <input
          type="text"
          value={replyTo}
          onChange={(e) => setReplyTo(e.target.value)}
          placeholder="reply@another-domain.com (Leave empty if identical to From)"
          className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#0a84ff] focus:ring-4 focus:ring-[#0a84ff]/15 transition-all"
        />
      </div>

      {/* Subject Line */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-white/60">
          Email Subject <span className="text-[#ff453a]">*</span>
        </label>
        <div className="relative">
          <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Action Required: Confirm Identity / Urgent Notification"
            className="w-full pl-10 pr-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#0a84ff] focus:ring-4 focus:ring-[#0a84ff]/15 transition-all"
          />
        </div>
      </div>

      {/* Body Content */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-white/60">
            Email Body Content <span className="text-[#ff453a]">*</span>
          </label>
          <span className="text-[11px] font-mono text-white/40">
            {body.length} characters
          </span>
        </div>
        <textarea
          rows={7}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Paste complete email message body here including hyperlinks, sign-offs, and disclaimer text..."
          className="w-full p-3.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#0a84ff] focus:ring-4 focus:ring-[#0a84ff]/15 transition-all leading-relaxed"
        />
      </div>

      {/* Optional Raw Headers Dropdown */}
      <div className="border border-white/[0.08] rounded-2xl bg-white/[0.02] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowHeaders(!showHeaders)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
        >
          <span>Optional Raw RFC Headers (Authentication-Results, Received, Return-Path)</span>
          {showHeaders ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showHeaders && (
          <div className="p-4 border-t border-white/[0.08] bg-black/30">
            <textarea
              rows={4}
              value={rawHeaders}
              onChange={(e) => setRawHeaders(e.target.value)}
              placeholder="Received: from mail.server.com...&#10;Authentication-Results: spf=fail dkim=fail dmarc=fail..."
              className="w-full p-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-[11px] font-mono text-white/80 placeholder-white/30 focus:outline-none focus:border-[#0a84ff]"
            />
          </div>
        )}
      </div>

      {/* Primary Apple Pill Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="apple-btn-primary w-full py-3.5 px-6 rounded-full text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{isLoading ? "Running Forensic Threat Analysis..." : "Scan Email for Phishing Threats"}</span>
        </button>
      </div>
    </form>
  );
};
