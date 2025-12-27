"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../../../context/authContext';
import userService from '../../../../services/userService';
import departmentService from '../../../../services/departmentService';
import toast from 'react-hot-toast';

export default function Teachers() {
    const router = useRouter();
    const {user, isAuthenticated, loading: authLoading} = useAuthContext();

    const [allTeachers, setAllTeachers] = useState([]); // Pour stocker la liste brute de l'API
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || user?.role?.toUpperCase() !== 'ADMIN') {
            router.push('/auth/login');
            return;
        }
        loadData();
    }, [isAuthenticated, authLoading, router]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersResponse, departmentsData] = await Promise.all([
                userService.getAllWithPagination(),
                departmentService.getAll()
            ]);

            const teachersOnly = usersResponse.content.filter(u =>
                u.roles && u.roles.some(r => r.role === 'TEACHER')
            );

            const formattedTeachers = teachersOnly.map(t => ({
                id: t.id,
                nom: t.name,
                email: t.email,
                username: t.username,
                phone: t.phoneNumber,
                departement: t.departmentNames && t.departmentNames.length > 0
                    ? {
                        id: departmentsData.find(d => d.name === t.departmentNames[0])?.departmentId,
                        nom: t.departmentNames[0]
                    }
                    : {id: null, nom: 'Non assigné'},
                status: t.active ? 'active' : 'inactive',
                courses: [],
                dateEmbauche: t.createdDate,
                performance: {totalCours: 0, totalEtudiants: 0}
            }));

            setAllTeachers(formattedTeachers);
            setDepartments(departmentsData.map(d => ({id: d.departmentId, nom: d.name})));

        } catch (error) {
            toast.error("Impossible de charger les enseignants.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTeacher = async () => {
        if (!selectedTeacher) return;
        const deletePromise = userService.remove(selectedTeacher.id);
        toast.promise(deletePromise, {
            loading: 'Suppression...',
            success: () => {
                loadData();
                return "Enseignant supprimé.";
            },
            error: "La suppression a échoué.",
        });
        setShowDeleteModal(false);
    };

    const toggleTeacherStatus = (teacherToToggle) => {
        const actionPromise = teacherToToggle.status === 'active'
            ? userService.deactivate(teacherToToggle.id)
            : userService.activate(teacherToToggle.id);

        toast.promise(actionPromise, {
            loading: 'Mise à jour...',
            success: () => {
                loadData();
                return "Statut mis à jour.";
            },
            error: "La mise à jour a échoué.",
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'active':
                return 'Actif';
            case 'inactive':
                return 'Inactif';
            case 'pending':
                return 'En attente';
            default:
                return status;
        }
    };

    const filteredTeachers = allTeachers.filter(teacher => {
        const matchesSearch = teacher.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.email.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesDepartment = departmentFilter === 'all' || teacher.departement.id === parseInt(departmentFilter);
        const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;

        return matchesSearch && matchesDepartment && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26419] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement des enseignants...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Gestion des Enseignants
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Gérez tous les enseignants et leur assignation aux départements.
                    </p>
                </div>
                <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
                    <Link
                        href="/admin/users/teachers/assign-department"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                        </svg>
                        Assigner départements
                    </Link>
                    <Link
                        href="/admin/users/create"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#F26419] hover:bg-orange-600"
                    >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        Nouvel enseignant
                    </Link>
                </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total enseignants</dt>
                                    <dd className="text-lg font-medium text-gray-900">{allTeachers.length}</dd>
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
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Actifs</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {allTeachers.filter(t => t.status === 'active').length}
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
                                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total cours</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {allTeachers.reduce((total, teacher) => total + teacher.performance.totalCours, 0)}
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
                                <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m0 0v1M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Étudiants</dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {allTeachers.reduce((total, teacher) => total + teacher.performance.totalEtudiants, 0)}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Recherche */}
                        <div>
                            <label htmlFor="search" className="sr-only">Rechercher</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24"
                                         stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                    </svg>
                                </div>
                                <input
                                    id="search"
                                    name="search"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                                    placeholder="Rechercher un enseignant..."
                                    type="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filtre département */}
                        <div>
                            <label htmlFor="department-filter" className="sr-only">Filtrer par département</label>
                            <select
                                id="department-filter"
                                name="department-filter"
                                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm rounded-md"
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                            >
                                <option value="all">Tous les départements</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.nom}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtre statut */}
                        <div>
                            <label htmlFor="status-filter" className="sr-only">Filtrer par statut</label>
                            <select
                                id="status-filter"
                                name="status-filter"
                                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm rounded-md"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="active">Actif</option>
                                <option value="inactive">Inactif</option>
                                <option value="pending">En attente</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        {filteredTeachers.length} enseignant(s) trouvé(s)
                    </div>
                </div>
            </div>

            {/* Liste des enseignants */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {filteredTeachers.map((teacher) => (
                        <li key={teacher.id}>
                            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center flex-1 min-w-0">
                                        <div className="flex-shrink-0">
                                            <div
                                                className="w-10 h-10 bg-gradient-to-br from-[#F26419] to-[#FF7A47] rounded-full flex items-center justify-center text-white font-medium">
                                                {teacher.nom.charAt(0)}
                                            </div>
                                        </div>

                                        <div className="ml-4 flex-1 min-w-0">
                                            <div className="flex items-center">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                    {teacher.nom}
                                                </h3>
                                                <span
                                                    className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(teacher.status)}`}>
                          {getStatusLabel(teacher.status)}
                        </span>
                                            </div>

                                            <div className="mt-1 flex items-center text-sm text-gray-500">
                                                <span className="truncate">{teacher.specialite}</span>
                                                <span className="mx-2">•</span>
                                                <span>{teacher.departement.nom}</span>
                                                <span className="mx-2">•</span>
                                                <span>{teacher.performance.totalCours} cours</span>
                                            </div>

                                            <div className="mt-1 text-xs text-gray-400">
                                                {teacher.email} • {teacher.dateEmbauche ? `Embauché le ${new Date(teacher.dateEmbauche).toLocaleDateString('fr-FR')}` : 'Date inconnue'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Performance */}
                                    {teacher.status === 'active' && teacher.performance.totalCours > 0 && (
                                        <div className="hidden md:block mr-4">
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {teacher.performance.totalEtudiants} étudiants
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {teacher.performance.tauxPresence}% présence
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    ⭐ {teacher.performance.evaluationEtudiants}/5
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center space-x-2">
                                        <Link
                                            href={`/admin/users/${teacher.id}`}
                                            className="text-[#F26419] hover:text-orange-600 text-sm font-medium"
                                        >
                                            Voir
                                        </Link>
                                        <span className="text-gray-300">|</span>
                                        <Link
                                            href={`/admin/users/${teacher.id}/edit`}
                                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                        >
                                            Modifier
                                        </Link>
                                        <span className="text-gray-300">|</span>
                                        <button
                                            onClick={() => toggleTeacherStatus(teacher)}
                                            className={`text-sm font-medium ${
                                                teacher.status === 'active'
                                                    ? 'text-red-600 hover:text-red-900'
                                                    : 'text-green-600 hover:text-green-900'
                                            }`}
                                        >
                                            {teacher.status === 'active' ? 'Désactiver' : 'Activer'}
                                        </button>
                                        {teacher.id !== user?.id && (
                                            <>
                                                <span className="text-gray-300">|</span>
                                                <button
                                                    onClick={() => {
                                                        setSelectedTeacher(teacher);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                                                >
                                                    Supprimer
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Cours (affiché sur mobile) */}
                                {teacher.courses && teacher.courses.length > 0 && (
                                    <div className="mt-3 md:hidden">
                                        <div className="text-xs text-gray-500 mb-1">Cours enseignés:</div>
                                        <div className="flex flex-wrap gap-1">
                                            {teacher.courses.map((course) => (
                                                <span
                                                    key={course.id}
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                                >
                          {course.nom} ({course.niveau})
                        </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {filteredTeachers.length === 0 && (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun enseignant trouvé</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Aucun enseignant ne correspond à vos critères de recherche.
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/admin/users/teachers/assign-department"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#F26419] hover:bg-orange-600"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                            Ajouter un enseignant
                        </Link>
                    </div>
                </div>
            )}

            {/* Modal de suppression */}
            {showDeleteModal && selectedTeacher && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mt-2">
                                Supprimer l&apos;enseignant
                            </h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Êtes-vous sûr de vouloir supprimer l&apos;enseignant{' '}
                                    <span className="font-medium">{selectedTeacher.nom}</span> ?
                                    Cette action est irréversible et supprimera toutes les données associées.
                                </p>
                                {selectedTeacher.performance.totalCours > 0 && (
                                    <p className="text-sm text-red-600 mt-2">
                                        Attention: Cet enseignant a {selectedTeacher.performance.totalCours} cours
                                        actifs.
                                    </p>
                                )}
                            </div>
                            <div className="items-center px-4 py-3">
                                <button
                                    onClick={handleDeleteTeacher}
                                    className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                                >
                                    Supprimer
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedTeacher(null);
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