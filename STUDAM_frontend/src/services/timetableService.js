import apiClient from '../lib/apiClient';

const getAll = async () => {
    try {
        const { data } = await apiClient.get('/timetable');
        return Array.isArray(data) ? data : [];
    } catch (error) {
        throw new Error("Impossible de charger l'emploi du temps.");
    }
};

const getByTeacher = async (teacherId) => {
    try {
        const { data } = await apiClient.get(`/timetable/teacher/${teacherId}`);
        return data;
    } catch (error) {
        if (error.response?.status === 404) return null;
        throw new Error("Impossible de charger l'emploi du temps.");
    }
};

const getByClass = async (classId) => {
    try {
        const { data } = await apiClient.get(`/timetable/class/${classId}`);
        return data;
    } catch (error) {
        if (error.response?.status === 404) return null;
        throw new Error("Impossible de charger l'emploi du temps.");
    }
};

const createTimetable = async (payload) => {
    try {
        const { data } = await apiClient.post('/timetable', payload);
        return data;
    } catch (error) {
        console.error('Erreur API [createTimetable]:', error);
        throw new Error("La creation de l'emploi du temps a echoue.");
    }
};

const timetableService = {
    getAll,
    getByTeacher,
    getByClass,
    createTimetable,
};

export default timetableService;
