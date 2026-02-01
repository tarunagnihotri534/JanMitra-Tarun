# Quick Setup Guide

## Windows Users

### Easiest Method:
1. Double-click `run_project.bat`
2. Wait for both servers to start
3. Open browser to `http://localhost:5173`

### Manual Method:

**Terminal 1 - Backend:**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Linux/Mac Users

**Terminal 1 - Backend:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Verify Installation

1. Backend: Open `http://127.0.0.1:8000` - should show `{"message": "JanMitra Backend Running"}`
2. Frontend: Open `http://localhost:5173` - should show the JanMitra dashboard

## Common Issues

- **Python not found**: Install Python 3.8+ from python.org
- **npm not found**: Install Node.js from nodejs.org
- **Port already in use**: Stop other services or change ports in config files
