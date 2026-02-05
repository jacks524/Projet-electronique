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
        const { data } = await apiClient.get(`/attendance-session/${sessionId}`);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        throw new Error("Impossible de charger les présences de la session.");
    }
};

const getSessionsByTeacher = async (teacherId) => {
    try {
        const { data } = await apiClient.get(`/attendance-session/teacher/${teacherId}`);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        throw new Error("Impossible de charger les sessions de présence.");
    }
};

const downloadSessionCsv = async (sessionId) => {
    try {
        const { data } = await apiClient.get(`/attendance-session/${sessionId}/csv`, {
            responseType: 'blob',
            headers: { Accept: 'text/csv' }
        });
        return data;
    } catch (error) {
        throw new Error("Le téléchargement du CSV a échoué.");
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
    getSessionsByTeacher,
    downloadSessionCsv,
};
export default attendanceService;