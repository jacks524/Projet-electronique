"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function FeaturesPage() {
    const [activeFeature, setActiveFeature] = useState(0);

    // Nouvelle palette de dégradés "Tech"
    const gradients = {
        violet: "from-violet-600 to-indigo-600",
        emerald: "from-emerald-500 to-teal-500",
        fuchsia: "from-fuchsia-600 to-pink-600",
        blue: "from-blue-600 to-cyan-600",
        amber: "from-amber-500 to-fuchsia-500"
    };

    const mainFeatures = [
        {
            icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
            ),
            title: "Authentification biométrique",
            description: "Système d'empreintes digitales pour une sécurité maximale et une identification rapide des utilisateurs.",
            details: [
                "Capteur d'empreintes digitales haute précision",
                "Authentification en moins de 2 secondes",
                "Base de données d'empreintes sécurisée",
                "Sauvegarde automatique des données biométriques"
            ],
            gradient: gradients.violet,
            image: "/features/biometric.svg"
        },
        {
            icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
            ),
            title: "Tableaux de bord intelligents",
            description: "Visualisations avancées et statistiques en temps réel pour un suivi optimal des présences.",
            details: [
                "Graphiques interactifs en temps réel",
                "Analyses prédictives des absences",
                "Tableaux de bord personnalisables par rôle",
                "Alertes automatiques pour les anomalies"
            ],
            gradient: gradients.emerald,
            image: "/features/dashboard.svg"
        },
        {
            icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            ),
            title: "Gestion d'emplois du temps",
            description: "Planification intelligente et synchronisation automatique des horaires de cours.",
            details: [
                "Création d'emplois du temps automatisée",
                "Gestion des conflits d'horaires",
                "Synchronisation calendrier externe",
                "Notifications de changements d'horaires"
            ],
            gradient: gradients.fuchsia,
            image: "/features/schedule.svg"
        },
        {
            icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
            ),
            title: "Rapports automatisés",
            description: "Génération automatique de rapports Excel avec analyses détaillées et exportation simplifiée.",
            details: [
                "Rapports Excel automatiques",
                "Analyses statistiques avancées",
                "Exportation en plusieurs formats",
                "Programmation d'envoi par email"
            ],
            gradient: gradients.blue,
            image: "/features/pending.svg"
        },
        {
            icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
            ),
            title: "Gestion multi-rôles",
            description: "Interface adaptée pour enseignants, étudiants, chefs de département et administrateurs.",
            details: [
                "4 niveaux d'accès différents",
                "Permissions granulaires",
                "Interface adaptée par rôle",
                "Workflows personnalisés"
            ],
            gradient: gradients.fuchsia,
            image: "/features/roles.svg"
        },
        {
            icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
            ),
            title: "Synchronisation temps réel",
            description: "Synchronisation instantanée des données et notifications en temps réel pour tous les utilisateurs.",
            details: [
                "Mise à jour en temps réel",
                "Notifications push instantanées",
                "Synchronisation multi-appareils",
                "Sauvegarde automatique cloud"
            ],
            gradient: gradients.amber,
            image: "/features/realtime.svg"
        }
    ];

    const additionalFeatures = [
        {
            icon: "🔒",
            title: "Sécurité avancée",
            description: "Chiffrement des données et conformité RGPD"
        },
        {
            icon: "📱",
            title: "Application mobile",
            description: "Application native iOS et Android"
        },
        {
            icon: "🌐",
            title: "API complète",
            description: "Intégration avec vos systèmes existants"
        },
        {
            icon: "☁️",
            title: "Cloud sécurisé",
            description: "Hébergement cloud haute disponibilité"
        },
        {
            icon: "📊",
            title: "Analytics avancés",
            description: "Intelligence artificielle pour prédictions"
        },
        {
            icon: "🔄",
            title: "Sauvegarde automatique",
            description: "Sauvegarde quotidienne automatique"
        },
        {
            icon: "🎯",
            title: "Personnalisation",
            description: "Interface personnalisable par établissement"
        },
        {
            icon: "⚡",
            title: "Performance optimale",
            description: "Chargement ultra-rapide et responsive"
        }
    ];

    const useCases = [
        {
            title: "Pour les Enseignants",
            items: [
                "Prise de présence en 30 secondes",
                "Suivi individuel des étudiants",
                "Génération de rapports personnalisés",
                "Notifications d'absences répétées"
            ],
            color: "violet"
        },
        {
            title: "Pour les Administrateurs",
            items: [
                "Vue d'ensemble de tous les établissements",
                "Gestion centralisée des utilisateurs",
                "Rapports consolidés multi-sites",
                "Paramétrage global du système"
            ],
            color: "slate"
        },
        {
            title: "Pour les Chefs de Département",
            items: [
                "Suivi des enseignants et courses",
                "Planification des emplois du temps",
                "Analyses par département",
                "Gestion des matières et salles"
            ],
            color: "emeralde"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section - Violet Gradient */}
            <section className="py-24 bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-violet-800/50 text-violet-200 text-sm font-medium mb-5 backdrop-blur-sm border border-violet-700">
                        Version 2.0 Disponible
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        La puissance de la biométrie,<br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">la simplicité du cloud.</span>
                    </h1>
                    <p className="text-xl text-indigo-200 max-w-3xl mx-auto mb-10 leading-relaxed">
                        Explorez la suite complète d'outils STUDAM conçue pour sécuriser votre campus et automatiser les tâches administratives répétitives.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/register" className="bg-white text-violet-900 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                            Démarrer l'essai 30 jours
                        </Link>
                    </div>
                </div>
            </section>

            {/* Fonctionnalités interactives */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-start">
                        {/* Menu Latéral */}
                        <div className="lg:col-span-5 mb-12 lg:mb-0">
                            <h2 className="text-3xl font-bold text-slate-900 mb-8">Cœur du système</h2>
                            <div className="space-y-2">
                                {mainFeatures.map((feature, index) => (
                                    <button key={index} onClick={() => setActiveFeature(index)} className={`w-full text-left p-5 rounded-xl transition-all duration-300 group ${index === activeFeature ? 'bg-violet-50 border-violet-600 shadow-sm' : 'hover:bg-slate-50 border-transparent'} border-2`}>
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${index === activeFeature ? feature.gradient : 'from-slate-200 to-slate-300'} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <h3 className={`text-lg font-bold transition-colors ${index === activeFeature ? 'text-violet-900' : 'text-slate-700'}`}>{feature.title}</h3>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Contenu Principal */}
                        <div className="lg:col-span-7">
                            <div className="bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                                {/* Background accent */}
                                <div className={`absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-gradient-to-br ${mainFeatures[activeFeature].gradient} rounded-full opacity-10 blur-3xl pointer-events-none`}></div>
                                
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${mainFeatures[activeFeature].gradient} text-white flex items-center justify-center mb-8 shadow-lg`}>
                                    {mainFeatures[activeFeature].icon}
                                </div>
                                <h3 className="text-3xl font-bold text-slate-900 mb-4">{mainFeatures[activeFeature].title}</h3>
                                <p className="text-lg text-slate-600 mb-10 leading-relaxed">{mainFeatures[activeFeature].description}</p>
                                
                                <ul className="grid sm:grid-cols-2 gap-4">
                                    {mainFeatures[activeFeature].details.map((detail, index) => (
                                        <li key={index} className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                            <span className="text-slate-700 font-medium">{detail}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases (Adapté avec les nouvelles couleurs) */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900">Adapté à chaque rôle</h2>
                </div>
                <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
                    {useCases.map((useCase, index) => (
                        <div key={index} className={`bg-white rounded-2xl p-8 border-t-4 shadow-xl shadow-slate-200/40 hover:-translate-y-1 transition-all border-${useCase.color}-500`}>
                            <h3 className={`text-2xl font-bold mb-6 text-${useCase.color}-900`}>{useCase.title}</h3>
                            <ul className="space-y-4">
                                {useCase.items.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className={`mt-1 w-2 h-2 rounded-full bg-${useCase.color}-500`}></div>
                                        <span className="text-slate-600">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

             {/* Section Technique "Dark Mode" pour le contraste */}
            <section className="py-24 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Architecture & Sécurité</h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">Conçu pour la performance, blindé pour la confidentialité.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        {/* Blocs techniques mis à jour */}
                        <div className="p-8 bg-slate-800 rounded-2xl border border-slate-700 hover:border-violet-500 transition-colors">
                             <div className="w-16 h-16 mx-auto bg-violet-900/50 text-violet-400 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Chiffrement de bout en bout</h3>
                            <p className="text-slate-400">Données biométriques hachées (SHA-512) et transmises via TLS 1.3.</p>
                        </div>
                        {/* ... autres blocs techniques similaires */}
                         <div className="p-8 bg-slate-800 rounded-2xl border border-slate-700 hover:border-emerald-500 transition-colors">
                             <div className="w-16 h-16 mx-auto bg-emerald-900/50 text-emerald-400 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Haute Disponibilité (99.9%)</h3>
                            <p className="text-slate-400">Infrastructure cloud redondante et mode hors-ligne sur terminaux.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final - Violet */}
            <section className="py-20 bg-gradient-to-r from-violet-600 to-indigo-600">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-white mb-8">Prêt à moderniser votre établissement ?</h2>
                    <Link href="/auth/register" className="bg-white text-violet-700 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:scale-105">
                        Créer un compte administrateur
                    </Link>
                </div>
            </section>
        </div>
    );
}
