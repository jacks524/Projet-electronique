import apiClient from "../lib/apiClient";

const getAll = async () => {
  try {
    const { data } = await apiClient.get("/departments/all");
    return data;
  } catch (error) {
    console.error("Erreur API [getAllDepartments]:", error);
    throw error.response?.data || new Error("Impossible de charger les departements.");
  }
};

const getById = async (id) => {
  try {
    const { data } = await apiClient.get(`/departments/${id}`);
    return data;
  } catch (error) {
    console.error(`Erreur API [getDepartmentById ${id}]:`, error);
    throw error.response?.data || new Error("Impossible de charger les details du departement.");
  }
};

const create = async (departmentData) => {
  try {
    const payload = {
      name: departmentData.name,
      description: departmentData.description,
      code: departmentData.code,
      departmentManagerId: departmentData.departmentManagerId,
    };
    const { data } = await apiClient.post("/departments", payload);
    return data;
  } catch (error) {
    console.error("Erreur API [createDepartment]:", error);
    throw error.response?.data || new Error("La creation du departement a echoue.");
  }
};

const update = async (id, departmentData) => {
  try {
    const payload = {
      name: departmentData.name,
      description: departmentData.description,
      code: departmentData.code,
      departmentManagerId: departmentData.departmentManagerId,
    };
    const { data } = await apiClient.put(`/departments/${id}`, payload);
    return data;
  } catch (error) {
    console.error(`Erreur API [updateDepartment ${id}]:`, error);
    throw error.response?.data || new Error("La mise a jour du departement a echoue.");
  }
};

const remove = async (id) => {
  try {
    await apiClient.delete(`/departments/${id}`);
    return { success: true, message: "Departement supprime avec succes." };
  } catch (error) {
    console.error(`Erreur API [deleteDepartment ${id}]:`, error);
    if (error.response?.status === 401) {
      throw new Error("Vous n'etes pas autorise a effectuer cette action.");
    }
    throw error.response?.data || new Error("La suppression du departement a echoue.");
  }
};

const departmentService = {
  getAll,
  getById,
  create,
  update,
  remove,
};

export default departmentService;
