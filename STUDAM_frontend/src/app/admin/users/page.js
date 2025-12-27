"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../../context/authContext';
import userService from '../../../services/userService';
import { ROLES, getRoleLabel } from '../../../lib/roles';
import toast from 'react-hot-toast';

export default function AdminUsers() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuthContext();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
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

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersResponse] = await Promise.all([
                userService.getAllWithPagination(),
            ]);

            setUsers(usersResponse.content.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                username: u.username,
                role: u.roles && u.roles.length > 0 ? u.roles[0].role.toUpperCase() : 'UNKNOWN',
                departement: u.departmentsNames && u.departmentsNames.length > 0 ? u.departmentsNames.join(', ') : null,
                status: u.active ? 'active' : 'inactive',
                lastLogin: u.lastConnection ? new Date(u.lastConnection).toLocaleString('fr-FR') : null
            })));

        } catch (error) {
            toast.error(error.message || "Erreur lors du chargement des données.");
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
                return "Utilisateur supprimé avec succès.";
            },
            error: "La suppression a échoué.",
        });
        setShowDeleteModal(false);
    };

    const toggleUserStatus = async (userToToggle) => {
        const isActivating = userToToggle.status !== 'active';
        const actionPromise = isActivating
            ? await userService.activate(userToToggle.id)
            : await userService.deactivate(userToToggle.id);

        await toast.promise(
            actionPromise,
            {
                loading: 'Mise à jour du statut...',
                success: () => {
                    setUsers(currentUsers =>
                        currentUsers.map(u =>
                            u.id === userToToggle.id
                                ? {...u, status: isActivating ? 'active' : 'inactive'}
                                : u
                        )
                    );

                    return "Statut mis à jour avec succès !";
                },
                error: (err) => err.message || "La mise à jour a échoué.",
            }
        );
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'super_admin': return 'bg-red-100 text-red-800';
            case 'admin': return 'bg-purple-100 text-purple-800';
            case 'chef_departement': return 'bg-blue-100 text-blue-800';
            case 'teacher': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.username.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26419] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
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
                        Gestion des Utilisateurs
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Gérez tous les utilisateurs du système : admins, chefs de département et enseignants.
                    </p>
                </div>
                <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
                    <Link
                        href="/admin/users/chiefs"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F26419]"
                    >
                        Chefs de département
                    </Link>
                    <Link
                        href="/admin/users/create"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#F26419] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
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
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
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
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                                    placeholder="Rechercher un utilisateur..."
                                    type="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filtre rôle */}
                        <div>
                            <label htmlFor="role-filter" className="sr-only">Filtrer par rôle</label>
                            <select
                                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm rounded-md"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="all">Tous les rôles</option>
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
                        {filteredUsers.length} utilisateur(s) trouvé(s)
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
                                    <dt className="text-sm font-medium text-gray-500 truncate">Chefs Département</dt>
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

            {/* Tableau des utilisateurs */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Utilisateur
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rôle
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Département
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Statut
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Dernière connexion
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#F26419] to-[#FF7A47] flex items-center justify-center text-white font-medium">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{u.name}</div>
                                            <div className="text-sm text-gray-500">{u.email}</div>
                                            <div className="text-xs text-gray-400">@{u.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}>
                                        {getRoleLabel(u.role)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <div className="max-w-xs break-words">
                                        {u.departement ? u.departement : '—'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(u.status)}`}>
                                        {u.status === 'active' ? 'Actif' : u.status === 'inactive' ? 'Inactif' : 'En attente'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {u.lastLogin ? u.lastLogin : 'Jamais connecté'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                        <Link
                                            href={`/admin/users/${u.id}`}
                                            className="text-[#F26419] hover:text-orange-600"
                                        >
                                            Voir
                                        </Link>
                                        <span className="text-gray-300">|</span>
                                        <Link
                                            href={`/admin/users/${u.id}/edit`}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Modifier
                                        </Link>
                                        <span className="text-gray-300">|</span>
                                        <button
                                            onClick={() => toggleUserStatus(u)}
                                            className={`${
                                                u.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                                            }`}
                                        >
                                            {u.status === 'active' ? 'Désactiver' : 'Activer'}
                                        </button>
                                        {u.id !== user?.id && (
                                            <>
                                                <span className="text-gray-300">|</span>
                                                <button
                                                    onClick={() => { setSelectedUser(u); setShowDeleteModal(true); }}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Supprimer
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m0 0v1M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur trouvé</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Aucun utilisateur ne correspond à vos critères de recherche.
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/admin/users/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#F26419] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                            Créer un utilisateur
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
                                    Êtes-vous sûr de vouloir supprimer l&apos; utilisateur
                                    <span className="font-medium">{selectedUser?.name}</span> ?
                                    Cette action est irréversible et supprimera toutes les données associées.
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