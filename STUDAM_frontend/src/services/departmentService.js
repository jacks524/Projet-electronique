import apiClient from '../lib/apiClient';


const getAll = async () => {
    try {
        const { data } = await apiClient.get('/departments/all');
        return data;
    } catch (error) {
        console.error("Erreur API [getAllDepartments]:", error);
        throw error.response?.data || new Error("Impossible de charger les départements.");
    }
};


const getById = async (id) => {
    try {
        const { data } = await apiClient.get(`/departments/${id}`);
        return data;
    } catch (error) {
        console.error(`Erreur API [getDepartmentById ${id}]:`, error);
        throw error.response?.data || new Error("Impossible de charger les détails du département.");
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
        const { data } = await apiClient.post('/departments', payload);
        return data;
    } catch (error) {
        console.error("Erreur API [createDepartment]:", error);
        throw error.response?.data || new Error("La création du département a échoué.");
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
        throw error.response?.data || new Error("La mise à jour du département a échoué.");
    }
};


const remove = async (id) => {
    try {
        await apiClient.delete(`/departments/${id}`);
        return { success: true, message: "Département supprimé avec succès." };
    } catch (error) {
        console.error(`Erreur API [deleteDepartment ${id}]:`, error);
        if (error.response?.status === 401) {
            throw new Error("Vous n'êtes pas autorisé à effectuer cette action.");
        }
        throw error.response?.data || new Error("La suppression du département a échoué.");
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