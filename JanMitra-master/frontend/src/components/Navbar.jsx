import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { Globe, Menu, X, User, LayoutDashboard, FileText, CheckCircle, LogOut, ChevronDown } from "lucide-react";
import LanguageModal from "./LanguageModal";
import "./Navbar.css"; // Ensure this file exists or styles are covered

export default function Navbar() {
    const { t, language } = useLanguage();
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isLangModalOpen, setIsLangModalOpen] = useState(false);

    // Close dropdown when clicking outside
    const dropdownRef = useRef(null);
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Simple active check
    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { title: t.nav.dashboard, path: "/" },
        { title: t.nav.services, path: "/services" },
        { title: t.nav.forms, path: "/submit-form" },
        { title: t.nav.submissions, path: "/submissions" },
        { title: t.nav.compareSchemes || "Compare Schemes", path: "/compare-schemes" },
    ];

    return (
        <nav className="glass-nav" style={{ width: '100%' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>

                {/* Logo */}
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                        <img src="/emblem.png" alt="JP" style={{ width: '24px', opacity: 0.9 }} onError={(e) => e.target.style.display = 'none'} />
                        {/* Fallback Icon if Image Fails */}
                        <div style={{ position: 'absolute', fontSize: '1.2rem' }}>🏛️</div>
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', margin: 0, lineHeight: 1, letterSpacing: '-0.5px' }}>JanMitra</h1>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', letterSpacing: '0.5px' }}>Digital India Initiative</span>
                    </div>
                </Link>

                {/* Desktop Links */}
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="desktop-menu">
                    {user && navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            style={{
                                textDecoration: 'none',
                                color: isActive(link.path) ? 'var(--primary)' : 'var(--text-light)',
                                fontWeight: isActive(link.path) ? 700 : 500,
                                position: 'relative',
                                fontSize: '0.95rem',
                                transition: 'color 0.2s'
                            }}
                        >
                            {link.title}
                            {isActive(link.path) && (
                                <motion.div layoutId="navIndicator" style={{ position: 'absolute', bottom: '-4px', left: 0, right: 0, height: '2px', background: 'var(--secondary)' }} />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    {/* Language Pill */}
                    {user && (
                        <button
                            onClick={() => setIsLangModalOpen(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: 'rgba(0,0,0,0.03)', padding: '8px 16px',
                                borderRadius: '30px', border: '1px solid rgba(0,0,0,0.05)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            className="hover:bg-gray-100"
                        >
                            <Globe size={16} color="var(--primary)" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>{language ? language.toUpperCase() : 'EN'}</span>
                        </button>
                    )}

                    {/* User Dropdown */}
                    {user ? (
                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                style={{
                                    background: 'white', border: '1px solid #e2e8f0',
                                    padding: '6px 12px', borderRadius: '30px',
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
                                    {user.name.charAt(0)}
                                </div>
                                <ChevronDown size={14} color="#64748b" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>

                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        style={{
                                            position: 'absolute', top: '120%', right: 0,
                                            width: '240px', background: 'white', borderRadius: '16px',
                                            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                                            border: '1px solid #f1f5f9', overflow: 'hidden',
                                            padding: '0.5rem', zIndex: 100
                                        }}
                                    >
                                        <div style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', marginBottom: '0.5rem' }}>
                                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{user.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.email}</div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <Link to="/" onClick={() => setDropdownOpen(false)} className="dropdown-item">
                                                <LayoutDashboard size={16} /> {t.nav.dashboard || "Dashboard"}
                                            </Link>
                                            <Link to="/submissions" onClick={() => setDropdownOpen(false)} className="dropdown-item">
                                                <FileText size={16} /> {t.nav.myApps || "My Apps"}
                                            </Link>
                                        </div>

                                        <div style={{ marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                                            <button onClick={logout} className="dropdown-item" style={{ width: '100%', color: '#ef4444' }}>
                                                <LogOut size={16} /> {t.nav.logout || "Logout"}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link to="/auth" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                            Login
                        </Link>
                    )}
                </div>

            </div>

            <LanguageModal isOpen={isLangModalOpen} onClose={() => setIsLangModalOpen(false)} />

            <style>{`
        .dropdown-item {
            display: flex; alignItems: center; gap: 10px;
            padding: 10px 12px;
            border-radius: 8px;
            text-decoration: none;
            color: #475569;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s;
            background: transparent;
            border: none;
            cursor: pointer;
            text-align: left;
        }
        .dropdown-item:hover {
            background: #f8fafc;
            color: var(--primary);
        }
        @media (max-width: 768px) {
            .desktop-menu { display: none !important; }
        }
      `}</style>
        </nav>
    );
}
