import React, { useState } from "react";
import { Send, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Sample Fill Buttons */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-[#0b0f17] border border-[#1e293b] rounded-md">
        <span className="text-[11px] font-mono text-[#94a3b8] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span>Quick Load Synthetic Samples:</span>
        </span>
        <button
          type="button"
          onClick={() => handleSampleClick("phish1")}
          className="px-2.5 py-1 rounded bg-[#121824] border border-[#ef4444]/30 text-[#ef4444] text-xs font-mono hover:bg-[#ef4444]/10 transition-colors"
        >
          PayPal Phish (Urgent + Link)
        </button>
        <button
          type="button"
          onClick={() => handleSampleClick("phish2")}
          className="px-2.5 py-1 rounded bg-[#121824] border border-[#f97316]/30 text-[#f97316] text-xs font-mono hover:bg-[#f97316]/10 transition-colors"
        >
          Invoice Scam (IP Host URL)
        </button>
        <button
          type="button"
          onClick={() => handleSampleClick("legit1")}
          className="px-2.5 py-1 rounded bg-[#121824] border border-[#10b981]/30 text-[#10b981] text-xs font-mono hover:bg-[#10b981]/10 transition-colors"
        >
          Legitimate Internal Email
        </button>
      </div>

      {validationError && (
        <div className="p-3 bg-[#ef4444]/15 border border-[#ef4444]/40 rounded text-xs font-mono text-[#ef4444]">
          {validationError}
        </div>
      )}

      {/* From & To Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-mono text-[#94a3b8]">
            From <span className="text-[#ef4444]">*</span>
          </label>
          <input
            type="text"
            value={fromAddress}
            onChange={(e) => setFromAddress(e.target.value)}
            placeholder="Security Team <security@example.com>"
            className="w-full px-3 py-2 bg-[#0b0f17] border border-[#1e293b] rounded text-xs font-mono text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-[#334155]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-mono text-[#94a3b8]">
            To (Recipient)
          </label>
          <input
            type="text"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="user@yourcompany.com"
            className="w-full px-3 py-2 bg-[#0b0f17] border border-[#1e293b] rounded text-xs font-mono text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-[#334155]"
          />
        </div>
      </div>

      {/* Reply-To Field */}
      <div className="space-y-1.5">
        <label className="block text-xs font-mono text-[#94a3b8]">
          Reply-To (Optional)
        </label>
        <input
          type="text"
          value={replyTo}
          onChange={(e) => setReplyTo(e.target.value)}
          placeholder="reply@another-domain.com"
          className="w-full px-3 py-2 bg-[#0b0f17] border border-[#1e293b] rounded text-xs font-mono text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-[#334155]"
        />
      </div>

      {/* Subject */}
      <div className="space-y-1.5">
        <label className="block text-xs font-mono text-[#94a3b8]">
          Subject <span className="text-[#ef4444]">*</span>
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Action Required: Verify Account Security"
          className="w-full px-3 py-2 bg-[#0b0f17] border border-[#1e293b] rounded text-xs font-mono text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-[#334155]"
        />
      </div>

      {/* Body */}
      <div className="space-y-1.5">
        <label className="block text-xs font-mono text-[#94a3b8]">
          Email Body (Plain Text or HTML) <span className="text-[#ef4444]">*</span>
        </label>
        <textarea
          rows={7}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Paste complete email message body here including hyperlinks..."
          className="w-full px-3 py-2 bg-[#0b0f17] border border-[#1e293b] rounded text-xs font-mono text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-[#334155] leading-relaxed"
        />
      </div>

      {/* Optional Raw Headers Dropdown */}
      <div className="border border-[#1e293b] rounded bg-[#0b0f17] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowHeaders(!showHeaders)}
          className="w-full px-3 py-2 flex items-center justify-between text-xs font-mono text-[#94a3b8] hover:text-[#f8fafc] transition-colors cursor-pointer"
        >
          <span>Optional Raw RFC Headers (Authentication-Results, Received, Return-Path)</span>
          {showHeaders ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {showHeaders && (
          <div className="p-3 border-t border-[#1e293b]">
            <textarea
              rows={4}
              value={rawHeaders}
              onChange={(e) => setRawHeaders(e.target.value)}
              placeholder="Received: from mail.server.com...&#10;Authentication-Results: spf=fail dkim=fail..."
              className="w-full p-2 bg-[#121824] border border-[#1e293b] rounded text-[11px] font-mono text-[#cbd5e1] placeholder-[#64748b] focus:outline-none focus:border-[#334155]"
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded bg-[#1e293b] hover:bg-[#334155] text-sm font-mono font-semibold text-[#f8fafc] border border-[#334155] flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>{isLoading ? "Running Threat Analysis..." : "Analyze Email"}</span>
        </button>
      </div>
    </form>
  );
};
