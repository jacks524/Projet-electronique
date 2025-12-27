import apiClient from "../lib/apiClient";

const getDashboardStats = async () => {
  try {
    const { data } = await apiClient.get('/user/statistics');
    return {
      totalUsers: data.totalUsers || 0,
      totalDepartments: data.totalDepartments || 0,
      totalTeachers: data.totalTeachers || 0,
      totalStudents: data.totalStudents || 0,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des stats:", error);
    return { totalUsers: 0, totalDepartments: 0, totalTeachers: 0, totalStudents: 0 };
  }
};

const reportService = {
  getDashboardStats,
};

export default reportService;
