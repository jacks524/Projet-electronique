"use client";

import Link from 'next/link';

export default function ModernFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Fonctionnalités', href: '/features' },
      { name: 'Tableaux de bord', href: '/dashboard' },
      { name: 'Rapports', href: '/pending' },
      { name: 'Gestion des utilisateurs', href: '/admin' },
      { name: 'API Documentation', href: '/api-docs' }
    ],
    company: [
      { name: 'À propos', href: '#about' },
      { name: 'Notre équipe', href: '/team' },
      { name: 'Carrières', href: '/careers' },
      { name: 'Actualités', href: '/news' },
      { name: 'Partenaires', href: '/partners' }
    ],
    support: [
      { name: 'Centre d\'aide', href: '/help' },
      { name: 'Guides d\'utilisation', href: '/guides' },
      { name: 'Formation', href: '/training' },
      { name: 'Status', href: '/status' },
      { name: 'Contact', href: '#contact' }
    ],
    legal: [
      { name: 'Politique de confidentialité', href: '/privacy' },
      { name: 'Conditions d\'utilisation', href: '/terms' },
      { name: 'Mentions légales', href: '/legal' },
      { name: 'RGPD', href: '/gdpr' },
      { name: 'Cookies', href: '/cookies' }
    ]
  };

  const socialLinks = [
    {
      name: 'Facebook',
      href: '#',
      icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
          </svg>
      )
    },
    {
      name: 'Twitter',
      href: '#',
      icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
          </svg>
      )
    },
    {
      name: 'LinkedIn',
      href: '#',
      icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
          </svg>
      )
    },
    {
      name: 'YouTube',
      href: '#',
      icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
          </svg>
      )
    },
    {
      name: 'GitHub',
      href: '#',
      icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
      )
    }
  ];

  return (
      <footer className="bg-gradient-to-br from-[#1B396A] to-[#0F2847] text-white">
        {/* Section principale du footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Branding et description */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-10 w-10 bg-gradient-to-br from-[#F26419] to-[#FF7A47] rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                STUDAM
              </span>
              </div>

              <p className="text-blue-100 mb-6 leading-relaxed">
                La plateforme de référence pour la gestion moderne des présences dans les établissements d'enseignement. Sécurisé, intelligent et facile à utiliser.
              </p>

              {/* Contact info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 text-[#F26419]">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-blue-100 text-sm">Avenue de l&apos; Université, Dakar, Sénégal</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 text-[#F26419]">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-blue-100 text-sm">contact@studam.edu</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 text-[#F26419]">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <span className="text-blue-100 text-sm">+221 33 825 75 28</span>
                </div>
              </div>

              {/* Social links */}
              <div className="flex space-x-4">
                {socialLinks.map((item) => (
                    <a
                        key={item.name}
                        href={item.href}
                        className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-blue-100 hover:bg-[#F26419] hover:text-white transition-all duration-300 transform hover:scale-110"
                        aria-label={item.name}
                    >
                      {item.icon}
                    </a>
                ))}
              </div>
            </div>

            {/* Produit */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Produit</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                    <li key={link.name}>
                      <Link
                          href={link.href}
                          className="text-blue-100 hover:text-[#F26419] transition-colors text-sm hover:translate-x-1 transform duration-200 inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                ))}
              </ul>
            </div>

            {/* Entreprise */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Entreprise</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                    <li key={link.name}>
                      <Link
                          href={link.href}
                          className="text-blue-100 hover:text-[#F26419] transition-colors text-sm hover:translate-x-1 transform duration-200 inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                    <li key={link.name}>
                      <Link
                          href={link.href}
                          className="text-blue-100 hover:text-[#F26419] transition-colors text-sm hover:translate-x-1 transform duration-200 inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                ))}
              </ul>
            </div>

            {/* Légal */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Légal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                    <li key={link.name}>
                      <Link
                          href={link.href}
                          className="text-blue-100 hover:text-[#F26419] transition-colors text-sm hover:translate-x-1 transform duration-200 inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter section */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="md:flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Restez informé</h3>
                <p className="text-blue-100 text-sm mb-4 md:mb-0">
                  Recevez les dernières actualités et mises à jour de STUDAM directement dans votre boîte mail.
                </p>
              </div>
              <div className="md:ml-8">
                <form className="flex flex-col sm:flex-row gap-3">
                  <input
                      type="email"
                      placeholder="Votre adresse email"
                      className="px-4 py-2 rounded-lg bg-white/10 text-white placeholder-blue-200 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:border-transparent min-w-64"
                  />
                  <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-[#F26419] to-[#FF7A47] text-white rounded-lg font-medium hover:from-[#E55A1A] hover:to-[#F26419] transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
                  >
                    S'abonner
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex items-center space-x-6">
                <p className="text-blue-200 text-sm">
                  © {currentYear} STUDAM. Tous droits réservés.
                </p>
                <div className="hidden md:flex items-center space-x-4">
                  <span className="text-blue-200 text-sm">Développé avec ❤️ par</span>
                  <span className="text-[#F26419] font-semibold text-sm">Bioclass Innovators</span>
                </div>
              </div>

              {/* Certifications et sécurité */}
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-blue-200 text-xs">
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  <span>SSL Sécurisé</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-200 text-xs">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>RGPD Conforme</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
  );
}