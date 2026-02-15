"use client";

import Image from 'next/image';

export default function AboutPage() {
    // Pour afficher une photo: remplace photo: "" par ex. photo: "/team/nom-prenom.jpg"
    const team = [
        { name: "DJAMPA NJUITCHA ANICET", role: "Membre fondateur", photo: "" },
        { name: "DONFACK BOTREL CYRILLE", role: "Membre fondateur", photo: "" },
        { name: "KOUAM TCHUINTE Cedric D'orian", role: "Membre fondateur", photo: "" },
        { name: "MBO'O ATENA SIDONIE ORNELLA", role: "Membre fondateur", photo: "" },
        { name: "MVOGO MVOGO DAVID ROLAND", role: "Developpeur Full-Stack ", photo: "" },
        { name: "NGONGA TSAFANG Jacquy Junior", role: "Membre fondateur", photo: "" },
        { name: "NGOUPEYOU Bryan Jean-Roland", role: "Membre fondateur", photo: "" },
        { name: "NJIKI TCHOUBIA MIGUEL Alan", role: "Membre fondateur", photo: "" },
        { name: "NZIKO TALLA  Felix Andre", role: "Membre fondateur", photo: "" },
        { name: "OYIE MVA'A Japhet", role: "Membre fondateur", photo: "" },
        { name: "SAHA NZOYEM Philippe Owen", role: "Membre fondateur", photo: "" },
        { name: "TSAGUE TONFACK NAOMI LUCRESSE", role: "Membre fondateur", photo: "" }
    ];

    const values = [
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                </svg>
            ),
            title: "Excellence academique",
            description: "Nous mettons l'education au coeur de notre mission pour faciliter l'apprentissage et l'enseignement."
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
            ),
            title: "Sécurite & confidentialité",
            description: "La protection des données personnelles et la sécurité des informations sont des prioritées absolues."
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
            ),
            title: "Innovation continue",
            description: "Nous developpons constamment de nouvelles fonctionnalités pour repondre aux besoins evolutifs de l'education."
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
            ),
            title: "Collaboration terrain",
            description: "Nous co-construisons STUDAM avec les etablissements pour des usages concrets et une adoption durable."
        }
    ];

    const getInitials = (name) => {
        return name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join('')
            .toUpperCase();
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
          <section className="bg-gradient-to-b from-violet-900 via-indigo-900 to-slate-900 text-white py-32 md:py-48 min-h-[60vh] flex items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/about/hero-tech-bg.svg')] bg-cover bg-center opacity-40"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/35 via-indigo-950/55 to-violet-950/80"></div>


              <div className="absolute top-[-15%] right-[-10%] w-[28rem] h-[28rem] md:w-[45rem] md:h-[45rem] bg-fuchsia-500/20 rounded-full blur-[100px] md:blur-[150px] pointer-events-none"></div>
                  <div className="absolute bottom-[-15%] left-[-10%] w-[28rem] h-[28rem] md:w-[45rem] md:h-[45rem] bg-violet-500/20 rounded-full blur-[100px] md:blur-[150px] pointer-events-none"></div>

    <div className="max-w-7xl w-full mx-auto px-4 relative z-10 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Nous sommes <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-fuchsia-200">Empreinte Labs</span>
        </h1>
        <p className="text-xl text-violet-100 max-w-3xl mx-auto leading-relaxed">
            L&apos;innovation qui marque chaque présence.
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
                                    Simplifier la vie administrative des écoles pour que les enseignants puissent se concentrer sur l&apos;essentiel : enseigner.
                                    STUDAM sécurise les accès et automatise les tâches chronophages.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { num: "50+", label: "Etablissements" },
                                    { num: "10k+", label: "Utilisateurs quotidiens" },
                                    { num: "99.9%", label: "Precision biometrique" },
                                    { num: `${team.length}`, label: "Createurs" }
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

            {/* Team Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">L&apos;équipe derrière STUDAM</h2>
                    <p className="text-slate-600">Nous sommes des étudiants de l&apos;ENSPY passionnée par la technologie et l'innovation.</p>
                </div>

                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {team.map((member, index) => (
                        <div key={index} className="group bg-slate-50 rounded-2xl p-6 text-center hover:bg-white hover:shadow-xl hover:shadow-violet-100/50 border border-slate-100 transition-all">
                            <div className="relative w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden ring-4 ring-violet-100 bg-gradient-to-br from-violet-500 to-indigo-600">
                                {member.photo ? (
                                    <Image
                                        src={member.photo}
                                        alt={`Photo de ${member.name}`}
                                        fill
                                        className="object-cover"
                                        sizes="96px"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                                        {getInitials(member.name)}
                                    </div>
                                )}
                                <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-white/95 text-violet-700 border border-violet-200 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h4l2-2h6l2 2h4v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16a3 3 0 100-6 3 3 0 000 6z"/>
                                    </svg>
                                </div>
                            </div>
                            <h3 className="font-bold text-slate-900 text-sm leading-snug min-h-[2.75rem]">{member.name}</h3>
                            <p className="text-violet-600 text-sm font-medium mt-1">{member.role}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
