# MAIL SENTINEL

> **Detect the Threat. Protect the Inbox.**

Mail Sentinel is an intelligent, explainable email phishing detection and threat analysis platform engineered for Security Operations Centers (SOC), incident responders, and enterprise mail administrators.

Users can paste raw email headers and bodies or upload RFC 5322 `.eml` files to receive an immediate, explainable phishing risk assessment with zero reliance on paid cloud AI APIs.

---

## Key Features

- **Multi-Pillar Detection Pipeline**:
  - **Sender Analysis**: Syntax validation, display-name spoofing detection, Reply-To mismatches, and brand typosquatting.
  - **URL Analysis**: Passive lexical analysis of all extracted links (raw IP detection, suspicious TLDs, credential-harvesting paths, punycode).
  - **Content & NLP Analysis**: Heuristic urgency/fear detection combined with machine learning.
  - **Header & RFC Compliance**: Received hop chain auditing, Return-Path alignment, and Message-ID verification.
  - **Authentication Integrity**: SPF, DKIM, and DMARC evaluation without fabricating missing telemetry.
  - **Attachment Safety**: Cataloging dangerous executables, macro files, and double-extension obfuscation with zero execution.
- **Explainable Machine Learning**: Local TF-IDF + Logistic Regression trained on realistic corpora achieving **98.28% accuracy and 100% recall**, extracting top predictive n-gram features for forensic review.
- **Deterministic Risk Engine**: Generates a standardized 0–100 threat score mapped to **LOW**, **MEDIUM**, **HIGH**, or **CRITICAL** severities with tailored SOC recommendations.
- **Modular Threat Intelligence**: Pluggable adapters for VirusTotal, URLhaus, PhishTank, and AbuseIPDB.
- **SOC-Ready Dark UI**: Strict cybersecurity aesthetic (charcoal palette `#0b0f17`/`#121824`, solid status indicators, **ABSOLUTELY NO GRADIENTS**, minimal visual clutter).

---

## Technology Stack

### Backend
- **Language**: Python 3.11+
- **Framework**: FastAPI, Uvicorn, Pydantic v2
- **Database**: PostgreSQL (with automatic zero-config SQLite fallback for local developer velocity)
- **ORM**: SQLAlchemy
- **Machine Learning**: scikit-learn, Pandas, NumPy, Joblib

### Frontend
- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS (Tailwind v4 with `@tailwindcss/vite`, strictly zero gradients)
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Visualizations**: Recharts
- **Icons**: Lucide React

---

## Project Structure

```text
Mail Sentinel/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/          # Health, Scans, Statistics, Threat Intel
│   │   ├── core/                # Configuration and Security constants
│   │   ├── db/                  # SQLAlchemy models and SQLite/Postgres engine
│   │   ├── models/              # Scan, Finding, URL, Attachment ORM entities
│   │   ├── schemas/             # Pydantic validation schemas
│   │   └── services/            # Analyzers, ML service, and Risk Engine
│   ├── ml/
│   │   ├── artifacts/           # Serialized tfidf.joblib and phishing_model.joblib
│   │   ├── datasets/            # Training samples
│   │   ├── preprocess.py        # Text tokenization & sanitization
│   │   ├── train.py             # Model training script
│   │   └── evaluate.py          # Metrics & confusion matrix evaluation
│   ├── tests/                   # Pytest test suite (26 passing tests)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable SOC UI components
│   │   ├── pages/               # Dashboard, Scanner, Results, History, Intel, Reports, Settings, About
│   │   ├── services/            # Axios API client
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx              # Router & layout
│   │   └── index.css            # SOC styling tokens (zero gradients)
│   └── package.json
├── datasets/                    # Synthetic training and RFC 5322 test emails
├── docs/                        # Architecture, API, ML Pipeline, and Security docs
└── README.md
```

---

## Installation & Prerequisites

- **Python**: 3.11 or higher
- **Node.js**: 18 or higher (with npm)
- **Git**

### 1. Clone Repository
```bash
git clone <repository-url>
cd "Mail Sentinel"
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

---

## Environment Variables

Copy `.env.example` in `backend/`:
```bash
cd backend
cp .env.example .env
```

| Variable | Default | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `sqlite:///./mail_sentinel.db` | PostgreSQL or fallback SQLite URI |
| `MAX_UPLOAD_SIZE_BYTES` | `10485760` | Max file upload limit (10 MB) |
| `VIRUSTOTAL_API_KEY` | *(empty)* | Optional VirusTotal API key |
| `URLHAUS_API_KEY` | *(empty)* | Optional URLhaus API key |
| `PHISHTANK_API_KEY` | *(empty)* | Optional PhishTank API key |
| `ABUSEIPDB_API_KEY` | *(empty)* | Optional AbuseIPDB API key |

*Note: Mail Sentinel works completely out of the box without any API keys.*

---

## Machine Learning Pipeline

The repository includes pre-trained model artifacts. To retrain or evaluate on demand:

```bash
cd backend
python ml/train.py
python ml/evaluate.py
```

### Model Performance
- **Accuracy**: 98.28%
- **Recall (Phishing)**: 100.00%
- **Precision (Phishing)**: 96.67%
- **F1-Score**: 98.31%

---

## Running the Application

### 1. Start the Backend API Server
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The API is available at `http://127.0.0.1:8000`.
Swagger interactive documentation: `http://127.0.0.1:8000/docs`.

### 2. Start the Frontend Development Server
```bash
cd frontend
npm run dev
```
The web dashboard will be available at `http://127.0.0.1:5173`.

---

## Running Automated Tests

### Backend Test Suite (Pytest)
```bash
cd backend
python -m pytest
```
Runs 26 automated unit and integration tests covering:
- RFC 5322 parser & boundary decoding
- URL lexical heuristics & IP detection
- Sender domain spoofing checks
- Content urgency triggers
- Risk scoring deterministic weights
- ML inference & explainability
- REST API validation and error responses

### Frontend Type & Build Verification
```bash
cd frontend
npm run build
```

---

## Security Considerations

1. **Untrusted Input**: All pasted emails and uploaded `.eml` files are treated as untrusted.
2. **Zero Attachment Execution**: Attachments are inspected strictly at the binary header/metadata level. No file is ever executed or opened.
3. **Passive URL Analysis**: URLs are never automatically crawled or fetched by default.
4. **HTML Sanitization**: All script tags, frames, and event handlers are neutralized before inspection.
5. **No Secret Leaks**: External threat intelligence API keys remain exclusively on the server.
6. **Data Minimization**: Raw email body text is intentionally discarded after parsing; only forensic metrics and findings are stored.

---

## Limitations & Future Enhancements

- **Active DNS Sandbox**: Future versions could add optional active DNS MX/TXT lookups in isolated network namespaces.
- **Optical Character Recognition (OCR)**: Detecting text embedded inside malicious image attachments (e.g. QR code phishing).
- **YARA Rule Integration**: Adding custom enterprise YARA rules for attachment pattern matching.

---

## Documentation
- [Architecture & Design](docs/architecture.md)
- [API Reference](docs/api.md)
- [ML Pipeline & Evaluation](docs/ml-pipeline.md)
- [Security & Threat Model](docs/security.md)

---

## License
MIT License. See [LICENSE](LICENSE) for details.
