# How to Run Mail Sentinel 🛡️

> **"Detect the Threat. Protect the Inbox."**  
> Complete guide for setting up, running, testing, and stopping the Mail Sentinel platform.

---

## ⚡ Method 1: Quick 1-Click Launch (Windows)

If you are on Windows, simply double-click the included `run.bat` file or run it from your terminal:

```powershell
.\run.bat
```

**What this does automatically:**
1. Spawns the **FastAPI Backend** on `http://127.0.0.1:8000` (with live reload enabled).
2. Spawns the **Vite + React Frontend** on `http://127.0.0.1:5173`.
3. Opens your default web browser directly to `http://127.0.0.1:5173`.

---

## 🖥️ Method 2: Manual Step-by-Step Launch (All Platforms: Windows, macOS, Linux)

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Python**: Version 3.10, 3.11, or 3.12 (`python --version`)
- **Node.js**: Version 18+ or 20+ (`node -v`)
- **npm**: Version 9+ or 10+ (`npm -v`)

---

### 2. First-Time Setup (One-Time Only)

#### A. Backend Setup
Open a terminal in the project root:
```bash
# Navigate to backend directory
cd backend

# (Optional but recommended) Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install backend Python dependencies
pip install -r requirements.txt

# (Optional) Retrain ML baseline model if needed
python ml/train.py
```

#### B. Frontend Setup
Open a second terminal in the project root:
```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install
```

---

### 3. Starting the Services

You will need **two open terminal windows** (one for the backend, one for the frontend):

#### Terminal 1 — Start the Backend API:
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Expected Output:*
```text
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Application startup complete.
```

#### Terminal 2 — Start the Frontend UI:
```bash
cd frontend
npm run dev
```
*Expected Output:*
```text
  VITE v8.2.2  ready in 400 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🌐 Platform URLs & Navigation

Once both services are running, access the platform using your browser:

| Interface / Service | URL | Purpose |
| :--- | :--- | :--- |
| **SOC Dashboard** | [http://localhost:5173](http://localhost:5173) | Main security posture overview, incident metrics & quick actions. |
| **Email Threat Scanner** | [http://localhost:5173/scan](http://localhost:5173/scan) | Ingest emails via `.eml` upload or manual component paste. |
| **Threat Intelligence Console** | [http://localhost:5173/threat-intelligence](http://localhost:5173/threat-intelligence) | On-demand passive IOC reputation lookup (URLs, Domains, IPs). |
| **Scan Audit History** | [http://localhost:5173/history](http://localhost:5173/history) | Searchable database of past email analysis reports. |
| **Interactive API Documentation** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Swagger UI for executing and inspecting backend REST endpoints. |
| **API Alternative Docs (ReDoc)** | [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) | Clean OpenAPI technical specification. |

---

## 🧪 Quick Test: Verify Everything is Working

### 1. Test an Email Scan:
1. Open [http://localhost:5173/scan](http://localhost:5173/scan).
2. Choose **Paste Email Contents**:
   - **From**: `Security Team <support@micros0ft-verify.com>`
   - **Subject**: `URGENT: Your Account Has Been Suspended`
   - **Body**: `Immediate action required. Please verify your credentials within 24 hours at http://192.168.1.105/login or your account will be deleted permanently.`
3. Click **Scan Email for Threats**.
4. You should see a **CRITICAL / HIGH Risk Score (75–90/100)** with explainable finding cards detailing:
   - Targeted Executive Brand Typosquatting
   - Raw IP Host Credential Harvesting
   - High-Urgency Psychological Coercion Keywords

### 2. Test an IOC Lookup:
1. Open [http://localhost:5173/threat-intelligence](http://localhost:5173/threat-intelligence).
2. Click any of the pre-loaded sample badges (e.g. `paypal-security-update.xyz`).
3. Click **Analyze Indicator**.
4. View the instant risk score (92/100), Shannon entropy analysis, passive reverse-DNS results, and SOC containment steps.

---

## 🛑 How to Stop / Close the Servers

- If running via terminal: Press `Ctrl + C` in both terminal windows.
- If launched via `run.bat`: Close the two opened command prompt windows.
- If running in background (PowerShell):
  ```powershell
  # Kill any processes occupying ports 8000 and 5173
  Get-NetTCPConnection -LocalPort 8000, 5173 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
  ```

---

## ❓ Troubleshooting & FAQs

### Port 8000 or 5173 is already in use
Run the following in PowerShell to free up the ports:
```powershell
Get-NetTCPConnection -LocalPort 8000, 5173 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Python dependencies fail to install
Ensure `pip` is upgraded to the latest version:
```bash
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
```

### Frontend says "Failed to connect to server"
Make sure the backend is running first at `http://127.0.0.1:8000`. You can test backend health directly by opening [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health) in your browser (should return `{"status": "healthy"}`).
