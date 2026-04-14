import React, { useState } from 'react';
import { analyzeIssue, createSubmission } from '../lib/api.js';
import { motion } from 'framer-motion';
import { Send, AlertTriangle, MapPin, Building2, ShieldAlert, Loader2, ArrowLeft, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function GrievanceForm() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        setLoading(true);
        try {
            const data = await analyzeIssue(message);
            setResult(data);
        } catch (error) {
            console.error(error);
            alert(t.grievanceForm?.analysisFailed || "AI analysis requires the backend server. Please try on the deployed version.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            await createSubmission("JanMitra AI Grievance", result);
            navigate('/submissions');
        } catch (error) {
            console.error(error);
            alert(t.grievanceForm?.submissionFailed || "Submission failed.");
        }
    };

    const getSeverityColor = (sev) => {
        const s = sev?.toLowerCase() || '';
        if (s === 'critical') return '#ef4444';
        if (s === 'high') return '#f97316';
        if (s === 'medium') return '#fbbf24';
        return '#10b981';
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-color)' }}>
            <div className="form-sidebar" style={{ width: '400px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '3rem', position: 'fixed', height: '100vh', left: 0, top: 0 }}>
                <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '3rem' }}>
                    <ArrowLeft size={16} /> {t.grievanceForm?.dashboardBtn || "Dashboard"}
                </button>
                <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <ShieldAlert size={48} color="#f43f5e" />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 1rem 0', lineHeight: 1.2 }}>{t.grievanceForm?.title || "JanMitra AI Grievance"}</h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0 }}>
                    {t.grievanceForm?.description || "Describe your civic issue in your own words. JanMitra AI will automatically analyze your complaint and route it to the correct department."}
                </p>
            </div>
            
            <div className="form-main" style={{ flex: 1, marginLeft: '400px', padding: '4rem', display: 'flex', justifyContent: 'center' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '700px' }}>
                    {!result ? (
                        <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div>
                                <label style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '1rem', marginBottom: '0.75rem', display: 'block' }}>{t.grievanceForm?.describeLabel || "Describe the Issue"}</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={t.grievanceForm?.placeholder || "e.g. There is a large pothole near Civil Lines Prayagraj and many bikes are slipping."}
                                    rows="6"
                                    className="premium-input-ai"
                                    style={{ resize: 'vertical' }}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', border: 'none', cursor: 'pointer' }}>
                                    {loading ? <Loader2 className="animate-spin" /> : (t.grievanceForm?.analyzeBtn || "Analyze with AI")}
                                    {!loading && <Send size={20} />}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', borderRadius: '24px', padding: '3rem', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                                    <ShieldAlert size={24} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>{t.grievanceForm?.analysisComplete || "AI Analysis Complete"}</h2>
                                    <p style={{ color: 'var(--text-muted)', margin: 0, marginTop: '4px' }}>{t.grievanceForm?.readyToRoute || "Ready to route to the correct department"}</p>
                                </div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}><AlertTriangle size={16} /> {t.grievanceForm?.category || "Category"}</div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--primary)' }}>{result.issue_category}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}><Activity size={16} /> {t.grievanceForm?.severity || "Severity"}</div>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: getSeverityColor(result.severity) }}>{result.severity?.toUpperCase() || result.severity}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}><Building2 size={16} /> {t.grievanceForm?.routeTo || "Route To"}</div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--primary)' }}>{result.department}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}><MapPin size={16} /> {t.grievanceForm?.location || "Location"}</div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--primary)' }}>{result.location || (t.grievanceForm?.notSpecified || 'Not Specified')}</div>
                                </div>
                            </div>
                            
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
                                <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t.grievanceForm?.issueSummary || "Issue Summary"}</div>
                                <div style={{ fontWeight: 500, color: 'var(--primary)', lineHeight: 1.5 }}>{result.short_summary}</div>
                                <div style={{ color: 'var(--text-muted)', marginTop: '1rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t.grievanceForm?.recommendedAction || "Recommended Action"}</div>
                                <div style={{ fontWeight: 500, color: 'var(--accent)', lineHeight: 1.5 }}>{result.recommended_action}</div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setResult(null)} style={{ padding: '0.8rem 1.5rem', border: '1px solid #e2e8f0', background: 'white', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-muted)' }}>{t.grievanceForm?.editInput || "Edit Input"}</button>
                                <button onClick={handleSubmit} className="btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>{t.grievanceForm?.submitGrievance || "Submit Grievance"} <Send size={18} /></button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
            
            <style>{`
                .premium-input-ai {
                    background: white;
                    border: 1px solid #e2e8f0;
                    padding: 1.2rem;
                    border-radius: 12px;
                    transition: all 0.3s ease;
                    font-size: 1.1rem;
                    line-height: 1.5;
                    width: 100%;
                    font-family: inherit;
                }
                .premium-input-ai:focus {
                    border-color: var(--secondary);
                    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
                    transform: translateY(-2px);
                    outline: none;
                }
                @media (max-width: 1024px) {
                    .form-sidebar { width: 100% !important; height: auto !important; position: relative !important; padding: 2rem !important; }
                    .form-main { margin-left: 0 !important; padding: 2rem !important; }
                }
            `}</style>
        </div>
    );
}
