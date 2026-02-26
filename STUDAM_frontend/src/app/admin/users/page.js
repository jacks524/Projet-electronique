"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../../context/authContext';
import userService from '../../../services/userService';
import departmentService from '../../../services/departmentService';
import classService from '../../../services/classService';
import subjectService from '../../../services/subjectService';
import { ROLES } from '../../../lib/roles';
import toast from 'react-hot-toast';

export default function AdminUsers() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuthContext();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [departments, setDepartments] = useState([]);
    const [teacherConfigRows, setTeacherConfigRows] = useState([]);
    const [configLoading, setConfigLoading] = useState(false);
    const [isExportingConfig, setIsExportingConfig] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const totalUsers = users.length;
    const totalChiefs = users.filter(u => u.role === 'DEPARTMENT_MANAGER').length;
    const totalTeachers = users.filter(u => u.role === 'TEACHER').length;
    const totalActive = users.filter(u => u.status === 'active').length;

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || user?.role?.toUpperCase() !== 'ADMIN') {
            router.push('/auth/login');
            return;
        }
        loadData();
    }, [user, isAuthenticated, authLoading, router]);

    const extractClassLevel = (classe) => {
        return classe?.code || classe?.name || classe?.className || null;
    };

    const extractSubjectName = (subject) => {
        return subject?.name || subject?.libelle || subject?.code || null;
    };

    const extractSubjectSemester = (subject) => {
        return subject?.semester || subject?.semestre || subject?.timetable?.semester || null;
    };

    const normalizeTeacherConfigRow = async (teacherUser) => {
        const [teacherDetails, teacherClasses, teacherSubjects] = await Promise.all([
            userService.getById(teacherUser.id),
            classService.getByTeacher(teacherUser.id),
            subjectService.getByTeacher(teacherUser.id),
        ]);

        const levels = [...new Set((Array.isArray(teacherClasses) ? teacherClasses : [])
            .map(extractClassLevel)
            .filter(Boolean))];
        const subjects = [...new Set((Array.isArray(teacherSubjects) ? teacherSubjects : [])
            .map(extractSubjectName)
            .filter(Boolean))];
        const semesters = [...new Set((Array.isArray(teacherSubjects) ? teacherSubjects : [])
            .map(extractSubjectSemester)
            .filter(Boolean))];
        const departments = Array.isArray(teacherDetails?.departmentsNames) ? teacherDetails.departmentsNames : [];

        return {
            id: teacherUser.id,
            matricule: teacherDetails?.matricule || '',
            nom: teacherDetails?.name || teacherUser.name || '',
            departement: departments.length > 0 ? departments.join(', ') : (teacherUser.departement || ''),
            semestres: semesters,
            niveaux: levels,
            matieres: subjects,
            status: teacherDetails?.active ? 'active' : 'inactive',
        };
    };

    const loadTeacherConfigRows = async (usersList) => {
        const teacherUsers = (Array.isArray(usersList) ? usersList : []).filter((u) => u.role === 'TEACHER');
        if (teacherUsers.length === 0) {
            setTeacherConfigRows([]);
            return;
        }

        setConfigLoading(true);
        try {
            const rows = await Promise.all(
                teacherUsers.map(async (teacherUser) => {
                    try {
                        return await normalizeTeacherConfigRow(teacherUser);
                    } catch (error) {
                        return {
                            id: teacherUser.id,
                            matricule: '',
                            nom: teacherUser.name || '',
                            departement: teacherUser.departement || '',
                            semestres: [],
                            niveaux: [],
                            matieres: [],
                            status: teacherUser.status || 'inactive',
                        };
                    }
                })
            );
            setTeacherConfigRows(rows);
        } finally {
            setConfigLoading(false);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersResponse, departmentsResponse] = await Promise.all([
                userService.getAllUsersWithPagination(0, 2000),
                departmentService.getAll(),
            ]);

            const usersList = Array.isArray(usersResponse) ? usersResponse : [];
            const mappedUsers = usersList.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                username: u.username,
                role: u.roles && u.roles.length > 0 ? u.roles[0].role.toUpperCase() : 'UNKNOWN',
                departement: u.departmentsNames && u.departmentsNames.length > 0 ? u.departmentsNames.join(', ') : null,
                status: u.active ? 'active' : 'inactive',
                lastLogin: u.lastConnection ? new Date(u.lastConnection).toLocaleString('fr-FR') : null
            }));
            mappedUsers.sort((a, b) => (b.id || 0) - (a.id || 0));
            setUsers(mappedUsers);
            setDepartments(Array.isArray(departmentsResponse) ? departmentsResponse : []);
            await loadTeacherConfigRows(mappedUsers);

        } catch (error) {
            toast.error(error.message || "Erreur lors du chargement des donnees.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        const deletePromise = userService.remove(selectedUser.id);
        toast.promise(deletePromise, {
            loading: 'Suppression en cours...',
            success: () => {
                loadData();
                return "Utilisateur supprime avec succes.";
            },
            error: "La suppression a echoue.",
        });
        setShowDeleteModal(false);
    };

    const toggleUserStatus = async (userToToggle) => {
        const isActivating = userToToggle.status !== 'active';
        const actionPromise = isActivating
            ? userService.activate(userToToggle.id)
            : userService.deactivate(userToToggle.id);

        await toast.promise(actionPromise, {
            loading: 'Mise a jour du statut...',
            success: async () => {
                await loadData();
                return "Statut mis a jour avec succes !";
            },
            error: (err) => err.message || "La mise a jour a echoue.",
        });
    };

    const filteredTeacherConfigs = teacherConfigRows.filter((row) => {
        const normalizedSearch = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm ||
            row.nom.toLowerCase().includes(normalizedSearch) ||
            row.matricule.toLowerCase().includes(normalizedSearch) ||
            row.departement.toLowerCase().includes(normalizedSearch) ||
            row.semestres.some((semester) => semester.toLowerCase().includes(normalizedSearch)) ||
            row.niveaux.some((level) => level.toLowerCase().includes(normalizedSearch)) ||
            row.matieres.some((subject) => subject.toLowerCase().includes(normalizedSearch));

        const matchesRole = roleFilter === 'all' || roleFilter === 'TEACHER';
        const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
        const matchesDepartment = departmentFilter === 'all' || row.departement.includes(departmentFilter);

        return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
    });
    const usersById = new Map(users.map((u) => [u.id, u]));

    const toCsvValue = (value) => `"${`${value ?? ''}`.replace(/"/g, '""')}"`;

    const handleExportTeacherConfig = async () => {
        if (filteredTeacherConfigs.length === 0) {
            toast.error("Aucune configuration enseignant a exporter.");
            return;
        }

        try {
            setIsExportingConfig(true);
            const headers = [
                "Matricule de l'enseignant",
                "Nom de l'enseignant",
                "Departement de l'enseignant",
                "Semestre",
                "Niveaux dans lesquels il enseigne",
                "Matiere enseignee",
            ];

            const rows = filteredTeacherConfigs.map((row) => ([
                row.matricule,
                row.nom,
                row.departement,
                row.semestres.join(' | '),
                row.niveaux.join(' | '),
                row.matieres.join(' | '),
            ]));

            const csvContent = [headers, ...rows]
                .map((line) => line.map(toCsvValue).join(','))
                .join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const fileName = `config-enseignants-esp32-${new Date().toISOString().split('T')[0]}.csv`;
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(link.href);

            toast.success("Fichier de configuration exporte avec succes.");
        } catch {
            toast.error("Echec de l'export du fichier de configuration.");
        } finally {
            setIsExportingConfig(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tete */}
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Gestion des Utilisateurs
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Gerez tous les utilisateurs du systeme : admins, chefs de departement et enseignants.
                    </p>
                </div>
                <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
                    <button
                        type="button"
                        onClick={handleExportTeacherConfig}
                        disabled={isExportingConfig || configLoading || filteredTeacherConfigs.length === 0}
                        className="inline-flex items-center px-4 py-2 border border-emerald-300 rounded-md shadow-sm text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-8m0 8l-3-3m3 3l3-3M4 20h16" />
                        </svg>
                        {isExportingConfig ? 'Export en cours...' : 'Exporter config ESP32'}
                    </button>
                    <Link
                        href="/admin/users/chiefs"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7c3aed]"
                    >
                        Chefs de departement
                    </Link>
                    <Link
                        href="/admin/users/create"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#7c3aed] hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                    >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        Nouvel utilisateur
                    </Link>
                </div>
            </div>

            {/* Filtres et recherche */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                        {/* Recherche */}
                        <div className="sm:col-span-2">
                            <label htmlFor="search" className="sr-only">Rechercher</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                    </svg>
                                </div>
                                <input
                                    id="search"
                                    name="search"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm"
                                    placeholder="Rechercher un utilisateur..."
                                    type="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filtre role */}
                        <div>
                            <label htmlFor="role-filter" className="sr-only">Filtrer par role</label>
                            <select
                                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm rounded-md"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="all">Tous les roles</option>
                                {Object.keys(ROLES).map(roleKey => (
                                    <option key={roleKey} value={roleKey}>{ROLES[roleKey]}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtre statut */}
                        <div>
                            <label htmlFor="status-filter" className="sr-only">Filtrer par statut</label>
                            <select
                                id="status-filter"
                                name="status-filter"
                                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm rounded-md"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="active">Actif</option>
                                <option value="inactive">Inactif</option>
                                <option value="pending">En attente</option>
                            </select>
                        </div>

                        {/* Filtre departement */}
                        <div>
                            <label htmlFor="department-filter" className="sr-only">Filtrer par departement</label>
                            <select
                                id="department-filter"
                                name="department-filter"
                                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm rounded-md"
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                            >
                                <option value="all">Tous les departements</option>
                                {departments.map((dept) => (
                                    <option key={dept.departmentId} value={dept.name}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        {filteredTeacherConfigs.length} enseignant(s) dans le fichier de configuration ESP32
                    </div>
                </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m0 0v1M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                                    <dd className="text-lg font-medium text-gray-900">{totalUsers}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Chefs Departement</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {totalChiefs}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Enseignants</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {totalTeachers}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Actifs</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {totalActive}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tableau de configuration enseignants */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-6 py-4 border-b border-gray-100 bg-emerald-50/40">
                    <h2 className="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Configuration export ESP32</h2>
                    <p className="text-sm text-emerald-700 mt-1">
                        Format: matricule, nom, departement, semestre, niveaux enseignes, matiere enseignee.
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matricule</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom enseignant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departement</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semestre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveaux enseignes</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matiere enseignee</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTeacherConfigs.map((row) => {
                                const sourceUser = usersById.get(row.id);
                                return (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.matricule || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{row.nom || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{row.departement || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{row.semestres.length > 0 ? row.semestres.join(', ') : '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{row.niveaux.length > 0 ? row.niveaux.join(', ') : '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{row.matieres.length > 0 ? row.matieres.join(', ') : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {sourceUser ? (
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link href={`/admin/users/${sourceUser.id}`} className="text-[#7c3aed] hover:text-violet-600">Voir</Link>
                                                    <span className="text-gray-300">|</span>
                                                    <Link href={`/admin/users/${sourceUser.id}/edit`} className="text-indigo-600 hover:text-indigo-900">Modifier</Link>
                                                    <span className="text-gray-300">|</span>
                                                    <button
                                                        onClick={() => toggleUserStatus(sourceUser)}
                                                        className={`${sourceUser.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                                                    >
                                                        {sourceUser.status === 'active' ? 'Desactiver' : 'Activer'}
                                                    </button>
                                                    {sourceUser.id !== user?.id && (
                                                        <>
                                                            <span className="text-gray-300">|</span>
                                                            <button
                                                                onClick={() => { setSelectedUser(sourceUser); setShowDeleteModal(true); }}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Supprimer
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {(filteredTeacherConfigs.length === 0 || configLoading) && (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m0 0v1M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{configLoading ? 'Chargement des donnees de configuration...' : 'Aucun enseignant trouve'}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {configLoading ? 'Recuperation des classes et matieres en cours.' : 'Aucun enseignant ne correspond a vos criteres de recherche.'}
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/admin/users/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#7c3aed] hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                            Creer un utilisateur
                        </Link>
                    </div>
                </div>
            )}
            {/* Modal de suppression */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mt-2">
                                Supprimer l&apos; utilisateur
                            </h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Etes-vous sur de vouloir supprimer l&apos; utilisateur
                                    <span className="font-medium">{selectedUser?.name}</span> ?
                                    Cette action est irreversible et supprimera toutes les donnees associees.
                                </p>
                            </div>
                            <div className="items-center px-4 py-3">
                                <button
                                    onClick={handleDeleteUser}
                                    className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                                >
                                    Supprimer
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedUser(null);
                                    }}
                                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
