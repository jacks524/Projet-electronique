"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { useAuthContext } from '@/context/authContext';
import departmentService from '@/services/departmentService';
import classService from '@/services/classService';
import userService from '@/services/userService';
import timetableService from '@/services/timetableService';

export default function TimetablesPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuthContext();

    const [view, setView] = useState('classes');
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
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

            const [classesData, teachersData] = await Promise.all([
                classService.getByDepartment(targetDepartment.departmentId),
                userService.getUsersByRoleAndDepartment('TEACHER', targetDepartment.departmentId)
            ]);

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

            const teacherStats = await Promise.all(
                teachersData.map(async (teacher) => {
                    const timetable = await timetableService.getByTeacher(teacher.id);
                    const schedules = Array.isArray(timetable?.schedules) ? timetable.schedules : [];
                    return {
                        teacherId: teacher.id,
                        courseCount: schedules.length,
                        hoursPerWeek: getWeeklyHours(schedules)
                    };
                })
            );

            const teacherStatsMap = Object.fromEntries(teacherStats.map(stat => [stat.teacherId, stat]));

            const mappedTeachers = teachersData.map((teacher) => {
                const stats = teacherStatsMap[teacher.id] || { courseCount: 0, hoursPerWeek: 0 };
                return {
                    id: teacher.id,
                    name: teacher.name,
                    email: teacher.email,
                    courseCount: stats.courseCount,
                    hoursPerWeek: stats.hoursPerWeek,
                    department: { name: targetDepartment.name }
                };
            });

            setClasses(mappedClasses);
            setTeachers(mappedTeachers);

        } catch (error) {
            toast.error("Erreur lors du chargement des donnees");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClasses = classes.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.level.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredTeachers = teachers.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-3xl font-bold text-[#312e81]">Emplois du temps</h1>
                    <p className="text-gray-600 mt-1">Gerez les emplois du temps des classes et des enseignants</p>
                </div>
                <Link href="/chief/timetables/create">
                    <Button>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Creer un cours
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Classes</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">{classes.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Enseignants</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">{teachers.length}</p>
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
                                {classes.reduce((sum, c) => sum + (c.courseCount || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setView('classes')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                view === 'classes'
                                    ? 'bg-[#7c3aed] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Par classes
                        </button>
                        <button
                            onClick={() => setView('teachers')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                view === 'teachers'
                                    ? 'bg-[#7c3aed] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Par enseignants
                        </button>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            {view === 'classes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClasses.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune classe trouvee</h3>
                            <p className="mt-1 text-sm text-gray-500">Aucune classe ne correspond a votre recherche.</p>
                        </div>
                    ) : (
                        filteredClasses.map((classe) => (
                            <Link key={classe.id} href={`/chief/timetables/classes/${classe.id}`}>
                                <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer border-2 border-transparent hover:border-[#7c3aed]">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-[#312e81] mb-1">
                                                {classe.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">{classe.level}</p>
                                            <p className="text-xs text-gray-500 mt-1">{classe.department.name}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#7c3aed] to-[#a855f7] rounded-full flex items-center justify-center">
                                            <span className="text-lg font-bold text-white">{classe.name[0]}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
                                            </svg>
                                            {classe.studentCount} etudiants
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                            </svg>
                                            {classe.courseCount} cours
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                            {classe.totalWeeklyHours}h / semaine
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}

            {view === 'teachers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeachers.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun enseignant trouve</h3>
                            <p className="mt-1 text-sm text-gray-500">Aucun enseignant ne correspond a votre recherche.</p>
                        </div>
                    ) : (
                        filteredTeachers.map((teacher) => (
                            <Link key={teacher.id} href={`/chief/timetables/teachers/${teacher.id}`}>
                                <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-2 border-transparent hover:border-[#7c3aed]">
                                    <h3 className="text-lg font-bold text-[#312e81]">{teacher.name}</h3>
                                    <p className="text-sm text-gray-600">{teacher.email}</p>
                                    <div className="mt-4 space-y-2">
                                        <p className="text-sm text-gray-600">{teacher.courseCount} cours</p>
                                        <p className="text-sm text-gray-600">{teacher.hoursPerWeek}h/semaine</p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
