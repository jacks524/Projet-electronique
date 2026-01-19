"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "../../context/authContext";
import reportService from "../../services/reportService";

import {
  LayoutDashboard,
  Users,
  Building2,
  FileBarChart2,
  Settings,
} from "lucide-react";

// Logo Biométrique
const BiometricLogo = ({ className = "w-10 h-10" }) => (
  <svg
    className={className}
    viewBox="0 0 70 70"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="35"
      cy="35"
      r="30"
      stroke="url(#gradient-logo)"
      strokeWidth="3"
      opacity="0.9"
    />
    <path
      d="M35 15 Q45 25, 45 35 Q45 45, 35 55"
      stroke="url(#gradient-logo)"
      strokeWidth="2.5"
      opacity="0.8"
      fill="none"
    />
    <path
      d="M35 20 Q40 27, 40 35 Q40 43, 35 50"
      stroke="url(#gradient-logo)"
      strokeWidth="2"
      opacity="0.7"
      fill="none"
    />
    <path
      d="M35 25 Q37 30, 37 35 Q37 40, 35 45"
      stroke="url(#gradient-logo)"
      strokeWidth="2"
      opacity="0.6"
      fill="none"
    />
    <defs>
      <linearGradient id="gradient-logo" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#8b5cf6" }} />
        <stop offset="100%" style={{ stopColor: "#6366f1" }} />
      </linearGradient>
    </defs>
  </svg>
);

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading: authLoading, logout } =
    useAuthContext();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  // Menu items pour l'admin
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Users, label: "Utilisateurs", href: "/admin/users" },
    { icon: Building2, label: "Départements", href: "/admin/departments" },
    { icon: FileBarChart2, label: "Rapports", href: "/admin/reports" },
    { icon: Settings, label: "Paramètres", href: "/admin/system" },
  ];

  useEffect(() => {
    if (authLoading) return;

    const role = user?.role?.toUpperCase();
    const allowed = role === "ADMIN" || role === "SUPER_ADMIN";

    if (!isAuthenticated || !allowed) {
      router.push("/auth/login");
      return;
    }

    const loadRecentActivity = async () => {
      try {
        const data = await reportService.getRecentActivity(5);
        setRecentActivity(Array.isArray(data) ? data : []);
      } catch (error) {
        setRecentActivity([]);
      }
    };

    loadRecentActivity();

    // Simuler l'activité récente
    setRecentActivity([
      {
        id: 1,
        type: "user_created",
        description: "Nouvel enseignant créé",
        timestamp: "2025-01-03 14:30",
        icon: "👤",
      },
      {
        id: 2,
        type: "department_updated",
        description: "Département Informatique mis à jour",
        timestamp: "2025-01-03 12:15",
        icon: "🏢",
      },
      {
        id: 3,
        type: "system_backup",
        description: "Sauvegarde automatique",
        timestamp: "2025-01-03 08:00",
        icon: "💾",
      },
    ]);
  }, [user, isAuthenticated, authLoading, router]);

  const getActivityIcon = (activity) => {
    const type = (activity?.icon || activity?.type || "").toString().toLowerCase();

    if (type.includes("attendance")) {
      return (
        <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      );
    }

    if (type.includes("user")) {
      return (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    }

    if (type.includes("department") || type.includes("departement")) {
      return (
        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M4 21V4a1 1 0 011-1h14a1 1 0 011 1v17" />
        </svg>
      );
    }

    return (
      <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5h10M11 9h7M11 13h10M11 17h7M6 7h.01M6 11h.01M6 15h.01M6 19h.01" />
      </svg>
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto" />
          <p className="mt-4 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 z-30 transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <Link href="/" className="flex items-center space-x-3 group">
            <BiometricLogo className="w-10 h-10" />
            {isSidebarOpen && (
              <span className="text-2xl font-bold text-white tracking-tight">
                STUDAM<span className="text-violet-400">.</span>
              </span>
            )}
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-600/30"
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  {/* ✅ FIX: on rend le composant Icon, pas item.icon */}
                  <Icon className="h-5 w-5 shrink-0" />
                  {isSidebarOpen && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
          <div className="bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-xl p-4 border border-violet-500/30">
            {isSidebarOpen ? (
              <>
                <p className="text-xs text-violet-300 font-medium mb-1">
                  Version 2.0.0
                </p>
                <p className="text-xs text-slate-400">STUDAM © 2026</p>
              </>
            ) : (
              <p className="text-xs text-violet-300 text-center">V2.0</p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-slate-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    {getGreeting()}, {user?.name?.split(" ")[0]} 👋
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Voici un aperçu de votre système
                  </p>
                </div>
              </div>

              {/* Right Section - Notifications & Profile */}
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors relative"
                  >
                    <svg
                      className="w-6 h-6 text-slate-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-800">
                          Notifications
                        </h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {recentActivity.slice(0, 3).map((activity) => (
                          <div
                            key={activity.id}
                            className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">{getActivityIcon(activity)}</div>
                              <div className="flex-1">
                                <p className="text-sm text-slate-700">
                                  {activity.description}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {activity.timestamp}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-2 border-t border-slate-100">
                        <Link
                          href="/admin/notifications"
                          className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                        >
                          Voir toutes →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-3 pl-4 border-l border-slate-200 hover:bg-slate-50 rounded-r-xl pr-3 py-1 transition-colors"
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.name || "User"
                      )}&background=8b5cf6&color=fff`}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full ring-2 ring-violet-100"
                    />
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-slate-700">
                        {user?.name}
                      </p>
                      <p className="text-xs text-slate-500">Administrateur</p>
                    </div>
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        showProfileMenu ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-semibold text-slate-800">
                          {user?.name}
                        </p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <svg
                          className="w-5 h-5 text-slate-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span className="text-sm text-slate-700">Mon profil</span>
                      </Link>

                      <Link
                        href="/admin/system"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <svg
                          className="w-5 h-5 text-slate-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-sm text-slate-700">Paramètres</span>
                      </Link>

                      <div className="border-t border-slate-100 my-2" />

                      <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <svg
                          className="w-5 h-5 text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span className="text-sm text-red-600 font-medium">
                          Déconnexion
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">{children}</main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 px-6">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div>© 2026 STUDAM. Tous droits réservés.</div>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-violet-600">
                Politique de confidentialité
              </Link>
              <Link href="/terms" className="hover:text-violet-600">
                Conditions d'utilisation
              </Link>
              <Link href="/help" className="hover:text-violet-600">
                Aide
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
