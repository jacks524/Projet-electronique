"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '../../../context/authContext';
import attendanceService from '../../../services/attendanceService';
import toast from 'react-hot-toast';

export default function TeacherAttendanceHub() {
    const { user, isAuthenticated, loading: authLoading } = useAuthContext();
    const [recentAttendances, setRecentAttendances] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading || !user) return;
        loadAttendanceData();
    }, [user, authLoading]);

    const loadAttendanceData = async () => {
        try {
            setLoading(true);
            const [statsData, recentData] = await Promise.all([
                attendanceService.getMyStats(),
                attendanceService.getMyRecent()
            ]);

            setAttendanceStats(statsData);
            setRecentAttendances(recentData);

        } catch (error) {
            console.error('Erreur de chargement:', error);
            toast.error('Erreur de chargement des données de présence');
            setAttendanceStats({ averageAttendance: 0, totalStudents: 0, totalCourses: 0 });
            setRecentAttendances([]);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, description, icon, color, trend }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
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
            {trend && (
                <div className={`mt-3 text-xs font-medium ${trend.color}`}>
                    {trend.text}
                </div>
            )}
        </div>
    );

    const QuickActionCard = ({ title, description, icon, href, color, buttonText }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">{title}</h3>
            <p className="text-gray-600 text-sm mb-4">{description}</p>
            <Link href={href} className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-violet-600 hover:bg-violet-700 transition-colors">
                {buttonText}
            </Link>
        </div>
    );

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Chargement de votre hub de présence...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Présences</h1>
                    <p className="text-gray-600 mt-1">
                        Hub central pour toutes vos activités de présence et suivi
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                    <Link
                        href="/teacher/dashboard"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Retour au dashboard
                    </Link>
                </div>
            </div>

            {/* Actions principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <QuickActionCard
                    title="Consulter l'Historique"
                    description="Vérifiez et corrigez les présences enregistrées par le capteur."
                    icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>}
                    href="/teacher/attendance/history"
                    color="bg-blue-500"
                    buttonText="Voir l'historique"
                />
                <QuickActionCard
                    title="Prise de Présence Manuelle"
                    description="En cas de panne du capteur, lancez une session manuelle."
                    icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>}
                    href="/teacher/attendance/take"
                    color="bg-green-500"
                    buttonText="Commencer une session"
                />
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Taux de présence moyen"
                    value={`${attendanceStats.averageAttendance || 0}%`}
                    description="Sur tous vos cours"
                    icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                    color="bg-green-500"
                    trend={{ text: "+2% vs semaine dernière", color: "text-green-600" }}
                />
                <StatCard
                    title="Total étudiants"
                    value={attendanceStats.totalStudents || 0}
                    description="Dans vos classes"
                    icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Cours ce mois"
                    value={attendanceStats.totalCourses || 0}
                    description="Sessions enregistrées"
                    icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>}
                    color="bg-purple-500"
                />
            </div>

            {/* Dernières fiches validées */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                            📊 Dernières Fiches Validées
                        </h2>
                        <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                            {recentAttendances.length} récentes
                        </span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                        Vos dernières validations de présence
                    </p>
                </div>

                <div className="divide-y divide-gray-200">
                    {recentAttendances.length === 0 ? (
                        <div className="px-6 py-8 text-center">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <p className="text-gray-500">Aucune fiche de présence validée récemment</p>
                        </div>
                    ) : (
                        recentAttendances.map((attendance) => (
                            <div key={attendance.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <h3 className="font-medium text-gray-900">{attendance.courseName}</h3>
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                {attendance.className}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>📅 {new Date(attendance.date).toLocaleDateString('fr-FR')}</p>
                                            <div className="flex space-x-4 text-xs">
                                                <span className="text-green-600">✅ {attendance.present} présents</span>
                                                <span className="text-red-600">❌ {attendance.absent} absents</span>
                                                {attendance.late > 0 && (
                                                    <span className="text-amber-600">⏰ {attendance.late} retards</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-green-600">
                                            {Math.round((attendance.present / (attendance.present + attendance.absent + attendance.late)) * 100)}%
                                        </div>
                                        <div className="text-xs text-gray-500">Taux</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {recentAttendances.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <Link
                            href="/teacher/attendance/history"
                            className="text-sm text-violet-600 hover:text-violet-500 font-medium"
                        >
                            Voir l'historique complet →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}