"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    setIsVisible(true);

    // Auto-rotation des témoignages
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
      ),
      title: "Authentification biométrique",
      description: "Système d'empreintes digitales pour une sécurité maximale et une identification rapide des utilisateurs.",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
      ),
      title: "Tableaux de bord intelligents",
      description: "Visualisations avancées et statistiques en temps réel pour un suivi optimal des présences.",
      gradient: "from-emerald-500 to-emerald-600"
    },
    {
      icon: (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
      ),
      title: "Gestion d'emplois du temps",
      description: "Planification intelligente et synchronisation automatique des horaires de cours.",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
      ),
      title: "Rapports automatisés",
      description: "Génération automatique de rapports Excel avec analyses détaillées et exportation simplifiée.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
      ),
      title: "Gestion multi-rôles",
      description: "Interface adaptée pour enseignants, étudiants, chefs de département et administrateurs.",
      gradient: "from-indigo-500 to-indigo-600"
    },
    {
      icon: (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
      ),
      title: "Temps réel",
      description: "Synchronisation instantanée des données et notifications en temps réel pour tous les utilisateurs.",
      gradient: "from-yellow-500 to-orange-500"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Aissatou Fall",
      role: "Chef de Département - Informatique",
      content: "STUDAM a révolutionné notre façon de gérer les présences. Plus besoin de feuilles papier, tout est automatisé et précis.",
      avatar: "AF",
      rating: 5
    },
    {
      name: "Prof. Mamadou Diallo",
      role: "Enseignant - Mathématiques",
      content: "L'interface est intuitive et le système biométrique nous fait gagner un temps précieux en début de cours.",
      avatar: "MD",
      rating: 5
    },
    {
      name: "Omar Sow",
      role: "Administrateur système",
      content: "Les rapports automatisés et les analyses détaillées nous permettent un suivi optimal de la fréquentation.",
      avatar: "OS",
      rating: 4
    }
  ];

  const stats = [
    {
      number: "10,000+",
      label: "Étudiants actifs",
      icon: (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
          </svg>
      )
    },
    {
      number: "500+",
      label: "Enseignants",
      icon: (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
      )
    },
    {
      number: "50+",
      label: "Établissements",
      icon: (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
      )
    },
    {
      number: "99.9%",
      label: "Disponibilité",
      icon: (
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
      )
    }
  ];

  return (
      <div className="min-h-screen bg-white">
        {/* Hero Section avec animations et design moderne */}
        <section className="pt-8 pb-16 bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center min-h-[80vh]">
              <div className={`lg:col-span-6 transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                <div className="text-center lg:text-left">
                  {/* Badge tendance */}
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#F26419]/10 to-[#FF7A47]/10 text-[#F26419] text-sm font-medium mb-6 border border-[#F26419]/20">
                    <span className="w-2 h-2 bg-[#F26419] rounded-full mr-2 animate-pulse"></span>
                    Nouvelle version disponible
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                    <span className="block">L&apos;avenir de la</span>
                    <span className="block bg-gradient-to-r from-[#F26419] to-[#FF7A47] bg-clip-text text-transparent">
                    gestion des présences
                  </span>
                    <span className="block">est ici</span>
                  </h1>

                  <p className="text-xl text-gray-600 max-w-3xl mb-8 leading-relaxed">
                    STUDAM révolutionne la gestion des présences dans les établissements d&apos;enseignement avec
                    l&apos;authentification biométrique, des tableaux de bord intelligents et des rapports automatisés.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                    <Link
                        href="/auth/register"
                        className="bg-gradient-to-r from-[#F26419] to-[#FF7A47] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-[#E55A1A] hover:to-[#F26419] transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden group"
                    >
                      <span className="relative z-10">Commencer gratuitement</span>
                      <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full transition-transform duration-500 group-hover:translate-x-full"></div>
                    </Link>
                    <Link
                        href="#demo"
                        className="border-2 border-[#1B396A] text-[#1B396A] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#1B396A] hover:text-white transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Voir la démo
                    </Link>
                  </div>

                  {/* Stats avec animations */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center lg:text-left group">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#F26419]/10 to-[#FF7A47]/10 rounded-xl flex items-center justify-center text-[#F26419] mb-3 group-hover:scale-110 transition-transform duration-300">
                            {stat.icon}
                          </div>
                          <div className="text-2xl font-bold text-[#1B396A] group-hover:text-[#F26419] transition-colors">
                            {stat.number}
                          </div>
                          <div className="text-sm text-gray-600">{stat.label}</div>
                        </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`mt-12 lg:mt-0 lg:col-span-6 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                <div className="relative">
                  {/* Éléments décoratifs flottants */}
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-[#F26419]/20 to-[#FF7A47]/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-[#1B396A]/20 to-[#2A5490]/20 rounded-full blur-xl animate-pulse delay-1000"></div>

                  {/* Mockup d'interface moderne */}
                  <div className="bg-white rounded-2xl shadow-2xl p-6 transform hover:scale-105 transition-all duration-500 relative z-10">
                    <div className="flex items-center space-x-2 mb-6">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>

                    {/* Header mockup */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="h-8 bg-gradient-to-r from-[#F26419] to-[#FF7A47] rounded-lg w-24 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">STUDAM</span>
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                          </svg>
                        </div>
                        <div className="w-8 h-8 bg-[#F26419] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">U</span>
                        </div>
                      </div>
                    </div>

                    {/* Contenu mockup */}
                    <div className="space-y-4">
                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-blue-600">95%</div>
                          <div className="text-xs text-gray-500">Présences</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-green-600">142</div>
                          <div className="text-xs text-gray-500">Étudiants</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-orange-600">8</div>
                          <div className="text-xs text-gray-500">Classes</div>
                        </div>
                      </div>

                      {/* Graphique simulé */}
                      <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4 flex items-end justify-between">
                        {[40, 60, 80, 65, 90, 75, 85].map((height, i) => (
                            <div
                                key={i}
                                className="bg-gradient-to-t from-[#F26419] to-[#FF7A47] rounded-t w-6"
                                style={{ height: `${height}%` }}
                            ></div>
                        ))}
                      </div>

                      {/* Liste des étudiants simulée */}
                      <div className="space-y-3">
                        {[
                          { name: "Mamadou Diallo", status: "present" },
                          { name: "Aissatou Fall", status: "present" },
                          { name: "Omar Sow", status: "absent" },
                          { name: "Fatou Ndiaye", status: "present" }
                        ].map((student, i) => (
                            <div key={i} className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">{student.name.split(' ').map(n => n[0]).join('')}</span>
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="h-3 bg-gray-200 rounded w-3/4">
                                  <div className="h-full bg-gray-300 rounded" style={{ width: '60%' }}></div>
                                </div>
                                <div className="h-2 bg-gray-100 rounded w-1/2">
                                  <div className="h-full bg-gray-200 rounded" style={{ width: '40%' }}></div>
                                </div>
                              </div>
                              <div className={`w-16 h-6 ${student.status === 'present' ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
                                <div className={`w-2 h-2 ${student.status === 'present' ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Image hero avec overlay moderne */}
                  <div className="mt-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#F26419]/20 to-[#FF7A47]/20 rounded-2xl transform rotate-3"></div>
                    <Image
                        src="/images.jpeg"
                        alt="Gestion moderne des présences STUDAM"
                        className="relative z-10 w-full h-64 object-cover rounded-2xl shadow-xl"
                        width={600}
                        height={400}
                        priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Fonctionnalités avec design en grille moderne */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-base text-[#F26419] font-semibold tracking-wide uppercase mb-4">Fonctionnalités</h2>
              <h3 className="text-4xl font-bold text-gray-900 mb-4">
                Une plateforme complète pour la gestion des présences
              </h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez toutes les fonctionnalités qui font de STUDAM la solution de référence pour les établissements d&apos;enseignement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                  <div
                      key={index}
                      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group border border-gray-100"
                  >
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#1B396A] transition-colors">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section À propos moderne */}
        <section id="about" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <h2 className="text-base text-[#F26419] font-semibold tracking-wide uppercase mb-4">À propos</h2>
                <h3 className="text-4xl font-bold text-gray-900 mb-6">
                  Une solution pensée pour l&apos;éducation moderne
                </h3>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  STUDAM transforme la gestion des présences dans les établissements d&apos;enseignement grâce à une technologie de pointe et une interface intuitive.
                </p>

                <div className="space-y-6">
                  {[
                    {
                      title: "Efficacité",
                      desc: "Réduisez le temps administratif et concentrez-vous sur l'enseignement",
                      icon: (
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                          </svg>
                      )
                    },
                    {
                      title: "Précision",
                      desc: "Données fiables pour des décisions éclairées",
                      icon: (
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                      )
                    },
                    {
                      title: "Sécurité",
                      desc: "Protection des données avec les plus hauts standards",
                      icon: (
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                          </svg>
                      )
                    },
                    {
                      title: "Flexibilité",
                      desc: "Adaptable à tous types d'établissements",
                      icon: (
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                          </svg>
                      )
                    }
                  ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-4 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#F26419]/10 to-[#FF7A47]/10 rounded-xl flex items-center justify-center text-[#F26419] group-hover:scale-110 transition-transform duration-300">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-[#F26419] transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-gray-600">{item.desc}</p>
                        </div>
                      </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 lg:mt-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1B396A]/10 to-[#F26419]/10 rounded-3xl transform rotate-6"></div>
                  <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#1B396A]/10 to-[#F26419]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-[#1B396A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-4">Tableaux de bord intelligents</h4>
                      <p className="text-gray-600 mb-6">
                        Visualisez vos données de présence en temps réel avec des graphiques interactifs et des insights précieux.
                      </p>
                      <div className="bg-gradient-to-r from-[#F26419] to-[#FF7A47] h-2 rounded-full mb-4"></div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Présences</span>
                        <span>95%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Témoignages avec carousel interactif */}
        <section id="testimonials" className="py-20 bg-gradient-to-br from-[#1B396A] to-[#2A5490]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-base text-[#F26419] font-semibold tracking-wide uppercase mb-4">Témoignages</h2>
              <h3 className="text-4xl font-bold text-white mb-4">
                Ce que disent nos utilisateurs
              </h3>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Découvrez pourquoi plus de 50 établissements font confiance à STUDAM pour gérer leurs présences.
              </p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
                <div className="text-center">
                  {/* Rating stars */}
                  <div className="flex justify-center mb-6">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                    ))}
                  </div>

                  <blockquote className="text-xl md:text-2xl text-gray-800 italic mb-8 leading-relaxed">
                    &ldquo;{testimonials[currentTestimonial].content}&rdquo;
                  </blockquote>

                  <div className="flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#F26419] to-[#FF7A47] rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                      {testimonials[currentTestimonial].avatar}
                    </div>
                    <div className="text-left">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {testimonials[currentTestimonial].name}
                      </h4>
                      <p className="text-gray-600">
                        {testimonials[currentTestimonial].role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation dots */}
              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentTestimonial(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentTestimonial
                                ? 'bg-[#F26419] scale-125'
                                : 'bg-white/50 hover:bg-white/75'
                        }`}
                    />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section CTA moderne avec design attractif */}
        <section className="py-20 bg-gradient-to-r from-[#F26419] to-[#FF7A47] relative overflow-hidden">
          {/* Éléments décoratifs */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Prêt à révolutionner la gestion des présences ?
              </h2>
              <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
                Rejoignez les milliers d&apos;établissements qui ont déjà adopté STUDAM pour simplifier leur quotidien.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                    href="/auth/register"
                    className="bg-white text-[#F26419] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Commencer gratuitement
                </Link>
                <Link
                    href="/contact"
                    className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-[#F26419] transition-all duration-200 transform hover:scale-105"
                >
                  Contacter l&apos;équipe
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex flex-wrap justify-center items-center gap-8 opacity-75">
                <div className="text-white text-center">
                  <div className="text-2xl font-bold">30 jours</div>
                  <div className="text-sm">Essai gratuit</div>
                </div>
                <div className="text-white text-center">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm">Support technique</div>
                </div>
                <div className="text-white text-center">
                  <div className="text-2xl font-bold">SSL</div>
                  <div className="text-sm">Sécurisé</div>
                </div>
                <div className="text-white text-center">
                  <div className="text-2xl font-bold">RGPD</div>
                  <div className="text-sm">Conforme</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
  );
}