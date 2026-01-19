import apiClient from '../lib/apiClient';

const getAll = async () => {
    try {
        const { data } = await apiClient.get('/student');
        return Array.isArray(data) ? data : [];
    } catch (error) {
        if (error.response?.status === 404) return [];
        console.error("Erreur API [getAllStudents]:", error);
        throw new Error("Impossible de charger la liste des etudiants.");
    }
};

const getByClass = async (classId, { page = 0, size = 2000 } = {}) => {
    try {
        const { data } = await apiClient.get(`/student/class/${classId}`, {
            params: { page, size },
        });
        if (Array.isArray(data)) {
            return data;
        }
        if (data && Array.isArray(data.content)) {
            return data.content;
        }
        return [];
    } catch (error) {
        if (error.response?.status === 404) return [];
        throw new Error("Impossible de charger les etudiants de la classe.");
    }
};

const studentService = {
    getAll,
    getByClass,
};

export default studentService;
