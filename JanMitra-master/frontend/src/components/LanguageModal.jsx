import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { X, Check } from 'lucide-react';

export default function LanguageModal({ isOpen, onClose }) {
    const { language, setLanguage, availableLanguages } = useLanguage();
    const [hoveredLang, setHoveredLang] = useState(null);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed', inset: 0,
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 999
                        }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        style={{
                            position: 'fixed',
                            top: '50%', left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '90%', maxWidth: '800px',
                            maxHeight: '90vh',
                            background: '#0f172a',
                            borderRadius: '24px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                            padding: '2rem',
                            zIndex: 1000,
                            overflowY: 'auto',
                            color: 'white'
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                                    Select Language
                                </h2>
                                <p style={{ color: 'rgba(255,255,255,0.6)' }}>Choose your preferred language for the interface</p>
                            </div>
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    width: '40px', height: '40px',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'white',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {availableLanguages.map((lang, index) => {
                                const isSelected = language === lang.code;
                                const isHovered = hoveredLang === lang.code;

                                return (
                                    <motion.button
                                        key={lang.code}
                                        onMouseEnter={() => setHoveredLang(lang.code)}
                                        onMouseLeave={() => setHoveredLang(null)}
                                        onClick={() => {
                                            setLanguage(lang.code);
                                            onClose();
                                        }}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            background: isSelected
                                                ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
                                                : isHovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                                            border: isSelected ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '16px',
                                            padding: '1.5rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '1rem',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            transition: 'all 0.3s ease',
                                            height: '180px'
                                        }}
                                    >
                                        <span style={{ fontSize: '3rem' }}>{lang.flag}</span>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '4px' }}>
                                                {lang.nativeName}
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)' }}>
                                                {lang.name}
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <div style={{
                                                position: 'absolute', top: '12px', right: '12px',
                                                background: 'white', color: '#b45309',
                                                width: '24px', height: '24px', borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Add simple close hover effect
const style = document.createElement('style');
style.textContent = `
    button:hover { opacity: 0.9; }
`;
document.head.appendChild(style);
