"use client";

import Link from 'next/link';

const BiometricLogo = ({ className = "w-10 h-10" }) => (
  <svg className={className} viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="35" cy="35" r="30" stroke="url(#gradient-logo-footer)" strokeWidth="3" opacity="0.9"/>
    <path d="M35 15 Q45 25, 45 35 Q45 45, 35 55" stroke="url(#gradient-logo-footer)" strokeWidth="2.5" opacity="0.8" fill="none"/>
    <path d="M35 20 Q40 27, 40 35 Q40 43, 35 50" stroke="url(#gradient-logo-footer)" strokeWidth="2" opacity="0.7" fill="none"/>
    <path d="M35 25 Q37 30, 37 35 Q37 40, 35 45" stroke="url(#gradient-logo-footer)" strokeWidth="2" opacity="0.6" fill="none"/>
    <defs>
      <linearGradient id="gradient-logo-footer" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#8b5cf6' }} />
        <stop offset="100%" style={{ stopColor: '#6366f1' }} />
      </linearGradient>
    </defs>
  </svg>
);

export default function ModernFooter() {
  const currentYear = new Date().getFullYear();

  return (
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            
            {/* Colonne Brand */}
            <div className="col-span-1 md:col-span-1">
              <Link href="/" className="flex items-center space-x-3 group mb-6">
                <BiometricLogo className="w-10 h-10" />
                <span className="text-2xl font-bold text-white">
                  STUDAM<span className="text-violet-600">.</span>
                </span>
              </Link>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                La solution biométrique n°1 pour sécuriser et simplifier la gestion des présences des élèves en milieu académique.
              </p>
              <div className="flex gap-4">
                {/* Social Icons (simplifiés) */}
                   {['Twitter', 'LinkedIn', 'Instagram'].map((net) => (
  <a 
    key={net} 
    href="#" 
    className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-violet-600 hover:text-white transition-colors"
  >
    <span className="sr-only">{net}</span>
    {net === 'Twitter' && (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    )}
    {net === 'LinkedIn' && (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    )}
    {net === 'Instagram' && (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )}
  </a>
))}
              </div>
            </div>

            {/* Colonne Produit */}
            <div>
              <h3 className="text-white font-semibold mb-4">Plateforme</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/features" className="hover:text-violet-400 transition-colors">Fonctionnalités</Link></li>
                <li><Link href="/pricing" className="hover:text-violet-400 transition-colors">Tarifs</Link></li>
                <li><Link href="/demo" className="hover:text-violet-400 transition-colors">Demander une démo</Link></li>
              </ul>
            </div>

            {/* Colonne Légal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Légal & Sécurité</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/privacy" className="hover:text-violet-400 transition-colors">Politique de confidentialité</Link></li>
                <li><Link href="/rgpd" className="hover:text-violet-400 transition-colors">Conformité RGPD</Link></li>
                <li><Link href="/terms" className="hover:text-violet-400 transition-colors">Conditions d'utilisation</Link></li>
              </ul>
            </div>
            
            {/* Colonne Contact */}
            <div>
               <h3 className="text-white font-semibold mb-4">Contact</h3>
               <ul className="space-y-3 text-sm text-slate-400">
                 <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Support 24/7
                 </li>
                 <li>contact@studam.edu</li>
                 <li>+237 6XX XX XX XX</li>
                 <li>Yaoundé, Cameroun</li>
               </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
            <p>© {currentYear} STUDAM Inc. Tous droits réservés.</p>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
               <span>Tous les systèmes opérationnels</span>
            </div>
          </div>
        </div>
      </footer>
  );
}
