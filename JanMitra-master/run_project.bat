@echo off
echo ===================================================
echo       Starting JanMitra Project (Optimized)
echo ===================================================

cd /d %~dp0

:: Check if .venv exists
if not exist "backend\.venv" (
    echo [Backend] Virtual environment not found. Creating...
    cd backend
    python -m venv .venv
    call .venv\Scripts\activate
    echo [Backend] Installing dependencies...
    pip install -q fastapi uvicorn pydantic
    cd ..
) else (
    echo [Backend] Virtual environment found. Activating...
    call backend\.venv\Scripts\activate
)

:: Start Backend in a new window
echo [Backend] Starting Server on Port 8000...
start "JanMitra Backend" cmd /k "cd backend && call .venv\Scripts\activate && uvicorn main:app --reload --host 127.0.0.1 --port 8000"

:: Start Frontend in a new window
echo [Frontend] Starting Application...
start "JanMitra Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo Project Running!
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo ===================================================
echo.
pause
