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
            let resolvedDepartments = response.data.departmentNames || [];
            let resolvedDepartmentIds = response.data.departmentsIds || [];
            const departmentIdIfChief = response.data.departmentIdIfChief || decodedToken.departmentIdIfChief || decodedToken.departmentId || null;

            if (typeof window !== 'undefined') {
                localStorage.setItem('authToken', fullToken);
            }

            try {
                const { data: userDetails } = await apiClient.get(`/user/${decodedToken.userId}`);
                resolvedDepartments = userDetails?.departmentsNames || resolvedDepartments;
                resolvedDepartmentIds = userDetails?.departmentsIds || resolvedDepartmentIds;
            } catch (detailsError) {
                console.warn("Impossible de charger les details utilisateur apres connexion:", detailsError);
            }

            if ((!resolvedDepartments || resolvedDepartments.length == 0) && departmentIdIfChief) {
                try {
                    const { data: dept } = await apiClient.get(`/departments/${departmentIdIfChief}`);
                    if (dept?.name) {
                        resolvedDepartments = [dept.name];
                    }
                } catch (deptError) {
                    console.warn("Impossible de charger le departement du chef:", deptError);
                }
            }

            if ((!resolvedDepartmentIds || resolvedDepartmentIds.length == 0) && departmentIdIfChief) {
                resolvedDepartmentIds = [departmentIdIfChief];
            }

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
                departmentNames: resolvedDepartments,
                departmentsIds: resolvedDepartmentIds,
                departmentIdIfChief,
            };

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