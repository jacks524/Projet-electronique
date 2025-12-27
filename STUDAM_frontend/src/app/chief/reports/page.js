"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '../../../context/authContext';
import departmentService from '../../../services/departmentService';
import userService from '../../../services/userService';
import classService from '../../../services/classService';
import toast from 'react-hot-toast';

export default function ReportsPage() {
    const { user } = useAuthContext();
    const [stats, setStats] = useState({
        teachers: 0,
        students: 0,
        classes: 0,
        attendanceRate: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, [user]);

    const loadStats = async () => {
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

            const departmentId = targetDepartment.departmentId;

            const [teachers, classes] = await Promise.all([
                userService.getUsersByRoleAndDepartment('TEACHER', departmentId),
                classService.getByDepartment({
                    departmentId,
                    name: "temp",
                    code: "temp",
                    description: "temp"
                })
            ]);

            const totalStudents = classes.reduce((sum, c) => sum + (c.studentNumber || 0), 0);

            setStats({
                teachers: teachers.length,
                students: totalStudents,
                classes: classes.length,
                attendanceRate: 85 // TODO: Calculer le taux réel
            });

        } catch (error) {
            toast.error("Erreur lors du chargement des statistiques");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const reportTypes = [
        {
            title: 'Rapport de présences',
            description: 'Consultez les statistiques de présence par classe, matière et période',
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            href: '/chief/reports/attendance',
            color: 'blue',
            stats: `${stats.attendanceRate}%`
        },
        {
            title: 'Rapport des enseignants',
            description: 'Vue d\'ensemble des enseignants, leurs matières et performances',
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            href: '/chief/reports/teachers',
            color: 'green',
            stats: `${stats.teachers}`
        },
        {
            title: 'Rapport des classes',
            description: 'Statistiques par classe, effectifs et taux de présence',
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            href: '/chief/reports/classes',
            color: 'purple',
            stats: `${stats.classes}`
        }
    ];

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
                <h1 className="text-2xl font-bold text-[#1B396A]">
                    Rapports et Statistiques
                </h1>
                <p className="text-gray-600 mt-2">
                    Accédez aux différents rapports de votre département
                </p>
            </div>

            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Enseignants
                                </dt>
                                <dd className="flex items-baseline">
                                    <div className="text-2xl font-semibold text-gray-900">
                                        {stats.teachers}
                                    </div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Étudiants
                                </dt>
                                <dd className="flex items-baseline">
                                    <div className="text-2xl font-semibold text-gray-900">
                                        {stats.students}
                                    </div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Classes
                                </dt>
                                <dd className="flex items-baseline">
                                    <div className="text-2xl font-semibold text-gray-900">
                                        {stats.classes}
                                    </div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Taux de présence
                                </dt>
                                <dd className="flex items-baseline">
                                    <div className="text-2xl font-semibold text-gray-900">
                                        {stats.attendanceRate}%
                                    </div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Types */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reportTypes.map((report, index) => (
                    <Link key={index} href={report.href}>
                        <div className={`bg-white shadow rounded-lg p-6 hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-${report.color}-500 cursor-pointer group`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 bg-${report.color}-100 rounded-lg flex items-center justify-center text-${report.color}-600 group-hover:scale-110 transition-transform`}>
                                    {report.icon}
                                </div>
                                <span className={`text-2xl font-bold text-${report.color}-600`}>
                                    {report.stats}
                                </span>
                            </div>

                            <h3 className="text-lg font-semibold text-[#1B396A] mb-2 group-hover:text-[#F26419] transition-colors">
                                {report.title}
                            </h3>

                            <p className="text-sm text-gray-600 mb-4">
                                {report.description}
                            </p>

                            <div className="flex items-center text-sm text-[#F26419] font-medium">
                                Consulter le rapport
                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-[#1B396A] mb-4">Actions rapides</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Exporter tous les rapports
                    </button>
                    <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Imprimer les statistiques
                    </button>
                    <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Envoyer par email
                    </button>
                </div>
            </div>
        </div>
    );
}