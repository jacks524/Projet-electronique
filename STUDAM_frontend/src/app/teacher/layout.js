"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../context/authContext';
import { getRoleLabel } from '../../lib/roles';

const BiometricLogo = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="35" cy="35" r="30" stroke="url(#gradient-logo)" strokeWidth="3" opacity="0.9"/>
    <path d="M35 15 Q45 25, 45 35 Q45 45, 35 55" stroke="url(#gradient-logo)" strokeWidth="2.5" opacity="0.8" fill="none"/>
    <path d="M35 20 Q40 27, 40 35 Q40 43, 35 50" stroke="url(#gradient-logo)" strokeWidth="2" opacity="0.7" fill="none"/>
    <path d="M35 25 Q37 30, 37 35 Q37 40, 35 45" stroke="url(#gradient-logo)" strokeWidth="2" opacity="0.6" fill="none"/>
    <defs>
      <linearGradient id="gradient-logo" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor: '#8b5cf6'}}/>
        <stop offset="100%" style={{stopColor: '#6366f1'}}/>
      </linearGradient>
    </defs>
  </svg>
);

const Icon = ({ type, className = "w-5 h-5" }) => {
  switch (type) {
    case 'dashboard':
      return (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>);
    case 'courses':
      return (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>);
    case 'timetable':
      return (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>);
    case 'attendance':
      return (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>);
    case 'reports':
      return (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>);
    case 'profile':
      return (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>);
    default:
      return (<span className="text-xl">*</span>);
  }
};

export default function TeacherLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuthContext();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  const menuItems = [
    { icon: 'dashboard', label: 'Dashboard', href: '/teacher/dashboard' },
    { icon: 'courses', label: 'Mes cours', href: '/teacher/courses' },
    { icon: 'timetable', label: 'Emploi du temps', href: '/teacher/timetable' },
    { icon: 'attendance', label: 'Presences', href: '/teacher/attendance' },
    { icon: 'reports', label: 'Rapports', href: '/teacher/reports' },
    { icon: 'profile', label: 'Mon profil', href: '/profile' },
  ];

  useEffect(() => {
    if (authLoading) return;

    const isAllowed = isAuthenticated &&
      user &&
      Array.isArray(user.roles) &&
      user.roles.some(userRole => ['TEACHER', 'DEPARTMENT_MANAGER', 'ADMIN'].includes(userRole));

    if (!isAllowed) {
      router.push('/auth/login');
    }

    setRecentActivity([
      { id: 1, description: 'Nouvelle session de presence enregistree', timestamp: 'Il y a 2 heures', icon: 'attendance' },
      { id: 2, description: 'Mise a jour de votre emploi du temps', timestamp: 'Hier', icon: 'timetable' },
      { id: 3, description: 'Rapport hebdo genere', timestamp: 'Il y a 3 jours', icon: 'reports' },
    ]);
  }, [user, isAuthenticated, authLoading, router]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon apres-midi';
    return 'Bonsoir';
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <aside className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 z-30 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
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

        <nav className="p-4 space-y-2">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link key={index} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}>
                  <Icon type={item.icon} className="w-5 h-5" />
                  {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
          <div className="bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-xl p-4 border border-violet-500/30">
            {isSidebarOpen ? (
              <>
                <p className="text-xs text-violet-300 font-medium mb-1">Espace enseignant</p>
                <p className="text-xs text-slate-400">STUDAM (C) 2025</p>
              </>
            ) : (
              <p className="text-xs text-violet-300 text-center">ENS</p>
            )}
          </div>
        </div>
      </aside>

      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">{getGreeting()}, {user?.name?.split(' ')[0]}</h1>
                  <p className="text-sm text-slate-500 mt-1">Votre espace enseignant</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors relative"
                  >
                    <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                    </svg>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-800">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="text-slate-500"><Icon type={activity.icon} className="w-4 h-4" /></div>
                              <div className="flex-1">
                                <p className="text-sm text-slate-700">{activity.description}</p>
                                <p className="text-xs text-slate-500 mt-1">{activity.timestamp}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-2 border-t border-slate-100">
                        <Link href="/teacher/reports" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                          Voir toutes
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-3 pl-4 border-l border-slate-200 hover:bg-slate-50 rounded-r-xl pr-3 py-1 transition-colors"
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=8b5cf6&color=fff`}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full ring-2 ring-violet-100"
                    />
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-slate-700">{user?.name}</p>
                      <p className="text-xs text-slate-500">{getRoleLabel(user?.role)}</p>
                    </div>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-semibold text-slate-800">{user?.name}</p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                      </div>
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                        <Icon type="profile" className="w-5 h-5 text-slate-500" />
                        <span className="text-sm text-slate-700">Mon profil</span>
                      </Link>
                      <div className="border-t border-slate-100 my-2"></div>
                      <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        <span className="text-sm text-red-600 font-medium">Deconnexion</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>

        <footer className="bg-white border-t border-slate-200 py-4 px-6">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div>
              (C) 2025 STUDAM. Tous droits reserves.
            </div>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-violet-600">Politique de confidentialite</Link>
              <Link href="/terms" className="hover:text-violet-600">Conditions d'utilisation</Link>
              <Link href="/help" className="hover:text-violet-600">Aide</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

