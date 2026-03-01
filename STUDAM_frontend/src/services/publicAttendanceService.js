import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://projet-electronique.onrender.com/api';
const lookupPath = process.env.NEXT_PUBLIC_PUBLIC_ATTENDANCE_LOOKUP_PATH || '/public/student-attendance';

const publicApiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const normalizeStatus = (value) => {
    const status = `${value || ''}`.trim().toUpperCase();
    if (status === 'PRESENT') return 'PRESENT';
    if (status === 'LATE') return 'LATE';
    if (status === 'ABSENT') return 'ABSENT';
    return 'UNKNOWN';
};

const normalizeAttendanceRow = (row, index = 0) => ({
    id: row?.attendanceId || row?.id || row?.sessionId || `attendance-${index}`,
    subjectName: row?.subjectName || row?.subject?.name || row?.courseName || row?.ueName || 'Cours',
    subjectCode: row?.subjectCode || row?.subject?.code || row?.courseCode || row?.ueCode || '',
    teacherName: row?.teacherName || row?.teacher?.name || row?.instructorName || row?.professorName || '-',
    className: row?.className || row?.class?.name || row?.classe?.name || '-',
    sessionDate: row?.sessionDate || row?.date || row?.attendanceDate || row?.createdAt || '',
    day: row?.day || row?.scheduleDay || row?.weekday || '',
    startHour: row?.startHour || row?.schedule?.startHour || row?.startTime || '',
    endHour: row?.endHour || row?.schedule?.endHour || row?.endTime || '',
    status: normalizeStatus(row?.attendanceStatus || row?.status),
});

const normalizeLookupResponse = (data, matricule) => {
    const student = data?.student || data?.studentInfo || {};
    const attendances = Array.isArray(data?.attendances)
        ? data.attendances
        : Array.isArray(data?.records)
            ? data.records
            : Array.isArray(data)
                ? data
                : [];

    return {
        student: {
            matricule: student?.matricule || matricule,
            name: student?.name || student?.studentName || '',
            className: student?.className || student?.class?.name || student?.classe?.name || '',
            departmentName: student?.departmentName || student?.department?.name || '',
        },
        attendances: attendances.map((row, index) => normalizeAttendanceRow(row, index)),
    };
};

const lookupStudentAttendance = async (matricule) => {
    try {
        const { data } = await publicApiClient.get(lookupPath, {
            params: { matricule },
        });
        return normalizeLookupResponse(data, matricule);
    } catch (error) {
        const backendMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message;
        throw new Error(backendMessage || "Impossible de consulter les presences pour ce matricule.");
    }
};

const publicAttendanceService = {
    lookupStudentAttendance,
};

export default publicAttendanceService;
