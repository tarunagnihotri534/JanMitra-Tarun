# JanMitra Frontend

React + Vite frontend for the JanMitra Government Services Platform.

## Quick Start

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── VoiceAssistant.jsx
│   └── ...
├── pages/              # Page components
│   ├── Dashboard.jsx
│   ├── Forms.jsx
│   └── ...
├── context/            # React Context providers
│   └── LanguageContext.jsx
└── utils/              # Utilities
    └── translations.js  # Multi-language translations
```

## Key Features

- **Multi-language Support**: 8 Indian languages
- **Voice Assistant**: Browser-based speech recognition
- **Dynamic Forms**: Auto-generated based on scheme requirements
- **Responsive Design**: Works on desktop and mobile

## Development

- Uses Vite for fast HMR (Hot Module Replacement)
- React Router for navigation
- Framer Motion for animations
- Axios for API calls to backend

## Backend Connection

The frontend expects the backend to be running on `http://127.0.0.1:8000`

To change this, update the API URLs in:
- `src/pages/Dashboard.jsx`
- `src/pages/Forms.jsx`
- `src/pages/Submissions.jsx`
- `src/components/VoiceAssistant.jsx`
- `src/components/Sidebar.jsx`

## Browser Support

- Chrome/Edge (recommended for voice features)
- Firefox
- Safari

**Note**: Voice Assistant requires Chrome/Edge for Web Speech API support.
