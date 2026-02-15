"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import { useRouter } from 'next/navigation';
import departmentService from '../services/departmentService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkLoggedIn = async () => {
            const storedUser = authService.getUser();
            const tokenExists = authService.isAuthenticated();

            if (tokenExists && storedUser) {
                let nextUser = storedUser;
                if (storedUser.role === 'DEPARTMENT_MANAGER' &&
                    (!storedUser.departmentNames || storedUser.departmentNames.length === 0)) {
                    const fallbackDepartmentId = storedUser.departmentIdIfChief ||
                        (Array.isArray(storedUser.departmentsIds) ? storedUser.departmentsIds[0] : null);
                    if (fallbackDepartmentId) {
                        try {
                            const dept = await departmentService.getById(fallbackDepartmentId);
                            if (dept?.name) {
                                nextUser = {
                                    ...storedUser,
                                    departmentNames: [dept.name],
                                    departmentsIds: [fallbackDepartmentId],
                                    departmentIdIfChief: storedUser.departmentIdIfChief || fallbackDepartmentId,
                                };
                                localStorage.setItem('user', JSON.stringify(nextUser));
                            }
                        } catch (error) {
                            console.warn('Impossible de charger le departement du chef:', error);
                        }
                    }
                }
                setUser(nextUser);
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

    const setUserAndPersist = (nextUserOrUpdater) => {
        setUser((prevUser) => {
            const nextUser =
                typeof nextUserOrUpdater === "function"
                    ? nextUserOrUpdater(prevUser)
                    : nextUserOrUpdater;

            if (typeof window !== "undefined") {
                if (nextUser) {
                    localStorage.setItem("user", JSON.stringify(nextUser));
                } else {
                    localStorage.removeItem("user");
                }
            }

            return nextUser;
        });
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
        setUser: setUserAndPersist,
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
