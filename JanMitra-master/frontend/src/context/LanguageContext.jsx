import React, { createContext, useContext, useState } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('janmitra_language') || null;
    });

    React.useEffect(() => {
        if (language) {
            localStorage.setItem('janmitra_language', language);
        }
    }, [language]);

    const t = (language && translations[language]) ? translations[language] : translations['en'];

    const availableLanguages = [
        { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
        { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
        { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
        { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
        { code: 'bi', name: 'Bihari', nativeName: 'बिहारी', flag: '🇮🇳' },
        { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
        { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
        { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' }
    ];

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
