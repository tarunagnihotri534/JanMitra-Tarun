import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, AlertTriangle, ShieldCheck, CheckCircle, Info, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FormReader() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setAnalysis(null);
            setError('');
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/analyze-form-risk', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to analyze document.');
            
            const data = await response.json();
            setAnalysis(data);
        } catch (err) {
            setError(err.message || "An error occurred during analysis.");
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level) => {
        if (level?.includes('High')) return '#ef4444'; // Red
        if (level?.includes('Medium')) return '#f59e0b'; // Amber
        return '#10b981'; // Green
    };

    const getRiskIcon = (level) => {
        if (level?.includes('High')) return <AlertTriangle size={32} color="#ef4444" />;
        if (level?.includes('Medium')) return <Info size={32} color="#f59e0b" />;
        return <CheckCircle size={32} color="#10b981" />;
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '4rem 2rem' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ marginBottom: '3rem' }}>
                    <Link to="/services" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1.5rem', fontWeight: 500 }}>
                        <ArrowLeft size={18} /> Back to Services
                    </Link>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                        Smart Form <span style={{ color: 'var(--accent)' }}>Analyzer</span>
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-light)', lineHeight: 1.6 }}>
                        Upload any legal document, agreement, or form. Our AI acts as your personal legal assistant to detect hidden risks, unfair clauses, and potential fraud before you sign.
                    </p>
                </div>

                {/* Upload Section */}
                <motion.div 
                    className="card-premium"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '3rem', textAlign: 'center', padding: '3rem 2rem' }}
                >
                    <div style={{ 
                        border: '2px dashed #cbd5e1', 
                        borderRadius: '16px', 
                        padding: '3rem 2rem', 
                        background: '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }} onClick={() => document.getElementById('doc-upload').click()}>
                        
                        <UploadCloud size={64} color="var(--primary-light)" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                            {file ? file.name : "Click or Drag to Upload Document"}
                        </h3>
                        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                            {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Supports PDF, JPG, PNG"}
                        </p>
                        <input 
                            type="file" 
                            id="doc-upload" 
                            accept=".pdf,image/*" 
                            style={{ display: 'none' }} 
                            onChange={handleFileChange}
                        />
                    </div>

                    {error && (
                        <div style={{ marginTop: '1.5rem', color: '#ef4444', backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                            {error}
                        </div>
                    )}

                    <button 
                        className="btn-primary"
                        onClick={handleAnalyze}
                        disabled={!file || loading}
                        style={{ marginTop: '2rem', width: '100%', maxWidth: '300px', fontSize: '1.1rem', padding: '1rem' }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={24} /> : "Analyze Document"}
                    </button>
                </motion.div>

                {/* Analysis Results */}
                <AnimatePresence>
                    {analysis && (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card-premium"
                            style={{ background: 'white' }}
                        >
                            {/* Result Header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                                {getRiskIcon(analysis.risk_level)}
                                <div>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: getRiskColor(analysis.risk_level), margin: 0 }}>
                                        {analysis.risk_level}
                                    </h2>
                                    <p style={{ color: '#64748b', margin: '4px 0 0 0', fontWeight: 600 }}>{analysis.recommendation}</p>
                                </div>
                            </div>

                            {/* Summary & Explanation */}
                            <div style={{ marginBottom: '2.5rem' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary)' }}>Executive Summary</h3>
                                <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#334155', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                                    {analysis.summary}
                                </p>
                            </div>

                            <div style={{ marginBottom: '2.5rem' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary)' }}>Simple Explanation</h3>
                                <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#475569' }}>
                                    {analysis.explanation}
                                </p>
                            </div>

                            {/* Key Risks */}
                            {analysis.key_risks && analysis.key_risks.length > 0 && (
                                <div style={{ marginBottom: '2.5rem' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>Identified Risks</h3>
                                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {analysis.key_risks.map((risk, index) => (
                                            <li key={index} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#fffbeb', padding: '1rem', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                                                <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                                                <span style={{ color: '#92400e', lineHeight: 1.5 }}>{risk}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Suspicious Clauses */}
                            {analysis.suspicious_clauses && analysis.suspicious_clauses.length > 0 && (
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>Suspicious Fine Print & Clauses</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {analysis.suspicious_clauses.map((clause, index) => (
                                            <div key={index} style={{ background: '#fef2f2', padding: '1.25rem', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                                                <p style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#991b1b', background: 'white', padding: '0.75rem', borderRadius: '6px', border: '1px solid #fca5a5', marginBottom: '0.75rem' }}>
                                                    "{clause.clause}"
                                                </p>
                                                <p style={{ fontSize: '0.95rem', color: '#b91c1c', margin: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <Info size={16} /> <strong>Why it's risky:</strong> {clause.reason}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
