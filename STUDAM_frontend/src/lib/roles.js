export const ROLES = {
    ADMIN: 'Admin',
    DEPARTMENT_MANAGER: 'Chef Département',
    TEACHER: 'Enseignant',
};

export const getRoleLabel = (roleKey) => {
    return ROLES[roleKey?.toUpperCase()] || roleKey;
};