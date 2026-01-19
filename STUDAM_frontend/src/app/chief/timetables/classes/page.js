"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { useAuthContext } from '@/context/authContext';
import departmentService from '@/services/departmentService';
import classService from '@/services/classService';
import timetableService from '@/services/timetableService';

export default function TimetableClassesListPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuthContext();

    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        const userRole = user?.role?.toUpperCase();
        if (!['ADMIN', 'DEPARTMENT_MANAGER'].includes(userRole)) {
            router.push('/dashboard');
            return;
        }

        loadData();
    }, [user, isAuthenticated, authLoading, router]);

    const parseTimeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':').map(Number);
        if (parts.length < 2) return 0;
        return parts[0] * 60 + parts[1];
    };

    const getWeeklyHours = (schedules) => {
        return schedules.reduce((total, item) => {
            const start = parseTimeToMinutes(item.startHour);
            const end = parseTimeToMinutes(item.endHour);
            const hours = Math.max(0, (end - start) / 60);
            return total + hours;
        }, 0);
    };

    const loadData = async () => {
        try {
            setLoading(true);

            if (!user?.departmentNames || user.departmentNames.length === 0) {
                toast.error("Aucun departement assigne");
                return;
            }

            const departments = await departmentService.getAll();
            const targetDepartment = departments.find(d => d.name === user.departmentNames[0]);

            if (!targetDepartment) {
                throw new Error('Departement introuvable');
            }

            const classesData = await classService.getByDepartment(targetDepartment.departmentId);

            const classStats = await Promise.all(
                classesData.map(async (classe) => {
                    const timetable = await timetableService.getByClass(classe.classId);
                    const schedules = Array.isArray(timetable?.schedules) ? timetable.schedules : [];
                    return {
                        classId: classe.classId,
                        courseCount: schedules.length,
                        totalWeeklyHours: getWeeklyHours(schedules)
                    };
                })
            );

            const classStatsMap = Object.fromEntries(classStats.map(stat => [stat.classId, stat]));

            const mappedClasses = classesData.map((classe) => {
                const stats = classStatsMap[classe.classId] || { courseCount: 0, totalWeeklyHours: 0 };
                return {
                    id: classe.classId,
                    name: classe.name,
                    level: classe.code || '---',
                    studentCount: classe.studentNumber || 0,
                    courseCount: stats.courseCount,
                    totalWeeklyHours: stats.totalWeeklyHours,
                    department: {
                        name: classe.departementResponseDTO?.name || targetDepartment.name
                    }
                };
            });

            setClasses(mappedClasses);

        } catch (error) {
            toast.error("Erreur lors du chargement des donnees");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClasses = classes
        .filter(c =>
            (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.level.toLowerCase().includes(searchTerm.toLowerCase()))
        );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#312e81]">Emplois du temps par classe</h1>
                    <p className="text-gray-600 mt-1">Consultez et gerez les emplois du temps de chaque classe</p>
                </div>
                <Link href="/chief/timetables">
                    <Button variant="secondary">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        Retour
                    </Button>
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher une classe..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Total classes</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">{filteredClasses.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Total etudiants</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">
                                {filteredClasses.reduce((sum, c) => sum + c.studentCount, 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Total cours</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">
                                {filteredClasses.reduce((sum, c) => sum + c.courseCount, 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-violet-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Moy. heures/sem</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">
                                {filteredClasses.length > 0
                                    ? Math.round(filteredClasses.reduce((sum, c) => sum + c.totalWeeklyHours, 0) / filteredClasses.length)
                                    : 0}h
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Classe
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Niveau
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Etudiants
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cours
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Heures/sem
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredClasses.length == 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune classe trouvee</h3>
                                    <p className="mt-1 text-sm text-gray-500">Aucune classe ne correspond a vos criteres de recherche.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredClasses.map((classe) => (
                                <tr key={classe.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#7c3aed] to-[#a855f7] rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">{classe.name[0]}</span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{classe.name}</div>
                                                <div className="text-sm text-gray-500">{classe.department.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {classe.level}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {classe.studentCount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {classe.courseCount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {classe.totalWeeklyHours}h
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Link href={`/chief/timetables/classes/${classe.id}`} className="text-[#7c3aed] hover:text-opacity-80">
                                            Voir
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
