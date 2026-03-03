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


const create = async (payload) => {
    try {
        const { data } = await apiClient.post('/class', payload);
        return data;
    } catch (error) {
        console.error('Erreur API [createClass]:', error);
        throw new Error("La creation de la classe a echoue.");
    }
};

const update = async (classId, payload) => {
    try {
        const { data } = await apiClient.put(`/class/${classId}`, payload);
        return data;
    } catch (error) {
        console.error('Erreur API [updateClass]:', error);
        throw new Error("La mise a jour de la classe a echoue.");
    }
};

const remove = async (classId) => {
    try {
        await apiClient.delete(`/class/${classId}`);
    } catch (error) {
        console.error('Erreur API [deleteClass]:', error);
        throw new Error("La suppression de la classe a echoue.");
    }
};

const assignSubject = async (classId, subjectId) => {
    try {
        await apiClient.put(`/class/${classId}/assign-subject/${subjectId}`);
    } catch (error) {
        console.error('Erreur API [assignSubjectToClass]:', error);
        throw new Error("L'assignation de la matiere a la classe a echoue.");
    }
};

const classService = {
    getByDepartment,
    getByTeacher,
    getById,
    create,
    update,
    remove,
    assignSubject,
};

export default classService;
