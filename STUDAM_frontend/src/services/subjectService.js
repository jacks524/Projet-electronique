import apiClient from '../lib/apiClient';

const getByTeacher = async (teacherId) => {
    try {
        const { data } = await apiClient.get(`/subject/teacher/${teacherId}`);
        return data;
    } catch (error) {
        if (error.response?.status === 404) return [];
        throw new Error("Impossible de charger les matières de l'enseignant.");
    }
};

const getById = async (subjectId) => {
    try {
        const { data } = await apiClient.get(`/subject/${subjectId}`);
        return data;
    } catch (error) {
        throw new Error("Impossible de charger les détails du cours.");
    }
};

const subjectService = {
    getByTeacher,
    getById,
};

export default subjectService;