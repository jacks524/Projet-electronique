"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../context/authContext';
import { getRoleLabel } from '../../lib/roles';

const ICONS = {
    dashboard: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>,
    courses: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>,
    timetable: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>,
    reports: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>,
    profile: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>,
    attendance: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
};

export default function TeacherLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, loading: authLoading, logout } = useAuthContext();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (authLoading) return;

        const isAllowed = isAuthenticated &&
            user &&
            Array.isArray(user.roles) &&
            user.roles.some(userRole => ['TEACHER', 'DEPARTMENT_MANAGER', 'ADMIN'].includes(userRole));

        if (!isAllowed) {
            router.push('/auth/login');
        }
    }, [user, isAuthenticated, authLoading, router]);

    const sidebarItems = [
        { name: 'Dashboard', href: '/teacher/dashboard', icon: ICONS.dashboard },
        { name: 'Mes Cours', href: '/teacher/courses', icon: ICONS.courses },
        { name: 'Emploi du temps', href: '/teacher/timetable', icon: ICONS.timetable },
        { name: 'Présences', href: '/teacher/attendance', icon: ICONS.attendance },
        { name: 'Rapports', href: '/teacher/reports', icon: ICONS.reports },
        { name: 'Mon Profil', href: '/profile', icon: ICONS.profile },
    ];

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement de votre espace enseignant...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Overlay pour mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Desktop + Mobile */}
            <aside className={`
                ${isSidebarOpen ? 'w-64' : 'w-20'} 
                bg-white shadow-lg transition-all duration-300 flex-col
                hidden lg:flex
                fixed lg:relative inset-y-0 left-0 z-50
            `}>
                <div className="p-4 border-b">
                    <Link href="/teacher/dashboard" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#F26419] to-[#FF7A47] rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        {isSidebarOpen && <span className="text-xl font-bold text-[#1B396A]">STUDAM</span>}
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-6">
                    <div className="space-y-2">
                        {sidebarItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            return (
                                <Link key={item.name} href={item.href}
                                      className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                                          isActive
                                              ? 'bg-orange-100 text-orange-700 border-l-4 border-orange-500'
                                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                      }`}
                                >
                                    <div className={`${isActive ? 'text-orange-600' : 'text-gray-400'}`}>
                                        {item.icon}
                                    </div>
                                    {isSidebarOpen && <span className="ml-3 font-medium">{item.name}</span>}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <Link href="/"
                              className="flex items-center p-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h12"></path>
                            </svg>
                            {isSidebarOpen && <span className="ml-3 font-medium">Retour</span>}
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Sidebar Mobile (menu coulissant) */}
            <aside className={`
                w-64 bg-white shadow-lg transition-transform duration-300 flex-col
                lg:hidden
                fixed inset-y-0 left-0 z-50
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-4 border-b flex justify-between items-center">
                    <Link href="/teacher/dashboard" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#F26419] to-[#FF7A47] rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <span className="text-xl font-bold text-[#1B396A]">STUDAM</span>
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 overflow-y-auto">
                    <div className="space-y-2">
                        {sidebarItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                                        isActive
                                            ? 'bg-orange-100 text-orange-700 border-l-4 border-orange-500'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    <div className={`${isActive ? 'text-orange-600' : 'text-gray-400'}`}>
                                        {item.icon}
                                    </div>
                                    <span className="ml-3 font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <Link
                            href="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center p-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h12"></path>
                            </svg>
                            <span className="ml-3 font-medium">Retour</span>
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Contenu Principal */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white shadow-sm border-b h-16 flex justify-between items-center px-6 shrink-0">
                    <div className="flex items-center">
                        <button
                            onClick={() => {
                                if (window.innerWidth < 1024) {
                                    setIsMobileMenuOpen(!isMobileMenuOpen);
                                } else {
                                    setIsSidebarOpen(!isSidebarOpen);
                                }
                            }}
                            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 mr-4 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                        <div className="text-sm text-gray-500 hidden md:block">
                            Espace Enseignant
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500 capitalize">
                                {getRoleLabel(user.role)}
                            </div>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-[#F26419] to-[#FF7A47] rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                            </svg>
                            <span className="hidden sm:inline">Déconnexion</span>
                        </button>
                    </div>
                </header>

                <main className="flex-grow p-6 overflow-y-auto bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}