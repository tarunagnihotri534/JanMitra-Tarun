import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Mic, X, Volume2, ChevronRight, ChevronLeft, Zap, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import voiceFormProcessor from "../utils/voiceFormProcessor";
import voiceConfig, { getRecognitionLanguage } from "../config/voiceConfig";
import gsap from "gsap";
import { AnimatePresence, motion } from "framer-motion";
import "./VoiceFormStyles.css";

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [guideActive, setGuideActive] = useState(false);
  const [guideSteps, setGuideSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [focusedField, setFocusedField] = useState(null);
  const [isOnFormPage, setIsOnFormPage] = useState(false);

  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const interimTimeoutRef = useRef(null);

  // UI Refs
  const assistantRef = useRef(null);
  const indicatorRef = useRef(null);

  const location = useLocation();
  const { t, language } = useLanguage();

  // Entrance Animation
  useEffect(() => {
    gsap.fromTo(assistantRef.current, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
  }, []);

  // Pulse Animation for Mic
  useEffect(() => {
    if (listening && indicatorRef.current) {
      gsap.to(indicatorRef.current, { scale: 1.3, opacity: 0.5, duration: 0.8, repeat: -1, yoyo: true });
    } else if (indicatorRef.current) {
      gsap.killTweensOf(indicatorRef.current);
      gsap.to(indicatorRef.current, { scale: 1, opacity: 1, duration: 0.3 });
    }
  }, [listening]);

  // Context Awareness (Form Page Detection)
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const onFormPage = pathParts[1] === 'forms' && pathParts[2];
    setIsOnFormPage(onFormPage);

    if (onFormPage) {
      // Fetch guide if needed
      const schemeId = pathParts[2];
      if (!isNaN(schemeId)) fetchSchemeDetails(schemeId);
      // Auto-enable for UX
      if (!continuousMode) setTimeout(() => setContinuousMode(true), 1000);
    } else {
      setContinuousMode(false);
      stopRecognition();
      setGuideActive(false);
    }
  }, [location.pathname]);

  // Field Focus Listener
  useEffect(() => {
    const handleFieldFocus = (e) => {
      setFocusedField(e.detail.field);
      voiceFormProcessor.setFocusedField(e.detail.field);
    };
    window.addEventListener('fieldFocus', handleFieldFocus);
    return () => window.removeEventListener('fieldFocus', handleFieldFocus);
  }, []);

  const fetchSchemeDetails = async (id) => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/schemes/${id}`);
      if (!res.data.error) setGuideSteps(res.data.filling_steps || []);
    } catch (err) { console.error(err); }
  };

  // --- Voice Logic (Simplified for brevity, logic remains robust) ---
  const startContinuousListening = () => {
    if (!('webkitSpeechRecognition' in window)) return;
    if (listening) return;

    const recognition = new window.webkitSpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = getRecognitionLanguage(language);
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      if (continuousMode && isOnFormPage) recognition.start();
      else setListening(false);
    };

    recognition.onresult = (event) => {
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }

      if (interim) {
        setInterimTranscript(interim);
        window.dispatchEvent(new CustomEvent('voiceInput', { detail: { value: interim, isInterim: true, field: focusedField } }));
      }

      if (final) {
        setInterimTranscript("");
        setSpokenText(final);
        processCommand(final);
      }
    };

    recognition.start();
  };

  const stopRecognition = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const processCommand = (text) => {
    // Check for guide commands
    if (text.toLowerCase().includes('guide') || text.toLowerCase().includes('help')) {
      setGuideActive(true);
      speak(guideSteps[0] || t.assistant?.noGuide || "No guide available.");
      return;
    }

    // Use ML-enhanced processing
    const result = voiceFormProcessor.processTranscriptML(
      text,
      focusedField,
      {
        availableFields: Object.keys(document.querySelectorAll('[name]') || {}).map(el => el.getAttribute?.('name')).filter(Boolean),
        filledFields: {}
      },
      language
    );

    if (!result) {
      console.log('[Voice] No result from ML processing');
      return;
    }

    // Handle multi-field results
    if (result.multiField && result.mappings) {
      console.log(`[Voice] Multi-field update: ${result.mappings.length} fields`);
      result.mappings.forEach(mapping => {
        window.dispatchEvent(new CustomEvent('voiceInput', {
          detail: {
            field: mapping.field,
            value: mapping.value,
            isInterim: false,
            confidence: mapping.confidence,
            source: 'ml'
          }
        }));
      });
      speak(`${result.mappings.length} ${t.assistant?.updatedFields || "fields updated"}`);
    } else if (result.field) {
      // Single field update
      window.dispatchEvent(new CustomEvent('voiceInput', {
        detail: {
          field: result.field,
          value: result.value,
          isInterim: false,
          confidence: result.confidence,
          source: result.source || 'ml'
        }
      }));
      speak(`${result.field} ${t.assistant?.fieldUpdated || "updated"}`);
    }
  };

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = getRecognitionLanguage(language);
    window.speechSynthesis.speak(u);
  };

  const toggleMode = () => {
    setContinuousMode(!continuousMode);
    if (!continuousMode) startContinuousListening();
    else stopRecognition();
  };

  return (
    <div ref={assistantRef} style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>

      {/* Guide Panel (Glassmorphism) */}
      <AnimatePresence>
        {guideActive && guideSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="glass-panel"
            style={{
              width: '320px',
              padding: '1.5rem',
              borderRadius: '20px',
              background: 'rgba(15, 23, 42, 0.85)', // Dark glass
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Sparkles size={16} color="#fbbf24" /> {t.assistant?.aiGuide || "AI Guide"}
              </h4>
              <button onClick={() => setGuideActive(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <p style={{ fontSize: '1.1rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {guideSteps[currentStep]}
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => {
                if (currentStep > 0) { setCurrentStep(c => c - 1); speak(guideSteps[currentStep - 1]); }
              }} className="btn-icon" style={{ background: 'rgba(255,255,255,0.1)' }}><ChevronLeft size={20} /></button>

              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                {t.assistant?.step || "Step"} {currentStep + 1} / {guideSteps.length}
              </div>

              <button onClick={() => {
                if (currentStep < guideSteps.length - 1) { setCurrentStep(c => c + 1); speak(guideSteps[currentStep + 1]); }
              }} className="btn-icon" style={{ background: 'var(--secondary)', color: 'white' }}><ChevronRight size={20} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Context Bubble */}
      <AnimatePresence>
        {interimTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'white', color: '#0f172a',
              padding: '10px 20px', borderRadius: '20px 20px 0 20px',
              fontWeight: 500, boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}
          >
            "{interimTranscript}"
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Button */}
      {isOnFormPage && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMode}
          style={{
            background: continuousMode ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            border: 'none',
            height: '60px',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: continuousMode ? '0 24px 0 6px' : '0 24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {continuousMode ? (
            <>
              <div ref={indicatorRef} style={{ width: '48px', height: '48px', background: 'rgba(0,0,0,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={24} />
              </div>
              <span style={{ fontWeight: 600 }}>{t.assistant?.listening || "Listening"}</span>
            </>
          ) : (
            <>
              <Zap size={24} />
              <span style={{ fontWeight: 600 }}>{t.assistant?.startVoiceAI || "Start Voice AI"}</span>
            </>
          )}
        </motion.button>
      )}
    </div>
  );
}
