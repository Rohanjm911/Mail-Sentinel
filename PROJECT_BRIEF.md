# Mail Sentinel - Project Executive Brief

> **"Detect the Threat. Protect the Inbox."**

---

## 1. Executive Summary
**Mail Sentinel** is an enterprise-grade, explainable email phishing detection and threat intelligence platform designed for Security Operations Centers (SOC), incident responders, and IT security teams. It analyzes raw pasted email components and standard RFC 5322 `.eml` files, executing deep multi-vector forensic evaluation and local machine learning inference without relying on paid external cloud APIs.

---

## 2. Key Capabilities & Architecture

| Capability | Description |
| :--- | :--- |
| **Multi-Pillar Pipeline** | 6 synchronized analysis engines: Sender Analysis, URL Heuristics, Content/NLP, Header Chain, Authentication (SPF/DKIM/DMARC), and Attachment Auditing. |
| **Explainable Local ML** | On-premises TF-IDF + Logistic Regression baseline trained on balanced cybersecurity corpora (98.28% accuracy, 100% recall), exposing top predictive threat tokens. |
| **Deterministic Risk Engine** | Standardized 0–100 composite risk scoring mapped to `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL` severities with tailored SOC containment playbooks. |
| **Indicator of Compromise (IOC) Engine** | Passive reputational lookup engine for URLs, domains, and IP addresses with zero-cloud on-premises heuristics plus optional external feeds (VirusTotal, URLhaus, PhishTank, AbuseIPDB). |
| **SOC-Grade Dark UI** | Modern cybersecurity aesthetic (`#0b0f17`/`#121824`), rich metrics, forensic evidence drill-downs, and real-time incident history tracking. |

---

## 3. Technology Stack

### Backend
- **Python 3.11+** & **FastAPI** (high-throughput asynchronous REST API)
- **SQLAlchemy 2.0** with **PostgreSQL** & automatic **SQLite** fallback (`mail_sentinel.db`)
- **Pydantic v2** for strict schema validation
- **scikit-learn**, **Pandas**, **NumPy**, **Joblib** for on-premises ML inference

### Frontend
- **React 19** & **TypeScript** with **Vite**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Recharts** for SOC threat telemetry visualizations
- **Lucide React** for SOC iconography

---

## 4. Quick Start

### Start Both Backend and Frontend Services
Simply double-click or run from terminal:
```cmd
run.bat
```

Or manually:
- **Backend**: `cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload`
- **Frontend**: `cd frontend && npm run dev`

### Access Points
- **Web UI**: http://localhost:5173
- **IOC Threat Console**: http://localhost:5173/threat-intelligence
- **API Swagger Documentation**: http://127.0.0.1:8000/docs
- **API Health Endpoint**: http://127.0.0.1:8000/api/health
