import apiClient from '../lib/apiClient';

const getByDepartment = async (departmentData) => {
    try {
        const { data } = await apiClient.post(`/class/by-department`, departmentData);
        return data;
    } catch (error) {
        if (error.response?.status === 404) return [];
        console.error("Erreur API [getClassesByDepartment]:", error);
        throw new Error("Impossible de charger les classes.");
    }
};

const getByTeacher = async (teacherId) => {
    try {
        const { data } = await apiClient.get(`/class/teacher/${teacherId}`);
        return data;
    } catch (error) {
        if (error.response?.status === 404) return [];
        throw new Error("Impossible de charger les classes de l'enseignant.");
    }
};

const classService = {
    getByDepartment,
    getByTeacher,
};

export default classService;