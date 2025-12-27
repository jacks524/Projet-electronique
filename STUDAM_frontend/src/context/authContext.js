"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkLoggedIn = () => {
            const storedUser = authService.getUser();
            const tokenExists = authService.isAuthenticated();

            if (tokenExists && storedUser) {
                setUser(storedUser);
                setIsAuthenticated(true);
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);


    const login = async (username, password) => {
        try {
            const data = await authService.login(username, password);
            setUser(data.user);
            setIsAuthenticated(true);
            return data;
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
        router.push('/');
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthContext doit être utilisé à l'intérieur d'un AuthProvider");
    }
    return context;
};