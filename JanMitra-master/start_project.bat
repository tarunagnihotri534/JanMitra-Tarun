@echo off
echo Starting JanMitra Project...

:: Start Backend
echo Starting Backend Server...
start "JanMitra Backend" cmd /k "cd backend && call .venv\Scripts\activate && pip install -q fastapi uvicorn pydantic && uvicorn main:app --reload --host 127.0.0.1 --port 8000"

:: Start Frontend
echo Starting Frontend...
start "JanMitra Frontend" cmd /k "cd frontend && npm run dev"

echo ===================================================
echo Project Started!
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo ===================================================
pause
