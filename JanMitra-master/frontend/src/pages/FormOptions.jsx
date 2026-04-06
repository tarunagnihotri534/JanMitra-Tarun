import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
    FileText, ArrowRight, ShieldCheck, Sprout, Building2, GraduationCap,
    Briefcase, Zap, Award, Home, Heart, Users, Baby, UserCheck,
    Scroll, Shield, Wallet, Wheat, Landmark, Store, Briefcase as BriefcaseAlt,
    BookOpen, DollarSign, School, Vote, CreditCard, Car, Plane,
    CheckCircle, AlertCircle, Filter
} from 'lucide-react';

export default function FormOptions() {
    const { t } = useLanguage();
    const [activeCategory, setActiveCategory] = useState('all');

    // Define all government forms with categories
    const govForms = [
        // Popular/Featured Forms
        { id: 'incomeCert', name: t.govForms.forms.incomeCert, icon: Award, color: '#3b82f6', category: 'certificates' },
        { id: 'casteCert', name: t.govForms.forms.casteCert, icon: FileText, color: '#8b5cf6', category: 'certificates' },
        { id: 'rationCard', name: t.govForms.forms.rationCard, icon: Wheat, color: '#f59e0b', category: 'welfare' },
        { id: 'ayushmanCard', name: t.govForms.forms.ayushmanCard, icon: Heart, color: '#ef4444', category: 'welfare' },

        // Certificates
        { id: 'domicileCert', name: t.govForms.forms.domicileCert, icon: Home, color: '#10b981', category: 'certificates' },
        { id: 'birthCert', name: t.govForms.forms.birthCert, icon: Baby, color: '#ec4899', category: 'certificates' },
        { id: 'deathCert', name: t.govForms.forms.deathCert, icon: Scroll, color: '#6b7280', category: 'certificates' },
        { id: 'marriageCert', name: t.govForms.forms.marriageCert, icon: Users, color: '#f43f5e', category: 'certificates' },
        { id: 'characterCert', name: t.govForms.forms.characterCert, icon: UserCheck, color: '#06b6d4', category: 'certificates' },
        { id: 'ncl', name: t.govForms.forms.ncl, icon: Shield, color: '#8b5cf6', category: 'certificates' },
        { id: 'ews', name: t.govForms.forms.ews, icon: ShieldCheck, color: '#6366f1', category: 'certificates' },
        { id: 'disabilityCert', name: t.govForms.forms.disabilityCert, icon: AlertCircle, color: '#f59e0b', category: 'certificates' },

        // Welfare & Pensions
        { id: 'oldAgePension', name: t.govForms.forms.oldAgePension, icon: Users, color: '#6366f1', category: 'welfare' },
        { id: 'widowPension', name: t.govForms.forms.widowPension, icon: Heart, color: '#ec4899', category: 'welfare' },
        { id: 'disabilityPension', name: t.govForms.forms.disabilityPension, icon: AlertCircle, color: '#f59e0b', category: 'welfare' },
        { id: 'farmerPension', name: t.govForms.forms.farmerPension, icon: Sprout, color: '#10b981', category: 'welfare' },

        // Land & Property
        { id: 'landOwnership', name: t.govForms.forms.landOwnership, icon: Landmark, color: '#84cc16', category: 'certificates' },
        { id: 'mutation', name: t.govForms.forms.mutation, icon: FileText, color: '#a3e635', category: 'certificates' },
        { id: 'encumbrance', name: t.govForms.forms.encumbrance, icon: CheckCircle, color: '#22c55e', category: 'certificates' },

        // Business & Employment
        { id: 'udyogAadhar', name: t.govForms.forms.udyogAadhar, icon: Building2, color: '#3b82f6', category: 'business' },
        { id: 'gstReg', name: t.govForms.forms.gstReg, icon: Wallet, color: '#8b5cf6', category: 'business' },
        { id: 'shopLicense', name: t.govForms.forms.shopLicense, icon: Store, color: '#f59e0b', category: 'business' },
        { id: 'employmentReg', name: t.govForms.forms.employmentReg, icon: BriefcaseAlt, color: '#06b6d4', category: 'business' },

        // Education
        { id: 'scholarship', name: t.govForms.forms.scholarship, icon: GraduationCap, color: '#3b82f6', category: 'education' },
        { id: 'eduLoan', name: t.govForms.forms.eduLoan, icon: DollarSign, color: '#10b981', category: 'education' },
        { id: 'admission', name: t.govForms.forms.admission, icon: School, color: '#8b5cf6', category: 'education' },

        // Other Services
        { id: 'voterID', name: t.govForms.forms.voterID, icon: Vote, color: '#f59e0b', category: 'other' },
        { id: 'panCard', name: t.govForms.forms.panCard, icon: CreditCard, color: '#3b82f6', category: 'other' },
        { id: 'drivingLicense', name: t.govForms.forms.drivingLicense, icon: Car, color: '#ef4444', category: 'other' },
        { id: 'passport', name: t.govForms.forms.passport, icon: Plane, color: '#06b6d4', category: 'other' },
        { id: 'policeVerification', name: t.govForms.forms.policeVerification, icon: ShieldCheck, color: '#6366f1', category: 'other' },
        { id: 'grievance', name: t.govForms.forms.grievance, icon: AlertCircle, color: '#ef4444', category: 'other' },
    ];

    // Schemes (keeping original schemes)
    // Schemes State
    const [schemes, setSchemes] = React.useState([]);

    React.useEffect(() => {
        const fetchSchemes = async () => {
            try {
                const response = await fetch('/api/schemes');
                const data = await response.json();
                // Map backend data to frontend card format
                const mappedSchemes = data.map(s => ({
                    id: s.id, // Keep integer ID for linking
                    name: s.name,
                    icon: Sprout, // Default icon, can be dynamic based on category
                    color: '#10b981',
                    category: 'schemes',
                    description: s.description
                }));
                setSchemes(mappedSchemes);
            } catch (error) {
                console.error("Failed to fetch schemes:", error);
            }
        };
        fetchSchemes();
    }, []);

    const allForms = [...schemes, ...govForms];
    const filteredForms = activeCategory === 'all' ? allForms : allForms.filter(f => f.category === activeCategory);

    const categories = [
        { id: 'all', name: 'All Forms', icon: Filter },
        { id: 'schemes', name: t.schemes.title, icon: Zap },
        { id: 'certificates', name: t.govForms.categories.certificates, icon: Award },
        { id: 'welfare', name: t.govForms.categories.welfare, icon: Heart },
        { id: 'business', name: t.govForms.categories.business, icon: Building2 },
        { id: 'education', name: t.govForms.categories.education, icon: GraduationCap },
        { id: 'other', name: t.govForms.categories.other, icon: FileText }
    ];

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '3rem' }}
            >
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem' }}>
                    {t.govForms.title}
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', maxWidth: '600px', margin: '0 auto' }}>
                    {t.govForms.subtitle}
                </p>
            </motion.div>

            {/* Category Filter */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2.5rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
            }}>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '50px',
                            border: activeCategory === cat.id ? '2px solid var(--primary)' : '2px solid #e5e7eb',
                            background: activeCategory === cat.id ? 'var(--primary)' : 'white',
                            color: activeCategory === cat.id ? 'white' : '#6b7280',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontSize: '0.95rem',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <cat.icon size={18} />
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Forms Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem'
            }}>
                {filteredForms.map((form, index) => (
                    <motion.div
                        key={form.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -5, boxShadow: '0 10px 30px -5px rgba(0,0,0,0.15)' }}
                        className="card"
                        style={{ padding: '1.5rem', cursor: 'pointer', transition: 'all 0.3s ease' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '14px',
                                background: `${form.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: form.color,
                                flexShrink: 0
                            }}>
                                <form.icon size={28} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{
                                    fontSize: '1.05rem',
                                    fontWeight: 700,
                                    marginBottom: '0.75rem',
                                    lineHeight: '1.4',
                                    color: '#1f2937'
                                }}>
                                    {form.name}
                                </h3>
                                <Link
                                    to={`/forms/${form.id}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: 'var(--primary)',
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {t.search.apply} <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredForms.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
                    <p style={{ fontSize: '1.1rem' }}>No forms found in this category.</p>
                </div>
            )}
        </div>
    );
}
