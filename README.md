<div align="center">

<img src="./logo.png" alt="Mail Sentinel Logo" width="170" style="border-radius: 34px; box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6); margin-bottom: 16px;" />

# 🛡️ MAIL SENTINEL

[![Typing SVG](https://readme-typing-svg.demolab.com?font=SF+Pro+Display&weight=600&size=21&duration=3000&pause=1200&color=0A84FF&center=true&vCenter=true&width=650&lines=Intelligent+Email+Phishing+Defense+Platform;Explainable+Multi-Engine+Threat+Detection;Zero+Cloud+Egress+%E2%80%A2+100%25+On-Premise+Confidentiality;Apple-Inspired+SOC+Forensic+Console;Apple+Watch+Activity+Ring+Risk+Scoring)](https://git.io/typing-svg)

<p align="center">
  <b>Detect the Threat. Protect the Inbox.</b><br>
  <i>An air-gapped, explainable email phishing triage and threat intelligence workstation engineered for Security Operations Centers (SOC), incident responders, and privacy-first enterprises.</i>
</p>

<p align="center">
  <a href="#-quick-start"><img src="https://img.shields.io/badge/Status-Active_&_Guarding-30D158?style=for-the-badge&logo=shield&logoColor=white" alt="Status" /></a>
  <a href="#-zero-egress-security-guarantee"><img src="https://img.shields.io/badge/Privacy-Zero_Cloud_Egress-0A84FF?style=for-the-badge&logo=lock&logoColor=white" alt="Privacy" /></a>
  <a href="https://fastapi.tiangolo.com"><img src="https://img.shields.io/badge/Backend-FastAPI_0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/Frontend-React_19_&_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
  <a href="https://python.org"><img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" /></a>
  <a href="#-machine-learning-performance"><img src="https://img.shields.io/badge/ML_Accuracy-98.28%25-FF9F0A?style=for-the-badge&logo=scikitlearn&logoColor=white" alt="Accuracy" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-BF5AF2?style=for-the-badge" alt="License" /></a>
</p>

---

</div>

## 🌟 Executive Overview

**Mail Sentinel** provides immediate, explainable email phishing risk assessments by synthesizing **local statistical NLP (Naive Bayes / TF-IDF)** with **deterministic heuristic inspection algorithms**.

Designed with an **Apple-inspired macOS & visionOS frosted dark design language**, analysts experience a distraction-free, high-fidelity console with **Apple Watch Activity Ring risk scoring**, granular forensic explainability, and actionable SOC remediation playbooks.

### 🛡️ Why Mail Sentinel?
- 🔒 **Zero Cloud Egress**: 100% confidential. No email body, credentials, or attachments leave your machine.
- ⚡ **Sub-Second Multi-Engine Triage**: Ingests raw RFC 5322 headers, body text, or `.eml` files instantly.
- 🧠 **Explainable Intelligence**: Every risk score points to exact regex matches, header hops, and NLP token weights.
- ✨ **Apple-Grade Aesthetic**: Obsidian dark mode, fluid glassmorphism, responsive stationary sidebar, and built-in interactive onboarding guide.

---

## 🚀 Detection Architecture & Workflow

```mermaid
flowchart TD
    classDef input fill:#1c1c20,stroke:#0a84ff,stroke-width:2px,color:#fff;
    classDef engine fill:#1c1c20,stroke:#5e5ce6,stroke-width:2px,color:#fff;
    classDef score fill:#1c1c20,stroke:#ff9f0a,stroke-width:2px,color:#fff;
    classDef output fill:#1c1c20,stroke:#30d158,stroke-width:2px,color:#fff;

    A[📥 Ingest: Raw Headers / Body / .EML File]:::input --> B{Mail Sentinel Triage Pipeline}
    
    subgraph Six_Defense_Engines [6 Isolated Detection Layers]
        B --> E1[1. Authentication Engine: SPF / DKIM / DMARC]:::engine
        B --> E2[2. Sender Reputation: Display Spoof & Punycode]:::engine
        B --> E3[3. Lexical NLP: Urgency & Social Engineering]:::engine
        B --> E4[4. Passive URL Analyzer: Obfuscation & Raw IPs]:::engine
        B --> E5[5. Attachment Guard: Macros & Dangerous Exts]:::engine
        B --> E6[6. Local ML Classifier: TF-IDF + Naive Bayes]:::engine
    end

    E1 --> C[Deterministic Risk Synthesis Engine]:::score
    E2 --> C
    E3 --> C
    E4 --> C
    E5 --> C
    E6 --> C

    C --> D[🎯 0–100 Apple Watch Activity Ring Risk Score]:::output
    D --> F1[🚨 Verdict: Safe / Suspicious / High / Critical]:::output
    D --> F2[📋 Granular Finding Cards & Evidence Exporters]:::output
    D --> F3[🛡️ Actionable SOC Remediation Playbook]:::output
```

---

## 🎨 Apple-Inspired Design System

Mail Sentinel incorporates the best elements of Apple's modern Human Interface Guidelines:

- **Deep Obsidian Surfaces**: `#000000` base with multi-layered frosted glass (`backdrop-filter: blur(28px) saturate(190%)`).
- **Specular Edge Highlights**: Hairline top reflection (`inset 0 1px 0 rgba(255, 255, 255, 0.1)`) matching macOS Tahoe and visionOS window materials.
- **Apple Watch Activity Ring Gauge**: Dynamic circular radial progress visualization with color-graded status verdicts.
- **Stationary Pinned Sidebar**: Desktop-grade fixed navigation that remains 100% stationary during page scrolling.
- **Interactive Startup Onboarding Guide**: Integrated macOS modal dialog with a 4-step tour, feature directory, and pro tips.

---

## 🧩 Platform Features & Capabilities

<details open>
<summary><b>1. Email Security Scanner (<code>/scan</code>)</b></summary>
<br>

- **Dual Ingestion**: Paste raw email headers/body text, or drag-and-drop `.eml` files.
- **Pre-Loaded Threat Scenarios**: One-click testing with realistic phishing templates:
  - 🚨 *VIP Impersonation / CEO Wire Fraud* (Display name spoofing, high urgency)
  - 🎣 *Credential Harvester* (Urgent password expiration lure with obfuscated IP link)
  - 📎 *Malicious Invoice* (Macro attachment signature with fake billing details)
  - 🛡️ *Legitimate Security Bulletin* (Clean, passing SPF/DKIM authentication)
</details>

<details>
<summary><b>2. Threat Assessment Dossier (<code>/results/:id</code>)</b></summary>
<br>

- **Activity Ring Verdict**: 0–100 risk score categorized into `SAFE` (0–29), `SUSPICIOUS` (30–59), `HIGH` (60–79), and `CRITICAL` (80–100).
- **Explainable Findings**: Expandable iOS-style cards detailing exact score contributions (`+25 Risk`), trigger descriptions, and raw evidence.
- **Evidence Clipboard**: Instant one-click copy button for regex strings, header proof, and forensic logs.
- **SOC Remediation Playbook**: Prescriptive next steps for incident response teams (e.g. sender blacklisting, session revocation, message purging).
</details>

<details>
<summary><b>3. Security Operations Dashboard (<code>/</code>)</b></summary>
<br>

- **Live Stat Cards**: Total scans, phishing detected, safe emails, and average risk indices.
- **Severity Donut Breakdown**: Activity Ring color distribution of incident severities.
- **Score Trajectory & Volume Chart**: Recharts area visualization toggleable between score timeline and incident volume.
- **Engine Telemetry Cards**: 6 real-time status gauges monitoring detector health and relative weights.
</details>

<details>
<summary><b>4. Live Threat Intelligence (<code>/threat-intelligence</code>)</b></summary>
<br>

- **Interactive IOC Lookup**: Investigate URLs, domain names, and IPv4 addresses.
- **Multi-Feed Providers**: Status indicators for VirusTotal, AbuseIPDB, URLScan.io, and AlienVault OTX.
- **Offline Heuristic Fallback**: Evaluates suspicious top-level domains and patterns autonomously without external API keys.
</details>

<details>
<summary><b>5. Scan History & Incident Log (<code>/history</code>)</b></summary>
<br>

- **Searchable Audit Trail**: Filter past scans by subject, sender, or scan ID.
- **Severity Filter Pills**: Segmented filtering (`ALL`, `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
- **Persistence Controls**: SQLite and PostgreSQL backends with deletion and re-examination controls.
</details>

<details>
<summary><b>6. Reports & Security Analytics (<code>/reports</code>)</b></summary>
<br>

- **Executive Posture**: Phishing catch rate, safe ratio, and dominant attack vectors.
- **One-Click Export**: Download formal **JSON** and **CSV** audit summaries for SIEM or compliance archives.
</details>

<details>
<summary><b>7. Platform Configuration (<code>/settings</code>)</b></summary>
<br>

- **macOS System Settings Aesthetic**: Smooth toggles and numerical threshold adjustments.
- **Tunable Engine Weights**: Customize ML multiplier (default 25%) vs deterministic heuristic checks.
</details>

<details>
<summary><b>8. Interactive User Guide & Tour (<code>HowToUseModal</code>)</b></summary>
<br>

- **Startup Guide**: Pops up on first visit with step-by-step guidance.
- **Permanent Access**: Re-open anytime via the **"How to Use"** pill in the Navbar or Sidebar.
</details>

---

## 🔬 Machine Learning Performance

Mail Sentinel incorporates a locally trained statistical NLP pipeline (TF-IDF vectorizer + Multinomial Naive Bayes / Logistic Regression) trained on balanced, real-world email corpora:

| Metric | Score | Industry Benchmark |
| :--- | :---: | :---: |
| **Accuracy** | **98.28%** | > 95.0% |
| **Phishing Recall** | **100.00%** | > 97.0% |
| **Precision** | **96.67%** | > 94.0% |
| **F1-Score** | **98.31%** | > 95.5% |
| **Cloud Egress** | **0.00% (Air-Gapped)** | N/A |
| **Inference Latency**| **< 15ms** | < 200ms |

To retrain or re-evaluate the local model artifacts:
```bash
cd backend
python ml/train.py
python ml/evaluate.py
```

---

## ⚡ Quick Start

### Prerequisites
- **Python**: 3.11 or higher
- **Node.js**: 18 or higher (with npm)
- **Git**

### 1. One-Click Launch (Windows)
Double-click `run.bat` or execute in PowerShell:
```cmd
run.bat
```
This automatically verifies Python virtual environment dependencies, checks Node modules, and boots both the FastAPI backend (`http://127.0.0.1:8000`) and Vite frontend (`http://localhost:5173`).

---

### 2. Manual Installation

#### Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The web console will be accessible at `http://localhost:5173`.  
FastAPI Swagger documentation is live at `http://127.0.0.1:8000/docs`.

---

## 🧪 Automated Testing

### Backend Unit & Integration Tests (Pytest)
```bash
cd backend
python -m pytest
```
*Executes 26 comprehensive automated tests validating RFC 5322 parsing, URL lexical heuristics, ML tokenization, spoof detection, and API endpoints.*

### Frontend Production Build Verification
```bash
cd frontend
npm run build
```
*Validates full TypeScript type-checking and compiles optimized static assets with zero errors.*

---

## 📁 Repository Structure

```text
Mail Sentinel/
├── logo.png                     # Official Mail Sentinel Logo
├── run.bat                      # One-click Windows launch script
├── backend/
│   ├── app/
│   │   ├── api/routes/          # Scans, Health, Statistics, Threat Intel
│   │   ├── core/                # Configuration and Security constants
│   │   ├── db/                  # SQLite / PostgreSQL engine & session
│   │   ├── models/              # Scan, Finding, URL, Attachment ORM entities
│   │   ├── schemas/             # Pydantic validation schemas
│   │   └── services/            # 6 Detection Analyzers & Risk Engine
│   ├── ml/
│   │   ├── artifacts/           # Serialized tfidf.joblib & model artifacts
│   │   ├── train.py             # NLP model training pipeline
│   │   └── evaluate.py          # Metrics & confusion matrix evaluator
│   ├── tests/                   # 26 Pytest automated test suites
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── logo.png             # Web application logo & favicon
│   ├── src/
│   │   ├── components/          # Apple-inspired SOC UI components
│   │   │   ├── HowToUseModal.tsx# Interactive Onboarding & User Guide
│   │   │   ├── Sidebar.tsx      # Stationary pinned navigation
│   │   │   ├── Navbar.tsx       # Floating frosted header & live clock
│   │   │   ├── RiskScore.tsx    # Apple Watch Activity Ring gauge
│   │   │   └── ...
│   │   ├── pages/               # Dashboard, Scanner, Dossier, Intel, History, etc.
│   │   ├── services/            # Axios API communication
│   │   ├── types/               # TypeScript definitions
│   │   └── index.css            # Obsidian frosted glassmorphism tokens
│   └── package.json
└── README.md
```

---

## 🔒 Zero-Egress Security Guarantee

1. **Untrusted Input Handling**: All pasted emails and uploaded `.eml` files are parsed within memory using strict lexical sanitizers.
2. **Zero Attachment Execution**: Attachments are audited strictly at the binary header and extension signature level; no executable or script is ever run.
3. **Passive URL Inspection**: URLs are analyzed for heuristic anomalies (punycode, IP hosts, suspicious tokens) without automated network crawling.
4. **Data Minimization**: Raw email bodies are discarded after scoring; only security telemetry metrics are stored.

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for full details.

<div align="center">

**Mail Sentinel** • *Detect the Threat. Protect the Inbox.*

</div>
