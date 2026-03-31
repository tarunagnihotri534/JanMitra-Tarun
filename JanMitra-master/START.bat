@echo off
title JanMitra - Startup
color 0A

echo.
echo  ==========================================
echo    JanMitra - Digital India Initiative
echo  ==========================================
echo.

cd /d "%~dp0"

:: ── BACKEND SETUP ─────────────────────────────
echo  [1/4] Checking Python virtual environment...

if not exist "backend\venv\" (
    echo  [INFO] venv not found. Creating one now...
    cd backend
    python -m venv venv
    call venv\Scripts\activate.bat
    echo  [INFO] Installing Python dependencies...
    pip install -q -r requirements.txt
    cd ..
) else (
    echo  [OK] venv found.
)

:: ── START BACKEND ─────────────────────────────
echo  [2/4] Starting Backend on port 8000...
start "JanMitra Backend" cmd /k "title JanMitra Backend && cd /d "%~dp0backend" && call venv\Scripts\activate.bat && uvicorn main:app --reload --host 127.0.0.1 --port 8000"

:: Wait 3 seconds for backend to boot
timeout /t 3 /nobreak >nul

:: ── FRONTEND SETUP ────────────────────────────
echo  [3/4] Checking frontend dependencies...

if not exist "frontend\node_modules\" (
    echo  [INFO] node_modules not found. Running npm install...
    cd frontend
    npm install
    cd ..
) else (
    echo  [OK] node_modules found.
)

:: ── START FRONTEND ────────────────────────────
echo  [4/4] Starting Frontend on port 5173...
start "JanMitra Frontend" cmd /k "title JanMitra Frontend && cd /d "%~dp0frontend" && npm run dev"

:: Wait 3 seconds then open browser
timeout /t 3 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo  ==========================================
echo    Both servers are running!
echo  ==========================================
echo    Backend  : http://127.0.0.1:8000
echo    Frontend : http://localhost:5173
echo.
echo    NOTE: On FIRST run, Hindi translations
echo    are built in the background (~2-3 min).
echo    After that, Hindi loads instantly always.
echo  ==========================================
echo.
echo  You can close this window now.
pause
