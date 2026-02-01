import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer style={{ background: 'var(--primary)', color: 'white', padding: '2rem 0', marginTop: 'auto' }}>
            <div className="container" style={{ textAlign: 'center' }}>
                <p>{t.footer.copyright}</p>
                <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Government of India</p>
            </div>
        </footer>
    );
}
