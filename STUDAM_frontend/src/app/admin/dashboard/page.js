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

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalDepartments: 0,
        totalTeachers: 0,
        totalStudents: 0,
    });
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        if (authLoading) return;
        
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        if (user?.role?.toUpperCase() !== 'ADMIN' && user?.role?.toUpperCase() !== 'SUPER_ADMIN') {
            router.push('/dashboard');
            return;
        }

        loadDashboardData();
    }, [user, isAuthenticated, authLoading, router]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const dashboardStats = await reportService.getDashboardStats();
            setStats(dashboardStats);
            
            // Données de démo pour l'activité récente
            setRecentActivity([
                { id: 1, type: 'user_created', description: 'Nouvel enseignant créé : Dr. Aminata Fall', timestamp: '2025-01-03 14:30', icon: '👤' },
                { id: 2, type: 'department_updated', description: 'Département Informatique mis à jour', timestamp: '2025-01-03 12:15', icon: '🏢' },
                { id: 3, type: 'system_backup', description: 'Sauvegarde automatique effectuée', timestamp: '2025-01-03 08:00', icon: '💾' },
                { id: 4, type: 'course_added', description: 'Nouveau cours de Mathématiques avancées', timestamp: '2025-01-02 16:45', icon: '📚' },
                { id: 5, type: 'report_generated', description: 'Rapport trimestriel généré', timestamp: '2025-01-02 11:20', icon: '📊' },
            ]);
        } catch (error) {
            toast.error(error.message || "Impossible de charger les statistiques.");
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon, color, href, trend }) => (
        <Link href={href} className="group">
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 overflow-hidden relative">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                    <div className={`w-full h-full rounded-full bg-gradient-to-br ${color} transform translate-x-8 -translate-y-8`}></div>
                </div>
                
                <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl shadow-lg`}>
                            {icon}
                        </div>
                        {trend && (
                            <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                                </svg>
                                {trend}%
                            </div>
                        )}
                    </div>
                    <div className="text-3xl font-bold text-slate-800 mb-1">
                        {value.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500 font-medium">{title}</div>
                </div>
            </div>
        </Link>
    );

    const QuickActionCard = ({ title, description, icon, color, href }) => (
        <Link href={href}>
            <div className={`bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 border-l-4 ${color} group cursor-pointer`}>
                <div className="flex items-start gap-4">
                    <div className={`text-2xl p-3 rounded-xl bg-gradient-to-br ${color.replace('border-', 'from-').replace('-500', '-100')} ${color.replace('border-', 'to-').replace('-500', '-200')}`}>
                        {icon}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-violet-600 transition-colors">{title}</h3>
                        <p className="text-xs text-slate-500">{description}</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
        </Link>
    );

    const bestPerformers = [
        { id: 1, name: 'Informatique', score: 95, color: 'from-violet-500 to-purple-600', students: 320 },
        { id: 2, name: 'Mathématiques', score: 89, color: 'from-amber-500 to-orange-600', students: 280 },
        { id: 3, name: 'Physique', score: 85, color: 'from-blue-500 to-indigo-600', students: 240 },
        { id: 4, name: 'Chimie', score: 78, color: 'from-green-500 to-emerald-600', students: 190 },
    ];

    const libraryItems = [
        { title: 'Literature', reads: '240 lus', icon: '📚', color: 'bg-amber-100 text-amber-600' },
        { title: 'Mathematics', reads: '180 lus', icon: '🔢', color: 'bg-blue-100 text-blue-600' },
        { title: 'English', reads: '156 lus', icon: '📖', color: 'bg-green-100 text-green-600' },
        { title: 'Science', reads: '142 lus', icon: '🔬', color: 'bg-purple-100 text-purple-600' },
    ];

    const quickStats = [
        { label: 'Cours actifs', value: '24', change: '+3', color: 'text-blue-600' },
        { label: 'Évaluations', value: '156', change: '+12', color: 'text-green-600' },
        { label: 'Taux de complétion', value: '78%', change: '+5%', color: 'text-amber-600' },
        { label: 'Support ouvert', value: '8', change: '-2', color: 'text-red-600' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Chargement des données...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
                    <p className="text-sm text-slate-500 mt-1">Aperçu complet de votre système</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                            </svg>
                            Exporter
                        </span>
                    </button>
                    <button className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors">
                        Générer rapport
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Étudiants" 
                    value={stats.totalStudents} 
                    icon="🎓" 
                    color="from-violet-500 to-purple-600" 
                    href="/admin/users"
                    trend={12}
                />
                <StatCard 
                    title="Enseignants" 
                    value={stats.totalTeachers} 
                    icon="👨‍🏫" 
                    color="from-blue-500 to-indigo-600" 
                    href="/admin/users/teachers"
                    trend={8}
                />
                <StatCard 
                    title="Départements" 
                    value={stats.totalDepartments} 
                    icon="🏢" 
                    color="from-amber-500 to-orange-600" 
                    href="/admin/departments"
                    trend={5}
                />
                <StatCard 
                    title="Total Utilisateurs" 
                    value={stats.totalUsers} 
                    icon="👥" 
                    color="from-green-500 to-emerald-600" 
                    href="/admin/users"
                    trend={15}
                />
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {quickStats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                            <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
                            <div className={`text-xs font-medium mt-1 ${stat.color}`}>{stat.change}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Actions & Activity */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-800">Actions rapides</h2>
                            <Link href="/admin/actions" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                                Voir tout →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <QuickActionCard 
                                title="Créer un utilisateur" 
                                description="Ajouter un admin, chef..." 
                                icon="➕"
                                color="border-blue-500"
                                href="/admin/users/create"
                            />
                            <QuickActionCard 
                                title="Nouveau département" 
                                description="Créer un département..." 
                                icon="🏢"
                                color="border-green-500"
                                href="/admin/departments/create"
                            />
                            <QuickActionCard 
                                title="Rapports système" 
                                description="Consulter les rapports..." 
                                icon="📊"
                                color="border-purple-500"
                                href="/admin/reports"
                            />
                            <QuickActionCard 
                                title="Paramètres" 
                                description="Configurer le système..." 
                                icon="⚙️"
                                color="border-slate-500"
                                href="/admin/system"
                            />
                        </div>
                    </div>

                    {/* Library Section */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-800">Ressources populaires</h2>
                            <Link href="/admin/library" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                                Voir tout →
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {libraryItems.map((item, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-slate-100">
                                    <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center text-2xl`}>
                                        {item.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-800 text-sm truncate">{item.title}</p>
                                        <p className="text-xs text-slate-500">{item.reads}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Stats & Performers */}
                <div className="space-y-6">
                    {/* Course Statistics Donut */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-800">Statistiques</h2>
                            <button className="text-slate-400 hover:text-slate-600">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Best Performers */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-800">Meilleurs départements</h2>
                            <select className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-1.5 border-none focus:outline-none focus:ring-2 focus:ring-violet-500">
                                <option>Hebdomadaire</option>
                                <option>Mensuel</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            {bestPerformers.map((dept) => (
                                <div key={dept.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${dept.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                                                {dept.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800 text-sm">{dept.name}</p>
                                                <p className="text-xs text-slate-500">{dept.students} étudiants</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-800">{dept.score}%</p>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full bg-gradient-to-r ${dept.color} transition-all duration-500`}
                                            style={{ width: `${dept.score}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications / Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Activité récente</h2>
                    <Link href="/admin/system/logs" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                        Voir tout →
                    </Link>
                </div>
                <div className="space-y-3">
                    {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-xl flex-shrink-0">
                                {activity.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-800 font-medium">{activity.description}</p>
                                <p className="text-xs text-slate-500 mt-1">{activity.timestamp}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* System Overview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Aperçu système</h2>
                    <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Tout fonctionne normalement
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-700">Serveur</p>
                                <p className="text-xs text-slate-500">Charge CPU: 42%</p>
                            </div>
                            <div className="text-green-600 text-sm">✓</div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-700">Base de données</p>
                                <p className="text-xs text-slate-500">Latence: 12ms</p>
                            </div>
                            <div className="text-green-600 text-sm">✓</div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-700">Stockage</p>
                                <p className="text-xs text-slate-500">1.2GB / 5GB</p>
                            </div>
                            <div className="text-amber-600 text-sm">⚠</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}