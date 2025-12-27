import apiClient from '../lib/apiClient';

const getAll = async () => {
    try {
        const { data } = await apiClient.get('/timetable');
        return data;
    } catch (error) {
        throw new Error("Impossible de charger l'emploi du temps.");
    }
};

const getByTeacher = async (teacherId) => {
    try {
        const { data } = await apiClient.get(`/timetables/teacher/${teacherId}`);
        return data;
    } catch (error) {
        if (error.response?.status === 404) return [];
        throw new Error("Impossible de charger l'emploi du temps.");
    }
};

const timetableService = {
    getAll,
    getByTeacher,
};

export default timetableService;