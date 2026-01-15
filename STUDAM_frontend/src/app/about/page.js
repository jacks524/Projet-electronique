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
           {/* Hero Section - Violet */}
            <section className="bg-gradient-to-b from-violet-900 to-indigo-900 text-white py-24 relative overflow-hidden">
                 {/* Background patterns */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[10%] left-[-10%] w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"></div>
                </div>
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Nous sommes <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-fuchsia-200">Bioclass Innovators</span>.</h1>
                    <p className="text-xl text-violet-100 max-w-3xl mx-auto leading-relaxed">
                        Une équipe passionnée dédiée à sécuriser l'éducation grâce à la technologie biométrique de pointe.
                    </p>
                </div>
            </section>

            {/* Mission & Stats */}
            <section className="py-20 bg-white relative z-10 -mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-3xl shadow-2xl shadow-violet-900/10 p-8 md:p-12 border border-slate-100">
                        <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
                             <div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-6">Notre Mission</h2>
                                <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                                    Simplifier la vie administrative des écoles pour que les enseignants puissent se concentrer sur l'essentiel : enseigner. STUDAM sécurise les accès et automatise les tâches chronophages.
                                </p>
                            </div>
                             <div className="grid grid-cols-2 gap-6">
                                {[
                                    { num: "50+", label: "Établissements" }, { num: "10k+", label: "Utilisateurs quotidiens" },
                                    { num: "99.9%", label: "Précision biométrique" }, { num: "24/7", label: "Support technique" }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-100">
                                        <div className="text-3xl font-bold text-violet-600 mb-1">{stat.num}</div>
                                        <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            </section>

             {/* Valeurs */}
            <section className="py-24 bg-slate-50">
                 <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
                    <h2 className="text-3xl font-bold text-slate-900">Nos Piliers</h2>
                </div>
                <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
                    {values.map((value, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group border border-slate-100">
                            <div className="w-14 h-14 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                                {value.icon}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">{value.title}</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">{value.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Team Section - Cartes modernes */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">L'équipe derrière STUDAM</h2>
                    <p className="text-slate-600">Des experts en sécurité, développement et pédagogie.</p>
                </div>
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {team.map((member, index) => (
                        <div key={index} className="group bg-slate-50 rounded-2xl p-6 text-center hover:bg-white hover:shadow-xl hover:shadow-violet-100/50 border border-slate-100 transition-all">
                            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg group-hover:scale-110 transition-transform">
                                {member.avatar}
                            </div>
                            <h3 className="font-bold text-slate-900">{member.name}</h3>
                            <p className="text-violet-600 text-sm font-medium mb-2">{member.role}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}