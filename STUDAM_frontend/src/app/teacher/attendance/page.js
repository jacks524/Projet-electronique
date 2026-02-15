"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '../../../context/authContext';
import attendanceService from '../../../services/attendanceService';
import toast from 'react-hot-toast';

export default function TeacherAttendanceHub() {
    const { user, loading: authLoading } = useAuthContext();
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
                attendanceService.getMyStats(user.id),
                attendanceService.getMyRecent(10, user.id),
            ]);

            setAttendanceStats(statsData || {});
            setRecentAttendances(Array.isArray(recentData) ? recentData : []);
        } catch (error) {
            console.error(error);
            toast.error('Erreur de chargement des donnees de presence');
            setAttendanceStats({ averageAttendance: 0, totalStudents: 0, totalCourses: 0 });
            setRecentAttendances([]);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, description, icon, color }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    <p className="text-xs text-gray-500 mt-2">{description}</p>
                </div>
                <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
            </div>
        </div>
    );

    const QuickActionCard = ({ title, description, icon, href, color, buttonText }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4"><div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>{icon}</div></div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">{title}</h3>
            <p className="text-gray-600 text-sm mb-4">{description}</p>
            <Link href={href} className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium rounded-lg text-white bg-violet-600 hover:bg-violet-700 transition-colors">{buttonText}</Link>
        </div>
    );

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Chargement de votre hub de presence...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Presences</h1>
                    <p className="text-gray-600 mt-1">Statistiques et sessions uniquement de l&apos;enseignant connecte</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                    <Link href="/teacher/dashboard" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">Retour au dashboard</Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <QuickActionCard title="Consulter l&apos;Historique" description="Verifiez et corrigez vos presences enregistrees." icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" /></svg>} href="/teacher/attendance/history" color="bg-blue-500" buttonText="Voir l&apos;historique" />
                <QuickActionCard title="Prise de Presence Manuelle" description="Lancez une session manuelle si necessaire." icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>} href="/teacher/attendance/take" color="bg-green-500" buttonText="Commencer une session" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Taux de presence moyen" value={`${attendanceStats.averageAttendance || 0}%`} description="Sur tous vos cours" icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0" /></svg>} color="bg-green-500" />
                <StatCard title="Total etudiants" value={attendanceStats.totalStudents || 0} description="Dans vos classes" icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7" /></svg>} color="bg-blue-500" />
                <StatCard title="Cours ce mois" value={attendanceStats.totalCourses || 0} description="Sessions enregistrees" icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13" /></svg>} color="bg-purple-500" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Dernieres sessions</h2>
                        <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">{recentAttendances.length}</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">Sessions de presence de cet enseignant uniquement</p>
                </div>

                <div className="divide-y divide-gray-200">
                    {recentAttendances.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500">Aucune session recente.</div>
                    ) : (
                        recentAttendances.map((attendance) => {
                            const total = (attendance.present || 0) + (attendance.absent || 0) + (attendance.late || 0);
                            const rate = total > 0 ? Math.round(((attendance.present || 0) / total) * 100) : 0;
                            return (
                                <div key={attendance.id || `${attendance.courseName}-${attendance.date}`} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{attendance.courseName || attendance.subjectName || 'Cours'}</h3>
                                            <p className="text-sm text-gray-600">{attendance.className || 'Classe'} - {attendance.date ? new Date(attendance.date).toLocaleDateString('fr-FR') : '-'}</p>
                                            <div className="flex space-x-4 text-xs mt-1">
                                                <span className="text-green-600">{attendance.present || 0} presents</span>
                                                <span className="text-red-600">{attendance.absent || 0} absents</span>
                                                <span className="text-amber-600">{attendance.late || 0} retards</span>
                                            </div>
                                        </div>
                                        <div className="text-right"><div className="text-2xl font-bold text-green-600">{rate}%</div><div className="text-xs text-gray-500">Taux</div></div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {recentAttendances.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50"><Link href="/teacher/attendance/history" className="text-sm text-violet-600 hover:text-violet-500 font-medium">Voir l&apos;historique complet →</Link></div>
                )}
            </div>
        </div>
    );
}
