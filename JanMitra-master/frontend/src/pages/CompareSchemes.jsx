import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, ArrowRight, ArrowLeft, User, MapPin, CheckCircle,
    X, Trophy, Zap, Heart, GraduationCap,
    Landmark, ShieldCheck, Sprout, Users, Activity, FileText, Upload
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import './CompareSchemes.css';

// ─── Indian States ────────────────────────────────────────────────────────────
const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman & Nicobar', 'Chandigarh', 'Delhi', 'Jammu & Kashmir',
    'Ladakh', 'Lakshadweep', 'Puducherry'
];

// ─── Category mapping by age ──────────────────────────────────────────────────
const AGE_TO_KEYWORDS = {
    '0-14': ['child', 'education', 'scholarship', 'school', 'nutrition', 'health'],
    '15-24': ['youth', 'skill', 'education', 'employment', 'scholarship', 'training', 'startup'],
    '25-40': ['housing', 'employment', 'women', 'business', 'mudra', 'health', 'farmer'],
    '41-59': ['farmer', 'agriculture', 'business', 'livelihood', 'income', 'pension'],
    '60+': ['pension', 'old age', 'senior', 'widow', 'health', 'disability'],
};

// ─── Icon picker ──────────────────────────────────────────────────────────────
function getSchemeIcon(scheme) {
    const n = (scheme.name + ' ' + (scheme.description || '')).toLowerCase();
    if (n.includes('pension') || n.includes('old age')) return Landmark;
    if (n.includes('health') || n.includes('ayushman')) return Activity;
    if (n.includes('education') || n.includes('scholarship')) return GraduationCap;
    if (n.includes('farmer') || n.includes('agriculture') || n.includes('kisan')) return Sprout;
    if (n.includes('women') || n.includes('mahila')) return Heart;
    if (n.includes('employment') || n.includes('rozgar')) return Users;
    if (n.includes('security') || n.includes('bima') || n.includes('insurance')) return ShieldCheck;
    return FileText;
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ step, total }) {
    return (
        <div className="cs-step-bar">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className={`cs-step-dot ${i < step ? 'done' : ''} ${i === step - 1 ? 'active' : ''}`}>
                    {i < step - 1 ? <CheckCircle size={14} /> : <span>{i + 1}</span>}
                </div>
            ))}
            <div className="cs-step-progress" style={{ width: `${((step - 1) / (total - 1)) * 100}%` }} />
        </div>
    );
}

