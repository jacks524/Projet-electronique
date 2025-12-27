"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function FeaturesPage() {
    const [activeFeature, setActiveFeature] = useState(0);

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
            gradient: "from-blue-500 to-blue-600",
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
            gradient: "from-emerald-500 to-emerald-600",
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
            gradient: "from-purple-500 to-purple-600",
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
            gradient: "from-orange-500 to-red-500",
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
            gradient: "from-indigo-500 to-indigo-600",
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
            gradient: "from-yellow-500 to-orange-500",
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
            color: "blue"
        },
        {
            title: "Pour les Administrateurs",
            items: [
                "Vue d'ensemble de tous les établissements",
                "Gestion centralisée des utilisateurs",
                "Rapports consolidés multi-sites",
                "Paramétrage global du système"
            ],
            color: "purple"
        },
        {
            title: "Pour les Étudiants",
            items: [
                "Consultation de ses présences",
                "Historique détaillé par matière",
                "Notifications de retards/absences",
                "Interface mobile intuitive"
            ],
            color: "green"
        },
        {
            title: "Pour les Chefs de Département",
            items: [
                "Suivi des enseignants et courses",
                "Planification des emplois du temps",
                "Analyses par département",
                "Gestion des matières et salles"
            ],
            color: "orange"
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Fonctionnalités <span className="bg-gradient-to-r from-[#F26419] to-[#FF7A47] bg-clip-text text-transparent">STUDAM</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                            Découvrez toutes les fonctionnalités qui font de STUDAM la solution de référence
                            pour la gestion des présences dans les établissements d&apos; enseignement.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/auth/register"
                                className="bg-gradient-to-r from-[#F26419] to-[#FF7A47] text-white px-8 py-3 rounded-xl font-semibold hover:from-[#E55A1A] hover:to-[#F26419] transition-all duration-200 transform hover:scale-105"
                            >
                                Essayer gratuitement
                            </Link>
                            <Link
                                href="/contact"
                                className="border-2 border-[#1B396A] text-[#1B396A] px-8 py-3 rounded-xl font-semibold hover:bg-[#1B396A] hover:text-white transition-all duration-200"
                            >
                                Demander une démo
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Fonctionnalités principales */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Fonctionnalités principales
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Des outils puissants pour transformer la gestion des présences dans votre établissement.
                        </p>
                    </div>

                    {/* Feature principale interactive */}
                    <div className="mb-16">
                        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
                            <div>
                                <div className="mb-8">
                                    {mainFeatures.map((feature, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveFeature(index)}
                                            className={`w-full text-left p-4 rounded-lg mb-4 transition-all duration-200 ${
                                                index === activeFeature
                                                    ? 'bg-gradient-to-r from-[#F26419]/10 to-[#FF7A47]/10 border-l-4 border-[#F26419]'
                                                    : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-start space-x-4">
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} text-white flex items-center justify-center flex-shrink-0`}>
                                                    {feature.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                        {feature.title}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm">
                                                        {feature.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 lg:mt-0">
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${mainFeatures[activeFeature].gradient} text-white flex items-center justify-center mb-6`}>
                                        {mainFeatures[activeFeature].icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                        {mainFeatures[activeFeature].title}
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {mainFeatures[activeFeature].description}
                                    </p>
                                    <ul className="space-y-3">
                                        {mainFeatures[activeFeature].details.map((detail, index) => (
                                            <li key={index} className="flex items-center space-x-3">
                                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                                </svg>
                                                <span className="text-gray-700">{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Fonctionnalités supplémentaires */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Et bien plus encore...
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Une solution complète avec toutes les fonctionnalités dont vous avez besoin.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {additionalFeatures.map((feature, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Cas d'usage */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Adapté à tous les utilisateurs
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            STUDAM s&apos; adapte aux besoins spécifiques de chaque type d&apos; utilisateur.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {useCases.map((useCase, index) => (
                            <div key={index} className="bg-gray-50 rounded-xl p-8">
                                <h3 className={`text-xl font-bold mb-6 text-${useCase.color}-600`}>
                                    {useCase.title}
                                </h3>
                                <ul className="space-y-4">
                                    {useCase.items.map((item, itemIndex) => (
                                        <li key={itemIndex} className="flex items-start space-x-3">
                                            <svg className={`w-5 h-5 text-${useCase.color}-500 flex-shrink-0 mt-0.5`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                            </svg>
                                            <span className="text-gray-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section technique */}
            <section className="py-20 bg-gradient-to-br from-[#1B396A] to-[#2A5490]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Spécifications techniques
                        </h2>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                            Une architecture moderne et robuste pour garantir performance et fiabilité.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Sécurité</h3>
                            <p className="text-blue-100">Chiffrement AES-256, HTTPS, conformité RGPD</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Performance</h3>
                            <p className="text-blue-100">99.9% de disponibilité, temps de réponse  200ms</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7c0 2.21-3.582 4-8 4s-8-1.79-8-4z"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Scalabilité</h3>
                            <p className="text-blue-100">Architecture cloud, support de millions d&apos; utilisateurs</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-20 bg-gradient-to-r from-[#F26419] to-[#FF7A47]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Prêt à découvrir STUDAM ?
                    </h2>
                    <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
                        Rejoignez les établissements qui ont déjà choisi STUDAM pour moderniser leur gestion des présences.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/auth/register"
                            className="bg-white text-[#F26419] px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
                        >
                            Commencer gratuitement
                        </Link>
                        <Link
                            href="/contact"
                            className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-[#F26419] transition-all duration-200"
                        >
                            Demander une démo
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}