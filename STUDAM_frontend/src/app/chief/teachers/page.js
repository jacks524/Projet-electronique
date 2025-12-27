"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../../context/authContext';
import departmentService from '../../../services/departmentService';
import userService from '../../../services/userService';
import Button from '../../../components/ui/Button';
import toast from 'react-hot-toast';

export default function TeachersPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const [teachers, setTeachers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [selectedDepartment, setSelectedDepartment] = useState('');

    useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated || !user) {
            router.push('/auth/login');
            return;
        }

        const userRole = user.role?.toUpperCase();
        if (!['ADMIN', 'DEPARTMENT_MANAGER'].includes(userRole)) {
            router.push('/dashboard');
            return;
        }

        loadAllData();
    }, [user, isAuthenticated, authLoading, router]);

    const loadAllData = async () => {
        try {
            setLoading(true);

            if (!user?.departmentNames || user.departmentNames.length === 0) {
                toast.error("Aucun département assigné");
                return;
            }

            const allDepartments = await departmentService.getAll();
            const targetDepartment = allDepartments.find(
                d => d.name === user.departmentNames[0]
            );

            if (!targetDepartment) {
                throw new Error("Département non trouvé");
            }

            const teachersData = await userService.getUsersByRoleAndDepartment(
                'TEACHER',
                targetDepartment.departmentId
            );

            setDepartments(allDepartments);
            setTeachers(teachersData);

        } catch (error) {
            toast.error("Erreur lors du chargement des données");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTeachers = teachers.filter(teacher => {
        const matchesSearch = !searchTerm ||
            teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDepartment = !selectedDepartment ||
            teacher.departmentId?.toString() === selectedDepartment;

        return matchesSearch && matchesDepartment;
    });

    const sortedTeachers = [...filteredTeachers].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'email':
                return a.email.localeCompare(b.email);
            default:
                return 0;
        }
    });

    const handleToggleStatus = async (teacherId) => {
        try {
            const teacher = teachers.find(t => t.id === teacherId);
            if (!teacher) return;

            if (teacher.active) {
                await userService.deactivate(teacherId);
                toast.success("Enseignant désactivé");
            } else {
                await userService.activate(teacherId);
                toast.success("Enseignant activé");
            }

            loadAllData();
        } catch (error) {
            toast.error("Erreur lors du changement de statut");
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26419]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1B396A]">
                            Gestion des enseignants
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {teachers.length} enseignant(s) • Département: {user?.departmentNames?.[0]}
                        </p>
                    </div>
                    <Link href="/chief/teachers/create">
                        <Button>
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Ajouter un enseignant
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total enseignants</p>
                            <p className="text-3xl font-bold text-[#1B396A] mt-2">{teachers.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Actifs</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">
                                {teachers.filter(t => t.active).length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Inactifs</p>
                            <p className="text-3xl font-bold text-red-600 mt-2">
                                {teachers.filter(t => !t.active).length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Départements</p>
                            <p className="text-3xl font-bold text-purple-600 mt-2">{departments.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white shadow rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher un enseignant..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                        />
                    </div>

                    <div className="flex space-x-2">
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                        >
                            <option value="">Tous les départements</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                        >
                            <option value="name">Nom</option>
                            <option value="email">Email</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Teachers Grid */}
            {sortedTeachers.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun enseignant trouvé</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? "Essayez avec d'autres mots-clés" : "Commencez par ajouter un enseignant"}
                    </p>
                    {!searchTerm && (
                        <div className="mt-6">
                            <Link href="/chief/teachers/create">
                                <Button>
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Ajouter un enseignant
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedTeachers.map((teacher) => (
                        <div key={teacher.id} className="bg-white shadow rounded-lg p-6 hover:shadow-xl transition-shadow duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#F26419] to-[#FF7A47] flex items-center justify-center text-white font-semibold text-lg">
                                        {teacher.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-[#1B396A]">
                                            {teacher.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">{teacher.email}</p>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    teacher.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {teacher.active ? 'Actif' : 'Inactif'}
                                </span>
                            </div>

                            {teacher.phoneNumber && (
                                <p className="text-sm text-gray-600 mb-2">
                                    📞 {teacher.phoneNumber}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="flex space-x-2">
                                    <Link href={`/chief/teachers/${teacher.id}`}>
                                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Voir détails">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                    </Link>
                                    <Link href={`/chief/teachers/${teacher.id}/edit`}>
                                        <button className="p-2 text-[#1B396A] hover:bg-gray-100 rounded-lg transition-colors" title="Modifier">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => handleToggleStatus(teacher.id)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            teacher.active
                                                ? 'text-red-600 hover:bg-red-50'
                                                : 'text-green-600 hover:bg-green-50'
                                        }`}
                                        title={teacher.active ? "Désactiver" : "Activer"}
                                    >
                                        {teacher.active ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}