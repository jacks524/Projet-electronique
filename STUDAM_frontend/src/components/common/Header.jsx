"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '../../context/authContext';

const Header = () => {
  const { user, isAuthenticated, logout, loading } = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/profile';
    switch (user.role?.toUpperCase()) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return '/admin/dashboard';
      case 'DEPARTMENT_MANAGER':
        return '/chief/dashboard';
      case 'TEACHER':
        return '/teacher/dashboard';
      default:
        return '/profile';
    }
  };

  const canAccessAdmin = () => {
    return user && (user.role?.toUpperCase() === 'ADMIN' || user.role?.toUpperCase() === 'SUPER_ADMIN');
  };

  const canAccessChief = () => {
    return user && (user.role?.toUpperCase() === 'DEPARTMENT_MANAGER' || canAccessAdmin());
  };

  if (loading) {
    return <header className="bg-white shadow-lg sticky top-0 z-50 h-16"></header>;
  }

  return (
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#F26419] to-[#FF7A47] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-[#1B396A] to-[#437DE0] bg-clip-text text-transparent">
                STUDAM
              </span>
              </Link>
            </div>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center space-x-8">
              {!isAuthenticated ? (
                  <>
                    <Link href="/about" className="text-gray-700 hover:text-[#F26419] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      À propos
                    </Link>
                    <Link href="/features" className="text-gray-700 hover:text-[#F26419] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Fonctionnalités
                    </Link>
                    <Link href="/contact" className="text-gray-700 hover:text-[#F26419] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Contact
                    </Link>
                  </>
              ) : (
                  <>
                    <Link href={getDashboardPath()} className="text-gray-700 hover:text-[#F26419] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Tableau de bord
                    </Link>

                    {user.role?.toUpperCase() === 'TEACHER' && (
                        <>
                          <Link href="/teacher/courses" className="text-gray-700 hover:text-[#F26419] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                            Mes cours
                          </Link>
                          <Link href="/teacher/attendance" className="text-gray-700 hover:text-[#F26419] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                            Présences
                          </Link>
                        </>
                    )}

                    {user.role?.toUpperCase() === 'STUDENT' && (
                        <>
                          <Link href="/student/courses" className="text-gray-700 hover:text-[#F26419] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                            Mes cours
                          </Link>
                          <Link href="/student/attendance" className="text-gray-700 hover:text-[#F26419] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                            Mes présences
                          </Link>
                        </>
                    )}

                    {(canAccessAdmin() || canAccessChief()) && (
                        <div className="relative group">
                          <button className="text-gray-700 hover:text-[#F26419] px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                            Administration
                            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                          </button>
                          <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div className="py-1">
                              {canAccessAdmin() && (
                                  <>
                                    <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#F26419]">
                                      Administration générale
                                    </Link>
                                    <Link href="/admin/departments" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#F26419]">
                                      Départements
                                    </Link>
                                    <Link href="/admin/users" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#F26419]">
                                      Utilisateurs
                                    </Link>
                                    <Link href="/admin/system" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#F26419]">
                                      Système
                                    </Link>
                                  </>
                              )}
                              {canAccessChief() && (
                                  <>
                                    <Link href="/chief/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#F26419]">
                                      Chef de département
                                    </Link>
                                    <Link href="/chief/teachers" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#F26419]">
                                      Enseignants
                                    </Link>
                                    <Link href="/chief/timetables" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#F26419]">
                                      Emplois du temps
                                    </Link>
                                  </>
                              )}
                            </div>
                          </div>
                        </div>
                    )}

                    <Link href="/profile" className="text-gray-700 hover:text-[#F26419] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Profil
                    </Link>
                  </>
              )}
            </nav>

            {/* Boutons de connexion au menu utilisateur */}
            <div className="hidden lg:flex items-center space-x-4">
              {!isAuthenticated ? (
                  <>
                    <Link
                        href="/auth/login"
                        className="bg-[#F26419] text-white px-4 py-2 rounded-md font-medium hover:bg-[#E55A1A] transition-colors"
                    >
                      Connexion
                    </Link>
                  </>
              ) : (
                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-gray-700 hover:text-[#F26419] transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#F26419] to-[#FF7A47] rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                      </div>
                      <span className="font-medium">{user?.name || 'Utilisateur'}</span>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-1">
                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#F26419]">
                          Mon profil
                        </Link>
                        <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#F26419]">
                          Paramètres
                        </Link>
                        <button
                            onClick={logout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#F26419]"
                        >
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  </div>
              )}
            </div>

            {/* Menu Mobile */}
            <div className="lg:hidden">
              <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-700 hover:text-[#F26419] focus:outline-none focus:text-[#F26419]"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Menu Mobile Déroulant */}
          {isMenuOpen && (
              <div className="lg:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                  {!isAuthenticated ? (
                      <>
                        <Link
                            href="/about"
                            className="text-gray-700 hover:bg-gray-100 hover:text-[#F26419] block px-3 py-2 rounded-md text-base font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                          À propos
                        </Link>
                        <Link
                            href="/features"
                            className="text-gray-700 hover:bg-gray-100 hover:text-[#F26419] block px-3 py-2 rounded-md text-base font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                          Fonctionnalités
                        </Link>
                        <Link
                            href="/contact"
                            className="text-gray-700 hover:bg-gray-100 hover:text-[#F26419] block px-3 py-2 rounded-md text-base font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                          Contact
                        </Link>
                      </>
                  ) : (
                      <>
                        <Link
                            href={getDashboardPath()}
                            className="text-gray-700 hover:bg-gray-100 hover:text-[#F26419] block px-3 py-2 rounded-md text-base font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                          Tableau de bord
                        </Link>

                        {canAccessAdmin() && (
                            <>
                              <Link
                                  href="/admin/departments"
                                  className="text-gray-700 hover:bg-gray-100 hover:text-[#F26419] block px-3 py-2 rounded-md text-base font-medium"
                                  onClick={() => setIsMenuOpen(false)}
                              >
                                Départements
                              </Link>
                              <Link
                                  href="/admin/users"
                                  className="text-gray-700 hover:bg-gray-100 hover:text-[#F26419] block px-3 py-2 rounded-md text-base font-medium"
                                  onClick={() => setIsMenuOpen(false)}
                              >
                                Utilisateurs
                              </Link>
                            </>
                        )}

                        {canAccessChief() && (
                            <>
                              <Link
                                  href="/chief/teachers"
                                  className="text-gray-700 hover:bg-gray-100 hover:text-[#F26419] block px-3 py-2 rounded-md text-base font-medium"
                                  onClick={() => setIsMenuOpen(false)}
                              >
                                Enseignants
                              </Link>
                              <Link
                                  href="/chief/timetables"
                                  className="text-gray-700 hover:bg-gray-100 hover:text-[#F26419] block px-3 py-2 rounded-md text-base font-medium"
                                  onClick={() => setIsMenuOpen(false)}
                              >
                                Emplois du temps
                              </Link>
                            </>
                        )}

                        <Link
                            href="/profile"
                            className="text-gray-700 hover:bg-gray-100 hover:text-[#F26419] block px-3 py-2 rounded-md text-base font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                          Profil
                        </Link>
                      </>
                  )}
                </div>

                {/* Section utilisateur mobile */}
                <div className="pt-4 pb-3 border-t border-gray-200">
                  {!isAuthenticated ? (
                      <div className="flex items-center px-5 space-x-3">
                        <Link
                            href="/auth/login"
                            className="bg-[#F26419] text-white px-4 py-2 rounded-md font-medium hover:bg-[#E55A1A] transition-colors"
                        >
                          Connexion
                        </Link>
                      </div>
                  ) : (
                      <div className="flex items-center px-5">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#F26419] to-[#FF7A47] rounded-full flex items-center justify-center text-white font-medium">
                            {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-base font-medium text-gray-800">{user?.name || 'Utilisateur'}</div>
                          <div className="text-sm text-gray-500">{user?.email || 'Email non renseigné'}</div>
                        </div>
                        <button
                            onClick={logout}
                            className="ml-auto text-gray-400 hover:text-[#F26419] p-2"
                        >
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                          </svg>
                        </button>
                      </div>
                  )}
                </div>
              </div>
          )}
        </div>
      </header>
  );
};

export default Header;