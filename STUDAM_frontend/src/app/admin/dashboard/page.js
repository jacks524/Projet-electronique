"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "../../../context/authContext";
import reportService from "../../../services/reportService";
import userService from "../../../services/userService";
import departmentService from "../../../services/departmentService";
import studentService from "../../../services/studentService";
import toast from "react-hot-toast";

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
      router.push("/auth/login");
      return;
    }

    if (user?.role?.toUpperCase() !== "ADMIN" && user?.role?.toUpperCase() !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }

    loadDashboardData();
  }, [user, isAuthenticated, authLoading, router]);

  const getRoleCount = (users, role) => {
    return users.filter((u) =>
      Array.isArray(u.roles) && u.roles.some((r) => r.role?.toUpperCase() === role)
    ).length;
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const dashboardStats = await reportService.getDashboardStats();
      let nextStats = { ...dashboardStats };

      if (
        dashboardStats.totalUsers === 0 ||
        dashboardStats.totalDepartments === 0 ||
        dashboardStats.totalTeachers === 0 ||
        dashboardStats.totalStudents === 0
      ) {
        const [usersPage, departments, students] = await Promise.all([
          userService.getAllWithPagination(0, 2000),
          departmentService.getAll(),
          studentService.getAll(),
        ]);

        const users = Array.isArray(usersPage?.content) ? usersPage.content : [];
        const departmentsList = Array.isArray(departments) ? departments : [];
        const studentsList = Array.isArray(students) ? students : [];

        const computedUsers = users.length;
        const computedTeachers = getRoleCount(users, "TEACHER");
        const computedStudents = studentsList.length || getRoleCount(users, "STUDENT");
        const computedDepartments = departmentsList.length;

        nextStats = {
          totalUsers: dashboardStats.totalUsers || computedUsers,
          totalTeachers: dashboardStats.totalTeachers || computedTeachers,
          totalStudents: dashboardStats.totalStudents || computedStudents,
          totalDepartments: dashboardStats.totalDepartments || computedDepartments,
        };
      }

      setStats(nextStats);
      const recent = await reportService.getRecentActivity();
      setRecentActivity(Array.isArray(recent) ? recent : []);
    } catch (error) {
      toast.error(error.message || "Impossible de charger les statistiques.");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, href, trend }) => (
    <Link href={href} className="group">
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
    </Link>
  );

  const QuickActionCard = ({ title, description, icon, color, href }) => (
    <Link href={href}>
      <div className={`bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 border-l-4 ${color} group cursor-pointer`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color.replace("border-", "from-").replace("-500", "-100")} ${color.replace("border-", "to-").replace("-500", "-200")}`}>
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
    const type = (activity?.type || activity?.action || activity?.category || activity?.description || "").toString().toLowerCase();

    if (type.includes("attendance") || type.includes("presence") || type.includes("session")) {
      return { bg: "bg-violet-100 text-violet-600", icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      ) };
    }

    if (type.includes("departement") || type.includes("department")) {
      return { bg: "bg-amber-100 text-amber-600", icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M4 21V4a1 1 0 011-1h14a1 1 0 011 1v17M9 21V9h6v12" />
        </svg>
      ) };
    }

    if (type.includes("user") || type.includes("utilisateur")) {
      return { bg: "bg-blue-100 text-blue-600", icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ) };
    }

    if (type.includes("report") || type.includes("rapport")) {
      return { bg: "bg-emerald-100 text-emerald-600", icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6m4 6V7m4 10v-4M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ) };
    }

    return { bg: "bg-slate-100 text-slate-600", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5h10M11 9h7M11 13h10M11 17h7M6 7h.01M6 11h.01M6 15h.01M6 19h.01" />
      </svg>
    ) };
  };

  if (loading) {
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
          <p className="text-sm text-slate-500 mt-1">Apercu complet de votre systeme</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Exporter
            </span>
          </button>
          <button className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors">
            Generer rapport
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Etudiants"
          value={stats.totalStudents}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.083 12.083 0 0112 21a12.083 12.083 0 01-6.16-10.422L12 14z" />
            </svg>
          }
          color="from-violet-500 to-purple-600"
          href="/admin/users"
          trend={12}
        />
        <StatCard
          title="Enseignants"
          value={stats.totalTeachers}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          color="from-blue-500 to-indigo-600"
          href="/admin/users"
          trend={8}
        />
        <StatCard
          title="Departements"
          value={stats.totalDepartments}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M4 21V4a1 1 0 011-1h14a1 1 0 011 1v17" />
            </svg>
          }
          color="from-amber-500 to-violet-600"
          href="/admin/departments"
          trend={5}
        />
        <StatCard
          title="Total utilisateurs"
          value={stats.totalUsers}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          color="from-green-500 to-emerald-600"
          href="/admin/users"
          trend={15}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickActionCard
          title="Creer un utilisateur"
          description="Ajouter un admin, chef ou enseignant"
          icon={
            <svg className="w-5 h-5 text-violet-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          }
          color="border-violet-500"
          href="/admin/users/create"
        />
        <QuickActionCard
          title="Creer un departement"
          description="Structurer les equipes et les filieres"
          icon={
            <svg className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M4 21V4a1 1 0 011-1h14a1 1 0 011 1v17" />
            </svg>
          }
          color="border-amber-500"
          href="/admin/departments/create"
        />
        <QuickActionCard
          title="Rapports"
          description="Consulter les statistiques et exports"
          icon={
            <svg className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6m4 6V7m4 10v-4" />
            </svg>
          }
          color="border-emerald-500"
          href="/admin/reports"
        />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">Activite recente</h2>
          <Link href="/admin/system/logs" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
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
                    <p className="text-sm text-slate-800 font-medium">{activity.description || "Activite recente"}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.timestamp || ""}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">Apercu systeme</h2>
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
              <div className="text-green-600 text-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Base de donnees</p>
                <p className="text-xs text-slate-500">Latence: 12ms</p>
              </div>
              <div className="text-green-600 text-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Stockage</p>
                <p className="text-xs text-slate-500">1.2GB / 5GB</p>
              </div>
              <div className="text-amber-600 text-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
