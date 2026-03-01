"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '../../context/authContext';

// Composant Logo Biométrique
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

const Header = () => {
  const { user, isAuthenticated, logout, loading } = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Effet pour détecter le scroll et ajouter une ombre
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardPath = () => {
    if (!user) return '/profile';
    switch (user.role?.toUpperCase()) {
      case 'ADMIN': return '/admin/dashboard';
      case 'SUPER_ADMIN': return '/admin/dashboard';
      case 'DEPARTMENT_MANAGER': return '/chief/dashboard';
      case 'TEACHER': return '/teacher/dashboard';
      default: return '/profile';
    }
  };

  const navLinkClass = "text-slate-600 hover:text-violet-600 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-violet-50";

  if (loading) return <header className="h-16"></header>;

  return (
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 bg-white border-b border-slate-200 ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center">
             <Link href="/" className="flex items-center space-x-3 group">
  <BiometricLogo className="w-10 h-10" />
  <span className="text-2xl font-bold text-slate-800">
    STUDAM<span className="text-violet-600">.</span>
  </span>
</Link>
            </div>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center space-x-2">
              {!isAuthenticated ? (
                  <>
                    <Link href="/features" className={navLinkClass}>Fonctionnalités</Link>
                    <Link href="/about" className={navLinkClass}>À propos</Link>
                    <Link href="/contact" className={navLinkClass}>Contact</Link>
                  </>
              ) : (
                  <>
                    <Link href={getDashboardPath()} className={navLinkClass}>Tableau de bord</Link>
                    {/* Liens spécifiques simplifiés pour l'exemple */}
                    <Link href="/profile" className={navLinkClass}>Mon Espace</Link>
                  </>
              )}
            </nav>

            {/* Boutons d'action */}
            <div className="hidden lg:flex items-center space-x-4">
              {!isAuthenticated ? (
                  <>
                    <Link href="/auth/login" className="text-slate-600 hover:text-violet-600 font-medium text-sm px-4">
                      Se connecter
                    </Link>
                  </>
              ) : (
                  <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <span className="text-sm font-medium text-slate-700">{user?.name}</span>
                    <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                    </button>
                  </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
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
        </div>

        {/* Mobile Menu (Simplifié pour la lisibilité) */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl p-4 flex flex-col gap-2">
            {!isAuthenticated ? (
              <>
                <Link href="/features" className="block p-3 rounded-lg hover:bg-violet-50 text-slate-700 font-medium">Fonctionnalités</Link>
                <Link href="/auth/login" className="block p-3 rounded-lg text-center border border-slate-200 mt-2">Connexion</Link>
              </>
            ) : (
               <Link href={getDashboardPath()} className="block p-3 rounded-lg bg-violet-50 text-violet-700 font-medium">Accéder au Dashboard</Link>
            )}
          </div>
        )}
      </header>
  );
};

export default Header;
