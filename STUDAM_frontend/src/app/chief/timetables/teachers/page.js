"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { useAuthContext } from '@/context/authContext';
import departmentService from '@/services/departmentService';
import userService from '@/services/userService';
import timetableService from '@/services/timetableService';
import { useRouter } from 'next/navigation';

export default function TimetableTeachersListPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuthContext();

    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

            const departments = await departmentService.getAll();
            const targetDepartment = resolveDepartment(Array.isArray(departments) ? departments : []);

            if (!targetDepartment) {
                throw new Error('Departement introuvable');
            }

            const teachersData = await userService.getUsersByRoleAndDepartment(
                'TEACHER',
                targetDepartment.departmentId
            );

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

            setTeachers(mappedTeachers);
        } catch (error) {
            toast.error('Erreur lors du chargement');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTeachers = teachers.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed]"></div>
        </div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-[#312e81]">Emplois du temps des enseignants</h1>
                <Link href="/chief/timetables">
                    <Button variant="secondary">Retour</Button>
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
                <input
                    type="text"
                    placeholder="Rechercher un enseignant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeachers.map((teacher) => (
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
                ))}
            </div>
        </div>
    );
}
