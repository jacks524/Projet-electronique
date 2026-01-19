export const ROLES = {
  ADMIN: "Admin",
  DEPARTMENT_MANAGER: "Chef departement",
  TEACHER: "Enseignant",
  STUDENT: "Etudiant",
};

export const getRoleLabel = (roleKey) => {
  return ROLES[roleKey?.toUpperCase()] || roleKey;
};
