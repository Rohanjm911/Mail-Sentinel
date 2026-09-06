import React from 'react';
import { Shield, Lock, Terminal, Eye } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-950/60 border border-blue-800 text-blue-400 rounded">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">MAIL SENTINEL</h1>
            <p className="text-xs font-mono text-blue-400 tracking-wide">
              INTELLIGENT EMAIL PHISHING DETECTION & THREAT ANALYSIS PLATFORM
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-300 mt-3 font-medium">
          Tagline: <span className="text-slate-100 font-semibold italic">"Detect the Threat. Protect the Inbox."</span>
        </p>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          Mail Sentinel is a production-grade cybersecurity application engineered for Security Operations Centers (SOC), incident responders, and enterprise email administrators. It analyzes raw emails and RFC 5322 <code className="text-slate-300">.eml</code> files to deliver deterministic, explainable risk scoring powered by local machine learning and multi-vector security heuristics.
        </p>
      </div>

      {/* Philosophy */}
      <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" />
          Core Engineering Philosophy
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded">
            <div className="text-xs font-semibold text-slate-200 mb-1">Explainability First</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every risk score is backed by granular technical findings, exact header evidence, matched regex heuristics, and top predictive n-gram tokens. No black-box scores.
            </p>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded">
            <div className="text-xs font-semibold text-slate-200 mb-1">100% Local Inference</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Email data is highly sensitive. Mail Sentinel uses an on-premises TF-IDF + Logistic Regression model with zero dependency on third-party generative AI APIs or data exfiltration.
            </p>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded">
            <div className="text-xs font-semibold text-slate-200 mb-1">Zero-Execution Sandbox</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Attachments are never executed, links are never fetched blindly, and email HTML is sanitized of JavaScript and dynamic scripts before analysis.
            </p>
          </div>
        </div>
      </div>

      {/* 6 Security Pillars */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-400" />
          The 6 Detection Pillars
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">1. Sender Analysis</span>
              <span className="text-[10px] font-mono text-slate-500">Origin Verification</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Validates RFC email syntax, extracts root domains, detects display-name impersonation (e.g. "PayPal Support &lt;attacker@gmail.com&gt;"), verifies Reply-To alignment, and checks for brand typosquatting.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">2. URL Analysis</span>
              <span className="text-[10px] font-mono text-slate-500">Passive Lexical Heuristics</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Extracts all plain-text and HTML href links. Identifies raw IP hostnames, punycode/IDN homoglyphs, suspicious TLDs (.top, .xyz, .buzz), credential-harvesting keywords in URL paths, and anchor text mismatches.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">3. Content & NLP</span>
              <span className="text-[10px] font-mono text-slate-500">Social Engineering Detection</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Synthesizes TF-IDF lexical frequency and rule-based psychological triggers including artificial urgency ("account suspended within 24 hours"), fear coercion, fake rewards, and password reset deception.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">4. Header & RFC Compliance</span>
              <span className="text-[10px] font-mono text-slate-500">MTA Chain Auditing</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Examines Received relay hops, Return-Path mismatches against the envelope From, missing Message-ID headers, and anomalous routing hops indicating spoofed relay pathways.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">5. Authentication Integrity</span>
              <span className="text-[10px] font-mono text-slate-500">SPF / DKIM / DMARC</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Parses Authentication-Results and Received-SPF headers to detect hard and soft authentication failures without generating synthetic assertions. Accurately labels missing telemetry as "Not Available".
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">6. Attachment Safety</span>
              <span className="text-[10px] font-mono text-slate-500">Binary Metadata Inspection</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Catalogs attachments without execution. Evaluates file size, MIME declarations, known dangerous executable formats (.exe, .scr, .vbs, .js), macro-enabled Office files (.docm, .xlsm), and double-extension obfuscation.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Specs */}
      <div className="bg-slate-900 border border-slate-800 rounded p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          Technical Stack
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded">
            <span className="text-slate-400 block text-[11px]">Backend API</span>
            <span className="font-semibold text-slate-200">FastAPI & Pydantic</span>
          </div>
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded">
            <span className="text-slate-400 block text-[11px]">Machine Learning</span>
            <span className="font-semibold text-slate-200">scikit-learn & Joblib</span>
          </div>
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded">
            <span className="text-slate-400 block text-[11px]">Frontend</span>
            <span className="font-semibold text-slate-200">React 19 & TypeScript</span>
          </div>
          <div className="p-2.5 bg-slate-950 border border-slate-800 rounded">
            <span className="text-slate-400 block text-[11px]">Styling</span>
            <span className="font-semibold text-slate-200">Tailwind CSS (No Gradients)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
