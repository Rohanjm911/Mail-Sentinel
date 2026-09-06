@echo off
echo ========================================================
echo   Starting Mail Sentinel Platform
echo   "Detect the Threat. Protect the Inbox."
echo ========================================================

start "Mail Sentinel Backend API" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
start "Mail Sentinel Frontend UI" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Waiting for services to initialize...
timeout /t 3 /nobreak >nul
start http://127.0.0.1:5173

echo ========================================================
echo   Mail Sentinel is running:
echo   - Web UI:     http://127.0.0.1:5173
echo   - Backend API: http://127.0.0.1:8000
echo   - API Docs:    http://127.0.0.1:8000/docs
echo ========================================================
