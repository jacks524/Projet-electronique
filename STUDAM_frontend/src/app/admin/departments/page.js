"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../../context/authContext';
import departmentService from '../../../services/departmentService';
import toast from 'react-hot-toast';

export default function AdminDepartments() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuthContext();

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || user?.role?.toUpperCase() !== 'ADMIN') {
            router.push('/auth/login');
            return;
        }
        loadDepartments();
    }, [user, isAuthenticated, authLoading, router]);

    const loadDepartments = async () => {
        try {
            setLoading(true);
            const dataFromApi = await departmentService.getAll();
            const formattedData = dataFromApi.map(dept => ({
                id: dept.departmentId,
                nom: dept.name,
                code: dept.code,
                description: dept.description,
		chef: dept.departmentManager,
		totalEnseignants: dept.stats.totalTeachers,
		totalEtudiants: dept.stats.totalStudents,
                statut: 'active',
            }));
            setDepartments(formattedData);
        } catch (error) {
            toast.error(error.message || 'Erreur lors du chargement des départements');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDepartment = async () => {
        if (!selectedDepartment) return;

        const deletePromise = departmentService.remove(selectedDepartment.id);

        toast.promise(deletePromise, {
            loading: `Suppression de "${selectedDepartment.nom}"...`,
            success: () => {
                loadDepartments();
                return `Département supprimé avec succès !`;
            },
            error: (err) => err.message || 'La suppression a échoué.',
        });

        // On ferme le modal immédiatement
        setShowDeleteModal(false);
        setSelectedDepartment(null);
    };

    const filteredDepartments = departments.filter(dept =>
        dept.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26419] mx-auto"></div>
                    <p>Chargement des départements...</p>
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
                        Gestion des Départements
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Gérez les départements, assignez des chefs et supervisez l&apos;organisation académique.
                    </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <Link
                        href="/admin/departments/create"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#F26419] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        Nouveau département
                    </Link>
                </div>
            </div>


            {/* Filtres et recherche */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div className="sm:flex sm:items-center">
                            <div className="w-full sm:max-w-xs">
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
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                                        placeholder="Rechercher un département..."
                                        type="search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-4 text-sm text-gray-500">
                            {filteredDepartments.length} département(s) trouvé(s)
                        </div>
                    </div>
                </div>
            </div>

            {/* Liste des départements */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {filteredDepartments.map((department) => (
                        <li key={department.id}>
                            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                                                    department.statut === 'active' ? 'bg-green-500' : 'bg-gray-400'
                                                }`}>
                                                    {department.code}
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-1 min-w-0">
                                                <div className="flex items-center">
                                                    <h3 className="text-lg font-medium text-gray-900 truncate">
                                                        {department.nom}
                                                    </h3>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {department.description}
                                                </p>
                                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                                    <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                                    </svg>
                                                    {department.chef ? (
                                                        <span>Chef: {department.chef.name}</span>
                                                    ) : (
                                                        <span className="text-red-500">Aucun chef assigné</span>
                                                    )}
                                                    <span className="mx-2">•</span>
                                                    <span>{department.totalEnseignants} enseignants</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{department.totalEtudiants} étudiants</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Link
                                            href={`/admin/departments/${department.id}`}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F26419]"
                                        >
                                            Voir détails
                                        </Link>
                                        <Link
                                            href={`/admin/departments/${department.id}/edit`}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#F26419] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                        >
                                            Modifier
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setSelectedDepartment(department);
                                                setShowDeleteModal(true);
                                            }}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {filteredDepartments.length === 0 && (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun département trouvé</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Commencez par créer un nouveau département.
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/admin/departments/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#F26419] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                            Nouveau département
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
                                Supprimer le département
                            </h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Êtes-vous sûr de vouloir supprimer le département
                                    <span className="font-medium"> {selectedDepartment?.nom}</span> ?
                                    Cette action est irréversible.
                                </p>
                            </div>
                            <div className="items-center px-4 py-3">
                                <button
                                    onClick={handleDeleteDepartment}
                                    className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                                >
                                    Supprimer
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedDepartment(null);
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
