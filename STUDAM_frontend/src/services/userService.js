import apiClient from "../lib/apiClient";

const getTeachers = async () => {
  try {
    const { data } = await apiClient.get("/user/TEACHER/department/0");
    return data;
  } catch (error) {
    console.error("Erreur API [getTeachers]:", error);
    throw new Error("Impossible de charger les enseignants.");
  }
};

const getAllUsers = async () => {
  try {
    const { data } = await apiClient.get("/users/all");
    return data;
  } catch (error) {
    console.error("Erreur API [getAllUsers]:", error);
    throw new Error("Impossible de charger la liste des utilisateurs.");
  }
};

const getAvailableManagers = async () => {
  try {
    const { data } = await apiClient.get("/user/DEPARTMENT_MANAGER/department/0");
    return data;
  } catch (error) {
    if (error.response?.status === 404) return [];
    throw new Error("Impossible de charger les chefs disponibles.");
  }
};

const getUsersByRoleAndDepartment = async (role, departmentId) => {
  try {
    const { data } = await apiClient.get(`/user/${role}/department/${departmentId}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) return [];
    console.error(`Erreur API [getUsersByRoleAndDepartment(${role})]:`, error);
    throw new Error("Impossible de charger les utilisateurs.");
  }
};

const searchUsers = async (searchTerm, type = "name") => {
  try {
    if (!searchTerm) return [];
    const { data } = await apiClient.get("/user/search", {
      params: { searchTerm, type },
    });
    return data;
  } catch (error) {
    if (error.response?.status === 404) return [];
    console.error("Erreur API [searchUsers]:", error);
    throw new Error("La recherche d'utilisateurs a echoue.");
  }
};

const update = async (userId, userData) => {
    try {
        const providedDepartmentIds = Array.isArray(userData.departmentIds)
            ? userData.departmentIds
            : Array.isArray(userData.departmentsIds)
                ? userData.departmentsIds
                : null;

        const hasDepartmentPayload =
            providedDepartmentIds !== null ||
            userData.departmentId !== undefined && userData.departmentId !== null;

        const normalizedDepartmentIds = providedDepartmentIds
            ? providedDepartmentIds.map((id) => parseInt(id, 10))
            : userData.departmentId !== undefined && userData.departmentId !== null
                ? [parseInt(userData.departmentId, 10)]
                : undefined;

        const payload = {
            ...(userData.name !== undefined ? { name: userData.name } : {}),
            ...(userData.email !== undefined ? { email: userData.email } : {}),
            ...(userData.phoneNumber !== undefined ? { phoneNumber: userData.phoneNumber } : {}),
            ...(userData.username !== undefined ? { username: userData.username } : {}),
            ...(userData.matricule !== undefined ? { matricule: userData.matricule } : {}),
            ...(userData.role ? { role: userData.role.toUpperCase() } : {}),
            ...(typeof userData.active === 'boolean' ? { active: userData.active } : {}),
            ...(hasDepartmentPayload ? { departmentsIds: normalizedDepartmentIds || [] } : {}),
        };
        const { data } = await apiClient.put(`/user/${userId}`, payload);
        return data;
    } catch (error) {
        console.error(`Erreur API [updateUser ${userId}]:`, error);
        throw new Error(error.response?.data?.message || "La mise a jour de l'utilisateur a echoue.");
    }
};

const getAllUsersWithPagination = async (page = 0, size = 100) => {
  try {
    const { data } = await apiClient.get("/user", {
      params: { page, size },
    });

    if (data && Array.isArray(data.content)) {
      return data.content;
    }

    return [];
  } catch (error) {
    console.error("Erreur API [getAllUsersWithPagination]:", error);
    throw new Error("Impossible de charger les utilisateurs.");
  }
};

const getAllWithPagination = async (page = 0, size = 10) => {
  try {
    const { data } = await apiClient.get("/user", { params: { page, size } });
    return data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Une erreur est survenue.";
    console.error("Erreur API:", error);
    throw new Error(errorMessage);
  }
};

const getStatistics = async () => {
  try {
    const { data } = await apiClient.get("/user/statistics");
    return data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Une erreur est survenue.";
    console.error("Erreur API:", error);
    throw new Error(errorMessage);
  }
};

const deactivate = async (id) => {
  try {
    await apiClient.put(`/user/desactivate/${id}`);
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Une erreur est survenue.";
    console.error("Erreur API:", error);
    throw new Error(errorMessage);
  }
};

const activate = async (id) => {
  try {
    await apiClient.put(`/user/activate/${id}`);
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Une erreur est survenue.";
    console.error("Erreur API:", error);
    throw new Error(errorMessage);
  }
};

const remove = async (userId) => {
  try {
    await apiClient.delete(`/user/${userId}`);
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Une erreur est survenue.";
    console.error("Erreur API:", error);
    throw new Error(errorMessage);
  }
};

const register = async (userData) => {
  try {
    const normalizedPhoneNumber = (userData.phoneNumber || "").replace(/\D/g, "");
    const departmentsIds = Array.isArray(userData.departmentIds)
      ? userData.departmentIds.map((id) => parseInt(id))
      : userData.departmentId
      ? [parseInt(userData.departmentId)]
      : [];

    const payload = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phoneNumber: normalizedPhoneNumber,
      username: userData.username,
      matricule: userData.matricule,
      role: userData.role.toUpperCase(),
      departmentsIds,
    };

    const { data } = await apiClient.post("/user/register", payload);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "La creation de l'utilisateur a echoue.");
  }
};

const getById = async (userId) => {
  try {
    const { data } = await apiClient.get(`/user/${userId}`);
    return data;
  } catch {
    throw new Error("Impossible de charger les donnees de l'utilisateur.");
  }
};

const assignToDepartments = async (teacherId, departmentIds) => {
  try {
    await apiClient.put(`/user/${teacherId}/assign-to-departments`, departmentIds);
  } catch {
    throw new Error("L'assignation de l'enseignant a echoue.");
  }
};

const userService = {
  getTeachers,
  getAllUsers,
  getAvailableManagers,
  getUsersByRoleAndDepartment,
  searchUsers,
  update,
  getAllUsersWithPagination,
  getAllWithPagination,
  getStatistics,
  remove,
  activate,
  deactivate,
  register,
  getById,
  assignToDepartments,
};

export default userService;
