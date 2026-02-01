import React, { useState, useEffect } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SpeakerButton({ text, className = "", color = "var(--primary)", size = 18 }) {
    const { language } = useLanguage();
    const [speaking, setSpeaking] = useState(false);
    const [voices, setVoices] = useState([]);

    // Load voices with retry
    useEffect(() => {
        let interval;
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
                if (interval) clearInterval(interval);
            }
        };

        loadVoices();

        // Browsers handle this differently
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        // Fallback polling for Chrome/Edge which might be lazy
        interval = setInterval(loadVoices, 500);
        return () => clearInterval(interval);
    }, []);

    const speak = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!text) return;

        window.speechSynthesis.cancel();

        // Target Language Code
        const langMap = {
            'hi': 'hi-IN',
            'bn': 'bn-IN',
            'mr': 'mr-IN',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'gu': 'gu-IN',
            'kn': 'kn-IN',
            'ml': 'ml-IN',
            'pa': 'pa-IN',
            'en': 'en-US' // Default to US English if just 'en'
        };

        const targetLang = langMap[language] || 'en-US';
        const utterance = new SpeechSynthesisUtterance(text);

        // Diagnostic logging
        console.log("🔊 TTS Request:", {
            language,
            targetLang,
            text: text.substring(0, 50) + "...",
            availableVoicesCount: voices.length
        });

        // Find best matching voice
        const langCode = targetLang.split('-')[0]; // e.g., 'hi'

        const selectedVoice =
            voices.find(v => v.lang === targetLang) ||
            voices.find(v => v.lang.replace('_', '-').toLowerCase() === targetLang.toLowerCase()) || // Handle hi_IN vs hi-IN
            voices.find(v => v.lang.toLowerCase().startsWith(langCode)) ||
            voices.find(v => v.name.toLowerCase().includes(langCode)); // Sometimes name has language

        if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log("✅ Using voice:", selectedVoice.name, selectedVoice.lang);
        } else {
            console.warn("⚠️ No specific voice found for", targetLang);
            console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`));
            utterance.lang = targetLang;
        }

        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
            setSpeaking(true);
            console.log("🎤 Speech started");
        };
        utterance.onend = () => {
            setSpeaking(false);
            window.currentUtterance = null;
            console.log("✅ Speech ended");
        };
        utterance.onerror = (e) => {
            console.error("❌ Speech error:", e.error, e);
            setSpeaking(false);
            window.currentUtterance = null;
        };

        // CRITICAL FIX: Assign to window to prevent garbage collection
        window.currentUtterance = utterance;

        // Small timeout to ensure state updates before speaking
        setTimeout(() => {
            try {
                window.speechSynthesis.speak(utterance);
                console.log("📢 Speech queued");
            } catch (err) {
                console.error("Failed to queue speech:", err);
                setSpeaking(false);
            }
        }, 10);
    };

    return (
        <button
            type="button"
            onClick={speak}
            className={`speaker - btn ${className} `}
            disabled={speaking}
            style={{
                background: speaking ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.05)',
                border: speaking ? '1px solid #3b82f6' : 'none',
                cursor: speaking ? 'default' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '50%',
                color: speaking ? '#3b82f6' : color,
                transition: 'all 0.2s ease',
                marginLeft: '8px',
                opacity: speaking ? 1 : 0.8
            }}
            title="Read Aloud"
            onMouseEnter={(e) => !speaking && (e.currentTarget.style.background = 'rgba(0,0,0,0.1)')}
            onMouseLeave={(e) => !speaking && (e.currentTarget.style.background = 'rgba(0,0,0,0.05)')}
        >
            {speaking ? <Loader2 size={size} className="animate-spin" /> : <Volume2 size={size} />}
        </button>
    );
}
