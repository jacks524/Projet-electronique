export const ROLES = {
  ADMIN: "Admin",
  DEPARTMENT_MANAGER: "Chef departement",
  TEACHER: "Enseignant",
  STUDENT: "Etudiant",
};

export const getRoleLabel = (roleKey) => {
  return ROLES[roleKey?.toUpperCase()] || roleKey;
};

export const hasUserRole = (user, expectedRole) => {
  const normalizedExpectedRole = `${expectedRole || ""}`.toUpperCase();
  if (!normalizedExpectedRole) return false;

  const directRole = `${user?.role || ""}`.toUpperCase();
  if (directRole === normalizedExpectedRole) return true;

  if (!Array.isArray(user?.roles)) return false;

  return user.roles.some((roleEntry) => {
    if (typeof roleEntry === "string") {
      return roleEntry.toUpperCase() === normalizedExpectedRole;
    }
    return `${roleEntry?.role || ""}`.toUpperCase() === normalizedExpectedRole;
  });
};