// ─── Result Card ──────────────────────────────────────────────────────────────
function ResultCard({ scheme, rank, onViewDetails, cs }) {
    const Icon = getSchemeIcon(scheme);
    const colors = ['#d97706', '#64748b', '#ca8a04'];
    const medals = ['🥇', '🥈', '🥉'];
    const rankColor = colors[rank] || '#3b82f6';

    return (
        <motion.div
            className="cs-result-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rank * 0.12 }}
            whileHover={{ y: -6, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.18)' }}
        >
            <div className="cs-rank-badge" style={{ background: rankColor }}>
                {medals[rank] || `#${rank + 1}`}
            </div>
            <div className="cs-result-icon" style={{ background: `${rankColor}18`, color: rankColor }}>
                <Icon size={28} />
            </div>
            <h3 className="cs-result-name">{scheme.name}</h3>
            <p className="cs-result-desc">{scheme.description}</p>

            {scheme.benefits && scheme.benefits.length > 0 && (
                <div className="cs-result-benefits">
                    <span className="cs-benefits-label">
                        <Sparkles size={13} /> {cs.keyBenefits || 'Key Benefits'}
                    </span>
                    <ul>
                        {scheme.benefits.slice(0, 3).map((b, i) => (
                            <li key={i}>{b}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="cs-result-actions">
                <button className="cs-btn-outline" onClick={() => onViewDetails(scheme)}>
                    {cs.viewDetails || 'View Details'}
                </button>
                <Link to={`/forms/${scheme.id}`} className="cs-btn-primary">
                    {cs.applyNow || 'Apply Now'} <ArrowRight size={16} />
                </Link>
            </div>
        </motion.div>
    );
}

// ─── Details Modal ────────────────────────────────────────────────────────────
function DetailsModal({ scheme, onClose, cs }) {
    if (!scheme) return null;
    const Icon = getSchemeIcon(scheme);

    return (
        <AnimatePresence>
            <motion.div className="cs-modal-overlay" onClick={onClose}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="cs-modal-box" onClick={e => e.stopPropagation()}
                    initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}>

                    <button className="cs-modal-close" onClick={onClose}><X size={20} /></button>

                    <div className="cs-modal-header">
                        <div className="cs-modal-icon"><Icon size={32} /></div>
                        <h2>{scheme.name}</h2>
                    </div>

                    <p className="cs-modal-desc">{scheme.description}</p>

                    {scheme.benefits && scheme.benefits.length > 0 && (
                        <div className="cs-modal-section">
                            <h4><Sparkles size={16} /> {cs.keyBenefits || 'Key Benefits'}</h4>
                            <ul>{scheme.benefits.map((b, i) => <li key={i}>{b}</li>)}</ul>
                        </div>
                    )}

                    {scheme.required_docs && scheme.required_docs.length > 0 && (
                        <div className="cs-modal-section">
                            <h4><FileText size={16} /> {cs.requiredDocs || 'Required Documents'}</h4>
                            <div className="cs-tags">
                                {scheme.required_docs.map((d, i) => <span key={i} className="cs-tag">{d}</span>)}
                            </div>
                        </div>
                    )}

                    {scheme.details && scheme.details.length > 0 && (
                        <div className="cs-modal-section">
                            {scheme.details.map((s, i) => (
                                <div key={i} style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ marginBottom: '0.4rem' }}>{s.title}</h4>
                                    <p style={{ color: '#4b5563', lineHeight: 1.6, fontSize: '0.95rem' }}>{s.content}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <Link to={`/forms/${scheme.id}`} className="cs-btn-primary cs-modal-apply" onClick={onClose}>
                        {cs.applyNow || 'Apply Now'} <ArrowRight size={16} />
                    </Link>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CompareSchemes() {
    const { language, t } = useLanguage();
    const cs = t.compareSchemes || {};

    // Build age groups from translations (reactive to language switch)
    const AGE_GROUPS = [
        { id: '0-14', label: cs.ageGroups?.child?.label || 'Child (0–14 yrs)', icon: '👶', color: '#f59e0b', desc: cs.ageGroups?.child?.desc || 'Primary and secondary education support' },
        { id: '15-24', label: cs.ageGroups?.youth?.label || 'Youth (15–24 yrs)', icon: '🎓', color: '#3b82f6', desc: cs.ageGroups?.youth?.desc || 'Skill development and higher education' },
        { id: '25-40', label: cs.ageGroups?.adult?.label || 'Adult (25–40 yrs)', icon: '💼', color: '#8b5cf6', desc: cs.ageGroups?.adult?.desc || 'Employment and housing schemes' },
        { id: '41-59', label: cs.ageGroups?.middle?.label || 'Middle Age (41–59)', icon: '🏡', color: '#10b981', desc: cs.ageGroups?.middle?.desc || 'Farmer, business, and livelihood schemes' },
        { id: '60+', label: cs.ageGroups?.senior?.label || 'Senior (60+ yrs)', icon: '🧓', color: '#ef4444', desc: cs.ageGroups?.senior?.desc || 'Pension and healthcare support' },
    ];

    // Wizard state
    const [step, setStep] = useState(0); // 0 is initial choice (Manual vs Document)
    const [selectedAge, setSelectedAge] = useState(null);
    const [selectedState, setSelectedState] = useState('');
    const [stateSearch, setStateSearch] = useState('');
    const [details, setDetails] = useState({ gender: '', category: '', occupation: '', income: '' });
    const [isScanning, setIsScanning] = useState(false);

    // Schemes
    const [allSchemes, setAllSchemes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [viewScheme, setViewScheme] = useState(null);

    // Fetch all schemes once (re-fetch on language change for translated content)
    useEffect(() => {
        const langParam = language ? language.toLowerCase() : 'en';
        fetch(`/api/schemes?language=${langParam}`)
            .then(r => r.json())
            .then(data => setAllSchemes(data))
            .catch(console.error);
    }, [language]);

    const filteredStates = INDIAN_STATES.filter(s =>
        s.toLowerCase().includes(stateSearch.toLowerCase())
    );

    // ─── Scoring ──────────────────────────────────────────────────────────
    function scoreScheme(scheme) {
        let score = 0;
        const text = [scheme.name, scheme.description, ...(scheme.benefits || [])].join(' ').toLowerCase();
        const keywords = AGE_TO_KEYWORDS[selectedAge] || [];
        keywords.forEach(kw => { if (text.includes(kw)) score += 10; });
        if (details.gender === 'female' && (text.includes('women') || text.includes('mahila') || text.includes('widow'))) score += 15;
        if (details.gender === 'male' && (text.includes('farmer') || text.includes('employment') || text.includes('kisan'))) score += 5;
        if (details.category === 'sc' && (text.includes('sc') || text.includes('scheduled caste') || text.includes('dalit'))) score += 12;
        if (details.category === 'st' && (text.includes('st') || text.includes('scheduled tribe') || text.includes('tribal'))) score += 12;
        if (details.category === 'obc' && text.includes('obc')) score += 12;
        if (details.occupation === 'farmer' && (text.includes('kisan') || text.includes('farmer') || text.includes('agriculture'))) score += 15;
        if (details.occupation === 'student' && (text.includes('scholar') || text.includes('education') || text.includes('student'))) score += 15;
        if (details.occupation === 'entrepreneur' && (text.includes('mudra') || text.includes('startup') || text.includes('business'))) score += 15;
        if (details.income === 'below1' && (text.includes('bpl') || text.includes('poor') || text.includes('ration') || text.includes('subsidy'))) score += 12;
        return score;
    }

    function runFilter() {
        setLoading(true);
        setTimeout(() => {
            const scored = allSchemes
                .map(s => ({ ...s, _score: scoreScheme(s) }))
                .sort((a, b) => b._score - a._score)
                .slice(0, 9);
            setResults(scored);
            setLoading(false);
            setStep(4);
        }, 1200);
    }
    
    // ─── Document Scanner ──────────────────────────────────────────────────
    async function handleDocumentUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        setIsScanning(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post("/api/analyze-document", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Map AI inferences to state
            const data = res.data;
            if (data.age_group) setSelectedAge(data.age_group);
            if (data.state) setSelectedState(INDIAN_STATES.find(s => s.toLowerCase() === data.state.toLowerCase()) || '');
            
            setDetails(prev => ({
                ...prev,
                gender: data.gender || '',
                category: data.category || '',
                occupation: data.occupation || '',
                income: data.income || '1to3'
            }));

            // Auto advance
            setIsScanning(false);
            setStep(3); // Go to final details to confirm/edit
        } catch (error) {
            console.error(error);
            alert("Failed to analyze document. Please proceed manually.");
            setIsScanning(false);
        }
    }

    const slideVariants = {
        initial: { opacity: 0, x: 60 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -60 },
    };

    return (
        <div className="cs-page">

            {/* ── Hero Banner ──────────────────────────────────────────── */}
            <div className="cs-hero">
                <div className="cs-hero-badge">
                    <Trophy size={16} /> {cs.heroBadge || 'Scheme Recommender'}
                </div>
                <h1 className="cs-hero-title">
                    {cs.heroTitle || 'Compare & Find the'}{' '}
                    <span className="cs-highlight">{cs.heroHighlight || 'Best Scheme'}</span>{' '}
                    {cs.heroTitleEnd || 'for You'}
                </h1>
                <p className="cs-hero-sub">
                    {cs.heroSub || "Answer 3 quick questions and we'll match you with the most relevant government schemes."}
                </p>
            </div>

            {/* ── Wizard Card ──────────────────────────────────────────── */}
            {step > 0 && step < 4 && (
                <div className="cs-wizard-wrap">
                    <StepIndicator step={step} total={3} />

                    <AnimatePresence mode="wait">

                        {/* STEP 1 – Age */}
                        {step === 1 && (
                            <motion.div key="step1" className="cs-step" variants={slideVariants}
                                initial="initial" animate="animate" exit="exit">
                                <div className="cs-step-header">
                                    <User size={28} className="cs-step-icon-svg" />
                                    <div>
                                        <h2>{cs.step1Title || 'What is your age group?'}</h2>
                                        <p>{cs.step1Sub || "We'll filter schemes based on your life stage"}</p>
                                    </div>
                                </div>

                                <div className="cs-age-grid">
                                    {AGE_GROUPS.map(ag => (
                                        <motion.button
                                            key={ag.id}
                                            className={`cs-age-card ${selectedAge === ag.id ? 'selected' : ''}`}
                                            style={{ '--ag-color': ag.color }}
                                            whileHover={{ scale: 1.04 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedAge(ag.id)}
                                        >
                                            <span className="cs-age-emoji">{ag.icon}</span>
                                            <strong>{ag.label}</strong>
                                            <small>{ag.desc}</small>
                                            {selectedAge === ag.id && (
                                                <div className="cs-age-check"><CheckCircle size={18} /></div>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>

                                <div className="cs-step-footer">
                                    <button className="cs-btn-primary cs-btn-next" disabled={!selectedAge}
                                        onClick={() => setStep(2)}>
                                        {cs.step1Next || 'Next: Select State'} <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2 – State */}
                        {step === 2 && (
                            <motion.div key="step2" className="cs-step" variants={slideVariants}
                                initial="initial" animate="animate" exit="exit">
                                <div className="cs-step-header">
                                    <MapPin size={28} className="cs-step-icon-svg" />
                                    <div>
                                        <h2>{cs.step2Title || 'Which state are you from?'}</h2>
                                        <p>{cs.step2Sub || 'Some schemes are state-specific'}</p>
                                    </div>
                                </div>

                                <input
                                    className="cs-search-input"
                                    placeholder={cs.step2Search || '🔍  Search state...'}
                                    value={stateSearch}
                                    onChange={e => setStateSearch(e.target.value)}
                                />

                                <div className="cs-state-grid">
                                    {filteredStates.map(st => (
                                        <button
                                            key={st}
                                            className={`cs-state-pill ${selectedState === st ? 'selected' : ''}`}
                                            onClick={() => setSelectedState(st)}
                                        >
                                            {selectedState === st && <CheckCircle size={14} />}
                                            {st}
                                        </button>
                                    ))}
                                </div>

                                <div className="cs-step-footer">
                                    <button className="cs-btn-ghost" onClick={() => setStep(1)}>
                                        <ArrowLeft size={16} /> {cs.back || 'Back'}
                                    </button>
                                    <button className="cs-btn-primary cs-btn-next" disabled={!selectedState}
                                        onClick={() => setStep(3)}>
                                        {cs.step2Next || 'Next: Your Details'} <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3 – Details */}
                        {step === 3 && (
                            <motion.div key="step3" className="cs-step" variants={slideVariants}
                                initial="initial" animate="animate" exit="exit">
                                <div className="cs-step-header">
                                    <Sparkles size={28} className="cs-step-icon-svg" />
                                    <div>
                                        <h2>{cs.step3Title || 'Tell us a bit more about yourself'}</h2>
                                        <p>{cs.step3Sub || 'This helps us give highly accurate recommendations'}</p>
                                    </div>
                                </div>

                                <div className="cs-details-grid">

                                    {/* Gender */}
                                    <div className="cs-field">
                                        <label>{cs.genderLabel || 'Gender'}</label>
                                        <div className="cs-options-row">
                                            {[
                                                ['male', cs.genderMale || '👨 Male'],
                                                ['female', cs.genderFemale || '👩 Female'],
                                                ['other', cs.genderOther || '🧑 Other'],
                                            ].map(([val, lbl]) => (
                                                <button key={val}
                                                    className={`cs-option-btn ${details.gender === val ? 'active' : ''}`}
                                                    onClick={() => setDetails(d => ({ ...d, gender: val }))}>
                                                    {lbl}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Social Category */}
                                    <div className="cs-field">
                                        <label>{cs.categoryLabel || 'Social Category'}</label>
                                        <div className="cs-options-row">
                                            {[
                                                ['general', cs.catGeneral || 'General'],
                                                ['sc', cs.catSC || 'SC'],
                                                ['st', cs.catST || 'ST'],
                                                ['obc', cs.catOBC || 'OBC'],
                                            ].map(([val, lbl]) => (
                                                <button key={val}
                                                    className={`cs-option-btn ${details.category === val ? 'active' : ''}`}
                                                    onClick={() => setDetails(d => ({ ...d, category: val }))}>
                                                    {lbl}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Occupation */}
                                    <div className="cs-field">
                                        <label>{cs.occupationLabel || 'Occupation'}</label>
                                        <div className="cs-options-row cs-wrap">
                                            {[
                                                ['farmer', cs.occFarmer || '🌾 Farmer'],
                                                ['student', cs.occStudent || '📚 Student'],
                                                ['entrepreneur', cs.occBusiness || '🏪 Business'],
                                                ['salaried', cs.occSalaried || '💼 Salaried'],
                                                ['unemployed', cs.occUnemployed || '🔍 Unemployed'],
                                                ['other', cs.occOther || '🙋 Other'],
                                            ].map(([val, lbl]) => (
                                                <button key={val}
                                                    className={`cs-option-btn ${details.occupation === val ? 'active' : ''}`}
                                                    onClick={() => setDetails(d => ({ ...d, occupation: val }))}>
                                                    {lbl}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Annual Income */}
                                    <div className="cs-field">
                                        <label>{cs.incomeLabel || 'Annual Family Income'}</label>
                                        <div className="cs-options-row cs-wrap">
                                            {[
                                                ['below1', cs.incBelow1 || 'Below ₹1 Lakh'],
                                                ['1to3', cs.inc1to3 || '₹1–3 Lakh'],
                                                ['3to8', cs.inc3to8 || '₹3–8 Lakh'],
                                                ['above8', cs.incAbove8 || 'Above ₹8 Lakh'],
                                            ].map(([val, lbl]) => (
                                                <button key={val}
                                                    className={`cs-option-btn ${details.income === val ? 'active' : ''}`}
                                                    onClick={() => setDetails(d => ({ ...d, income: val }))}>
                                                    {lbl}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="cs-step-footer">
                                    <button className="cs-btn-ghost" onClick={() => setStep(2)}>
                                        <ArrowLeft size={16} /> {cs.back || 'Back'}
                                    </button>
                                    <button className="cs-btn-primary cs-btn-next" onClick={runFilter}
                                        disabled={!details.gender || !details.category || !details.occupation || !details.income}>
                                        <Zap size={18} /> {cs.step3Find || 'Find Best Schemes'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* ── Loading ───────────────────────────────────────────────── */}
            {loading && (
                <div className="cs-loading">
                    <div className="cs-loading-spinner" />
                    <p>
                        {cs.loading || 'Analysing'} <strong>{allSchemes.length}+</strong>{' '}
                        {cs.loadingSchemesFor || 'government schemes for you…'}
                    </p>
                </div>
            )}

            {/* ── Results ───────────────────────────────────────────────── */}
            {step === 4 && !loading && (
                <motion.div className="cs-results-wrap"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                    {/* Summary Bar */}
                    <div className="cs-summary-bar">
                        <div className="cs-summary-info">
                            <Trophy size={20} className="cs-trophy" />
                            <div>
                                <strong>{cs.yourRecommendations || 'Your Personalised Recommendations'}</strong>
                                <span>{selectedAge} yrs • {selectedState} • {details.occupation || 'N/A'} • {(details.category || '').toUpperCase() || 'N/A'}</span>
                            </div>
                        </div>
                        <button className="cs-btn-ghost cs-restart"
                            onClick={() => {
                                setStep(0); setSelectedAge(null); setSelectedState('');
                                setStateSearch(''); setDetails({ gender: '', category: '', occupation: '', income: '' });
                                setResults([]);
                            }}>
                            <ArrowLeft size={16} /> {cs.startOver || 'Start Over'}
                        </button>
                    </div>

                    {/* Top Pick Banner */}
                    {results[0] && (
                        <div className="cs-top-pick">
                            <div className="cs-top-pick-badge">{cs.bestMatch || '🥇 Best Match for You'}</div>
                            <h2>{results[0].name}</h2>
                            <p>{results[0].description}</p>
                            <div className="cs-top-pick-actions">
                                <button className="cs-btn-outline-white" onClick={() => setViewScheme(results[0])}>
                                    {cs.viewDetails || 'View Details'}
                                </button>
                                <Link to={`/forms/${results[0].id}`} className="cs-btn-gold">
                                    {cs.applyNow || 'Apply Now'} <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Results Grid */}
                    <h3 className="cs-results-sub">
                        {cs.allRecommended || 'All Recommended Schemes'} ({results.length})
                    </h3>
                    <div className="cs-results-grid">
                        {results.map((s, i) => (
                            <ResultCard key={s.id} scheme={s} rank={i} onViewDetails={setViewScheme} cs={cs} />
                        ))}
                    </div>

                    {results.length === 0 && (
                        <div className="cs-no-results">
                            <p>{cs.noResults || 'No schemes matched your profile. Try adjusting your details.'}</p>
                            <button className="cs-btn-primary" onClick={() => { setStep(0); setResults([]); }}>
                                {cs.tryAgain || 'Try Again'}
                            </button>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Details Modal */}
            {viewScheme && (
                <DetailsModal scheme={viewScheme} onClose={() => setViewScheme(null)} cs={cs} />
            )}
            
            {/* ── Initial Initial Modal Selection ────────────────────────────── */}
            {step === 0 && (
                <div className="cs-wizard-wrap">
                    <motion.div className="cs-step" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>{cs.selectionTitle || "How would you like to proceed?"}</h2>
                            <p style={{ color: '#64748b' }}>{cs.selectionSub || "Upload your ID card for AI autofill or enter details manually."}</p>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            
                            {/* Option 1: AI Doc Upload */}
                            <label className="cs-upload-card" style={{ cursor: 'pointer', textAlign: 'center', padding: '3rem 2rem', border: '2px dashed #3b82f6', borderRadius: '24px', background: '#eff6ff', transition: 'all 0.3s' }}>
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleDocumentUpload} disabled={isScanning} />
                                <div style={{ background: 'white', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#3b82f6', boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.3)' }}>
                                    {isScanning ? <div className="cs-loading-spinner" style={{ width: '30px', height: '30px', borderWidth: '3px', borderColor: '#bfdbfe', borderTopColor: '#3b82f6' }} /> : <Upload size={30} />}
                                </div>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '0.5rem' }}>{cs.aiTitle || "AI Auto-Fill"}</h3>
                                <p style={{ fontSize: '0.95rem', color: '#3b82f6', margin: 0 }}>{cs.aiSub || "Fastest. Upload Aadhar, PAN, or any ID card."}</p>
                                {isScanning && <p style={{ marginTop: '1rem', fontWeight: 600, color: '#2563eb' }}>{cs.scanning || "Analysing document..."}</p>}
                            </label>

                            {/* Option 2: Manual */}
                            <button className="cs-upload-card" style={{ textAlign: 'center', padding: '3rem 2rem', border: '2px solid #e2e8f0', borderRadius: '24px', background: 'white', cursor: 'pointer', transition: 'all 0.3s' }} onClick={() => setStep(1)}>
                                <div style={{ background: '#f8fafc', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#64748b', border: '1px solid #e2e8f0' }}>
                                    <FileText size={28} />
                                </div>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>{cs.manualTitle || "Fill Manually"}</h3>
                                <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>{cs.manualSub || "Answer a few quick questions yourself."}</p>
                            </button>
                            
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
