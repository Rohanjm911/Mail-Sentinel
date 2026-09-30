import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  SearchCheck,
  LayoutDashboard,
  Radio,
  History,
  FileBarChart,
  Settings,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ExternalLink,
  Lock,
  Cpu,
  Mail,
  FileCode,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeatureItem {
  id: string;
  title: string;
  subtitle: string;
  route?: string;
  icon: React.ElementType;
  tint: string;
  colorHex: string;
  summary: string;
  howToUse: string[];
  proTip: string;
  keyHighlights: string[];
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"features" | "tour" | "engines" | "tips">("features");
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>("scanner");
  const [tourStep, setTourStep] = useState<number>(0);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, dontShowAgain]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem("mail_sentinel_guide_seen", "true");
    }
    onClose();
  };

  const handleNavigate = (route: string) => {
    handleDismiss();
    navigate(route);
  };

  const features: FeatureItem[] = [
    {
      id: "scanner",
      title: "Email Security Scanner",
      subtitle: "Analyze raw email headers, body text, or standard .eml files",
      route: "/scan",
      icon: SearchCheck,
      tint: "bg-[#0a84ff]/15 text-[#0a84ff] border-[#0a84ff]/30",
      colorHex: "#0a84ff",
      summary:
        "The core triage workstation. Evaluates email authenticity, sender reputation, lexical deception, embedded links, and payload attachments.",
      howToUse: [
        "Select either 'Manual Input (Raw Headers & Body)' or 'Upload .EML File'.",
        "Or pick a pre-built sample scenario (e.g. VIP Wire Impersonation, Credential Harvest, Macro Attachment) for immediate one-click testing.",
        "Enter From address, Subject, and email body text.",
        "Click 'Execute Deep Security Scan' to trigger the 6-pillar inspection pipeline.",
      ],
      proTip:
        "Including raw headers (Authentication-Results, Received-SPF, DKIM-Signature) enables 100% accurate SPF/DKIM/DMARC cryptographical verification.",
      keyHighlights: [
        "Multi-format ingestion (.EML / RFC 822 and plain text)",
        "Pre-configured realistic threat templates",
        "Sub-second analysis with zero external cloud egress",
      ],
    },
    {
      id: "results",
      title: "Threat Dossier & Explainability",
      subtitle: "Forensic breakdown with Apple Watch Activity Ring risk gauge",
      route: "/results/demo-scan",
      icon: ShieldCheck,
      tint: "bg-[#ff453a]/15 text-[#ff453a] border-[#ff453a]/30",
      colorHex: "#ff453a",
      summary:
        "Comprehensive forensic assessment with complete explainability, score deltas, and actionable SOC remediation playbooks.",
      howToUse: [
        "View the 0–100 Apple Watch Activity Ring showing the consolidated risk score (Safe, Suspicious, High, Critical).",
        "Review the 6-Engine Telemetry cards showing score contributions from each defense layer.",
        "Expand each Finding Category accordion (Authentication, Sender Domain, Lexical Triggers, Suspicious URLs, Attachments).",
        "Use the 'Copy Evidence' button next to any finding to copy regex matches and header proof for incident reports.",
        "Follow the SOC Remediation Recommendations at the bottom to neutralize the threat.",
      ],
      proTip:
        "Scores of 80+ indicate critical threats requiring immediate host isolation and mailbox purges.",
      keyHighlights: [
        "Deterministic + ML hybrid scoring logic",
        "Instant one-click clipboard evidence export",
        "Interactive SOC remediation guidance",
      ],
    },
    {
      id: "dashboard",
      title: "Security Operations Dashboard",
      subtitle: "Live security posture, threat trends, and detection metrics",
      route: "/",
      icon: LayoutDashboard,
      tint: "bg-[#30d158]/15 text-[#30d158] border-[#30d158]/30",
      colorHex: "#30d158",
      summary:
        "High-level monitoring console summarizing all organizational email threats, severity breakdown, and detector activity.",
      howToUse: [
        "Monitor Stat Cards: Total Scans, Phishing Detected, Safe Emails, and Average Risk Index.",
        "Interact with the Severity Breakdown Donut Chart to visualize threat distribution.",
        "Switch between 'Score Trajectory' and 'Severity Volume' in the Apple-styled trend chart.",
        "Inspect the 6 Core Engine status meters in real-time.",
        "Click on any entry in the Recent Scans table to jump directly to its forensic dossier.",
      ],
      proTip:
        "The Dashboard dynamically pulls both real scans from your database and synthetic benchmarks for complete visibility.",
      keyHighlights: [
        "Interactive Apple Watch Donut & Area Charts",
        "Real-time local backend health monitoring",
        "Rapid triage table with direct links",
      ],
    },
    {
      id: "threat-intel",
      title: "Live Threat Intelligence (OSINT)",
      subtitle: "Reputational intelligence lookup for URLs, domains, and IPv4s",
      route: "/threat-intelligence",
      icon: Radio,
      tint: "bg-[#ff9f0a]/15 text-[#ff9f0a] border-[#ff9f0a]/30",
      colorHex: "#ff9f0a",
      summary:
        "Investigate suspicious indicators of compromise (IOCs) across external feeds or fallback offline reputation lists.",
      howToUse: [
        "Select indicator type: URL, Domain, or IP Address.",
        "Type or paste an indicator (or click any of the pre-loaded malicious samples).",
        "Click 'Analyze Indicator' to run multi-engine checks (VirusTotal, AbuseIPDB, URLScan, AlienVault OTX).",
        "Review the resulting verdict, confidence score, and associated threat categories.",
      ],
      proTip:
        "Works offline with built-in heuristic threat heuristics even without external API keys configured.",
      keyHighlights: [
        "One-click IOC preset testing",
        "Multi-provider aggregation and offline fallback",
        "Autonomous malicious pattern detection",
      ],
    },
    {
      id: "history",
      title: "Scan History & Incident Log",
      subtitle: "Searchable audit trail of all evaluated emails and outcomes",
      route: "/history",
      icon: History,
      tint: "bg-[#bf5af2]/15 text-[#bf5af2] border-[#bf5af2]/30",
      colorHex: "#bf5af2",
      summary:
        "Persistent audit ledger tracking every email analyzed, timestamps, sender addresses, verdicts, and severity tags.",
      howToUse: [
        "Filter results by severity pills: All, Critical, High, Medium, or Low.",
        "Use the instant search bar to find emails by subject, sender, or scan ID.",
        "Click any scan row to re-open its complete Threat Assessment Dossier.",
        "Purge individual records when no longer required for retention.",
      ],
      proTip:
        "Audit logs are saved locally in SQLite/JSON persistence, respecting data privacy and organizational retention policies.",
      keyHighlights: [
        "Instant client-side + server-side filtering",
        "Historical risk score trajectory badges",
        "Permanent audit trail with deletion controls",
      ],
    },
    {
      id: "reports",
      title: "Security Reports & Analytics",
      subtitle: "Executive summaries and exportable compliance dossiers",
      route: "/reports",
      icon: FileBarChart,
      tint: "bg-[#64d2ff]/15 text-[#64d2ff] border-[#64d2ff]/30",
      colorHex: "#64d2ff",
      summary:
        "Executive-grade reporting suite providing organizational risk metrics, threat vectors, and data exports.",
      howToUse: [
        "Review the Executive Summary scorecard: Phishing Catch Rate, Clean Ratio, and Dominant Attack Vectors.",
        "Inspect the Attack Vector Breakdown (Credential Harvesting, Financial Scams, Malware Payloads).",
        "Click 'Export Security Report (JSON)' or 'Download CSV Audit' to ingest data into SIEM or compliance archives.",
      ],
      proTip:
        "Use the export feature to generate compliance evidence for SOC 2 or ISO 27001 email security controls.",
      keyHighlights: [
        "Executive-level visual threat summaries",
        "JSON and CSV one-click reporting",
        "Continuous compliance metrics",
      ],
    },
    {
      id: "settings",
      title: "Platform Configuration",
      subtitle: "Fine-tune risk thresholds, ML weight, and detection engines",
      route: "/settings",
      icon: Settings,
      tint: "bg-white/[0.1] text-white/80 border-white/[0.15]",
      colorHex: "#ffffff",
      summary:
        "Customizable policy controls allowing SOC leads to tailor detection sensitivities to their organization's risk tolerance.",
      howToUse: [
        "Adjust Severity Thresholds (Low, Medium, High, Critical) using numerical step inputs.",
        "Fine-tune the Local ML Weight slider (default 25% ML, 75% Deterministic Rules).",
        "Toggle Passive URL inspection and external Threat Intel lookups.",
        "Set maximum upload file size boundaries for email attachments.",
        "Click 'Save Configuration' to persist platform settings.",
      ],
      proTip:
        "In high-security environments, increasing ML weight to 35-40% provides stricter detection against novel zero-day phrasing.",
      keyHighlights: [
        "macOS System Settings layout with animated switches",
        "Granular threshold sliders and weights",
        "Zero-cloud strict local enforcement mode",
      ],
    },
    {
      id: "egress",
      title: "Zero-Egress Security & Privacy",
      subtitle: "100% private, on-premise inspection with zero cloud leakage",
      route: "/about",
      icon: Lock,
      tint: "bg-[#30d158]/15 text-[#30d158] border-[#30d158]/30",
      colorHex: "#30d158",
      summary:
        "Mail Sentinel is engineered from the ground up for strict air-gapped environments, confidentiality, and GDPR/HIPAA compliance.",
      howToUse: [
        "No email contents, PII, recipient addresses, or attachments are ever transmitted to third-party AI APIs or cloud servers.",
        "All TF-IDF vectorization and Multinomial Naive Bayes classifications run locally in Python.",
        "Heuristic rule evaluation and authentication extraction occur entirely in-memory on your local instance.",
      ],
      proTip:
        "Verify privacy anytime via the 'Zero Cloud Egress' badge in the top navigation bar.",
      keyHighlights: [
        "Strict on-premise execution",
        "No API keys required for core phishing detection",
        "Complete enterprise confidentiality",
      ],
    },
  ];

  const tourSteps = [
    {
      step: 1,
      badge: "Step 1 of 4",
      title: "Ingest Email Data",
      desc: "Open the Scanner (/scan) and either paste raw headers and email body text, or simply drop a .eml file. You can also pick any of the 4 pre-built real-world test scenarios to immediately see detection in action.",
      icon: Mail,
      color: "#0a84ff",
      actionText: "Try the Scanner",
      actionRoute: "/scan",
    },
    {
      step: 2,
      badge: "Step 2 of 4",
      title: "Multi-Engine Deep Inspection",
      desc: "Click 'Execute Deep Security Scan'. Mail Sentinel coordinates 6 concurrent detection engines: SPF/DKIM verification, domain spoofing analysis, lexical heuristics, URL reputation, attachment safety, and local ML classification.",
      icon: Cpu,
      color: "#5e5ce6",
      actionText: "Explore Engine Specs",
      actionTab: "engines",
    },
    {
      step: 3,
      badge: "Step 3 of 4",
      title: "Analyze the Threat Dossier",
      desc: "Review your 0–100 Apple Watch Activity Ring score. Safe emails score 0–29, Suspicious 30–59, High Threat 60–79, and Critical Phishing 80–100. Expand accordions to inspect exact regex triggers, obfuscated links, and raw evidence.",
      icon: AlertTriangle,
      color: "#ff9f0a",
      actionText: "View Sample Dossier",
      actionRoute: "/results/sample-scan-1",
    },
    {
      step: 4,
      badge: "Step 4 of 4",
      title: "Incident Triage & Remediation",
      desc: "Follow the actionable SOC Remediation Playbook at the bottom of the dossier (block sender domain, revoke credentials, purge mailbox). All scans are automatically preserved in your local Scan History (/history) and Reports (/reports).",
      icon: CheckCircle2,
      color: "#30d158",
      actionText: "Go to Dashboard",
      actionRoute: "/",
    },
  ];

  const detectionEngines = [
    {
      name: "Authentication Engine",
      tag: "SPF / DKIM / DMARC",
      weight: "20%",
      desc: "Extracts Authentication-Results and Received-SPF headers to verify sender cryptographic legitimacy and detect spoofing bypasses.",
      icon: ShieldCheck,
      tint: "bg-[#0a84ff]/15 text-[#0a84ff] border-[#0a84ff]/25",
    },
    {
      name: "Sender Domain Reputation",
      tag: "Display Name Spoofing & Typo-Squatting",
      weight: "20%",
      desc: "Detects cousin domains (e.g. paypa1.com), lookalike Unicode punycode characters, and mismatch between display name and actual Return-Path.",
      icon: Mail,
      tint: "bg-[#5e5ce6]/15 text-[#5e5ce6] border-[#5e5ce6]/25",
    },
    {
      name: "Lexical & Social Engineering",
      tag: "Urgency, Coercion, Financial Lures",
      weight: "15%",
      desc: "Identifies psychological triggers, artificial urgency (e.g. 'Account suspended in 24 hours'), wire fraud requests, and sensitive credential prompts.",
      icon: AlertTriangle,
      tint: "bg-[#ff9f0a]/15 text-[#ff9f0a] border-[#ff9f0a]/25",
    },
    {
      name: "Passive URL & Link Analysis",
      tag: "Obfuscation, Raw IP, Brand Mimicry",
      weight: "15%",
      desc: "Parses all embedded links, analyzes URL structure, detects raw IPv4/IPv6 hosts, brand impersonation in subdomains, and URL shortener redirects.",
      icon: Radio,
      tint: "bg-[#bf5af2]/15 text-[#bf5af2] border-[#bf5af2]/25",
    },
    {
      name: "Attachment Analyzer",
      tag: "Executable & Macro Signatures",
      weight: "10%",
      desc: "Inspects file extensions, double extensions (.pdf.exe), high-risk archive types (.iso, .vbs, .hta), and office document macro warnings.",
      icon: FileCode,
      tint: "bg-[#64d2ff]/15 text-[#64d2ff] border-[#64d2ff]/25",
    },
    {
      name: "Local Machine Learning",
      tag: "TF-IDF + Naive Bayes Classifier",
      weight: "20%",
      desc: "Trained local statistical NLP model calculating empirical phishing vs legitimate probability on email body text with 0ms cloud latency.",
      icon: Cpu,
      tint: "bg-[#30d158]/15 text-[#30d158] border-[#30d158]/25",
    },
  ];

  const currentFeature = features.find((f) => f.id === selectedFeatureId) || features[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-2xl transition-all select-none">
      {/* Modal Dialog Window */}
      <div className="apple-modal-animate relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0e0e12]/95 border border-white/[0.14] shadow-[0_20px_70px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.18)] overflow-hidden">
        
        {/* macOS Style Window Topbar */}
        <div className="h-14 px-5 border-b border-white/[0.08] bg-white/[0.03] flex items-center justify-between shrink-0">
          {/* Traffic Light Dots */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDismiss}
              className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:brightness-110 cursor-pointer flex items-center justify-center group"
              title="Close Guide"
            >
              <X className="w-2 h-2 text-[#4a0002] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
            <div className="ml-3 flex items-center gap-2">
              <span className="text-xs font-semibold text-white tracking-tight">
                Mail Sentinel
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-white/60 font-mono">
                User Guide &amp; Tour
              </span>
            </div>
          </div>

          {/* Segmented Top Navigation Pills */}
          <div className="apple-segmented-container hidden sm:inline-flex">
            <button
              type="button"
              onClick={() => setActiveTab("features")}
              className={`px-3 py-1 text-xs font-medium transition-all ${
                activeTab === "features" ? "apple-segmented-item-active" : "text-white/60 hover:text-white"
              }`}
            >
              All Functions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tour")}
              className={`px-3 py-1 text-xs font-medium transition-all ${
                activeTab === "tour" ? "apple-segmented-item-active" : "text-white/60 hover:text-white"
              }`}
            >
              Quick Tour (4 Steps)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("engines")}
              className={`px-3 py-1 text-xs font-medium transition-all ${
                activeTab === "engines" ? "apple-segmented-item-active" : "text-white/60 hover:text-white"
              }`}
            >
              6 Defense Engines
            </button>
          </div>

          {/* Close Icon Button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Small Screen Segmented Tabs */}
        <div className="sm:hidden px-4 py-2 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="apple-segmented-container w-full justify-around">
            <button
              type="button"
              onClick={() => setActiveTab("features")}
              className={`flex-1 text-center py-1 text-[11px] font-medium transition-all ${
                activeTab === "features" ? "apple-segmented-item-active" : "text-white/60"
              }`}
            >
              Functions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tour")}
              className={`flex-1 text-center py-1 text-[11px] font-medium transition-all ${
                activeTab === "tour" ? "apple-segmented-item-active" : "text-white/60"
              }`}
            >
              Quick Tour
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("engines")}
              className={`flex-1 text-center py-1 text-[11px] font-medium transition-all ${
                activeTab === "engines" ? "apple-segmented-item-active" : "text-white/60"
              }`}
            >
              Engines
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0 p-5 md:p-6 space-y-6">
          
          {/* TAB 1: ALL FUNCTIONS (EXPLORER) */}
          {activeTab === "features" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Left Column: Feature Picker List */}
              <div className="md:col-span-4 space-y-1.5 pr-1 md:border-r md:border-white/[0.08]">
                <div className="px-2 pb-2 text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                  Platform Features ({features.length})
                </div>
                {features.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedFeatureId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedFeatureId(item.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white/[0.12] border border-white/[0.12] text-white shadow-sm"
                          : "text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 ${item.tint}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-medium tracking-tight truncate">
                            {item.title}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-white/30 shrink-0" />
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Selected Feature Details */}
              <div className="md:col-span-8 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  
                  {/* Feature Header */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-md ${currentFeature.tint}`}
                      >
                        <currentFeature.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white tracking-tight">
                          {currentFeature.title}
                        </h3>
                        <p className="text-xs text-white/50 mt-0.5">
                          {currentFeature.subtitle}
                        </p>
                      </div>
                    </div>

                    {currentFeature.route && (
                      <button
                        type="button"
                        onClick={() => handleNavigate(currentFeature.route!)}
                        className="apple-btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 cursor-pointer"
                      >
                        <span>Open Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-white/80 leading-relaxed font-normal">
                    {currentFeature.summary}
                  </p>

                  {/* Step by Step How to Use */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider text-white/60">
                      How to Use This Function:
                    </h4>
                    <div className="space-y-2">
                      {currentFeature.howToUse.map((step, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white/[0.025] border border-white/[0.06] flex items-start gap-2.5 text-xs text-white/70"
                        >
                          <span className="w-5 h-5 rounded-full bg-white/[0.08] text-white/80 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Highlights */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-white/60">
                      Key Highlights:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentFeature.keyHighlights.map((hl, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/80 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3 h-3 text-[#30d158]" />
                          <span>{hl}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pro Tip Box */}
                  <div className="p-3.5 rounded-2xl bg-[#0a84ff]/10 border border-[#0a84ff]/25 text-xs text-[#0a84ff] flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white">SOC Pro Tip: </span>
                      <span className="text-white/80">{currentFeature.proTip}</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: QUICK TOUR (4 STEP WIZARD) */}
          {activeTab === "tour" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              
              {/* Progress Indicator */}
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#0a84ff]/15 border border-[#0a84ff]/30 text-[#0a84ff]">
                    {tourSteps[tourStep].badge}
                  </span>
                  <span className="text-xs text-white/50">Guided Workflow</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {tourSteps.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setTourStep(i)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        tourStep === i
                          ? "w-6 bg-[#0a84ff]"
                          : "w-2 bg-white/20 hover:bg-white/40"
                      }`}
                      title={`Step ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Step Card */}
              {(() => {
                const s = tourSteps[tourStep];
                const StepIcon = s.icon;
                return (
                  <div className="apple-card p-6 md:p-8 space-y-6 text-center flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded-3xl border flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                      style={{
                        backgroundColor: `${s.color}15`,
                        borderColor: `${s.color}35`,
                        color: s.color,
                      }}
                    >
                      <StepIcon className="w-8 h-8" />
                    </div>

                    <div className="space-y-2 max-w-md">
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {s.title}
                      </h3>
                      <p className="text-xs text-white/60 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>

                    {s.actionRoute && (
                      <button
                        type="button"
                        onClick={() => handleNavigate(s.actionRoute!)}
                        className="apple-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-xs font-medium cursor-pointer"
                      >
                        <span>{s.actionText}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {s.actionTab && (
                      <button
                        type="button"
                        onClick={() => setActiveTab(s.actionTab as any)}
                        className="apple-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-xs font-medium cursor-pointer"
                      >
                        <span>{s.actionText}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* Tour Controls (Back / Next) */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setTourStep((prev) => Math.max(0, prev - 1))}
                  disabled={tourStep === 0}
                  className="apple-btn-secondary inline-flex items-center gap-1.5 px-4 py-2 text-xs disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {tourStep < tourSteps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setTourStep((prev) => Math.min(tourSteps.length - 1, prev + 1))}
                    className="apple-btn-primary inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleNavigate("/scan")}
                    className="apple-btn-primary inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium cursor-pointer"
                  >
                    <span>Start First Scan</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: THE 6 DEFENSE ENGINES */}
          {activeTab === "engines" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    Deterministic &amp; ML Multi-Pillar Architecture
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    Mail Sentinel evaluates every email through 6 isolated algorithmic filters.
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#30d158]/15 border border-[#30d158]/30 text-[#30d158] font-bold">
                  Zero Cloud Egress
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {detectionEngines.map((engine, idx) => {
                  const Icon = engine.icon;
                  return (
                    <div
                      key={idx}
                      className="apple-card p-4 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-xl border ${engine.tint}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-white">
                                {engine.name}
                              </h4>
                              <span className="text-[10px] text-white/40 font-mono">
                                {engine.tag}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-white/70 font-semibold">
                            Weight: {engine.weight}
                          </span>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed font-normal">
                          {engine.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 px-6 border-t border-white/[0.08] bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          
          {/* Don't show again checkbox */}
          <label className="flex items-center gap-2 text-xs text-white/60 hover:text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded bg-white/[0.08] border-white/20 text-[#0a84ff] focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span>Don't show this guide automatically on startup</span>
          </label>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleDismiss}
              className="apple-btn-secondary px-4 py-2 text-xs font-medium cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => handleNavigate("/scan")}
              className="apple-btn-primary px-5 py-2 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Get Started</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
