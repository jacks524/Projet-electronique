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


const create = async (payload) => {
    try {
        const { data } = await apiClient.post('/student', payload);
        return data;
    } catch (error) {
        console.error('Erreur API [createStudent]:', error);
        throw new Error(error.response?.data?.message || "La creation de l'etudiant a echoue.");
    }
};

const update = async (studentId, payload) => {
    try {
        const { data } = await apiClient.put(`/student/${studentId}`, payload);
        return data;
    } catch (error) {
        console.error('Erreur API [updateStudent]:', error);
        throw new Error(error.response?.data?.message || "La mise a jour de l'etudiant a echoue.");
    }
};


const getById = async (studentId) => {
    try {
        const { data } = await apiClient.get(`/student/${studentId}`);
        return data;
    } catch (error) {
        if (error.response?.status === 404) return null;
        console.error('Erreur API [getStudentById]:', error);
        throw new Error("Impossible de charger les details de l'etudiant.");
    }
};

const studentService = {
    getAll,
    getByClass,
    create,
    update,
    getById,
};

export default studentService;
