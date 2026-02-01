import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { Globe, ArrowRight, Check, Sparkles, ChevronRight } from 'lucide-react';
import MagneticButton from './MagneticButton';

export default function LanguageSelector() {
    const { language, setLanguage, availableLanguages } = useLanguage();
    const [hoveredLang, setHoveredLang] = useState(null);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0a0a', // Deepest black-blue
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Background Texture (Grain) */}
            <div style={{
                position: 'absolute', inset: 0, opacity: 0.05,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                zIndex: 0
            }}></div>

            {/* Ambient Gold Glows */}
            <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '500px', background: 'radial-gradient(ellipse at center, rgba(217, 119, 6, 0.15), transparent 70%)', filter: 'blur(80px)', zIndex: 0 }}></div>

            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
                style={{ zIndex: 10, width: '100%', maxWidth: '1400px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
                {/* Header */}
                <header style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', position: 'relative' }}>
                            <div style={{ position: 'absolute', inset: -10, background: 'rgba(255,215,0,0.2)', filter: 'blur(20px)', borderRadius: '50%' }}></div>
                            <Globe size={48} color="#d4af37" strokeWidth={1} style={{ position: 'relative' }} />
                        </div>
                        <h1 style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '4.5rem',
                            background: 'linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: '1rem',
                            letterSpacing: '-1px'
                        }}>
                            JanMitra
                        </h1>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            Official Digital India Portal
                        </p>
                    </motion.div>
                </header>

                {/* Language Showcase (Horizontal Scroll / Grid) */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '2.5rem',
                    width: '100%',
                    perspective: '1000px'
                }}>
                    {availableLanguages.map((lang, index) => {
                        const isSelected = language === lang.code;
                        const isHovered = hoveredLang === lang.code;

                        return (
                            <motion.button
                                key={lang.code}
                                onMouseEnter={() => setHoveredLang(lang.code)}
                                onMouseLeave={() => setHoveredLang(null)}
                                onClick={() => setLanguage(lang.code)}
                                initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                whileHover={{ scale: 1.05, y: -10 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    width: '280px',
                                    height: '380px',
                                    background: isSelected
                                        ? 'linear-gradient(160deg, rgba(20, 20, 20, 0.8), rgba(10, 10, 10, 0.9))'
                                        : 'rgba(255, 255, 255, 0.02)',
                                    border: isSelected ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '4px', // Sharp sophisticated corners or slight rounding
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '3rem 2rem',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    transition: 'border-color 0.4s ease',
                                    boxShadow: isSelected ? '0 0 30px rgba(212, 175, 55, 0.15)' : 'none'
                                }}
                            >
                                {/* Top Decor */}
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', letterSpacing: '2px', color: isSelected ? '#d4af37' : 'rgba(255,255,255,0.3)' }}>
                                        {lang.code.toUpperCase()}
                                    </span>
                                </div>

                                {/* Main Character */}
                                <div style={{
                                    fontSize: '5rem',
                                    fontFamily: "'Playfair Display', serif",
                                    color: isSelected ? '#fff' : 'rgba(255,255,255,0.8)',
                                    textShadow: isSelected ? '0 0 20px rgba(255,255,255,0.4)' : 'none',
                                    transition: 'all 0.4s'
                                }}>
                                    {lang.nativeName.charAt(0)}
                                </div>

                                {/* Title */}
                                <div style={{ textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '1.8rem', color: isSelected ? '#d4af37' : 'white', marginBottom: '0.5rem', fontFamily: "'Playfair Display', serif" }}>
                                        {lang.nativeName}
                                    </h3>
                                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {lang.name}
                                    </p>
                                </div>

                                {/* Bottom Selection Indicator (Minimal Line) */}
                                <motion.div
                                    animate={{ width: isSelected ? '40px' : '0px', opacity: isSelected ? 1 : 0 }}
                                    style={{ height: '2px', background: '#d4af37' }}
                                />

                                {/* Subtle Hover Shine */}
                                {isHovered && !isSelected && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)',
                                        pointerEvents: 'none'
                                    }}></div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Continue Section */}
                <div style={{ height: '100px', marginTop: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AnimatePresence>
                        {language && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <MagneticButton
                                    className=""
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #d4af37',
                                        color: '#d4af37',
                                        padding: '1rem 3rem',
                                        borderRadius: '0',
                                        fontSize: '1rem',
                                        letterSpacing: '2px',
                                        textTransform: 'uppercase',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem'
                                    }}
                                >
                                    Enter Portal <ChevronRight size={18} />
                                </MagneticButton>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </motion.div>
        </div>
    );
}
