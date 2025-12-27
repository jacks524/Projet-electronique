"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../../context/authContext';
import reportService from '../../../services/reportService';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuthContext();

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalDepartments: 0,
        totalTeachers: 0,
        totalStudents: 0,
    });
    const [recentActivity, setRecentActivity] = useState([
        { id: 1, type: 'user_created', description: 'Nouvel enseignant créé : Dr. Aminata Fall', timestamp: '2025-01-03 14:30', icon: '👤' },
        { id: 2, type: 'department_updated', description: 'Département Informatique mis à jour', timestamp: '2025-01-03 12:15', icon: '🏢' },
        { id: 3, type: 'system_backup', description: 'Sauvegarde automatique effectuée', timestamp: '2025-01-03 08:00', icon: '💾' },
        { id: 4, type: 'user_login', description: 'Connexion chef département: M. Diallo', timestamp: '2025-01-03 07:45', icon: '🔐' }
    ]);
    const [pageLoading, setPageLoading] = useState(true);



    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || user?.role?.toUpperCase() !== 'ADMIN') {
            router.push('/auth/login');
            return;
        }
        loadDashboardData();
    }, [user, isAuthenticated, authLoading, router]);

    const loadDashboardData = async () => {
        setPageLoading(true);
        try {
            const dashboardStats = await reportService.getDashboardStats();
            setStats(dashboardStats);
        } catch (error) {
            toast.error(error.message || "Impossible de charger les statistiques.");
        } finally {
            setPageLoading(false);
        }
    };


    const StatCard = ({ title, value, href }) => (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
            </div>
            <div className="bg-gray-50 px-5 py-3">
                <Link href={href} className="text-sm font-medium text-orange-600 hover:text-orange-500">
                    Gérer
                </Link>
            </div>
        </div>
    );

    const quickActions = [
        { title: 'Créer un utilisateur', description: 'Ajouter un nouvel admin, chef...', href: '/admin/users/create', color: 'bg-blue-600 hover:bg-blue-700' },
        { title: 'Nouveau département', description: 'Créer un nouveau département...', href: '/admin/departments/create', color: 'bg-green-600 hover:bg-green-700' },
        { title: 'Rapports système', description: 'Consulter les rapports...', href: '/admin/reports',color: 'bg-purple-600 hover:bg-purple-700' },
        { title: 'Paramètres système', description: 'Configurer les paramètres globaux...', href: '/admin/system', color: 'bg-gray-600 hover:bg-gray-700' }
    ];

    if (authLoading || pageLoading) {
        return <div className="text-center p-10">Chargement du dashboard...</div>;
    }

    if (!isAuthenticated) return null;

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Dashboard Administrateur
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Bienvenue, {user?.name}. Voici un aperçu de votre système STUDAM.
                    </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <Link
                        href="/admin/reports"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#F26419] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                        Voir tous les rapports
                    </Link>
                </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Utilisateurs" value={stats.totalUsers} href="/admin/users" />
                <StatCard title="Départements" value={stats.totalDepartments} href="/admin/departments" />
                <StatCard title="Enseignants" value={stats.totalTeachers} href="/admin/users/teachers" />
                <StatCard title="Étudiants" value={stats.totalStudents} href="/admin/users" />
            </div>

            {/* Actions rapides */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Actions rapides
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {quickActions.map((action, index) => (
                            <Link key={index} href={action.href}>
                                <div className={`${action.color} text-white p-4 rounded-lg hover:shadow-md transition-all cursor-pointer`}>
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            {action.icon}
                                        </div>
                                        <div className="ml-3">
                                            <h4 className="text-sm font-medium">{action.title}</h4>
                                            <p className="text-xs text-white/80 mt-1">{action.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grille principale */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* État du système */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            État du système
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Serveur</span>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                    <span className="text-sm font-medium text-green-600">En ligne</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Base de données</span>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                    <span className="text-sm font-medium text-green-600">Connectée</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Capteurs biométriques</span>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                                    <span className="text-sm font-medium text-yellow-600">2/5 actifs</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Dernière sauvegarde</span>
                                <span className="text-sm text-gray-900">Il y a 2h</span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link
                                href="/admin/system"
                                className="text-sm text-[#F26419] hover:text-orange-600 font-medium"
                            >
                                Voir détails système →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Activité récente */}
                <div className="lg:col-span-2 bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Activité récente
                        </h3>
                        <div className="flow-root">
                            <ul className="-mb-8">
                                {recentActivity.map((activity, index) => (
                                    <li key={activity.id}>
                                        <div className="relative pb-8">
                                            {index !== recentActivity.length - 1 && (
                                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></span>
                                            )}
                                            <div className="relative flex space-x-3">
                                                <div>
                          <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                            {activity.icon}
                          </span>
                                                </div>
                                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                    <div>
                                                        <p className="text-sm text-gray-900">
                                                            {activity.description}
                                                        </p>
                                                    </div>
                                                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                        {activity.timestamp}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-4">
                            <Link
                                href="/admin/system/logs"
                                className="text-sm text-[#F26419] hover:text-orange-600 font-medium"
                            >
                                Voir tous les logs →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphiques et métriques avancées */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graphique d'activité */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Activité des 30 derniers jours
                        </h3>
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                            <div className="text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                                </svg>
                                <p className="mt-2 text-sm text-gray-500">Graphique d&apos; activité</p>
                                <p className="text-xs text-gray-400">À implémenter avec Chart.js</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Départements les plus actifs */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Départements les plus actifs
                        </h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Informatique', activity: 95, students: 320 },
                                { name: 'Mathématiques', activity: 87, students: 280 },
                                { name: 'Physique', activity: 82, students: 240 },
                                { name: 'Chimie', activity: 76, students: 190 },
                                { name: 'Biologie', activity: 71, students: 220 }
                            ].map((dept, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium text-gray-900">{dept.name}</span>
                                            <span className="text-gray-500">{dept.activity}%</span>
                                        </div>
                                        <div className="mt-1 flex items-center text-xs text-gray-500">
                                            <span>{dept.students} étudiants</span>
                                        </div>
                                    </div>
                                    <div className="ml-4 w-24">
                                        <div className="bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-[#F26419] h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${dept.activity}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <Link
                                href="/admin/departments"
                                className="text-sm text-[#F26419] hover:text-orange-600 font-medium"
                            >
                                Gérer les départements →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}