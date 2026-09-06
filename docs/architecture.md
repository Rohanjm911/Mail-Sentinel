# Mail Sentinel Architecture

## Overview
**Mail Sentinel** is an on-premises, intelligent email phishing detection and threat-analysis platform engineered for Security Operations Centers (SOC), incident responders, and enterprise mail environments.

> Tagline: **Detect the Threat. Protect the Inbox.**

The platform processes email inputs (either raw pasted content or standard RFC 5322 `.eml` files), extracts multi-pillar threat telemetry, executes local machine learning inference without third-party AI APIs, and synthesizes an explainable, deterministic risk score with technical evidence.

---

## High-Level System Architecture

```
                                  +---------------------------------------+
                                  |      User / Security Analyst          |
                                  +---------------------------------------+
                                                      |
                                             HTTP / REST (Vite)
                                                      v
                                  +---------------------------------------+
                                  |      Frontend: React + TypeScript     |
                                  |  - Tailwind CSS (Zero Gradients)      |
                                  |  - Recharts Visualizations            |
                                  |  - Lucide Cybersecurity Icons         |
                                  +---------------------------------------+
                                                      |
                                                Reverse Proxy
                                                      v
                                  +---------------------------------------+
                                  |         Backend: FastAPI Core         |
                                  |  - Pydantic Schema Validation         |
                                  |  - RESTful API Routing                |
                                  |  - PostgreSQL / SQLite Engine         |
                                  +---------------------------------------+
                                                      |
                                              Detection Pipeline
                                                      v
                    +-------------------------------------------------------------------+
                    |                          Email Parser                             |
                    |   - Safe RFC 5322 & MIME Processing                               |
                    |   - HTML Script Stripping / Sanitization                          |
                    |   - Attachment Cataloging (Zero Execution)                        |
                    +-------------------------------------------------------------------+
                                                      |
                   +----------------------------------+----------------------------------+
                   |                                                                     |
                   v                                                                     v
    +------------------------------+                                      +------------------------------+
    |     Local ML Classifier      |                                      |   Multi-Pillar Heuristics    |
    |  - TF-IDF Vectorizer         |                                      |  - Sender Analyzer           |
    |  - Logistic Regression Model |                                      |  - URL Analyzer (Passive)    |
    |  - Joblib Artifact Cache     |                                      |  - Content / NLP Triggers    |
    |  - Top N-gram Feature Evid.  |                                      |  - Header / Received Chains  |
    +------------------------------+                                      |  - Auth (SPF/DKIM/DMARC)     |
                   |                                                      |  - Attachment Risk Analysis  |
                   |                                                      +------------------------------+
                   +----------------------------------+----------------------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |          Deterministic Risk           |
                                  |             Scoring Engine            |
                                  |  - Weighted Multi-Vector Fusion       |
                                  |  - Severity: LOW, MED, HIGH, CRITICAL |
                                  |  - Granular Security Findings List    |
                                  |  - Actionable SOC Recommendations     |
                                  +---------------------------------------+
                                                      |
                                           Storage & Persistence
                                                      v
                                  +---------------------------------------+
                                  |         Relational Persistence        |
                                  |  - Scans, Findings, URLs, Attachments |
                                  |  - Privacy: No Raw Bodies Stored      |
                                  +---------------------------------------+
```

---

## Core Pillars & Component Responsibilities

### 1. Email Parser (`backend/app/services/email_parser.py`)
- Ingests raw RFC 5322 headers, multipart MIME boundaries, and pasted email bodies.
- Decodes quoted-printable, base64, and variable charsets safely without throwing unhandled exceptions on corrupt inputs.
- Strips executable HTML entities (`<script>`, `<iframe>`, `javascript:`, inline event handlers).
- Normalizes all output into a standardized `ParsedEmail` dataclass.

### 2. Sender Analysis (`backend/app/services/sender_analyzer.py`)
- Evaluates RFC 5322 `From` and `Reply-To` headers.
- Identifies **Display Name Spoofing** (e.g., `"PayPal Security" <attacker@random-domain.com>`).
- Assesses Reply-To mismatches and domain inconsistencies.
- Detects typosquatting, IDN homoglyphs, and known brand impersonation.
- Accounts for legitimate free-mail domain usage without falsely flagging legitimate Gmail or Outlook users.

### 3. URL Analysis (`backend/app/services/url_analyzer.py`)
- Passive lexical inspection of extracted URLs. **Never executes network requests or navigates to untrusted destinations.**
- Flags raw IP hostnames (e.g., `http://192.168.1.1/login`).
- Evaluates suspicious TLDs (`.top`, `.xyz`, `.buzz`, `.club`, etc.).
- Flags login/credential/payment-related path tokens combined with unverified domains.
- Detects anchor-to-href mismatches in HTML emails.

### 4. Content & NLP Analysis (`backend/app/services/content_analyzer.py`)
- Identifies psychological coercion tactics:
  - Artificial urgency & deadline pressure.
  - Fear & punitive threats (e.g., "account suspended within 24 hours").
  - Financial extortion and cryptocurrency wallet solicitations.
  - Credential & password verification lures.
  - Prize and lottery scams.

### 5. Header & RFC Compliance (`backend/app/services/header_analyzer.py`)
- Verifies Received hop chains for consistency.
- Inspects Return-Path alignment against the envelope sender.
- Validates Message-ID formatting.
- Flags missing standard RFC headers.

### 6. Authentication Integrity (`backend/app/services/authentication_analyzer.py`)
- Parses SPF, DKIM, and DMARC status from `Authentication-Results` and `Received-SPF` headers.
- Evaluates `PASS`, `FAIL`, `SOFTFAIL`, `NEUTRAL`, `NONE`, or `UNKNOWN`.
- Distinctly marks header-declared vs. active verification without fabricating results.

### 7. Attachment Safety (`backend/app/services/attachment_analyzer.py`)
- Inspects filenames, extensions, MIME types, and sizes without executing or decompressing binaries.
- Flags dangerous executable formats (`.exe`, `.scr`, `.bat`, `.vbs`, `.js`).
- Flags macro-enabled documents (`.docm`, `.xlsm`).
- Detects double-extension obfuscation (e.g., `invoice.pdf.exe`).

### 8. Local ML Service (`backend/app/services/ml_service.py`)
- Runs local inference using scikit-learn and joblib.
- Converts preprocessed text using TF-IDF (3,000 features, unigram + bigrams).
- Classifies using Logistic Regression trained on stratified phishing and ham corpora (98.28% test accuracy, 100% recall).
- Extracts top predictive n-gram tokens for explainable forensic attribution.

### 9. Risk Scoring Engine (`backend/app/services/risk_engine.py`)
- Synthesizes findings across all 6 analytical pillars plus the ML confidence.
- Produces a normalized score (0–100) mapped to deterministic severity buckets:
  - `0 – 29`: **LOW**
  - `30 – 59`: **MEDIUM**
  - `60 – 79`: **HIGH**
  - `80 – 100`: **CRITICAL**
- Generates categorized security findings and tailored SOC recommendations.

---

## Database Architecture
- **Primary**: PostgreSQL (via SQLAlchemy ORM).
- **Fallback**: Automated SQLite fallback (`sqlite:///./mail_sentinel.db`) ensures zero-friction local execution if PostgreSQL is offline or unconfigured.
- **Data Minimization**: Raw email body text is intentionally discarded after telemetry extraction. Only scan metadata, findings, URLs, and attachment summaries are persisted.
