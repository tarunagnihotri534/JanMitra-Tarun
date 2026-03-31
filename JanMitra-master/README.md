# 🇮🇳 JanMitra — Digital India Initiative

> AI-powered government scheme discovery platform with multi-language support (Hindi, English, Bengali, Tamil & more).

---

## ⚡ Quick Start (after `git clone`)

### 1. Clone the repository
```bash
git clone https://github.com/tarunagnihotri534/JanMitra-Tarun.git
cd JanMitra-Tarun
```

---

### 2. Start the Backend (Python/FastAPI)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

> ✅ On **first launch**, the backend automatically creates the database and begins building the Hindi translations table in the background. This takes ~2–3 minutes. Hindi section will work perfectly once done.

---

### 3. Start the Frontend (React/Vite)

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start the frontend dev server
npm run dev
```

Then open your browser at: **http://localhost:5173**

---

## 📦 Requirements

### Backend
- Python 3.9+
- All packages in `backend/requirements.txt`

### Frontend
- Node.js 18+
- npm 9+

---

## 🌐 Features

| Feature | Description |
|---|---|
| 🔍 Scheme Search | Filter 25+ government schemes by state, gender, age, category |
| 🇮🇳 Hindi Translation | Full Hindi support — names, descriptions, deadlines, documents |
| 📅 Application Deadlines | Last date displayed prominently on every scheme card |
| 📖 Scheme Details | Rich detail modal with key features, eligibility, and benefits |
| 🤖 AI Chatbot | Get scheme guidance in Hindi or English |
| 🗣️ Voice Assistant | Voice-enabled navigation and form filling |
| 📄 Form Reader | AI-powered document/form analysis |
| ⚖️ Scheme Comparator | AI recommends best scheme based on your profile |
| 📝 Grievance Filing | AI routes complaints to the right department |

---

## 🗂️ Project Structure

```
JanMitra-Tarun/
├── backend/
│   ├── main.py          # FastAPI app + all API routes
│   ├── db.py            # SQLite DB with auto Hindi table build
│   ├── requirements.txt # Python dependencies
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── pages/       # Dashboard, Compare, Forms, etc.
│   │   ├── components/  # Chatbot, Sidebar, Navbar, etc.
│   │   ├── context/     # Language context (Hindi/English)
│   │   └── utils/       # translations.js and helpers
│   └── package.json
└── README.md
```

---

## 🔧 How Hindi Translation Works

On **first startup**, the backend:
1. Creates the English `schemes` table and seeds all 25 schemes
2. Spawns a **background thread** to translate everything to Hindi
3. Stores translated data in a dedicated `schemes_hi` SQLite table

On **subsequent startups**: the Hindi table already exists → loads instantly (0ms).

---

## 👨‍💻 Developer

**Tarun Agnihotri** — [tarunagnihotri534@gmail.com](mailto:tarunagnihotri534@gmail.com)

---

## 📄 License

MIT License