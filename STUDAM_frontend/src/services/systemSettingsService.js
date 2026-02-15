import apiClient from "../lib/apiClient";

const getAdminSettings = async () => {
  try {
    const { data } = await apiClient.get("/system-settings/admin");
    return data && typeof data === "object" ? data : {};
  } catch (error) {
    throw new Error(error.response?.data?.message || "Impossible de charger les parametres systeme.");
  }
};

const updateAdminSettings = async (settings) => {
  try {
    const { data } = await apiClient.put("/system-settings/admin", settings || {});
    return data && typeof data === "object" ? data : {};
  } catch (error) {
    throw new Error(error.response?.data?.message || "Impossible d'enregistrer les parametres systeme.");
  }
};

const systemSettingsService = {
  getAdminSettings,
  updateAdminSettings,
};

export default systemSettingsService;
