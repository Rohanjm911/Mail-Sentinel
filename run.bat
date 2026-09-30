@echo off
title Mail Sentinel Launcher
echo ========================================================
echo               Mail Sentinel 🛡️ Launcher
echo     Detect the Threat. Protect the Inbox.
echo ========================================================
echo.

echo [1/3] Starting FastAPI Backend on port 8000...
start "Mail Sentinel - Backend" cmd /k "cd backend && venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/3] Starting Frontend Dev Server on port 5173...
start "Mail Sentinel - Frontend" cmd /k "cd frontend && npm run dev"

echo [3/3] Opening browser at http://localhost:5173...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================================
echo   Mail Sentinel is running!
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://127.0.0.1:8000
echo   - API Docs: http://127.0.0.1:8000/docs
echo ========================================================
echo.
