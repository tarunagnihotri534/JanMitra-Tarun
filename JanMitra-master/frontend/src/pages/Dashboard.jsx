import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, Landmark, Activity, CreditCard, ShieldCheck, ChevronRight, Loader2, Sparkles, ArrowRight, Mic, Zap, Globe, Lock, GraduationCap, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Sidebar from '../components/Sidebar';
import gsap from 'gsap';
import './Dashboard.css';
import MagneticButton from '../components/MagneticButton';
import SpeakerButton from '../components/SpeakerButton';

const ServiceCard = ({ icon: Icon, title, desc, link, index }) => (
    <Link to={link} className="service-card-link" style={{ textDecoration: 'none', color: 'inherit' }}>
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-premium h-full service-card-gsap"
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.2rem',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.8))',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.6)',
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
                padding: '2rem'
            }}
        >
            <div className="service-icon-box" style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                width: '64px', height: '64px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '20px',
                color: 'white',
                boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.4)'
            }}>
                <Icon size={30} strokeWidth={1.5} />
            </div>
            <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary)', letterSpacing: '-0.5px' }}>{title}</h3>
                <p style={{ fontSize: '1rem', color: 'var(--text-light)', lineHeight: 1.6 }}>{desc}</p>
            </div>
            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', fontSize: '0.95rem', fontWeight: 700, color: 'var(--secondary)' }}>
                <span className="group-hover:translate-x-1 transition-transform" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Apply Now <ChevronRight size={18} />
                </span>
            </div>
        </motion.div>
    </Link>
);

const FeatureCard = ({ icon: Icon, title, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, type: "spring", stiffness: 100 }}
        style={{
            background: 'white',
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: '0 20px 40px -5px rgba(0,0,0,0.1)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem',
            border: '1px solid rgba(0,0,0,0.05)',
            minWidth: '140px'
        }}
    >
        <div style={{ background: `${color}15`, padding: '12px', borderRadius: '50%', color: color }}>
            <Icon size={28} />
        </div>
        <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.95rem' }}>{title}</span>
    </motion.div>
);

