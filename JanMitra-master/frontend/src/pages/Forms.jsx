import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GrievanceForm from './GrievanceForm';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { Check, ArrowLeft, Mic, Send, FileText, Info, Loader2, AlignLeft, CreditCard, Activity } from 'lucide-react';
import SpeakerButton from '../components/SpeakerButton';
import gsap from 'gsap';

// Mock icons for categories/schemes
const SchemeIcon = ({ type }) => {
    if (type === 'income') return <CreditCard size={48} color="#f59e0b" />;
    if (type === 'health') return <Activity size={48} color="#10b981" />;
    return <FileText size={48} color="#3b82f6" />;
};

export default function Forms() {
    const { type } = useParams();
    const navigate = useNavigate();
    const { t, language } = useLanguage();

    // State
    const [schemeData, setSchemeData] = useState(null);
    const [formData, setFormData] = useState({ name: '', age: '', aadhar: '', address: '' });
    const [interimValues, setInterimValues] = useState({});
    const [voiceFilledFields, setVoiceFilledFields] = useState([]);
    const [focusedField, setFocusedField] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);

    const formRef = useRef(null);
    const isScheme = !isNaN(type);

    // Initial Data Fetch
    useEffect(() => {
        if (isScheme) {
            axios.get(`/api/schemes/${type}`, {
                params: { language }
            })
                .then(res => {
                    if (!res.data.error) {
                        setSchemeData(res.data);
                        const dynamicFields = {};
                        res.data.required_docs?.forEach(doc => {
                            if (doc.toLowerCase() !== 'aadhar card') dynamicFields[doc] = '';
                        });
                        setFormData(prev => ({ ...prev, ...dynamicFields }));
                    }
                })
                .catch(err => console.error("Error fetching scheme:", err));
        }
    }, [type, isScheme, language]);

    // Progress Calculation
    useEffect(() => {
        const totalKeys = Object.keys(formData).length;
        const filledKeys = Object.values(formData).filter(val => val !== '').length;
        const newProgress = Math.round((filledKeys / totalKeys) * 100);

        gsap.to('.progress-bar-fill', {
            width: `${newProgress}%`,
            duration: 0.5,
            ease: 'power2.out'
        });
        setProgress(newProgress);
    }, [formData]);

    // Voice Event Listeners
    useEffect(() => {
        const handleVoiceInput = (e) => {
            const { field, value, isInterim, action, confidence, source } = e.detail;
            setIsListening(true);

            // Auto-hide listening state after inactivity
            clearTimeout(window.voiceTimeout);
            window.voiceTimeout = setTimeout(() => setIsListening(false), 2000);

            if (isInterim) {
                setInterimValues(prev => ({ ...prev, [field]: value }));
            } else {
                setInterimValues(prev => {
                    const next = { ...prev };
                    delete next[field];
                    return next;
                });

                if (action === 'clear') {
                    setFormData(prev => ({ ...prev, [field]: '' }));
                } else {
                    setFormData(prev => ({ ...prev, [field]: value }));

                    // Trigger "Pulse" on the field
                    if (!voiceFilledFields.includes(field)) {
                        setVoiceFilledFields(prev => [...prev, field]);
                        setTimeout(() => setVoiceFilledFields(prev => prev.filter(f => f !== field)), 2000);
                    }

                    // Log ML confidence if available
                    if (source === 'ml' && confidence) {
                        console.log(`[Forms] ML filled ${field} with confidence ${(confidence * 100).toFixed(0)}%`);
                    }
                }
            }
        };

        window.addEventListener('voiceInput', handleVoiceInput);
        return () => window.removeEventListener('voiceInput', handleVoiceInput);
    }, [voiceFilledFields]);

    // Field Definitions & Validation Logic
    const getFieldProps = (name) => {
        const lowerName = name.toLowerCase();

        if (lowerName.includes('aadhar')) {
            return {
                maxLength: 14, // 12 digits + 2 spaces/dashes
                placeholder: 'XXXX-XXXX-XXXX',
                pattern: "\\d{4}-\\d{4}-\\d{4}",
                title: "12-digit Aadhaar number"
            };
        }
        if (lowerName.includes('pan')) {
            return {
                maxLength: 10,
                placeholder: 'ABCDE1234F',
                pattern: "[A-Z]{5}[0-9]{4}[A-Z]{1}",
                title: "10-character PAN number"
            };
        }
        if (lowerName.includes('voter')) {
            return {
                maxLength: 10,
                placeholder: 'ABC1234567',
                style: { textTransform: 'uppercase' }
            };
        }
        if (lowerName.includes('phone') || lowerName.includes('mobile')) {
            return {
                maxLength: 10,
                placeholder: '9876543210',
                pattern: "[0-9]{10}",
                type: 'tel'
            };
        }
        if (lowerName.includes('pincode') || lowerName.includes('pin')) {
            return {
                maxLength: 6,
                placeholder: '110001',
                pattern: "[0-9]{6}"
            };
        }
        if (lowerName.includes('income')) {
            return {
                type: 'number',
                min: 0
            };
        }
        return {};
    };

    const formatValue = (name, value) => {
        const lowerName = name.toLowerCase();

        // Aadhaar: 1234-5678-9012
        if (lowerName.includes('aadhar')) {
            const clean = value.replace(/\D/g, '');
            const limited = clean.slice(0, 12);
            let formatted = limited;
            if (limited.length > 4) formatted = limited.slice(0, 4) + '-' + limited.slice(4);
            if (limited.length > 8) formatted = formatted.slice(0, 9) + '-' + limited.slice(8);
            return formatted;
        }

        // PAN / Voter ID / IFSC: Uppercase
        if (lowerName.includes('pan') || lowerName.includes('voter') || lowerName.includes('ifsc')) {
            return value.toUpperCase().slice(0, 10); // PAN/Voter are usually max 10
        }

        // Phone / Pincode: Digits only
        if (lowerName.includes('phone') || lowerName.includes('mobile')) {
            return value.replace(/\D/g, '').slice(0, 10);
        }
        if (lowerName.includes('pincode') || lowerName.includes('pin')) {
            return value.replace(/\D/g, '').slice(0, 6);
        }

        // Name: Validate characters (allow letters, spaces, dots)
        if (lowerName === 'name' || lowerName.includes('full name')) {
            return value.replace(/[^a-zA-Z\s.]/g, '');
        }

        return value;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const formattedValue = formatValue(name, value);
        setFormData({ ...formData, [name]: formattedValue });
    };

    const handleFocus = (field) => {
        setFocusedField(field);
        window.dispatchEvent(new CustomEvent('fieldFocus', { detail: { field } }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await axios.post('/api/submissions', {
                formType: isScheme ? schemeData?.name : (t.forms.titles[type] || type),
                formData
            });
            if (res.data.success) {
                // Success Animation
                navigate('/submissions');
            }
        } catch (error) {
            console.error(error);
            alert("Submission failed");
        } finally {
            setSubmitting(false);
        }
    };


    // Calculate dynamic fields
    const formFields = [
        { name: 'name', type: 'text', label: t.forms.fullName, icon: '👤' },
        { name: 'age', type: 'number', label: t.forms.age, icon: '🎂' },
        { name: 'aadhar', type: 'text', label: t.forms.aadhar, icon: '🆔' },
        { name: 'address', type: 'textarea', label: t.forms.address, icon: '📍' }
    ];

    if (isScheme && schemeData?.required_docs) {
        schemeData.required_docs.forEach(doc => {
            if (doc.toLowerCase() !== 'aadhar card') {
                const label = t.forms.documents[doc] || doc;
                formFields.push({ name: doc, type: 'text', label: label + ' *', icon: '📄' });
            }
        });
    } else if (!isScheme && type === 'income') {
        formFields.push({ name: 'income', type: 'number', label: t.forms.annualIncome, icon: '💰' });
    }

    if (!isScheme && type === 'grievance') {
        return <GrievanceForm />;
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-color)' }}>

            {/* Left Panel: Context & Visualizer (Desktop) */}
            <div className="form-sidebar" style={{
                width: '400px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: 'white',
                padding: '3rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'fixed',
                height: '100vh',
                left: 0,
                top: 0
            }}>
                <div>
                    <button
                        onClick={() => navigate('/')}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '3rem' }}
                    >
                        <ArrowLeft size={16} /> {t.forms.cancel}
                    </button>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{
                            width: '80px', height: '80px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '20px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '1.5rem',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <SchemeIcon type={type} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isScheme ? schemeData?.name : (t.forms.titles[type] || t.forms.titles.default)}
                            <SpeakerButton text={isScheme ? schemeData?.name : (t.forms.titles[type] || t.forms.titles.default)} color="white" />
                        </h1>
                        <div style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, display: 'flex', alignItems: 'start', gap: '8px' }}>
                            <span>{isScheme ? schemeData?.description : (t.forms.descs?.[type] || "Please fill out the details accurately.")}</span>
                            <SpeakerButton text={isScheme ? schemeData?.description : (t.forms.descs?.[type] || "Please fill out the details accurately.")} color="rgba(255,255,255,0.8)" size={16} />
                        </div>
                    </div>

                    {/* Completion Status */}
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            <span>Form Completion</span>
                            <span style={{ fontWeight: 700, color: '#fbbf24' }}>{progress}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div className="progress-bar-fill" style={{ width: '0%', height: '100%', background: '#fbbf24' }}></div>
                        </div>
                    </div>
                </div>

                {/* Voice Visualizer Area */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '60px', height: '60px',
                        margin: '0 auto 1rem',
                        background: isListening ? '#ef4444' : 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        boxShadow: isListening ? '0 0 30px rgba(239, 68, 68, 0.4)' : 'none'
                    }}>
                        <Mic size={24} color="white" />
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                        {isListening ? "Listening..." : "Tap microphone to autofill"}
                    </p>
                </div>
            </div>

            {/* Right Panel: The Form */}
            <div className="form-main" style={{
                flex: 1,
                marginLeft: '400px', // Matches sidebar width
                padding: '4rem',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ width: '100%', maxWidth: '700px' }}
                >
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {formFields.map((field) => (
                            <div key={field.name} style={{ position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.75rem' }}>
                                    <label style={{
                                        fontWeight: 600,
                                        color: 'var(--primary)',
                                        fontSize: '0.95rem',
                                        cursor: 'pointer'
                                    }} onClick={() => document.getElementsByName(field.name)[0]?.focus()}>
                                        {field.label}
                                    </label>
                                    <SpeakerButton text={field.label} />
                                </div>

                                <div style={{ position: 'relative' }}>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            name={field.name}
                                            value={formData[field.name] || ''}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus(field.name)}
                                            rows="3"
                                            className={`form-input premium-input ${voiceFilledFields.includes(field.name) ? 'voice-pulse' : ''}`}
                                            style={{ resize: 'none' }}
                                            required
                                        />
                                    ) : (
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            value={formData[field.name] || ''}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus(field.name)}
                                            {...getFieldProps(field.name)}
                                            className={`form-input premium-input ${voiceFilledFields.includes(field.name) ? 'voice-pulse' : ''}`}
                                            required
                                        />
                                    )}

                                    {/* Icons & Indicators */}
                                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px' }}>
                                        {voiceFilledFields.includes(field.name) && (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                <Check size={20} color="#10b981" />
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Interim Text Overlay */}
                                    <AnimatePresence>
                                        {interimValues[field.name] && !formData[field.name] && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '14px',
                                                    transform: 'translateY(-50%)',
                                                    color: '#94a3b8',
                                                    pointerEvents: 'none',
                                                    fontStyle: 'italic'
                                                }}
                                            >
                                                {interimValues[field.name]}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ))}

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary"
                                style={{
                                    padding: '1rem 3rem',
                                    fontSize: '1.1rem',
                                    borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', gap: '10px'
                                }}
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : t.forms.submit}
                                {!submitting && <Send size={20} />}
                            </button>
                        </div>

                    </form>
                </motion.div>
            </div>

            <style>{`
                .premium-input {
                    background: white;
                    border: 1px solid #e2e8f0;
                    padding: 1.2rem;
                    border-radius: 12px;
                    transition: all 0.3s ease;
                    font-size: 1rem;
                    width: 100%;
                }
                .premium-input:focus {
                    border-color: var(--secondary);
                    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
                    transform: translateY(-2px);
                }
                .premium-input.voice-pulse {
                    border-color: #10b981;
                    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
                    background: #f0fdf4;
                }
                
                @media (max-width: 1024px) {
                    .form-sidebar {
                        width: 100%;
                        height: auto;
                        position: relative;
                        padding: 2rem;
                    }
                    .form-main {
                        margin-left: 0;
                        padding: 2rem;
                    }
                    .root {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
}
