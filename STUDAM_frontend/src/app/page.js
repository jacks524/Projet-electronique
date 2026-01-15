"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeScan, setActiveScan] = useState(0);

  // Simulation d'un scan en temps réel pour le visuel Hero
  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveScan((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "Biométrie Avancée",
      description: "Reconnaissance digitale  avec un taux de précision de 99.9%. Fini la fraude au pointage.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.131A8 8 0 008 8m0 0a8 8 0 00-8 8c0 2.472.345 4.865.99 7.131M10 11a2 2 0 114 0 2 2 0 01-4 0z" />
        </svg>
      ),
      color: "bg-violet-100 text-violet-600"
    },
    {
      title: "Monitoring Temps Réel",
      description: "Vue salle de contrôle : voyez les statistiques de présences des élèves  en temps réel.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "bg-fuchsia-100 text-fuchsia-600"
    },
    {
      title: "Rapports Automatisés",
      description: "Exportez les feuilles de présence en PDF/Excel pour l'administration en un clic.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "bg-emerald-100 text-emerald-600"
    }
  ];

  const stats = [
    { label: "Taux de présence", value: "98.5%", color: "text-emerald-500" },
    { label: "Étudiants gérés", value: "10k+", color: "text-violet-600" },
    { label: "Économie temps/jour", value: "45min", color: "text-fuchsia-500" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Mesh Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-violet-200/40 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-fuchsia-100/50 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Colonne Texte */}
            <div className={`lg:col-span-6 space-y-8 transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="inline-flex items-center space-x-2 bg-white border border-violet-100 rounded-full px-4 py-1.5 shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium text-slate-600">Système v2.0 disponible</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                La gestion de présence <br />
                <span className="text-gradient">intelligente & sécurisée</span>
              </h1>
              
              <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                Modernisez votre établissement avec STUDAM. Synchronisation biométrique, tableaux de bord en temps réel et alertes automatiques pour une scolarité sans faille.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register" className="inline-flex justify-center items-center px-8 py-4 rounded-xl bg-violet-600 text-white font-semibold shadow-lg shadow-violet-200 hover:bg-violet-700 hover:scale-105 transition-all duration-200">
                  Démarrer l'essai
                </Link>
                <Link href="#demo" className="inline-flex justify-center items-center px-8 py-4 rounded-xl bg-white text-slate-700 border border-slate-200 font-semibold hover:bg-slate-50 transition-all duration-200">
                  <svg className="w-5 h-5 mr-2 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Voir la démo
                </Link>
              </div>

              <div className="pt-8 border-t border-slate-200/60 flex items-center gap-8">
                {stats.map((stat, i) => (
                  <div key={i}>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Colonne Visuelle (Mockup interactif) */}
            <div className={`lg:col-span-6 relative transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative rounded-2xl bg-slate-900 p-4 shadow-2xl shadow-violet-500/20 border border-slate-800">
                {/* Header du faux navigateur */}
                <div className="flex items-center gap-2 mb-4 px-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                  <div className="ml-4 h-6 w-64 bg-slate-800 rounded-md flex items-center px-3 text-[10px] text-slate-500 font-mono">
                    studam.app/admin/live-feed
                  </div>
                </div>

                {/* Contenu du Dashboard simulé */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      Flux d'entrées (Hall Principal)
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">14:02:45 PM</span>
                  </div>

                  {/* Liste des scans simulés */}
                  <div className="space-y-3">
                    {[
                      { name: "Sophie Owona", role: "Terminale S2", status: "success", time: "À l'instant" },
                      { name: "Marc Kenfack", role: "1ère L", status: "pending", time: "Scan en cours..." },
                      { name: "Jean Atangana", role: "Prof. Math", status: "success", time: "Il y a 2 min" },
                    ].map((user, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${idx === activeScan ? 'bg-violet-500/10 border-violet-500/50' : 'bg-slate-900 border-slate-700/50'} transition-all duration-300`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${idx === activeScan ? 'bg-violet-600 text-white ring-2 ring-violet-500 ring-offset-2 ring-offset-slate-900' : 'bg-slate-700 text-slate-300'}`}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-200">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.role}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          {user.status === 'success' ? (
                            <span className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-400/10 px-2 py-1 rounded">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              Validé
                            </span>
                          ) : (
                             <span className="text-xs text-amber-400 flex items-center gap-1 bg-amber-400/10 px-2 py-1 rounded">
                              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                              Analyse
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Graphe décoratif */}
                  <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-end gap-1 h-16 opacity-50">
                     {[30, 45, 25, 60, 75, 50, 80, 40, 90, 65].map((h, i) => (
                       <div key={i} className="flex-1 bg-violet-500 rounded-t-sm" style={{height: `${h}%`}}></div>
                     ))}
                  </div>
                </div>
              </div>
              
              {/* Carte flottante décorative */}
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 z-20 hidden md:block animate-bounce" style={{animationDuration: '3s'}}>
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Système Actif</p>
                    <p className="text-xs text-slate-500">Tous les terminaux connectés</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-violet-600 font-semibold tracking-wide uppercase text-sm mb-3">Fonctionnalités Clés</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Tout pour gérer votre campus</h3>
            <p className="text-slate-600 text-lg">Une suite complète d'outils administratifs conçue pour simplifier la vie scolaire, de la grille d'entrée au conseil de classe.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-8 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-violet-100 hover:shadow-xl hover:shadow-violet-100/50 transition-all duration-300">
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION SÉCURITÉ & HARDWARE --- */}
<section className="py-24 bg-slate-900 text-white relative overflow-hidden">
  {/* Décoration de fond */}
  <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-violet-900/20 to-transparent"></div>
  
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="grid md:grid-cols-2 gap-16 items-center">
      
      {/* Texte Explicatif */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          Données Chiffrées AES-256
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Vos données biométriques ne sortent jamais de l'école.</h2>
        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
          La confidentialité est notre priorité. STUDAM n'enregistre pas les images de vos empreintes, mais uniquement une clé mathématique cryptée impossible à reproduire.
        </p>
        
        <ul className="space-y-4">
          {[
            "Conforme RGPD & Protection des données locales",
            "Hébergement sécurisé ou déploiement local",
            "Terminaux biométriques avec batterie de secours (4h)",
            "Fonctionne même sans connexion internet (Mode Offline)"
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-slate-300">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Visuel Hardware */}
      <div className="relative">
        <div className="absolute inset-0 bg-violet-600/20 blur-3xl rounded-full"></div>
        <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h4 className="font-bold text-lg">3ème année Génie informatique</h4>
              <p className="text-xs text-slate-400">Capteur principal CSI</p>
            </div>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
          
          {/* Simulation écran terminal */}
          <div className="bg-black rounded-lg aspect-video flex items-center justify-center relative overflow-hidden border border-slate-700">
             <div className="text-center">
               <div className="w-16 h-16 mx-auto mb-3 border-2 border-violet-500 rounded-lg flex items-center justify-center text-violet-500 animate-pulse">
                 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.131A8 8 0 008 8m0 0a8 8 0 00-8 8c0 2.472.345 4.865.99 7.131M10 11a2 2 0 114 0 2 2 0 01-4 0z" /></svg>
               </div>
               <p className="text-emerald-400 font-mono text-sm">SCAN OK</p>
               <p className="text-slate-500 text-xs mt-1">Veuillez entrer</p>
             </div>
             
             {/* Scan line effect */}
             <div className="absolute top-0 left-0 w-full h-1 bg-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 p-3 rounded-lg text-center">
              <p className="text-xs text-slate-400">Vitesse</p>
              <p className="font-bold text-white">0.2 sec</p>
            </div>
            <div className="bg-slate-700/50 p-3 rounded-lg text-center">
              <p className="text-xs text-slate-400">Capacité</p>
              <p className="font-bold text-white">5,000 users</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</section>

      {/* --- CTA SECTION --- */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-700 px-6 py-16 sm:p-16 shadow-2xl shadow-violet-900/20">
            {/* Cercles décoratifs */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-fuchsia-500/20 blur-3xl"></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Prêt à sécuriser votre établissement ?
              </h2>
              <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
                Rejoignez les écoles innovantes qui ont choisi la tranquillité d'esprit avec STUDAM. Installation rapide et support dédié.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact" className="px-8 py-4 bg-white text-violet-700 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg">
                  Contacter l'équipe
                </Link>
                <Link href="/auth/register" className="px-8 py-4 bg-indigo-800/50 text-white border border-indigo-400/30 rounded-xl font-bold hover:bg-indigo-800 transition-colors backdrop-blur-sm">
                  Créer un compte admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}