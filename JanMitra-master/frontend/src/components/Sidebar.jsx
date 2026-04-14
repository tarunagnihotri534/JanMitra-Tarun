import React, { useState } from 'react';
import { Filter, ChevronRight, Search, MapPin, Users, User, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

import { fetchSchemes } from '../lib/api.js';

import './Sidebar.css';

export default function Sidebar({ onSearch }) {
    const { t, language } = useLanguage();
    const [prevLanguage, setPrevLanguage] = useState(language);

    const [filters, setFilters] = useState(() => {
        const savedFilters = localStorage.getItem('janmitra_filters');
        return savedFilters ? JSON.parse(savedFilters) : {
            state: t.sidebar.allStates,
            gender: t.sidebar.any,
            age: t.sidebar.any,
            category: t.sidebar.any
        };
    });

    React.useEffect(() => {
        localStorage.setItem('janmitra_filters', JSON.stringify(filters));
    }, [filters]);

    const categories = [
        { key: 'state', title: t.sidebar.state, icon: MapPin, options: [t.sidebar.allStates, ...t.sidebar.states] },
        { key: 'age', title: t.sidebar.ageGroup, icon: Users, options: [t.sidebar.any, ...t.sidebar.ageOptions] },
        { key: 'category', title: `${t.sidebar.category} (Caste)`, icon: Briefcase, options: [t.sidebar.any, ...t.sidebar.categoryOptions] },
        { key: 'gender', title: t.sidebar.gender, icon: User, options: [t.sidebar.any, ...t.sidebar.genderOptions] }
    ];

    const performSearch = async (currentFilters) => {
        try {
            const data = await fetchSchemes({
                state: currentFilters.state === t.sidebar.allStates ? null : currentFilters.state,
                gender: currentFilters.gender === t.sidebar.any ? null : currentFilters.gender,
                age: currentFilters.age === t.sidebar.any ? null : currentFilters.age,
                category: currentFilters.category === t.sidebar.any ? null : currentFilters.category,
                language: language
            });
            if (onSearch) {
                onSearch(data);
            }
        } catch (error) {
            console.error("Error searching schemes:", error);
        }
    };

    const handleSearch = () => performSearch(filters);

    // Sync filters when language changes
    React.useEffect(() => {
        if (prevLanguage !== language) {
            const prevT = translations[prevLanguage] || translations['en'];
            const currT = translations[language] || translations['en'];

            const translateValue = (val, optionsListKey, allKey) => {
                // Check for 'All/Any' match
                if (val === prevT.sidebar[allKey]) return currT.sidebar[allKey];

                // Check for specific option match
                if (prevT.sidebar[optionsListKey]) {
                    const index = prevT.sidebar[optionsListKey].indexOf(val);
                    if (index !== -1 && currT.sidebar[optionsListKey][index]) {
                        return currT.sidebar[optionsListKey][index];
                    }
                }
                return val;
            };

            const newFilters = {
                state: translateValue(filters.state, 'states', 'allStates'),
                gender: translateValue(filters.gender, 'genderOptions', 'any'),
                age: translateValue(filters.age, 'ageOptions', 'any'),
                category: translateValue(filters.category, 'categoryOptions', 'any')
            };

            setFilters(newFilters);
            setPrevLanguage(language);
            performSearch(newFilters);
        }
    }, [language, prevLanguage, filters, t]);

    return (
        <aside className="sidebar">
            <div className="sidebar-content">
                <div className="sidebar-header">
                    <div className="sidebar-icon-container">
                        <Filter size={20} />
                    </div>
                    <h2 className="sidebar-title">{t.sidebar.findSchemes}</h2>
                </div>

                <div className="filters-container">
                    {/* State Selection */}
                    {categories.map((cat) => (
                        <div key={cat.key} className="filter-group">
                            <div className="filter-label">
                                <cat.icon size={18} className="text-gray-500" />
                                <span>{cat.title}</span>
                            </div>
                            <select
                                value={filters[cat.key]}
                                onChange={(e) => setFilters({ ...filters, [cat.key]: e.target.value })}
                                className="filter-select"
                            >
                                {cat.options.map((opt, i) => (
                                    <option key={i} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    ))}

                    <button
                        onClick={handleSearch}
                        className="search-btn"
                    >
                        <Search size={18} />
                        {t.sidebar.searchSchemes}
                    </button>
                </div>
            </div>
        </aside>
    );
}
