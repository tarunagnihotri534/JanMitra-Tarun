import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import Forms from "./pages/Forms";
import Submissions from "./pages/Submissions";
import Auth from "./pages/Auth";
import Services from "./pages/Services";
import FormOptions from "./pages/FormOptions";

import VoiceAssistant from "./components/VoiceAssistant";
import Chatbot from "./components/Chatbot";
import LanguageSelector from "./components/LanguageSelector";
import PageTransition from "./components/PageTransition";
import ErrorBoundary from "./components/ErrorBoundary";

import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./App.css";

// Animated Routes Component
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
        <Route path="/forms/:type" element={<PageTransition><Forms /></PageTransition>} />
        <Route path="/submit-form" element={<PageTransition><FormOptions /></PageTransition>} />
        <Route path="/submissions" element={<PageTransition><Submissions /></PageTransition>} />
        {/* Fallback route */}
        <Route path="*" element={<PageTransition><Dashboard /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

// Inner App Content
function AppContent() {
  const { user } = useAuth();
  const { language } = useLanguage();

  // 1. First Priority: Authentication
  if (!user) {
    return <Auth />;
  }

  // 2. Second Priority: Language Selection
  if (!language) {
    return <LanguageSelector />;
  }

  // 3. Main App (Authenticated & Localized)
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-gradient)' }}>
        <Navbar />
        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <AnimatedRoutes />
        </div>
        <Footer />
        <VoiceAssistant />
        <Chatbot />
      </div>
    </Router>
  );
}

function App() {
  // Backend Health Check (Optional)
  useEffect(() => {
    fetch('http://127.0.0.1:8000/')
      .then(res => res.ok && console.log("Backend Connected"))
      .catch(console.error);
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
