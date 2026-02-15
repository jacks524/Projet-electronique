import apiClient from "../lib/apiClient";

const getDashboardStats = async () => {
  try {
    const { data } = await apiClient.get("/user/statistics");

    const getNumber = (...keys) => {
      for (const key of keys) {
        if (data && typeof data[key] === "number") {
          return data[key];
        }
      }
      return 0;
    };

    return {
      totalUsers: getNumber("totalUsers", "usersCount", "totalUser"),
      totalDepartments: getNumber("totalDepartments", "departmentsCount", "totalDepartment"),
      totalTeachers: getNumber("totalTeachers", "teachersCount", "totalTeacher"),
      totalStudents: getNumber("totalStudents", "studentsCount", "totalStudent"),
    };
  } catch (error) {
    console.error("Erreur lors de la recuperation des stats:", error);
    return { totalUsers: 0, totalDepartments: 0, totalTeachers: 0, totalStudents: 0 };
  }
};

const getRecentActivity = async (limit = 5, departmentId) => {
  try {
    const { data } = await apiClient.get("/reports/admin/recent-activity", {
      params: { limit, departmentId },
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Erreur lors de la recuperation des activites recentes:", error);
    return [];
  }
};

const getTeacherAttendanceList = async ({ departmentId, teacherId, classId, startDate, endDate, status } = {}) => {
  try {
    const { data } = await apiClient.get("/reports/teachers-attendance", {
      params: { departmentId, teacherId, classId, startDate, endDate, status },
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Erreur lors de la recuperation des presences enseignants:", error);
    throw new Error("Impossible de charger les presences des enseignants.");
  }
};

const toNumber = (value, fallback = 0) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const toNamedObject = (value, fallbackName) => {
  if (typeof value === 'string') {
    return { name: value };
  }
  if (value && typeof value === 'object') {
    if (typeof value.name === 'string') {
      return value;
    }
    if (typeof value.label === 'string') {
      return { name: value.label };
    }
  }
  if (fallbackName) {
    return { name: fallbackName };
  }
  return null;
};

const extractReportsArray = (payload, visited = new Set()) => {
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload)) return payload;
  if (visited.has(payload)) return [];
  visited.add(payload);

  const candidateKeys = [
    'data',
    'result',
    'payload',
    'reports',
    'content',
    'items',
    'validatedReports',
  ];

  for (const key of candidateKeys) {
    if (payload[key]) {
      const result = extractReportsArray(payload[key], visited);
      if (result.length) return result;
    }
  }

  for (const value of Object.values(payload)) {
    if (Array.isArray(value)) {
      return value;
    }
    const nested = extractReportsArray(value, visited);
    if (nested.length) {
      return nested;
    }
  }

  return [];
};

const normalizeReportRow = (report) => {
  const resolvedSubjectName =
    typeof report.subject === 'string'
      ? report.subject
      : report.subject?.name || report.subjectName || report.courseName || report.courseLabel;
  const resolvedClassName =
    typeof report.class === 'string'
      ? report.class
      : report.class?.name || report.className || report.clazzName;

  return {
    id:
      report.id ??
      report.reportId ??
      report.attendanceSessionId ??
      report.sessionId ??
      report.attendanceId ??
      report.report_id,
    subject: toNamedObject(report.subject, resolvedSubjectName),
    class: toNamedObject(report.class, resolvedClassName),
    date: report.date || report.sessionDate || report.createdAt || report.recordedAt,
    status: report.status || report.attendanceStatus || report.reportStatus || 'VALIDATED',
    presentCount:
      toNumber(report.presentCount ?? report.totalPresent ?? report.present ?? report.presentStudents ?? report.attended),
    totalStudents:
      toNumber(report.totalStudents ?? report.total ?? report.totalPlanned ?? report.capacity),
    raw: report,
  };
};

const getValidatedReports = async (teacherId) => {
  try {
    const { data } = await apiClient.get(`/reports/teacher/${teacherId}/validated`, {
      params: { status: 'VALIDATED' },
    });
    console.debug("getValidatedReports payload:", data);
    const rows = extractReportsArray(data);

    return rows.map((report) => normalizeReportRow(report));
  } catch (error) {
    console.error("Erreur lors de la recuperation des rapports valides:", error);
    if (error.response?.status === 401) {
      const authError = new Error("UNAUTHORIZED");
      authError.status = 401;
      throw authError;
    }
    // Fallback: try getting all reports and filter by teacher
    try {
      const { data: allReports } = await apiClient.get("/reports/attendance");
      return Array.isArray(allReports)
        ? allReports.filter(r => r.teacherId === teacherId && r.status === 'VALIDATED')
        : [];
    } catch {
      return [];
    }
  }
};

const reportService = {
  getDashboardStats,
  getRecentActivity,
  getTeacherAttendanceList,
  getValidatedReports,
};

export default reportService;
