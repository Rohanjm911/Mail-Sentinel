import React from "react";
import { Lock, Terminal, Eye, ShieldCheck, Globe, Cpu, FileText, Key, Paperclip } from "lucide-react";

export const About: React.FC = () => {
  const pillars = [
    {
      title: "1. Sender Integrity",
      sub: "Origin Verification",
      desc: "Validates RFC email syntax, extracts root domains, detects display-name impersonation (e.g. 'PayPal Support <attacker@gmail.com>'), verifies Reply-To alignment, and checks for typosquatting.",
      icon: Key,
      tint: "bg-[#bf5af2]/15 text-[#bf5af2] border-[#bf5af2]/30",
    },
    {
      title: "2. URL Reputation",
      sub: "Passive Lexical Heuristics",
      desc: "Extracts all plain-text and HTML href links. Identifies raw IP hostnames, punycode/IDN homoglyphs, suspicious TLDs (.top, .xyz, .buzz), credential-harvesting keywords in URL paths, and anchor text mismatches.",
      icon: Globe,
      tint: "bg-[#0a84ff]/15 text-[#0a84ff] border-[#0a84ff]/30",
    },
    {
      title: "3. Content & Social Engineering",
      sub: "Cognitive Lure Analysis",
      desc: "Synthesizes TF-IDF lexical frequency and rule-based psychological triggers including artificial urgency ('account suspended within 24 hours'), fear coercion, fake rewards, and password reset deception.",
      icon: Cpu,
      tint: "bg-[#ff9f0a]/15 text-[#ff9f0a] border-[#ff9f0a]/30",
    },
    {
      title: "4. Header & RFC Compliance",
      sub: "MTA Chain Auditing",
      desc: "Examines Received relay hops, Return-Path mismatches against the envelope From, missing Message-ID headers, and anomalous routing hops indicating spoofed relay pathways.",
      icon: FileText,
      tint: "bg-[#5e5ce6]/15 text-[#5e5ce6] border-[#5e5ce6]/30",
    },
    {
      title: "5. Authentication Integrity",
      sub: "SPF / DKIM / DMARC",
      desc: "Parses Authentication-Results and Received-SPF headers to detect hard and soft authentication failures without generating synthetic assertions. Accurately labels missing telemetry as 'Not Available'.",
      icon: ShieldCheck,
      tint: "bg-[#30d158]/15 text-[#30d158] border-[#30d158]/30",
    },
    {
      title: "6. Attachment Safety",
      sub: "Sandboxed Metadata Inspection",
      desc: "Catalogs attachments without execution. Evaluates file size, MIME declarations, known dangerous executable formats (.exe, .scr, .vbs, .js), macro-enabled Office files (.docm, .xlsm), and double-extension obfuscation.",
      icon: Paperclip,
      tint: "bg-[#ff453a]/15 text-[#ff453a] border-[#ff453a]/30",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:px-8 space-y-8">
      {/* Apple Header */}
      <div className="border-b border-white/[0.08] pb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 rounded-3xl bg-white/[0.05] border border-white/[0.12] flex items-center justify-center p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] shrink-0">
            <img src="/logo.png" alt="Mail Sentinel Logo" className="w-full h-full object-contain drop-shadow-[0_2px_10px_rgba(10,132,255,0.4)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Mail Sentinel</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] border border-white/[0.1] text-white/70 font-medium">
                SOC Edition
              </span>
            </div>
            <p className="text-xs text-[#0a84ff] font-medium tracking-wide mt-0.5">
              Intelligent Email Phishing Detection & Threat Analysis Platform
            </p>
          </div>
        </div>
        <p className="text-sm text-white/80 font-medium">
          Mission: <span className="text-white font-semibold italic">"Detect the Threat. Protect the Inbox."</span>
        </p>
        <p className="text-xs text-white/50 mt-2 leading-relaxed font-normal">
          Mail Sentinel is a production-grade cybersecurity application engineered for Security Operations Centers (SOC), incident responders, and enterprise email administrators. It analyzes raw emails and RFC 5322 <code className="text-white/80 font-mono bg-white/[0.06] px-1.5 py-0.5 rounded">.eml</code> files to deliver deterministic, explainable risk scoring powered by local machine learning and multi-vector security heuristics.
        </p>
      </div>

      {/* Core Philosophy (Apple Cards) */}
      <div className="apple-card p-6 md:p-7 space-y-4">
        <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#30d158]" />
          <span>Core Engineering Philosophy</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl space-y-1.5">
            <div className="text-xs font-semibold text-white">Explainability First</div>
            <p className="text-[11px] text-white/50 leading-relaxed font-normal">
              Every risk score is backed by granular technical findings, exact header evidence, matched regex heuristics, and top predictive tokens.
            </p>
          </div>
          <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl space-y-1.5">
            <div className="text-xs font-semibold text-white">100% Local Inference</div>
            <p className="text-[11px] text-white/50 leading-relaxed font-normal">
              Email data is highly confidential. Mail Sentinel uses an on-premises TF-IDF + Logistic Regression model with zero dependency on external generative AI APIs.
            </p>
          </div>
          <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl space-y-1.5">
            <div className="text-xs font-semibold text-white">Zero-Execution Sandbox</div>
            <p className="text-[11px] text-white/50 leading-relaxed font-normal">
              Attachments are never executed, links are never fetched blindly, and email HTML is sanitized of scripts before forensic inspection.
            </p>
          </div>
        </div>
      </div>

      {/* 6 Security Pillars */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#0a84ff]" />
          <span>The 6 Detection Pillars</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div key={idx} className="apple-card p-5 space-y-2.5 transition-all hover:scale-[1.01]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl border ${pillar.tint}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-white">{pillar.title}</span>
                  </div>
                  <span className="text-[10px] text-white/40 font-mono">{pillar.sub}</span>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed font-normal">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="apple-card p-6 md:p-7 space-y-4">
        <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#64d2ff]" />
          <span>Technical Stack Specifications</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <span className="text-white/40 block text-[10px] uppercase font-medium">Backend API</span>
            <span className="font-semibold text-white font-mono mt-0.5 block">FastAPI & Pydantic</span>
          </div>
          <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <span className="text-white/40 block text-[10px] uppercase font-medium">Machine Learning</span>
            <span className="font-semibold text-white font-mono mt-0.5 block">scikit-learn & Joblib</span>
          </div>
          <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <span className="text-white/40 block text-[10px] uppercase font-medium">Frontend Framework</span>
            <span className="font-semibold text-white font-mono mt-0.5 block">React 19 & Vite</span>
          </div>
          <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <span className="text-white/40 block text-[10px] uppercase font-medium">Design Language</span>
            <span className="font-semibold text-white font-mono mt-0.5 block">Apple Dark Frosted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
