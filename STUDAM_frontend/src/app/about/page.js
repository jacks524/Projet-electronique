"use client";

import Link from 'next/link';

export default function AboutPage() {
    const team = [
        { name: "DONCHI Tresor", role: "Développeur Full-Stack", email: "tresorleroyd@gmail.com", avatar: "DT" },
        { name: "KENFACK Franck", role: "Chef de Projet & Développeur Frontend", email: "", avatar: "KF" },
        { name: "LADO SAHA", role: "Développeur Backend", email: "", avatar: "LS" },
        { name: "MBEUYO Audrey", role: "Designer UX/UI", email: "mbeuyoaudrey@gmail.com", avatar: "MA" },
        { name: "MENGOSSO Adrien", role: "Architecte Système", email: "amengosso@gmail.com", avatar: "AM" },
        { name: "NOUKOUA Maëva", role: "Responsable Qualité", email: "noukouamaeva@gmail.com", avatar: "NM" },
        { name: "TCHASSI Daniel", role: "Spécialiste Sécurité", email: "", avatar: "TD" }
    ];

    const stats = [
        { number: "2024", label: "Année de création" },
        { number: "7", label: "Membres de l'équipe" },
        { number: "50+", label: "Établissements partenaires" },
        { number: "10,000+", label: "Utilisateurs actifs" }
    ];

    const values = [
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                </svg>
            ),
            title: "Excellence académique",
            description: "Nous mettons l'éducation au cœur de notre mission pour faciliter l'apprentissage et l'enseignement."
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
            ),
            title: "Sécurité et confidentialité",
            description: "La protection des données personnelles et la sécurité des informations sont nos priorités absolues."
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
            ),
            title: "Innovation continue",
            description: "Nous développons constamment de nouvelles fonctionnalités pour répondre aux besoins évolutifs de l'éducation."
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
            ),
            title: "Collaboration",
            description: "Nous travaillons en étroite collaboration avec les établissements pour créer des solutions adaptées."
        }
    ];

    const features = [
        "Authentification biométrique sécurisée",
        "Rapports automatisés et personnalisables",
        "Interface intuitive et responsive",
        "Synchronisation temps réel",
        "Gestion multi-rôles complète",
        "Tableau de bord intelligent"
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#1B396A] to-[#2A5490] text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            À propos de STUDAM
                        </h1>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
                            Révolutionner la gestion des présences dans l&apos; enseignement supérieur grâce à l&apos; innovation technologique et l&apos; expertise pédagogique.
                        </p>
                        <div className="flex flex-wrap justify-center gap-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-3xl font-bold text-[#F26419]">{stat.number}</div>
                                    <div className="text-blue-100">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre Mission</h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                STUDAM (Student Attendance Manager) a été conçu pour moderniser et simplifier la gestion des présences dans les établissements d&apos; enseignement. Notre mission est de fournir une solution technologique innovante qui permet aux enseignants, administrateurs et étudiants de gérer efficacement les présences.
                            </p>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Nous croyons fermement que la technologie doit servir l&apos; éducation en réduisant les tâches administratives pour permettre aux enseignants de se concentrer sur ce qui compte vraiment : l&apos; enseignement et l&apos; accompagnement des étudiants.
                            </p>
                            <Link
                                href="/auth/register"
                                className="inline-flex items-center bg-[#F26419] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E55A1A] transition-colors"
                            >
                                Rejoindre STUDAM
                                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                                </svg>
                            </Link>
                        </div>
                        <div className="mt-12 lg:mt-0">
                            <div className="bg-white rounded-2xl p-8 shadow-xl">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Pourquoi STUDAM ?</h3>
                                <ul className="space-y-4">
                                    {features.map((feature, index) => (
                                        <li key={index} className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                                </svg>
                                            </div>
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Valeurs Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Valeurs</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Les principes qui guident notre développement et notre relation avec nos utilisateurs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="text-center group">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#F26419] to-[#FF7A47] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 text-white">
                                    {value.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#F26419] transition-colors">
                                    {value.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Équipe Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre Équipe</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Bioclass Innovators : une équipe passionnée de développeurs et designers dédiés à l&apos;innovation dans l&apos;éducation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {team.map((member, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#1B396A] to-[#2A5490] rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                                    {member.avatar}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    {member.name}
                                </h3>
                                <p className="text-[#F26419] text-sm font-medium mb-2">
                                    {member.role}
                                </p>
                                {member.email && (
                                    <p className="text-gray-500 text-xs">
                                        {member.email}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technologie Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="bg-gradient-to-br from-[#1B396A] to-[#2A5490] rounded-2xl p-8 text-white">
                                <h3 className="text-2xl font-bold mb-6">Technologies Utilisées</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { name: "Laravel", desc: "Backend robuste" },
                                        { name: "Next.js", desc: "Frontend moderne" },
                                        { name: "MySQL", desc: "Base de données" },
                                        { name: "Biométrie", desc: "Authentification" }
                                    ].map((tech, index) => (
                                        <div key={index} className="bg-white/10 rounded-lg p-4">
                                            <h4 className="font-semibold text-[#F26419] mb-1">{tech.name}</h4>
                                            <p className="text-blue-100 text-sm">{tech.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="order-1 lg:order-2 mb-8 lg:mb-0">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                Une architecture moderne et sécurisée
                            </h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                STUDAM est développé avec les dernières technologies web pour garantir performance, sécurité et évolutivité. Notre architecture modulaire permet une maintenance aisée et des mises à jour continues.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Architecture microservices pour la scalabilité",
                                    "Chiffrement bout-en-bout des données",
                                    "API RESTful pour l'intégration",
                                    "Interface responsive et accessible"
                                ].map((feature, index) => (
                                    <li key={index} className="flex items-center space-x-3">
                                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                        </svg>
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-16 bg-gradient-to-r from-[#F26419] to-[#FF7A47]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Prêt à transformer votre gestion des présences ?
                    </h2>
                    <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                        Contactez notre équipe pour une démonstration personnalisée et découvrez comment STUDAM peut s&apos; adapter à vos besoins.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/auth/register"
                            className="bg-white text-[#F26419] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Commencer gratuitement
                        </Link>
                        <Link
                            href="/contact"
                            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#F26419] transition-colors"
                        >
                            Nous contacter
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}