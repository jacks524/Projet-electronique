export const ROLE_PERMISSIONS = {
    'super_admin': ['/admin/**'],
    'chef_departement': ['/chief/**', '/admin/teachers', '/admin/students'],
    'teacher': ['/teacher/**', '/attendance/take'],
    'student': ['/student/**']
};