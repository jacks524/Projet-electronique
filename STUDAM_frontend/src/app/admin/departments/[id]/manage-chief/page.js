"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../../../../context/authContext';
import departmentService from '../../../../../services/departmentService';
import userService from '../../../../../services/userService';
import toast from 'react-hot-toast';

export default function ManageDepartmentChief() {
    const router = useRouter();
    const params = useParams();
    const departmentId = params.id;
    const { user, isAuthenticated, loading: authLoading } = useAuthContext();

    const [department, setDepartment] = useState(null);
    const [currentChief, setCurrentChief] = useState(null);
    const [availableChiefs, setAvailableChiefs] = useState([]);
    const [selectedChiefId, setSelectedChiefId] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) { router.push('/auth/login'); return; }
        if (departmentId && user) {
            loadData(user);
        }
    }, [isAuthenticated, authLoading, router, departmentId, user]);

    const loadData = async (currentUser) => {
        try {
            setLoading(true);

            const [deptData, currentChiefsData, allUsers] = await Promise.all([
                departmentService.getById(departmentId),
                userService.getUsersByRoleAndDepartment('DEPARTMENT_MANAGER', departmentId),
                userService.getAllUsersWithPagination()
            ]);

            setDepartment(deptData);
            setCurrentChief(currentChiefsData.length > 0 ? currentChiefsData[0] : null);

            const candidates = allUsers
                .filter(u => u.roles && u.roles.some(r => r.role === 'TEACHER' || r.role === 'ADMIN'))
                .filter(u => u.id !== currentUser.id);

            setAvailableChiefs(candidates);

        } catch (error) {
            toast.error("Erreur lors du chargement des données.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedChiefId) {
            toast.error('Veuillez sélectionner un candidat.');
            return;
        }
        setSubmitting(true);
        try {
            await departmentService.update(departmentId, {
                name: department.name,
                code: department.code,
                description: department.description,
                departmentManagerId: parseInt(selectedChiefId),
            });
            toast.success('Le chef a été assigné avec succès !');
            router.push(`/admin/departments/${departmentId}`);
        } catch (error) {
            toast.error(error.message || "L'assignation a échoué.");
        } finally {
            setSubmitting(false);
        }
    };

    const getRoleLabel = (roleName) => {
        const upperCaseRole = roleName.toUpperCase();
        switch (upperCaseRole) {
            case 'ADMIN':
                return 'Administrateur';
            case 'DEPARTMENT_MANAGER':
                return 'Chef de département';
            case 'TEACHER':
                return 'Enseignant';
            default:
                return roleName;
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26419] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-4">
                            <li>
                                <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-500">
                                    <svg className="flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                                    </svg>
                                </Link>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    <Link href="/admin/departments" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                        Départements
                                    </Link>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    <Link href={`/admin/departments/${departmentId}`} className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                        {department?.name}
                                    </Link>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    <span className="ml-4 text-sm font-medium text-gray-500">Assigner chef</span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                    <h1 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Assigner un chef de département
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Sélectionnez le nouveau chef pour le département {department?.nom}
                    </p>
                </div>
            </div>

            {/* Formulaire de sélection */}
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Candidats disponibles */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                            Candidats disponibles
                        </h3>

                        {toast.error.selectedChiefId && (
                            <div className="mb-4 text-sm text-red-600">{toast.error.selectedChiefId}</div>
                        )}

                        <div className="space-y-4">
                            {availableChiefs.map((candidate) => (
                                <div key={candidate.id} className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                    selectedChiefId === candidate.id.toString()
                                        ? 'border-[#F26419] bg-orange-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`} onClick={() => setSelectedChiefId(candidate.id.toString())}>
                                    <label className="cursor-pointer">
                                        <input
                                            type="radio"
                                            name="selectedChief"
                                            value={candidate.id}
                                            readOnly
                                            checked={selectedChiefId === candidate.id.toString()}
                                            onChange={(e) => setSelectedChiefId(e.target.value)}
                                            className="sr-only"
                                        />

                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-[#1B396A] to-[#2563eb] rounded-full flex items-center justify-center text-white font-bold">
                                                        {candidate.name.charAt(0)}
                                                    </div>
                                                </div>

                                                <div className="ml-4 flex-1">
                                                    <h4 className="text-lg font-medium text-gray-900 mb-1">
                                                        {candidate.name}
                                                    </h4>

                                                    <div className="space-y-2 text-sm text-gray-600">
                                                        <div className="flex items-center">
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                                            </svg>
                                                            {candidate.email}
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {candidate.roles.map(roleObj => (
                                                                <span key={roleObj.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                    {getRoleLabel(roleObj.role)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>

                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>

                        {availableChiefs.length === 0 && (
                            <div className="text-center py-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun candidat disponible</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Il n&apos;y a actuellement aucun candidat qualifié disponible.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                    <Link
                        href={`/admin/departments/${departmentId}/chief`}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F26419]"
                    >
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        disabled={!selectedChiefId || submitting}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#F26419] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Assignation en cours...
                            </>
                        ) : (
                            'Assigner comme chef'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}