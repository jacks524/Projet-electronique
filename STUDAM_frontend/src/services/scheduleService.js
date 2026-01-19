import apiClient from '../lib/apiClient';

const create = async (payload) => {
    try {
        const { data } = await apiClient.post('/schedule', payload);
        return data;
    } catch (error) {
        console.error('Erreur API [createSchedule]:', error);
        throw new Error(error.response?.data?.message || "La creation du cours a echoue.");
    }
};

const update = async (scheduleId, payload) => {
    try {
        const { data } = await apiClient.put(`/schedule/${scheduleId}`, payload);
        return data;
    } catch (error) {
        console.error('Erreur API [updateSchedule]:', error);
        throw new Error(error.response?.data?.message || "La mise a jour du cours a echoue.");
    }
};

const scheduleService = {
    create,
    update,
};

export default scheduleService;
