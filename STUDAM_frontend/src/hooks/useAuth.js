import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import authService from '../services/authService';

export function useAuth() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Vérifier l'état d'authentification au chargement
    useEffect(() => {
        const checkAuth = () => {
            try {
                const isAuth = authService.isAuthenticated();
                const userData = authService.getUser();

                setIsAuthenticated(isAuth);
                setUser(userData);
            } catch (error) {
                console.error('Erreur lors de la vérification d\'authentification:', error);
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        // Écouter les changements de localStorage (connexion/déconnexion dans un autre onglet)
        const handleStorageChange = (e) => {
            if (e.key === 'authToken' || e.key === 'user') {
                checkAuth();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Fonction de connexion
    const login = useCallback(async (email, password) => {
        try {
            const response = await authService.login(email, password);
            setUser(response.user);
            setIsAuthenticated(true);
            return response;
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            throw error;
        }
    }, []);

    // Fonction d'inscription
    const register = useCallback(async (userData) => {
        try {
            const response = await authService.register(userData);
            if (response.autoLogin) {
                setUser(response.user);
                setIsAuthenticated(true);
            }
            return response;
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            throw error;
        }
    }, []);

    // Fonction de déconnexion
    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            router.push('/auth/login');
        }
    }, [router]);

    // Fonction pour rafraîchir le profil utilisateur
    const refreshProfile = useCallback(async () => {
        try {
            const updatedUser = await authService.getProfile();
            setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            console.error('Erreur lors du rafraîchissement du profil:', error);
            // Si le token est invalide, déconnecter l'utilisateur
            if (error.message.includes('Session expirée')) {
                logout();
            }
            throw error;
        }
    }, [logout]);

    // Fonction pour vérifier les permissions
    const hasRole = useCallback((roles) => {
        return authService.hasRole(roles);
    }, []);

    // Fonctions de vérification de rôle
    const isAdmin = useCallback(() => {
        return authService.isAdmin();
    }, []);

    const isChefDepartement = useCallback(() => {
        return authService.isChefDepartement();
    }, []);

    const isTeacher = useCallback(() => {
        return authService.isTeacher();
    }, []);

    // Fonction pour rediriger si non authentifié
    const requireAuth = useCallback((redirectTo = '/auth/login') => {
        if (!isLoading && !isAuthenticated) {
            router.push(redirectTo);
            return false;
        }
        return true;
    }, [isLoading, isAuthenticated, router]);

    // Fonction pour rediriger si non autorisé
    const requireRole = useCallback((requiredRoles, redirectTo = '/dashboard') => {
        if (!isLoading && isAuthenticated && !hasRole(requiredRoles)) {
            router.push(redirectTo);
            return false;
        }
        return true;
    }, [isLoading, isAuthenticated, hasRole, router]);

    return {
        // État
        user,
        isLoading,
        isAuthenticated,

        // Actions
        login,
        register,
        logout,
        refreshProfile,

        // Vérifications
        hasRole,
        isAdmin,
        isChefDepartement,
        isTeacher,

        // Utilitaires
        requireAuth,
        requireRole,

        // Informations utilisateur
        userRole: user?.role,
        userName: user?.nom,
        userEmail: user?.email,
    };
}

export default useAuth;