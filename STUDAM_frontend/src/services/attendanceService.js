import apiClient from '../lib/apiClient';

const toNumber = (value, fallback = 0) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const parsed = Number.parseInt(value, 10);
        if (!Number.isNaN(parsed)) return parsed;
    }
    return fallback;
};

const normalizeSession = (session) => {
    const date = session?.date || session?.sessionDate || session?.createdAt || session?.updatedAt || '';
    const subjectName = session?.subjectName || session?.subject?.name || session?.courseName || 'Cours';
    const className = session?.className || session?.clazzName || session?.class?.name || session?.timetable?.clazz?.name || 'Classe';
    const classId = session?.classId || session?.class?.id || session?.class?.classId || session?.timetable?.clazz?.id || session?.timetable?.clazz?.classId || null;

    const present = toNumber(session?.present ?? session?.totalPresent ?? session?.presentCount, 0);
    const late = toNumber(session?.late ?? session?.totalLate ?? session?.lateCount, 0);
    const total = toNumber(session?.totalStudents ?? session?.total, present + late);
    const absent = toNumber(session?.absent ?? session?.absentCount, Math.max(total - present - late, 0));

    return {
        id: session?.attendanceSessionId || session?.sessionId || session?.id,
        date,
        courseName: subjectName,
        className,
        classId,
        present,
        absent,
        late,
        totalStudents: total,
    };
};

const getSessionsByTeacher = async (teacherId) => {
    try {
        const { data } = await apiClient.get(`/attendance-session/teacher/${teacherId}`);
        return Array.isArray(data) ? data : [];
    } catch {
        throw new Error("Impossible de charger les sessions de presence.");
    }
};

const getMyStats = async (teacherId) => {
    try {
        if (!teacherId) {
            const { data } = await apiClient.get('/teacher/me/attendance-statistics');
            return data;
        }

        const sessions = await getSessionsByTeacher(teacherId);
        const normalized = (Array.isArray(sessions) ? sessions : []).map(normalizeSession);

        if (normalized.length === 0) {
            return { averageAttendance: 0, totalStudents: 0, totalCourses: 0 };
        }

        const totalPresent = normalized.reduce((sum, s) => sum + s.present, 0);
        const totalAbsent = normalized.reduce((sum, s) => sum + s.absent, 0);
        const totalLate = normalized.reduce((sum, s) => sum + s.late, 0);
        const totalEvents = totalPresent + totalAbsent + totalLate;

        const classesMap = new Map();
        normalized.forEach((s) => {
            const key = String(s.classId || s.className || 'UNKNOWN');
            const prev = classesMap.get(key) || 0;
            classesMap.set(key, Math.max(prev, s.totalStudents || 0));
        });

        const uniqueCourses = new Set(normalized.map((s) => String(s.courseName || '').trim()).filter(Boolean));

        return {
            averageAttendance: totalEvents > 0 ? Math.round((totalPresent / totalEvents) * 100) : 0,
            totalStudents: Array.from(classesMap.values()).reduce((sum, n) => sum + n, 0),
            totalCourses: uniqueCourses.size,
        };
    } catch {
        throw new Error("Impossible de charger vos statistiques de presence.");
    }
};

const getMyRecent = async (limit = 3, teacherId) => {
    try {
        if (!teacherId) {
            const { data } = await apiClient.get('/teacher/me/recent-attendances', { params: { limit } });
            return Array.isArray(data) ? data : [];
        }

        const sessions = await getSessionsByTeacher(teacherId);
        const normalized = (Array.isArray(sessions) ? sessions : [])
            .map(normalizeSession)
            .sort((a, b) => {
                const ta = new Date(a.date || 0).getTime();
                const tb = new Date(b.date || 0).getTime();
                return tb - ta;
            });

        return normalized.slice(0, Math.max(limit, 0));
    } catch {
        throw new Error("Impossible de charger vos presences recentes.");
    }
};

const getSessionDetails = async (sessionId) => {
    try {
        const { data } = await apiClient.get(`/attendance-session/${sessionId}`);
        return Array.isArray(data) ? data : [];
    } catch {
        throw new Error("Impossible de charger les presences de la session.");
    }
};

const downloadSessionCsv = async (sessionId) => {
    try {
        const { data } = await apiClient.get(`/attendance-session/${sessionId}/csv`, {
            responseType: 'blob',
            headers: { Accept: 'text/csv' },
        });
        return data;
    } catch {
        throw new Error('Le telechargement du CSV a echoue.');
    }
};

const updateAttendance = async (attendanceId, updateData) => {
    try {
        const { data } = await apiClient.put(`/attendances/${attendanceId}`, updateData);
        return data;
    } catch {
        throw new Error('La mise a jour de la presence a echoue.');
    }
};

const launchWebAttendanceCall = async (payload) => {
    try {
        const { data } = await apiClient.post('/attendance-session/launch', payload);
        return data;
    } catch (error) {
        const backendMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message;
        throw new Error(backendMessage || "Le lancement de l'appel web a echoue.");
    }
};

const attendanceService = {
    getMyStats,
    getMyRecent,
    updateAttendance,
    getSessionDetails,
    getSessionsByTeacher,
    downloadSessionCsv,
    launchWebAttendanceCall,
};

export default attendanceService;
