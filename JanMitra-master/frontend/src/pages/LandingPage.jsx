import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { ChevronDown } from 'lucide-react';

export default function LandingPage() {
    const { language, setLanguage, t, availableLanguages } = useLanguage();
    const [showLanguagePanel, setShowLanguagePanel] = useState(false);

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#ffffff', fontFamily: "'Outfit', sans-serif", overflow: 'hidden', position: 'relative' }}>
            {/* Language Selector Dropdown - Top Right */}
            <div style={{
                position: 'fixed',
                top: '2rem',
                right: '2rem',
                zIndex: 50
            }}>
                {/* Arrow Button */}
                {/* Language Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowLanguagePanel(!showLanguagePanel)}
                    style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: '30px',
                        padding: '0.8rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                        color: 'white',
                        transition: 'all 0.3s ease',
                        fontSize: '1rem',
                        fontWeight: 600
                    }}
                >
                    <span style={{ fontSize: '1.2rem' }}>🌐</span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                        <span style={{ fontSize: '0.9rem' }}>Language</span>
                        <span style={{ fontSize: '1rem' }}>भाषा चुनें</span>
                    </div>
                    <motion.div
                        animate={{ rotate: showLanguagePanel ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ marginLeft: '4px' }}
                    >
                        <ChevronDown size={20} />
                    </motion.div>
                </motion.button>

                {/* Language Panel - Dropdown */}
                {showLanguagePanel && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 10, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: 'absolute',
                            top: '60px',
                            right: 0,
                            background: 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px',
                            padding: '1rem',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                            minWidth: '300px',
                            border: '1px solid rgba(102, 126, 234, 0.2)'
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {availableLanguages.map((lang) => (
                                <label
                                    key={lang.code}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        background: language === lang.code ? '#f0f4ff' : 'transparent',
                                        border: language === lang.code ? '2px solid #667eea' : '1px solid #e5e7eb',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={language === lang.code}
                                        onChange={() => {
                                            setLanguage(lang.code);
                                            setShowLanguagePanel(false);
                                        }}
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            cursor: 'pointer',
                                            accentColor: '#667eea'
                                        }}
                                    />
                                    <span style={{ fontSize: '1.3rem', marginRight: '0.2rem' }}>{lang.flag}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: language === lang.code ? '#667eea' : '#1f2937' }}>
                                            {lang.nativeName}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                            {lang.name}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Hero Section - Full Screen */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                color: 'white',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center'
            }}>
                {/* Animated Background Elements */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '600px',
                    height: '600px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    filter: 'blur(60px)'
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '-40%',
                    left: '-10%',
                    width: '500px',
                    height: '500px',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '50%',
                    filter: 'blur(60px)'
                }}></div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}
                >
                    {/* Large Emoji */}
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        style={{ fontSize: '5rem', marginBottom: '2rem' }}
                    >
                        🏛️
                    </motion.div>

                    {/* Main Welcome Text - English */}
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        style={{
                            fontSize: '4.5rem',
                            fontWeight: 900,
                            marginBottom: '1rem',
                            lineHeight: '1.2',
                            textShadow: '0 4px 20px rgba(0,0,0,0.2)'
                        }}
                    >
                        Welcome to JanMitra
                    </motion.h1>

                    {/* Welcome Text - Hindi */}
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        style={{
                            fontSize: '3.5rem',
                            fontWeight: 800,
                            marginBottom: '2rem',
                            color: 'rgba(255,255,255,0.95)',
                            lineHeight: '1.3'
                        }}
                    >
                        जनमित्र में आपका स्वागत है
                    </motion.h2>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        style={{
                            fontSize: '1.4rem',
                            color: 'rgba(255,255,255,0.85)',
                            marginBottom: '0',
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}
                    >
                        Empowering Citizens with Digital Government Services
                    </motion.p>
                </motion.div>
            </div>

            {/* Statistics Section */}
            <div style={{ padding: '4rem 2rem', background: '#f8fafc' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                    {[
                        { label: t.landing.stats.total, value: "500+", color: "#667eea" },
                        { label: t.landing.stats.central, value: "200+", color: "#764ba2" },
                        { label: t.landing.stats.state, value: "300+", color: "#f5576c" }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -10 }}
                            style={{
                                background: 'white',
                                padding: '2rem',
                                borderRadius: '20px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                textAlign: 'center',
                                border: `1px solid ${stat.color}20`
                            }}
                        >
                            <div style={{ fontSize: '3rem', fontWeight: 800, color: stat.color, marginBottom: '0.5rem' }}>{stat.value}</div>
                            <div style={{ fontSize: '1.2rem', color: '#4b5563', fontWeight: 600 }}>{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Categories Section */}
            <div style={{ padding: '4rem 2rem', background: 'white' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h3 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 800, marginBottom: '3rem', color: '#1f2937' }}>
                        {t.landing.categories.heading}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        {[
                            { title: t.landing.categories.agriculture, icon: "🌾" },
                            { title: t.landing.categories.banking, icon: "🏦" },
                            { title: t.landing.categories.business, icon: "💼" },
                            { title: t.landing.categories.education, icon: "🎓" },
                            { title: t.landing.categories.health, icon: "🏥" },
                            { title: t.landing.categories.housing, icon: "🏠" },
                            { title: t.landing.categories.public, icon: "⚖️" },
                            { title: t.landing.categories.travel, icon: "✈️" }
                        ].map((cat, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.03 }}
                                style={{
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    background: '#f9fafb',
                                    border: '1px solid #e5e7eb',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{ fontSize: '2rem' }}>{cat.icon}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>{cat.title}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
