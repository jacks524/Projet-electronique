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


const getByDepartment = async (departmentId) => {
    try {
        const { data } = await apiClient.get(`/subject/by-department/${departmentId}`);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        if (error.response?.status === 404) return [];
        throw new Error("Impossible de charger les matieres du departement.");
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


const create = async (payload) => {
    try {
        const { data } = await apiClient.post('/subject', payload);
        return data;
    } catch (error) {
        console.error('Erreur API [createSubject]:', error);
        throw new Error(error.response?.data?.message || "La creation de la matiere a echoue.");
    }
};

const update = async (subjectId, payload) => {
    try {
        const { data } = await apiClient.put(`/subject/${subjectId}`, payload);
        return data;
    } catch (error) {
        console.error('Erreur API [updateSubject]:', error);
        throw new Error(error.response?.data?.message || "La mise a jour de la matiere a echoue.");
    }
};

const remove = async (subjectId) => {
    try {
        await apiClient.delete(`/subject/${subjectId}`);
    } catch (error) {
        console.error('Erreur API [deleteSubject]:', error);
        throw new Error(error.response?.data?.message || "La suppression de la matiere a echoue.");
    }
};

const subjectService = {
    getByTeacher,
    getByDepartment,
    getById,
    create,
    update,
    remove,
};

export default subjectService;