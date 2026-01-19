import apiClient from '../lib/apiClient';

const getByDepartment = async (departmentInput) => {
    try {
        const departmentId = typeof departmentInput === 'number'
            ? departmentInput
            : departmentInput?.departmentId;

        if (!departmentId) {
            throw new Error("Identifiant de departement manquant.");
        }

        const { data } = await apiClient.post(`/class/by-department/${departmentId}`);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        if (error.response?.status === 404) return [];
        console.error("Erreur API [getClassesByDepartment]:", error);
        throw new Error("Impossible de charger les classes.");
    }
};

const getByTeacher = async (teacherId) => {
    try {
        const { data } = await apiClient.get(`/class/teacher/${teacherId}`);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        if (error.response?.status === 404) return [];
        throw new Error("Impossible de charger les classes de l'enseignant.");
    }
};

const getById = async (classId) => {
    try {
        const { data } = await apiClient.get(`/class/${classId}`);
        return data;
    } catch (error) {
        console.error("Erreur API [getClassById]:", error);
        throw new Error("Impossible de charger la classe.");
    }
};

const classService = {
    getByDepartment,
    getByTeacher,
    getById,
};

export default classService;
