import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, Landmark, Activity, CreditCard, ShieldCheck, ChevronRight, Search, FileSignature, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import gsap from 'gsap';

export default function Services() {
    const { t } = useLanguage();
    const headerRef = useRef(null);
    const gridRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(headerRef.current.children,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.2, duration: 0.8 }
        )
            .fromTo(gridRef.current.children,
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.05, duration: 0.8 }
            );
    }, []);

    const categories = [
        {
            title: t.servicesPage?.categories?.citizenServices || "Citizen Services",
            filter: "citizen",
            items: [
                { title: t.servicesPage?.items?.incomeTitle || "Income Certificate", desc: t.servicesPage?.items?.incomeDesc || "Apply for income verification documents", icon: FileText, link: "/forms/income", color: "blue" },
                { title: t.servicesPage?.items?.casteTitle || "Caste Certificate", desc: t.servicesPage?.items?.casteDesc || "SC/ST/OBC certification application", icon: Users, link: "/forms/caste", color: "purple" },
                { title: t.servicesPage?.items?.pensionTitle || "Pension Scheme", desc: t.servicesPage?.items?.pensionDesc || "Old age and widow pension benefits", icon: Landmark, link: "/forms/pension", color: "amber" },
                { title: t.servicesPage?.items?.healthTitle || "Health Card", desc: t.servicesPage?.items?.healthDesc || "Ayushman Bharat & State Health Cards", icon: Activity, link: "/forms/health", color: "emerald" },
            ]
        },
        {
            title: t.servicesPage?.categories?.utilityPayments || "Utility & Payments",
            filter: "utility",
            items: [
                { title: t.servicesPage?.items?.billsTitle || "Bill Payments", desc: t.servicesPage?.items?.billsDesc || "Electricity, Water, and Gas bills", icon: CreditCard, link: "/forms/bills", color: "cyan" },
                { title: t.servicesPage?.items?.grievanceTitle || "Grievance Redressal", desc: t.servicesPage?.items?.grievanceDesc || "Report issues to local authorities", icon: ShieldCheck, link: "/forms/grievance", color: "rose" },
            ]
        },
        {
            title: t.servicesPage?.categories?.documentServices || "Document Services",
            filter: "docs",
            items: [
                { title: t.servicesPage?.items?.lockerTitle || "Document Locker", desc: t.servicesPage?.items?.lockerDesc || "Securely store your official documents", icon: UploadCloud, link: "/locker", color: "indigo" },
                { title: t.servicesPage?.items?.esignTitle || "Digital Signature", desc: t.servicesPage?.items?.esignDesc || "e-Sign documents via Aadhar", icon: FileSignature, link: "/esign", color: "orange" },
                { title: "Smart Form Analyzer", desc: "Detect hidden risks and fraud in legal documents", icon: Search, link: "/form-reader", color: "red" }
            ]
        }
    ];

    return (
        <div style={{ minHeight: '100vh', padding: '4rem 2rem', background: 'var(--bg-color)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header */}
                <div ref={headerRef} style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 className="text-gradient" style={{
                        fontSize: '3.5rem',
                        fontWeight: 800,
                        marginBottom: '1rem',
                        fontFamily: 'var(--font-heading)'
                    }}>
                        {t.nav?.services || "Our Services"}
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-muted)',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        {t.servicesPage?.subtitle || "Access all government services, schemes, and digital tools in one place."}
                    </p>
                </div>

                {/* Service Categories */}
                <div ref={gridRef} style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                    {categories.map((cat, idx) => (
                        <div key={idx}>
                            <h3 style={{
                                fontSize: '1.75rem',
                                fontWeight: 700,
                                marginBottom: '2rem',
                                paddingLeft: '1rem',
                                borderLeft: `4px solid var(--accent)`,
                                color: 'var(--primary)'
                            }}>
                                {cat.title}
                            </h3>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '2rem'
                            }}>
                                {cat.items.map((item, i) => (
                                    <Link key={i} to={item.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <motion.div
                                            whileHover={{ y: -5, boxShadow: 'var(--shadow-lg)' }}
                                            className="glass-panel"
                                            style={{
                                                padding: '2rem',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                background: 'white',
                                                border: '1px solid rgba(3, 3, 3, 0.05)',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <div style={{
                                                width: '56px',
                                                height: '56px',
                                                borderRadius: '16px',
                                                background: `var(--bg-color)`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '1.5rem',
                                                color: 'var(--primary)'
                                            }}>
                                                <item.icon size={28} />
                                            </div>

                                            <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary)' }}>
                                                {item.title}
                                            </h4>

                                            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '2rem', flex: 1, lineHeight: 1.5 }}>
                                                {item.desc}
                                            </p>

                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: 'var(--accent)',
                                                fontWeight: 600,
                                                fontSize: '0.9rem',
                                                gap: '0.5rem'
                                            }}>
                                                {t.servicesPage?.accessNow || "Access Now"} <ChevronRight size={16} />
                                            </div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
