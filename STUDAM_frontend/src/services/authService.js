import apiClient from '../lib/apiClient';
import { jwtDecode } from 'jwt-decode';


const login = async (username, password) => {
    try {
        const response = await apiClient.post('/user/signin', { username, password });

        if (response.data && typeof response.data.token === 'string') {
            const fullToken = response.data.token;
            const rawToken = fullToken.startsWith('Bearer ') ? fullToken.split(' ')[1] : fullToken;
            const decodedToken = jwtDecode(rawToken);
            console.log("Contenu complet du token décodé :", decodedToken);

            const rolesFromApi = response.data.role || response.data.roles || [];
            const userRoles = rolesFromApi.map(r => r.role.toUpperCase());

            let mainRole = 'USER';
            if (userRoles.includes('ADMIN')) mainRole = 'ADMIN';
            else if (userRoles.includes('DEPARTMENT_MANAGER')) mainRole = 'DEPARTMENT_MANAGER';
            else if (userRoles.includes('TEACHER')) mainRole = 'TEACHER';

            const user = {
                id: decodedToken.userId,
                name: decodedToken.nom,
                username: decodedToken.sub,
                email: decodedToken.email || 'Email non fourni',
                role: mainRole,
                roles: userRoles,
                departmentNames: response.data.departmentNames || [],
            };

            localStorage.setItem('authToken', fullToken);
            localStorage.setItem('user', JSON.stringify(user));

            return { token: fullToken, user };
        } else {
            throw new Error('Réponse du serveur invalide.');
        }
    } catch (error) {
        console.error("Erreur détaillée dans authService.login :", error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        const errorMessage = error.response?.data?.message || error.message || 'Nom d\'utilisateur ou mot de passe incorrect.';
        throw new Error(errorMessage);
    }
};

const register = async (userData) => {
    try {
        const response = await apiClient.post('/user/register', userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Erreur lors de l\'inscription.');
    }
};

const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
};

const getUser = () => {
    if (typeof window === 'undefined') return null;
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        return null;
    }
};

const isAuthenticated = () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('authToken');
};

const forgotPassword = async (email) => {
    try {
        const { data } = await apiClient.post('/user/forgot-password', { email });
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "La demande a échoué.");
    }
};

const resetPassword = async (token, newPassword) => {
    try {
        const { data } = await apiClient.post('/user/reset-password', { token, newPassword });
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "La réinitialisation a échoué.");
    }
};

const changePassword = async (oldPassword, newPassword) => {
    try {
        const { data } = await apiClient.put('/user/change-password', { oldPassword, newPassword });
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Le changement a échoué.");
    }
};

const authService = {
    login,
    register,
    logout,
    getUser,
    isAuthenticated,
    forgotPassword,
    changePassword,
    resetPassword,
};

export default authService;