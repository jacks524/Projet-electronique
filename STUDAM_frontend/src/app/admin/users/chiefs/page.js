"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../../../context/authContext';
import userService from '../../../../services/userService';
import toast from 'react-hot-toast';

export default function AdminChiefsPage() {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuthContext();

    const [chiefs, setChiefs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        loadChiefs();
    }, [isAuthenticated, authLoading, router]);

    const loadChiefs = async () => {
        try {
            setLoading(true);
            const chiefUsers = await userService.getUsersByRoleAndDepartment('DEPARTMENT_MANAGER', 0);

            setChiefs(chiefUsers);
            const uniqueDepts = [...new Set(chiefUsers.flatMap(c => c.departmentNames || []))];
            setDepartments(uniqueDepts);

        } catch (error) {
            toast.error("Impossible de charger la liste des chefs de département.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (chiefId, currentStatus) => {
        try {
            await userService.toggleStatus(chiefId, !currentStatus);
            await loadChiefs();
            toast.success(`Chef ${!currentStatus ? 'activé' : 'désactivé'} avec succès`);
        } catch (error) {
            toast.error("Erreur lors du changement de statut");
        }
    };

    const handleDelete = async (chiefId, chiefName) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${chiefName} ?`)) {
            try {
                await userService.delete(chiefId);
                await loadChiefs();
                toast.success('Chef de département supprimé avec succès');
            } catch (error) {
                toast.error("Erreur lors de la suppression");
            }
        }
    };

    // Filtrage et tri
    const filteredAndSortedChiefs = chiefs
        .filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.matricule && c.matricule.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'active' && c.active) ||
                (filterStatus === 'inactive' && !c.active);

            const matchesDepartment = selectedDepartment === 'all' ||
                (c.departmentNames && c.departmentNames.includes(selectedDepartment));

            return matchesSearch && matchesStatus && matchesDepartment;
        })
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'email') return a.email.localeCompare(b.email);
            if (sortBy === 'status') return (b.active ? 1 : 0) - (a.active ? 1 : 0);
            return 0;
        });

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 mx-auto border-4 border-[#F26419] border-t-transparent rounded-full mb-4"></div>
                    <p className="text-gray-600 text-lg">Chargement des chefs de département...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* En-tête */}
                <div className="mb-6">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900">Gestion des Chefs de Département</h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Visualisez et gérez les utilisateurs ayant le rôle de chef de département.
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <Link
                                href="/admin/users/create"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#F26419] to-[#FF7A47] hover:from-[#E55A1A] hover:to-[#F26419] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F26419] transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                                </svg>
                                Créer un nouvel utilisateur
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Statistiques rapides */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Chefs</p>
                                <p className="text-2xl font-bold text-gray-900">{chiefs.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Actifs</p>
                                <p className="text-2xl font-bold text-gray-900">{chiefs.filter(c => c.active).length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Départements</p>
                                <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtres et recherche */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Recherche */}
                        <div className="md:col-span-2">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                Rechercher
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    id="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                                    placeholder="Nom, email, matricule..."
                                />
                            </div>
                        </div>

                        {/* Filtre par statut */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                Statut
                            </label>
                            <select
                                id="status"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                            >
                                <option value="all">Tous</option>
                                <option value="active">Actifs</option>
                                <option value="inactive">Inactifs</option>
                            </select>
                        </div>

                        {/* Filtre par département */}
                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                                Département
                            </label>
                            <select
                                id="department"
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                            >
                                <option value="all">Tous</option>
                                {departments.map((dept, index) => (
                                    <option key={index} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tri */}
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Trier par:</span>
                            <button
                                onClick={() => setSortBy('name')}
                                className={`px-3 py-1 text-sm rounded-md ${sortBy === 'name' ? 'bg-[#F26419] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Nom
                            </button>
                            <button
                                onClick={() => setSortBy('email')}
                                className={`px-3 py-1 text-sm rounded-md ${sortBy === 'email' ? 'bg-[#F26419] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Email
                            </button>
                            <button
                                onClick={() => setSortBy('status')}
                                className={`px-3 py-1 text-sm rounded-md ${sortBy === 'status' ? 'bg-[#F26419] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Statut
                            </button>
                        </div>
                        <span className="text-sm text-gray-500">
                            {filteredAndSortedChiefs.length} résultat(s)
                        </span>
                    </div>
                </div>

                {/* Tableau des chefs */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Chef de Département
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Département(s)
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Matricule
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndSortedChiefs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                                        </svg>
                                        <p className="font-medium">Aucun chef de département trouvé</p>
                                        <p className="mt-1">Essayez de modifier vos filtres de recherche</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredAndSortedChiefs.map((chief) => (
                                    <tr key={chief.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-[#1B396A] to-[#437DE0] rounded-full flex items-center justify-center text-white font-semibold">
                                                    {chief.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-gray-900">{chief.name}</div>
                                                    <div className="text-sm text-gray-500">{chief.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {chief.departmentNames && chief.departmentNames.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {chief.departmentNames.map((dept, index) => (
                                                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {dept}
                                                            </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {chief.matricule || <span className="text-gray-400">—</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                    chief.active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                        chief.active ? 'bg-green-600' : 'bg-red-600'
                                                    }`}></span>
                                                    {chief.active ? 'Actif' : 'Inactif'}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={`/admin/users/${chief.id}`}
                                                    className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                                                    title="Voir les détails"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                                    </svg>
                                                    Voir
                                                </Link>
                                                <Link
                                                    href={`/admin/users/${chief.id}/edit`}
                                                    className="inline-flex items-center px-3 py-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-md transition-colors"
                                                    title="Modifier"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                                    </svg>
                                                    Modifier
                                                </Link>
                                                <button
                                                    onClick={() => handleToggleStatus(chief.id, chief.active)}
                                                    className={`inline-flex items-center px-3 py-1.5 rounded-md transition-colors ${
                                                        chief.active
                                                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                                                    }`}
                                                    title={chief.active ? 'Désactiver' : 'Activer'}
                                                >
                                                    {chief.active ? 'Désactiver' : 'Activer'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(chief.id, chief.name)}
                                                    className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-md transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}