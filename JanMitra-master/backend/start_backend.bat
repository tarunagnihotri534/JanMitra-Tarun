@echo off
echo Starting JanMitra Backend...
cd /d %~dp0
python -m venv .venv
call .venv\Scripts\activate
pip install fastapi uvicorn pydantic deep-translator
uvicorn main:app --reload --host 127.0.0.1 --port 8000
pause