const SchemeDetailsModal = ({ scheme, onClose, t }) => {
    if (!scheme) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    background: 'white',
                    width: '90%', maxWidth: '700px',
                    maxHeight: '85vh',
                    borderRadius: '24px',
                    padding: '2rem',
                    overflowY: 'auto',
                    position: 'relative',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                }}
            >
                <button onClick={onClose} style={{
                    position: 'absolute', top: '20px', right: '20px',
                    background: '#f3f4f6', border: 'none', borderRadius: '50%',
                    width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#374151'
                }}>
                    <X size={20} />
                </button>

                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)', paddingRight: '40px', display: 'flex', alignItems: 'start', gap: '10px' }}>
                    {scheme.name}
                    <SpeakerButton text={scheme.name} />
                </h2>

                {/* Benefits Section in Modal */}
                {scheme.benefits && scheme.benefits.length > 0 && (
                    <div style={{ marginBottom: '1.5rem', background: '#f0fdf4', padding: '16px', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#166534', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Sparkles size={18} /> {t?.card?.keyBenefits || "Key Benefits"}
                        </h3>
                        <ul style={{ margin: 0, paddingLeft: '24px', fontSize: '1rem', color: '#15803d', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {scheme.benefits.map((benefit, idx) => (
                                <li key={idx}>
                                    {benefit}
                                    <SpeakerButton text={benefit} size={16} />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {scheme.details && scheme.details.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {scheme.details.map((section, idx) => (
                            <div key={idx}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {section.title}
                                    <SpeakerButton text={section.title + ". " + section.content} size={18} />
                                </h3>
                                <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                    {section.content}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No detailed information available.</p>
                )}
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <Link to={`/forms/${scheme.id}`} className="btn btn-primary" onClick={onClose} style={{ borderRadius: '12px' }}>
                        {t?.card?.apply || "Apply Now"}
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default function Dashboard() {
    const { t, language } = useLanguage();
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const location = useLocation();

    // GSAP Refs
    const heroContentRef = useRef(null);
    const [youthSchemes, setYouthSchemes] = useState([]);
    const [expandedSchemes, setExpandedSchemes] = useState({});
    const [selectedScheme, setSelectedScheme] = useState(null);

    const toggleExpand = (id) => {
        setExpandedSchemes(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleReadMore = (scheme) => {
        if (scheme.details && scheme.details.length > 0) {
            setSelectedScheme(scheme);
        } else {
            toggleExpand(scheme.id);
        }
    };

    useEffect(() => {
        const tl = gsap.timeline();
        tl.fromTo(heroContentRef.current.children,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }
        );

        // Fetch Youth Schemes - using specific IDs for youth-appropriate schemes
        const fetchYouthSchemes = async () => {
            try {
                // Ensure language is lowercase for backend compatibility
                const langParam = language ? language.toLowerCase() : 'en';
                const response = await fetch(`http://127.0.0.1:8000/schemes?language=${langParam}`);
                const allSchemes = await response.json();
                // Filter for youth-appropriate schemes
                const youthSchemeIds = [3, 5, 6, 12, 17, 20, 21, 22, 23, 24, 25];
                // Ensure ID is treated as number for comparison
                const filteredSchemes = allSchemes.filter(s => youthSchemeIds.includes(Number(s.id)));

                console.log("All Schemes:", allSchemes.length);
                console.log("Filtered Youth Schemes:", filteredSchemes.length);

                setYouthSchemes(filteredSchemes);
            } catch (error) {
                console.error("Error fetching youth schemes:", error);
            }
        };
        fetchYouthSchemes();
    }, [language]);

    useEffect(() => {
        if (location.hash === '#youth-schemes') {
            const elem = document.getElementById('youth-schemes');
            if (elem) {
                setTimeout(() => {
                    elem.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location]);

    const handleSearch = (results) => {
        setIsSearching(true);
        setTimeout(() => {
            setSearchResults(results);
            setIsSearching(false);
        }, 800);
    };

    const services = [
        { title: t.dashboard.services.income.title, desc: t.dashboard.services.income.desc, icon: FileText, link: "/forms/income" },
        { title: t.dashboard.services.caste.title, desc: t.dashboard.services.caste.desc, icon: Users, link: "/forms/caste" },
        { title: t.dashboard.services.pension.title, desc: t.dashboard.services.pension.desc, icon: Landmark, link: "/forms/pension" },
        { title: t.dashboard.services.health.title, desc: t.dashboard.services.health.desc, icon: Activity, link: "/forms/health" },
        { title: t.dashboard.services.bills.title, desc: t.dashboard.services.bills.desc, icon: CreditCard, link: "/forms/bills" },
        { title: t.dashboard.services.grievance.title, desc: t.dashboard.services.grievance.desc, icon: ShieldCheck, link: "/forms/grievance" },
        { title: t.dashboard.services.youth?.title || "Youth Schemes", desc: t.dashboard.services.youth?.desc || "Skill development & employment", icon: GraduationCap, link: "#youth-schemes" },
    ];

    return (
        <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '0', minHeight: '100vh' }}>
            {/* Top Filter Bar */}
            <Sidebar onSearch={handleSearch} />

            <div style={{ flex: 1, padding: '2rem 2rem 4rem', width: '100%', maxWidth: '1280px', margin: '0 auto' }}>

                {/* Hero Section */}
                <div className="dashboard-hero" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '3rem 0 5rem',
                    flexWrap: 'wrap',
                    gap: '4rem'
                }}>

                    {/* Left Content */}
                    <div ref={heroContentRef} style={{ flex: '1 1 500px' }}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            background: '#eff6ff', color: '#2563eb', padding: '8px 16px', borderRadius: '30px',
                            fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem', border: '1px solid #dbeafe'
                        }}>
                            <Sparkles size={16} fill="#2563eb" /> Digital India Initiative
                        </div>

                        <h1 className="text-gradient" style={{
                            fontSize: '4.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem',
                            letterSpacing: '-2px', fontFamily: 'Inter, sans-serif'
                        }}>
                            {t.dashboard.title}
                            <SpeakerButton text={t.dashboard.title} size={30} />
                        </h1>

                        <p style={{
                            fontSize: '1.25rem', color: 'var(--text-light)', lineHeight: 1.6, marginBottom: '2.5rem',
                            maxWidth: '90%'
                        }}>
                            {t.landing.heroText}
                            <SpeakerButton text={t.landing.heroText} />
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <MagneticButton className="btn-primary" style={{ padding: '1.1rem 2.5rem', fontSize: '1.1rem', borderRadius: '50px' }}>
                                Explore Services <ArrowRight size={20} />
                            </MagneticButton>
                        </div>
                    </div>

                    {/* Right Visual (Feature Grid) */}
                    <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem',
                            transform: 'rotate(-5deg)', padding: '2rem'
                        }}>
                            <FeatureCard icon={Mic} title="Voice Enabled" color="#ef4444" delay={0.5} />
                            <FeatureCard icon={Lock} title="Secure Data" color="#22c55e" delay={0.6} />
                            <FeatureCard icon={Zap} title="Instant Apply" color="#eab308" delay={0.7} />
                            <FeatureCard icon={Globe} title="Multi-Lingual" color="#3b82f6" delay={0.8} />
                        </div>
                    </div>
                </div>

                {/* Search Results Display */}
                {isSearching && (
                    <div className="flex-center" style={{ padding: '3rem', color: 'var(--secondary)' }}>
                        <Loader2 className="animate-spin" size={40} />
                        <span style={{ marginLeft: '12px', fontSize: '1.2rem', fontWeight: 500 }}>Finding best schemes for you...</span>
                    </div>
                )}

                {searchResults && !isSearching && (
                    <div className="results-section" style={{ marginBottom: '4rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '2rem' }}>Search Results</h2>
                            <button onClick={() => setSearchResults(null)} className="btn btn-secondary">Clear</button>
                        </div>
                        <div className="schemes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                            {searchResults.map((scheme) => (
                                <div key={scheme.id} className="card-premium scheme-card-result">
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {scheme.name}
                                        <SpeakerButton text={scheme.name} />
                                    </h3>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'start', gap: '8px', marginBottom: '0.8rem' }}>
                                            <p style={{ color: 'var(--text-light)', margin: 0 }}>{scheme.description}</p>
                                            <SpeakerButton text={scheme.description} size={16} />
                                        </div>

                                        {/* Benefits Section */}
                                        {scheme.benefits && scheme.benefits.length > 0 && (
                                            <div style={{ marginBottom: '1rem', background: '#f0fdf4', padding: '12px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                                                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#166534', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Sparkles size={14} /> {t.card?.benefits || "Benefits"}
                                                </h4>
                                                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#15803d' }}>
                                                    {(expandedSchemes[scheme.id] ? scheme.benefits : scheme.benefits.slice(0, 3)).map((benefit, idx) => (
                                                        <li key={idx} style={{ marginBottom: '4px' }}>{benefit}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Required Documents Section */}
                                        {scheme.required_docs && scheme.required_docs.length > 0 && (
                                            <div style={{ marginBottom: '1rem' }}>
                                                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>{t.card?.documentsRequired || "Documents Required:"}</h4>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {(expandedSchemes[scheme.id] ? scheme.required_docs : scheme.required_docs.slice(0, 4)).map((doc, idx) => (
                                                        <span key={idx} style={{
                                                            fontSize: '0.8rem',
                                                            padding: '4px 10px',
                                                            background: '#f3f4f6',
                                                            borderRadius: '20px',
                                                            border: '1px solid #e5e7eb',
                                                            color: '#4b5563'
                                                        }}>
                                                            {doc}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <Link to={`/forms/${scheme.id}`} className="btn btn-primary" style={{ width: '100%', borderRadius: '12px' }}>{t.card?.apply || "Apply Now"}</Link>
                                        <button
                                            onClick={() => handleReadMore(scheme)}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid var(--primary)',
                                                color: 'var(--primary)',
                                                padding: '0.8rem',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                                width: '100%'
                                            }}
                                        >
                                            {(scheme.details && scheme.details.length > 0) ? (t.card?.readMore || "Read More") : (expandedSchemes[scheme.id] ? (t.card?.readLess || "Show Less") : (t.card?.readMore || "Read More"))}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Youth Scheme Section - New Addition */}
                {!searchResults && (
                    <div id="youth-schemes" className="youth-section" style={{ marginBottom: "4rem" }}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem", gap: "12px" }}>
                            <div style={{ background: "#dbeafe", padding: "10px", borderRadius: "12px", color: "#2563eb" }}>
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>{t.youthSection?.title || "Youth Empowerment Schemes"}</h2>
                                <p style={{ color: "var(--text-light)", fontSize: "1rem" }}>{t.youthSection?.subtitle || "Schemes dedicated to skill development and employment for youth."}</p>
                            </div>
                        </div>

                        <div className="schemes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                            {youthSchemes.map((scheme) => (
                                <div key={scheme.id} className="card-premium scheme-card-result">
                                    <span style={{
                                        position: "absolute", top: "12px", right: "12px",
                                        background: "#e0f2fe", color: "#0369a1",
                                        fontSize: "0.75rem", fontWeight: 700,
                                        padding: "4px 10px", borderRadius: "20px"
                                    }}>
                                        {scheme.category}
                                    </span>

                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', marginTop: "1rem", display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {scheme.name}
                                        <SpeakerButton text={scheme.name} />
                                    </h3>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'start', gap: '8px', marginBottom: '0.8rem' }}>
                                            <p style={{ color: 'var(--text-light)', margin: 0 }}>{scheme.description}</p>
                                            <SpeakerButton text={scheme.description} size={16} />
                                        </div>

                                        {/* Benefits Section */}
                                        {scheme.benefits && scheme.benefits.length > 0 && (
                                            <div style={{ marginBottom: '1rem', background: '#f0fdf4', padding: '12px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                                                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#166534', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Sparkles size={14} /> {t.card?.keyBenefits || "Key Benefits"}
                                                </h4>
                                                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#15803d' }}>
                                                    {(expandedSchemes[scheme.id] ? scheme.benefits : scheme.benefits.slice(0, 3)).map((benefit, idx) => (
                                                        <li key={idx} style={{ marginBottom: '4px' }}>{benefit}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div style={{ marginBottom: '1rem' }}>
                                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>{t.card?.documents || "Documents:"}</h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {(expandedSchemes[scheme.id] ? (scheme.required_docs || []) : (scheme.required_docs || []).slice(0, 3)).map((doc, idx) => (
                                                    <span key={idx} style={{
                                                        fontSize: '0.8rem', padding: '4px 10px',
                                                        background: '#f3f4f6', borderRadius: '20px',
                                                        border: '1px solid #e5e7eb', color: '#4b5563'
                                                    }}>
                                                        {doc}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <Link to={`/forms/${scheme.id}`} className="btn btn-primary" style={{ width: '100%', borderRadius: '12px' }}>{t.card?.checkApply || "Check Eligibility & Apply"}</Link>
                                        <button
                                            onClick={() => handleReadMore(scheme)}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid var(--primary)',
                                                color: 'var(--primary)',
                                                padding: '0.8rem',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                                width: '100%'
                                            }}
                                        >
                                            {(scheme.details && scheme.details.length > 0) ? (t.card?.readMore || "Read More") : (expandedSchemes[scheme.id] ? (t.card?.readLess || "Show Less") : (t.card?.readMore || "Read More"))}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Services Section */}
                {!searchResults && (
                    <>
                        <div className="section-header" style={{ marginBottom: '3rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                            <div>
                                <h2 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Available Services</h2>
                                <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>Browse through our digital governance categories</p>
                            </div>
                        </div>

                        <div className="services-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                            gap: '2.5rem',
                            paddingBottom: '4rem'
                        }}>
                            {services.map((s, i) => (
                                <ServiceCard key={i} {...s} index={i} />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {selectedScheme && (
                <SchemeDetailsModal scheme={selectedScheme} onClose={() => setSelectedScheme(null)} t={t} />
            )}
        </div>
    );
}
