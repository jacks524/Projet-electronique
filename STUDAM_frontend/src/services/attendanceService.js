import apiClient from '../lib/apiClient';


const getMyStats = async () => {
    try {
        const { data } = await apiClient.get('/teacher/me/attendance-statistics');
        return data;
    } catch (error) {
        throw new Error("Impossible de charger vos statistiques de présence.");
    }
};


const getMyRecent = async (limit = 3) => {
    try {
        const { data } = await apiClient.get('/teacher/me/recent-attendances', {
            params: { limit }
        });
        return data;
    } catch (error) {
        throw new Error("Impossible de charger vos présences récentes.");
    }
};

const getSessionDetails = async (sessionId) => {
    try {
        const { data } = await apiClient.get(`/attendance-sessions/${sessionId}/details`);
        return data;
    } catch (error) {
        throw new Error("Impossible de charger les détails de la session.");
    }
};

const updateAttendance = async (attendanceId, updateData) => {
    try {
        const { data } = await apiClient.put(`/attendances/${attendanceId}`, updateData);
        return data;
    } catch (error) {
        throw new Error("La mise à jour de la présence a échoué.");
    }
};
const attendanceService = {
    getMyStats,
    getMyRecent,
    updateAttendance,
    getSessionDetails,
};
export default attendanceService;