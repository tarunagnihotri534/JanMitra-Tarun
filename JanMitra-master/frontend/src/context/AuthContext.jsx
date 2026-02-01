import React, { createContext, useContext, useState, useEffect } from 'react';
import Loader from '../components/Loader';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage on load
        const storedUser = localStorage.getItem('janmitra_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === 'test@gmail.com' && password === 'test@123') {
                    const userData = { email, name: 'Aditya Pandey', role: 'Citizen' };
                    setUser(userData);
                    localStorage.setItem('janmitra_user', JSON.stringify(userData));
                    resolve(userData);
                } else {
                    reject(new Error('Invalid email or password'));
                }
            }, 1000); // Simulate API latency
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('janmitra_user');
    };

    const signup = (name, email, password) => {
        // For mock, we just accept any signup and log them in immediately
        return new Promise((resolve) => {
            setTimeout(() => {
                const userData = { email, name, role: 'Citizen' };
                setUser(userData);
                localStorage.setItem('janmitra_user', JSON.stringify(userData));
                resolve(userData);
            }, 1000);
        });
    };

    const value = {
        user,
        login,
        logout,
        signup,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <Loader text="Authenticating Securely..." /> : children}
        </AuthContext.Provider>
    );
}
