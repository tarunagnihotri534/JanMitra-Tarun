import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ShieldCheck, AlertCircle, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import MagneticButton from '../components/MagneticButton';
import './Auth.css';

export default function Auth() {
    const { login, signup } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [focusedField, setFocusedField] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Artificial sweetener for smoothness
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(name, email, password);
            }
        } catch (err) {
            setError(err.message || "Authentication Failed");
        } finally {
            setLoading(false);
        }
    };

    const fillMockCredentials = () => {
        setEmail('test@gmail.com');
        setPassword('test@123');
    };

    const variants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" }}>

            {/* Left Panel - Premium Visuals */}
            <div className="auth-left-panel auth-bg-animation" style={{
                flex: '1',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '5rem',
                color: 'white'
            }}>
                {/* Floating Geometric Shapes */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                    style={{ position: 'absolute', top: '-20%', right: '-20%', width: '800px', height: '800px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '40%' }}
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                    style={{ position: 'absolute', bottom: '-20%', left: '-20%', width: '800px', height: '800px', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '45%' }}
                />

                <div style={{ zIndex: 10 }}>
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '20px',
                            backdropFilter: 'blur(10px)', marginBottom: '2.5rem', border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <ShieldCheck size={18} color="#fbbf24" />
                            <span style={{ fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.5px' }}>OFFICIAL GOVERNMENT PORTAL</span>
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}
                        style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', fontFamily: "'Playfair Display', serif" }}
                    >
                        Welcome to <br />
                        <span style={{
                            background: 'linear-gradient(to right, #fbbf24, #d97706)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>JanMitra</span>
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
                        style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '450px' }}
                    >
                        Your one-stop gateway to government services, welfare schemes, and real-time digital governance.
                    </motion.p>
                </div>
            </div>

            {/* Right Panel - Interactive Form */}
            <div style={{
                flex: '1',
                background: '#f8fafc',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '2rem',
                position: 'relative'
            }}>
                <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 5 }}>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? 'login' : 'signup'}
                            variants={variants}
                            initial="hidden" animate="visible" exit="exit"
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            className="glass-card"
                            style={{
                                padding: '3.5rem',
                                borderRadius: '32px',
                            }}
                        >
                            <div style={{ marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                                    {isLogin ? 'Sign In' : 'Get Started'}
                                </h2>
                                <p style={{ color: '#64748b', fontSize: '1rem' }}>
                                    {isLogin ? 'Welcome back! Please enter your details.' : 'Create your digital identity today.'}
                                </p>
                            </div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                        style={{ background: '#fef2f2', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.9rem', border: '1px solid #fee2e2' }}
                                    >
                                        <AlertCircle size={18} /> {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                                {!isLogin && (
                                    <div className="input-group">
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'name' ? '#2563eb' : '#94a3b8', transition: 'color 0.3s' }} />
                                            <input
                                                type="text"
                                                required
                                                onFocus={() => setFocusedField('name')}
                                                onBlur={() => setFocusedField(null)}
                                                placeholder="John Doe"
                                                value={name} onChange={e => setName(e.target.value)}
                                                style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="input-group">
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'email' ? '#2563eb' : '#94a3b8', transition: 'color 0.3s' }} />
                                        <input
                                            type="email"
                                            required
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField(null)}
                                            placeholder="name@example.com"
                                            value={email} onChange={e => setEmail(e.target.value)}
                                            style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: focusedField === 'password' ? '#2563eb' : '#94a3b8', transition: 'color 0.3s' }} />
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            required
                                            onFocus={() => setFocusedField('password')}
                                            onBlur={() => setFocusedField(null)}
                                            placeholder="••••••••"
                                            value={password} onChange={e => setPassword(e.target.value)}
                                            style={{ width: '100%', padding: '14px 48px 14px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
                                        />
                                        <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <MagneticButton
                                    className="btn-primary"
                                    style={{
                                        width: '100%', marginTop: '1rem', borderRadius: '16px', padding: '14px',
                                        display: 'flex', justifyContent: 'center', fontSize: '1.05rem', fontWeight: 600,
                                        boxShadow: '0 10px 30px -10px rgba(37, 99, 235, 0.5)'
                                    }}
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')} <ArrowRight size={18} style={{ marginLeft: '8px', opacity: 0.8 }} />
                                </MagneticButton>

                            </form>

                            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem', color: '#64748b' }}>
                                {isLogin ? "New to JanMitra? " : "Already have an account? "}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '4px' }}
                                >
                                    {isLogin ? 'Create an account' : 'Log in'}
                                </button>
                            </div>

                            {/* Mock Credential Hint - Stylish Version */}
                            {isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} delay={0.3}
                                    style={{ marginTop: '2.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                            <span style={{ display: 'block', fontWeight: 600, color: '#475569', marginBottom: '2px' }}>Testing Creds:</span>
                                            test@gmail.com • test@123
                                        </div>
                                        <button
                                            onClick={fillMockCredentials}
                                            style={{
                                                background: 'white', border: '1px solid #cbd5e1',
                                                padding: '6px 14px', borderRadius: '20px',
                                                cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
                                                color: '#334155', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            Auto-Fill
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Footer Links */}
                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
                        JanMitra – Your Digital Saathi for Government Services
                    </div>
                </div>
            </div>
        </div>
    );
}
