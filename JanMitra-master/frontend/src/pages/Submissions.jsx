import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Download, Trash2, Eye, FileText, Calendar, Clock, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Submissions() {
    const { t } = useLanguage();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const response = await axios.get('/api/submissions');
            // Sort by latest first
            const sorted = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setSubmissions(sorted);
        } catch (error) {
            console.error("Error fetching submissions:", error);
        } finally {
            setLoading(false);
        }
    };

    const downloadJSON = (submission, e) => {
        e.stopPropagation();
        const element = document.createElement('a');
        const file = new Blob([JSON.stringify(submission, null, 2)], { type: 'application/json' });
        element.href = URL.createObjectURL(file);
        element.download = `Application_${submission.id}.json`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const deleteSubmission = async (id, e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to withdraw this application?')) {
            // Optimistic update
            setSubmissions(prev => prev.filter(s => s.id !== id));
            // Actual API call would go here
            // await axios.delete(...)
        }
    };

    // Helper to determine status color (Random for mock demo)
    const getStatus = (id) => {
        const statuses = [
            { label: 'Under Review', color: 'orange', icon: Clock, bg: '#fff7ed' },
            { label: 'Approved', color: 'green', icon: CheckCircle, bg: '#f0fdf4' },
            { label: 'Action Required', color: 'red', icon: AlertCircle, bg: '#fef2f2' }
        ];
        return statuses[id % 3]; // Deterministic mock status
    };

    return (
        <div style={{ minHeight: '100vh', padding: '3rem 2rem', background: 'var(--bg-color)' }}>
            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '3rem', textAlign: 'center' }}
                >
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                        My Applications
                    </h1>
                    <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
                        Track status and manage your submitted forms
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex-center" style={{ padding: '4rem' }}>
                        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: 'var(--secondary)', borderRadius: '50%' }}></div>
                    </div>
                ) : submissions.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-panel"
                        style={{ padding: '4rem', textAlign: 'center', borderRadius: '24px' }}
                    >
                        <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <FileText size={32} color="#94a3b8" />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>No Applications Yet</h3>
                        <p style={{ color: 'var(--text-light)' }}>Start by browsing services to find relevant schemes.</p>
                    </motion.div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {submissions.map((submission, index) => {
                            const status = getStatus(index);
                            const StatusIcon = status.icon;
                            const isExpanded = expandedId === submission.id;

                            return (
                                <motion.div
                                    key={submission.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => setExpandedId(isExpanded ? null : submission.id)}
                                    layout
                                    style={{
                                        background: 'white',
                                        borderRadius: '16px',
                                        boxShadow: isExpanded ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                        border: '1px solid rgba(226, 232, 240, 0.8)',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        transition: 'box-shadow 0.3s ease'
                                    }}
                                >
                                    {/* Card Header Strip */}
                                    <div style={{
                                        display: 'flex',
                                        padding: '1.5rem',
                                        alignItems: 'center',
                                        gap: '1.5rem',
                                        position: 'relative'
                                    }}>
                                        {/* Colored Status Bar on Left */}
                                        <div style={{
                                            position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px',
                                            background: status.color === 'green' ? '#10b981' : status.color === 'orange' ? '#f59e0b' : '#ef4444'
                                        }}></div>

                                        {/* Icon */}
                                        <div style={{
                                            width: '50px', height: '50px',
                                            background: '#f8fafc', borderRadius: '12px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <FileText size={24} color="var(--primary)" />
                                        </div>

                                        {/* Main Info */}
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>
                                                {submission.formType}
                                            </h3>
                                            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={14} /> {new Date(submission.timestamp).toLocaleDateString()}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={14} /> {new Date(submission.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            background: status.bg,
                                            color: status.color === 'green' ? '#15803d' : status.color === 'orange' ? '#c2410c' : '#b91c1c',
                                            fontSize: '0.85rem', fontWeight: 600,
                                            display: 'flex', alignItems: 'center', gap: '6px'
                                        }}>
                                            <StatusIcon size={14} /> {status.label}
                                        </div>

                                        {/* Expand Chevron */}
                                        <div style={{ padding: '8px', color: 'var(--text-light)' }}>
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                style={{ borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}
                                            >
                                                <div style={{ padding: '2rem' }}>

                                                    {/* Data Grid */}
                                                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' }}>Application Details</h4>
                                                    <div style={{
                                                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                                        gap: '1.5rem', marginBottom: '2rem'
                                                    }}>
                                                        {Object.entries(submission.formData).map(([key, value]) => (
                                                            <div key={key}>
                                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block', marginBottom: '4px', textTransform: 'capitalize' }}>
                                                                    {key.replace(/_/g, ' ')}
                                                                </span>
                                                                <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--primary)', display: 'block', wordBreak: 'break-word' }}>
                                                                    {value ? value.toString() : '-'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                                                        <button
                                                            onClick={(e) => downloadJSON(submission, e)}
                                                            className="btn btn-secondary"
                                                            style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                                                        >
                                                            <Download size={16} /> Download Receipt
                                                        </button>
                                                        <button
                                                            onClick={(e) => deleteSubmission(submission.id, e)}
                                                            style={{
                                                                background: '#fee2e2', color: '#dc2626',
                                                                border: 'none', padding: '0.6rem 1.2rem', borderRadius: '12px',
                                                                fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <Trash2 size={16} /> Withdraw Application
                                                        </button>
                                                    </div>

                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
