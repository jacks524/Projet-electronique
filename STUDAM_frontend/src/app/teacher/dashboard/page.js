"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '../../../context/authContext';
import subjectService from '../../../services/subjectService';
import timetableService from '../../../services/timetableService';
import toast from 'react-hot-toast';


export default function TeacherDashboard() {
    const { user, loading: authLoading } = useAuthContext();
    const [subjects, setSubjects] = useState([]);
    const [stats, setStats] = useState({
        totalCourses: 0,
        pendingAttendance: 0,
        todayClasses: 0,
        recentActivity: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading || !user) return;
        loadTeacherData();
    }, [user, authLoading]);

    const loadTeacherData = async () => {
        try {
            setLoading(true);
            const subjectsData = await subjectService.getByTeacher(user.id);

            setSubjects(subjectsData);

            setStats(prev => ({
                ...prev,
                totalCourses: subjectsData.length,
            }));

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, description, icon, color, href }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    <p className="text-xs text-gray-500 mt-2">{description}</p>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    {icon}
                </div>
            </div>
            {href && (
                <Link href={href} className="inline-flex items-center text-sm text-orange-600 hover:text-orange-500 font-medium mt-4">
                    Voir détails
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </Link>
            )}
        </div>
    );

    const QuickAction = ({ title, description, icon, href, color }) => (
        <Link href={href} className="block">
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-orange-200 transition-all group">
                <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">{title}</h3>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
        </Link>
    );

    const recentActivities = [
        { id: 1, type: 'attendance', description: 'Présence enregistrée pour "Algorithmique"', time: 'Il y a 2 heures', icon: '✅' },
        { id: 2, type: 'comment', description: 'Commentaire ajouté sur la fiche de Jean Dupont', time: 'Il y a 5 heures', icon: '💬' },
        { id: 3, type: 'course', description: 'Cours "Base de données" planifié', time: 'Hier', icon: '📚' },
    ];

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement de votre tableau de bord...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Dashboard Enseignant
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Bienvenue, {user?.name}.
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                    <Link
                        href="/teacher/timetable"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        Emploi du temps
                    </Link>
                    <Link
                        href="/teacher/attendance"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Gérer les présences
                    </Link>
                </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total des cours"
                    value={stats.totalCourses}
                    description="Cours assignés"
                    icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>}
                    color="bg-blue-500"
                    href="/teacher/courses"
                />
                <StatCard
                    title="Présences en attente"
                    value={stats.pendingAttendance}
                    description="À valider/corriger"
                    icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                    color="bg-amber-500"
                    href="/teacher/attendance"
                />
                <StatCard
                    title="Cours aujourd'hui"
                    value={stats.todayClasses}
                    description="Séances programmées"
                    icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                    color="bg-green-500"
                    href="/teacher/timetable"
                />
                <StatCard
                    title="Activité récente"
                    value={stats.recentActivity}
                    description="Actions cette semaine"
                    icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>}
                    color="bg-purple-500"
                    href="/teacher/reports"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Actions rapides */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
                        <div className="space-y-3">
                            <QuickAction
                                title="Valider les présences"
                                description="Corriger et valider les fiches de présence automatiques"
                                icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                                href="/teacher/attendance"
                                color="bg-orange-500"
                            />
                            <QuickAction
                                title="Consulter l'emploi du temps"
                                description="Voir votre planning de cours"
                                icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>}
                                href="/teacher/timetable"
                                color="bg-blue-500"
                            />
                            <QuickAction
                                title="Générer un rapport"
                                description="Exporter les statistiques de présence"
                                icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>}
                                href="/teacher/reports"
                                color="bg-green-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Activité récente */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Activité récente</h2>
                            <Link href="/teacher/reports" className="text-sm text-orange-600 hover:text-orange-500 font-medium">
                                Voir tout
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                                        {activity.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900">{activity.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vos cours */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Vos Cours</h2>
                            <Link href="/teacher/courses" className="text-sm text-orange-600 hover:text-orange-500 font-medium">
                                Voir tous les cours
                            </Link>
                        </div>

                        {subjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {subjects.slice(0, 4).map(subject => (
                                    <div key={subject.subjectId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{subject.code}</p>
                                                {subject.description && (
                                                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{subject.description}</p>
                                                )}
                                            </div>
                                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2 mt-4">
                                            <Link
                                                href={`/teacher/courses/${subject.subjectId}`}
                                                className="flex-1 text-center px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                                            >
                                                Détails
                                            </Link>
                                            <Link
                                                href={`/teacher/attendance?course=${subject.subjectId}`}
                                                className="flex-1 text-center px-3 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                                            >
                                                Présences
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                                <p className="text-gray-500">Aucun cours ne vous est assigné pour le moment.</p>
                                <p className="text-sm text-gray-400 mt-1">Contactez votre chef de département.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}