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

const getTeacherAttendanceList = async ({ departmentId, teacherId, startDate, endDate, status } = {}) => {
  try {
    const { data } = await apiClient.get("/reports/teachers-attendance", {
      params: { departmentId, teacherId, startDate, endDate, status },
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Erreur lors de la recuperation des presences enseignants:", error);
    throw new Error("Impossible de charger les presences des enseignants.");
  }
};

const getValidatedReports = async (teacherId) => {
  try {
    const { data } = await apiClient.get(`/reports/teacher/${teacherId}/validated`, {
      params: { status: 'VALIDATED' },
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Erreur lors de la recuperation des rapports valides:", error);
    // Fallback: try getting all reports and filter by teacher
    try {
      const { data: allReports } = await apiClient.get("/reports/attendance");
      return Array.isArray(allReports)
        ? allReports.filter(r => r.teacherId === teacherId && r.status === 'VALIDATED')
        : [];
    } catch (fallbackError) {
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
