"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../../context/authContext';
import departmentService from '../../../services/departmentService';
import userService from '../../../services/userService';
import classService from '../../../services/classService';
import Button from '../../../components/ui/Button';
import toast from 'react-hot-toast';

export default function TeachersPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [selectedClass, setSelectedClass] = useState('');
    const [teacherClassesMap, setTeacherClassesMap] = useState({});
    const [departmentName, setDepartmentName] = useState('');

    const resolveDepartment = (departmentsList) => {
        if (user?.departmentIdIfChief) {
            return departmentsList.find((dept) => dept.departmentId === user.departmentIdIfChief);
        }
        if (Array.isArray(user?.departmentsIds) && user.departmentsIds.length > 0) {
            return departmentsList.find((dept) => dept.departmentId === user.departmentsIds[0]);
        }
        if (Array.isArray(user?.departmentNames) && user.departmentNames.length > 0) {
            return departmentsList.find((dept) => dept.name === user.departmentNames[0]);
        }
        return null;
    };

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

            const departments = await departmentService.getAll();
            const targetDepartment = resolveDepartment(Array.isArray(departments) ? departments : []);

            if (targetDepartment) {
                setDepartmentName(targetDepartment.name || '');
            }

            if (!targetDepartment) {
                throw new Error("Aucun departement assigne");
            }

            const [teachersData, classesData] = await Promise.all([
                userService.getUsersByRoleAndDepartment('TEACHER', targetDepartment.departmentId),
                classService.getByDepartment(targetDepartment.departmentId)
            ]);

            const mappedClasses = classesData.map(classe => ({
                id: classe.classId,
                nom: classe.name,
                code: classe.code,
                departement: {
                    id: classe.departementResponseDTO?.departmentId || targetDepartment.departmentId,
                    nom: classe.departementResponseDTO?.name || targetDepartment.name
                }
            }));

            const normalizedTeachers = await Promise.all((Array.isArray(teachersData) ? teachersData : []).map(async (teacher) => {
                let resolvedActive = typeof teacher.active === 'boolean' ? teacher.active : null;
                if (resolvedActive === null) {
                    try {
                        const teacherDetails = await userService.getById(teacher.id);
                        resolvedActive = typeof teacherDetails?.active === 'boolean' ? teacherDetails.active : null;
                    } catch {
                        resolvedActive = null;
                    }
                }
                if (resolvedActive === null) resolvedActive = true;

                return {
                    id: teacher.id,
                    name: teacher.name,
                    email: teacher.email,
                    matricule: teacher.matricule,
                    phoneNumber: teacher.phoneNumber,
                    status: resolvedActive ? 'active' : 'inactive',
                    active: resolvedActive,
                    dateEmbauche: teacher.createdDate || new Date().toISOString(),
                    departement: {
                        id: targetDepartment.departmentId,
                        nom: targetDepartment.name
                    }
                };
            }));

            const classAssignments = {};
            await Promise.all(normalizedTeachers.map(async (teacher) => {
                try {
                    const teacherClasses = await classService.getByTeacher(teacher.id);
                    classAssignments[teacher.id] = (Array.isArray(teacherClasses) ? teacherClasses : []).map(cls => cls.classId);
                } catch {
                    classAssignments[teacher.id] = [];
                }
            }));

            setTeachers(normalizedTeachers);
            setClasses(mappedClasses);
            setTeacherClassesMap(classAssignments);
        } catch (error) {
            toast.error(error.message || "Erreur lors du chargement des donnees");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTeachers = teachers.filter(teacher => {
        const matchesSearch = !searchTerm ||
            teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const assignedClasses = teacherClassesMap[teacher.id] || [];
        const matchesClass = !selectedClass || assignedClasses.includes(parseInt(selectedClass));

        return matchesSearch && matchesClass;
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
                toast.success("Enseignant desactive");
            } else {
                await userService.activate(teacherId);
                toast.success("Enseignant active");
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-[#312e81]">
                            Gestion des enseignants
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {teachers.length} enseignant(s) - Departement: {departmentName || '---'}
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total enseignants</p>
                            <p className="text-3xl font-bold text-[#312e81] mt-2">{teachers.length}</p>
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
                            <p className="text-sm text-gray-600">Classes</p>
                            <p className="text-3xl font-bold text-purple-600 mt-2">{classes.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

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
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm"
                        />
                    </div>

                    <div className="flex space-x-2">
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm"
                        >
                            <option value="">Toutes les classes</option>
                            {classes.map(classe => (
                                <option key={classe.id} value={classe.id}>
                                    {classe.nom}
                                </option>
                            ))}
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm"
                        >
                            <option value="name">Nom</option>
                            <option value="email">Email</option>
                        </select>
                    </div>
                </div>
            </div>

            {sortedTeachers.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun enseignant trouve</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedTeachers.map((teacher) => (
                        <div key={teacher.id} className="bg-white shadow rounded-lg p-6 hover:shadow-xl transition-shadow duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-[#312e81]">{teacher.name}</h3>
                                    <p className="text-sm text-gray-500">{teacher.email}</p>
                                </div>
                                <button
                                    onClick={() => handleToggleStatus(teacher.id)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        teacher.active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {teacher.active ? 'Actif' : 'Inactif'}
                                </button>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <Link
                                    href={`/chief/teachers/${teacher.id}`}
                                    className="text-sm text-[#7c3aed] hover:text-opacity-80"
                                >
                                    Voir details
                                </Link>
                                <Link
                                    href={`/chief/teachers/${teacher.id}/edit`}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Modifier
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
