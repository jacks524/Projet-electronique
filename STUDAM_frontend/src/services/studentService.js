import apiClient from '../lib/apiClient';

const getAll = async () => {
    try {
        const { data } = await apiClient.get('/student');
        return data;
    } catch (error) {
        if (error.response?.status === 404) return [];
        console.error("Erreur API [getAllStudents]:", error);
        throw new Error("Impossible de charger la liste des étudiants.");
    }
};

const getByClass = async (classId) => {
    try {
        const { data } = await apiClient.get(`/student/class/${classId}`);
        return data;
    } catch (error) {
        if (error.response?.status === 404) return [];
        throw new Error("Impossible de charger les étudiants de la classe.");
    }
};

const studentService = {
    getAll,
    getByClass,
};

export default studentService;