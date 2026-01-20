"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '../../../context/authContext';
import subjectService from '../../../services/subjectService';
import timetableService from '../../../services/timetableService';
import reportService from '../../../services/reportService';
import toast from 'react-hot-toast';

export default function TeacherDashboard() {
    const { user, loading: authLoading } = useAuthContext();
    const [subjects, setSubjects] = useState([]);
    const [todaySchedules, setTodaySchedules] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [stats, setStats] = useState({
        totalCourses: 0,
        pendingAttendance: 0,
        todayClasses: 0,
        recentActivity: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading || !user) return;
        loadTeacherData();
    }, [user, authLoading]);

    const dayKeys = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

    const formatTime = (timeValue) => {
        if (!timeValue) return '';
        if (typeof timeValue === 'string') return timeValue.slice(0, 5);
        if (typeof timeValue === 'object' && typeof timeValue.hour === 'number') {
            const hours = String(timeValue.hour).padStart(2, '0');
            const minutes = String(timeValue.minute || 0).padStart(2, '0');
            return `${hours}:${minutes}`;
        }
        return '';
    };

    const loadTeacherData = async () => {
        try {
            setLoading(true);

            const [subjectsData, timetableData, activityData] = await Promise.all([
                subjectService.getByTeacher(user.id),
                timetableService.getByTeacher(user.id),
                reportService.getRecentActivity(6),
            ]);

            const normalizedSubjects = Array.isArray(subjectsData) ? subjectsData : [];
            const timetables = Array.isArray(timetableData) ? timetableData : (timetableData ? [timetableData] : []);

            const schedules = timetables.flatMap((timetable) => {
                const timetableSchedules = Array.isArray(timetable?.schedules) ? timetable.schedules : [];
                return timetableSchedules.map((schedule) => ({
                    id: schedule.scheduleId || schedule.id,
                    day: schedule.day,
                    start: formatTime(schedule.startHour),
                    end: formatTime(schedule.endHour),
                    subject: schedule.subject,
                    classe: schedule.classe,
                }));
            });

            const todayKey = dayKeys[new Date().getDay()];
            const todays = schedules.filter((schedule) => schedule.day === todayKey);

            // Calculate pending attendance based on current time
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const currentTimeInMinutes = currentHour * 60 + currentMinute;

            const pendingClasses = todays.filter((schedule) => {
                if (!schedule.start) return false;
                const [startHour, startMinute] = schedule.start.split(':').map(Number);
                const scheduleTimeInMinutes = startHour * 60 + startMinute;
                // Consider a class pending if it hasn't started yet or is currently ongoing
                return scheduleTimeInMinutes > currentTimeInMinutes;
            });

            setSubjects(normalizedSubjects);
            setTodaySchedules(todays);

            // Filter recent activity to show only teacher's activities
            const teacherActivities = Array.isArray(activityData)
                ? activityData.filter(activity =>
                    !activity.userId || activity.userId === user.id
                )
                : [];
            setRecentActivity(teacherActivities);

            setStats({
                totalCourses: normalizedSubjects.length,
                pendingAttendance: pendingClasses.length,
                todayClasses: todays.length,
                recentActivity: teacherActivities.length,
            });
        } catch (error) {
            toast.error(error.message || 'Erreur lors du chargement du tableau de bord.');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon, color, href, trend }) => {
        const Card = (
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                    <div className={`w-full h-full rounded-full bg-gradient-to-br ${color} transform translate-x-8 -translate-y-8`}></div>
                </div>

                <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}>
                            {icon}
                        </div>
                        {trend && (
                            <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                                {trend}%
                            </div>
                        )}
                    </div>
                    <div className="text-3xl font-bold text-slate-800 mb-1">
                        {Number.isFinite(value) ? value.toLocaleString() : 0}
                    </div>
                    <div className="text-sm text-slate-500 font-medium">{title}</div>
                </div>
            </div>
        );

        if (href) {
            return (
                <Link href={href} className="group">
                    {Card}
                </Link>
            );
        }

        return Card;
    };

    const QuickActionCard = ({ title, description, icon, color, href }) => (
        <Link href={href}>
            <div className={`bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 border-l-4 ${color} group cursor-pointer`}>
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${color.replace('border-', 'from-').replace('-500', '-100')} ${color.replace('border-', 'to-').replace('-500', '-200')}`}>
                        {icon}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-violet-600 transition-colors">{title}</h3>
                        <p className="text-xs text-slate-500">{description}</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </Link>
    );

    const getActivityMeta = (activity) => {
        const type = (activity?.type || activity?.action || activity?.category || activity?.description || '').toString().toLowerCase();

        if (type.includes('attendance') || type.includes('presence') || type.includes('session')) {
            return {
                bg: 'bg-violet-100 text-violet-600', icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                    </svg>
                )
            };
        }

        if (type.includes('class') || type.includes('classe')) {
            return {
                bg: 'bg-blue-100 text-blue-600', icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M4 21V4a1 1 0 011-1h14a1 1 0 011 1v17" />
                    </svg>
                )
            };
        }

        return {
            bg: 'bg-slate-100 text-slate-600', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5h10M11 9h7M11 13h10M11 17h7M6 7h.01M6 11h.01M6 15h.01M6 19h.01" />
                </svg>
            )
        };
    };

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Chargement des donnees...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
                    <p className="text-sm text-slate-500 mt-1">Enseignant {user?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/teacher/timetable" className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Emploi du temps
                        </span>
                    </Link>
                    <Link href="/teacher/attendance" className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors">
                        Gerer presences
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Cours assignes"
                    value={stats.totalCourses}
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    }
                    color="from-violet-500 to-purple-600"
                    href="/teacher/courses"
                />
                <StatCard
                    title="Presences en attente"
                    value={stats.pendingAttendance}
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    color="from-amber-500 to-orange-600"
                    href="/teacher/attendance"
                />
                <StatCard
                    title="Cours aujourd'hui"
                    value={stats.todayClasses}
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    color="from-emerald-500 to-green-600"
                    href="/teacher/timetable"
                />
                <StatCard
                    title="Activite recente"
                    value={stats.recentActivity}
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    }
                    color="from-blue-500 to-indigo-600"
                    href="/teacher/reports"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <QuickActionCard
                    title="Valider les presences"
                    description="Corriger et valider les feuilles en attente"
                    icon={
                        <svg className="w-5 h-5 text-violet-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    color="border-violet-500"
                    href="/teacher/attendance"
                />
                <QuickActionCard
                    title="Consulter l'emploi du temps"
                    description="Voir votre planning de cours"
                    icon={
                        <svg className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    }
                    color="border-amber-500"
                    href="/teacher/timetable"
                />
                <QuickActionCard
                    title="Voir mes cours"
                    description="Acceder aux details de vos cours"
                    icon={
                        <svg className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    }
                    color="border-emerald-500"
                    href="/teacher/courses"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Cours aujourd'hui</h2>
                        <Link href="/teacher/timetable" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                            Voir le planning
                        </Link>
                    </div>
                    {todaySchedules.length === 0 ? (
                        <div className="text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-6 text-center">
                            Aucun cours prevu pour aujourd'hui.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {todaySchedules.map((schedule) => (
                                <div key={schedule.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-violet-100 text-violet-600">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-800 font-medium">{schedule.subject?.name || 'Cours'}</p>
                                        <p className="text-xs text-slate-500 mt-1">{schedule.start} - {schedule.end}</p>
                                        <p className="text-xs text-slate-500 mt-1">{schedule.classe?.name || 'Classe'} </p>
                                    </div>
                                    {schedule.subject?.subjectId && (
                                        <Link href={`/teacher/courses/${schedule.subject.subjectId}`} className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                                            Details
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Activite recente</h2>
                        <Link href="/teacher/reports" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                            Voir tout
                        </Link>
                    </div>
                    {recentActivity.length === 0 ? (
                        <div className="text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-6 text-center">
                            Aucune activite recente disponible.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentActivity.map((activity) => {
                                const meta = getActivityMeta(activity);
                                return (
                                    <div key={activity.id || `${activity.description}-${activity.timestamp}`} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${meta.bg} flex-shrink-0`}>
                                            {meta.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-slate-800 font-medium">{activity.description || 'Activite recente'}</p>
                                            <p className="text-xs text-slate-500 mt-1">{activity.timestamp || ''}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Vos cours</h2>
                    <Link href="/teacher/courses" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                        Voir tous
                    </Link>
                </div>

                {subjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subjects.slice(0, 4).map((subject) => (
                            <div key={subject.subjectId} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{subject.name}</h3>
                                        <p className="text-sm text-slate-600 mt-1">{subject.code}</p>
                                        {subject.description && (
                                            <p className="text-sm text-slate-500 mt-2 line-clamp-2">{subject.description}</p>
                                        )}
                                    </div>
                                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex space-x-2 mt-4">
                                    <Link
                                        href={`/teacher/courses/${subject.subjectId}`}
                                        className="flex-1 text-center px-3 py-2 text-sm font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors"
                                    >
                                        Details
                                    </Link>
                                    <Link
                                        href={`/teacher/attendance?course=${subject.subjectId}`}
                                        className="flex-1 text-center px-3 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                                    >
                                        Presences
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-slate-500">Aucun cours assigne pour le moment.</p>
                        <p className="text-sm text-slate-400 mt-1">Contactez votre chef de departement.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
