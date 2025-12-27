"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../context/authContext';
import { getRoleLabel } from '../../lib/roles';


const ICONS = {
    dashboard: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>,
    departments: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>,
    users: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m0 0v1M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>,
    system: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>,
    reports: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>,
};

export default function AdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, loading: authLoading, logout } = useAuthContext();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || user?.role?.toUpperCase() !== 'ADMIN') {
            router.push('/auth/login');
        }
    }, [user, isAuthenticated, authLoading, router]);

    const sidebarItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: ICONS.dashboard },
        { name: 'Départements', href: '/admin/departments', icon: ICONS.departments },
        { name: 'Utilisateurs', href: '/admin/users', icon: ICONS.users },
        { name: 'Système', href: '/admin/system', icon: ICONS.system },
        { name: 'Rapports', href: '/admin/reports', icon: ICONS.reports },
    ];

    if (authLoading || !user) {
        return <div className="min-h-screen flex items-center justify-center"><p>Chargement...</p></div>;
    }

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
            <aside className={`
                ${isSidebarOpen ? 'w-64' : 'w-20'} 
                bg-white shadow-lg transition-all duration-300 flex-col
                hidden lg:flex
                    fixed lg:relative inset-y-0 left-0 z-50
            `}>
                <div className="p-4 border-b">
                    <Link href="/admin/dashboard" className="flex items-center space-x-2">
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
            <div className="flex-1 flex flex-col">
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
                <main className="flex-grow p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}