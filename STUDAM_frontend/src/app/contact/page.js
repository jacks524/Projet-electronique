"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        entreprise: '',
        sujet: '',
        message: ''
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const contactInfo = [
        {
            title: "Adresse",
            content: "Rue de Melen, Yaoundé, Cameroun",
 iconBg: "bg-violet-100",
            iconColor: "text-violet-600",
            icon: (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>)
        },
        {
            title: "Email",
            content: "contact@studam.edu",
            iconBg: "bg-violet-100",
            iconColor: "text-violet-600",
            icon: (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>)
        },
        {
            title: "Téléphone",
            content: "+237 6XX XX XX XX",
             iconBg: "bg-violet-100",
            iconColor: "text-violet-600",
            icon: (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>)
        },
        {
            title: "Horaires",
            content: "Lun-Ven: 8h00-18h00",
             iconBg: "bg-violet-100",
            iconColor: "text-violet-600",
            icon: (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>)
        }
    ];

    const faqItems = [
        {
            question: "Comment fonctionne l'authentification biométrique ?",
            answer: "Notre système utilise des capteurs d'empreintes digitales sécurisés pour identifier de manière unique chaque utilisateur. Les données biométriques sont chiffrées et stockées de manière sécurisée."
        },
        {
            question: "STUDAM est-il compatible avec nos systèmes existants ?",
            answer: "Oui, STUDAM propose une API REST complète qui permet l'intégration avec la plupart des systèmes de gestion scolaire existants. Notre équipe peut vous accompagner dans cette intégration."
        },
        {
            question: "Quelle est la politique de sauvegarde des données ?",
            answer: "Nous effectuons des sauvegardes automatiques quotidiennes avec une rétention de 30 jours. Toutes les données sont chiffrées et stockées sur des serveurs sécurisés conformes aux normes RGPD."
        },
        {
            question: "Proposez-vous une formation pour les utilisateurs ?",
            answer: "Absolument ! Nous offrons une formation complète pour les administrateurs et les utilisateurs finaux, ainsi qu'une documentation détaillée et un support technique continu."
        }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Effacer l'erreur si l'utilisateur commence à taper
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nom.trim()) {
            newErrors.nom = "Le nom est requis";
        }

        if (!formData.email.trim()) {
            newErrors.email = "L'email est requis";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Format d'email invalide";
        }

        if (!formData.sujet.trim()) {
            newErrors.sujet = "Le sujet est requis";
        }

        if (!formData.message.trim()) {
            newErrors.message = "Le message est requis";
        } else if (formData.message.trim().length < 10) {
            newErrors.message = "Le message doit contenir au moins 10 caractères";
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            // Simuler l'envoi du message (à remplacer par un vrai appel API)
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('Message envoyé:', formData);
            setIsSubmitted(true);
            setFormData({
                nom: '',
                email: '',
                entreprise: '',
                sujet: '',
                message: ''
            });
        } catch (error) {
            console.error('Erreur lors de l\'envoi:', error);
            setErrors({
                general: 'Une erreur est survenue. Veuillez réessayer.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
       <div className="min-h-screen bg-slate-50">
        {/* Hero Section - Violet Gradient */}
        <section className="bg-gradient-to-br from-violet-800 to-indigo-900 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Contactez l'équipe STUDAM</h1>
                <p className="text-xl text-violet-200 max-w-2xl mx-auto">Une question sur la sécurité biométrique ou l'intégration ? Nous sommes là.</p>
            </div>
        </section>

        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-12">
            {/* Info Cards à gauche */}
            <div className="lg:col-span-1 space-y-6">
                {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start space-x-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <div className={`w-12 h-12 ${info.iconBg} rounded-xl flex items-center justify-center ${info.iconColor} flex-shrink-0`}>
                            {info.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 mb-1">{info.title}</h3>
                            <p className="text-slate-600 font-medium">{info.content}</p>
                        </div>
                    </div>
                ))}
                {/* Réseaux sociaux avec hover violet */}
                <div className="flex space-x-4 pt-4 justify-center lg:justify-start">
                    {/* Exemple d'icône sociale */}
                    <a href="#" className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-violet-600 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                    </a>
                </div>
            </div>

            {/* Formulaire à droite */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
                {isSubmitted ? (
                    // Message de succès Émeraude (Vert moderne)
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Message reçu !</h3>
                        <p className="text-slate-600 mb-8">Nos experts vous recontacteront sous 24h.</p>
                        <button onClick={() => setIsSubmitted(false)} className="text-violet-600 font-medium hover:text-violet-700 underline">Envoyer un autre message</button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-slate-900 mb-8">Envoyez-nous un message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Inputs avec focus violet */}
                                <div>
                                    <label htmlFor="nom" className="block text-sm font-bold text-slate-700 mb-2">Nom complet *</label>
                                    <input type="text" id="nom" name="nom" value={formData.nom} onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-slate-50 border ${errors.nom ? 'border-red-300 ring-red-200' : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'} rounded-xl focus:outline-none focus:ring-4 transition-all`} placeholder="Jean Dupont" />
                                    {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom}</p>}
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">Email professionnel *</label>
                                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-slate-50 border ${errors.email ? 'border-red-300' : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'} rounded-xl focus:outline-none focus:ring-4 transition-all`} placeholder="jean@ecole.com" />
                                </div>
                            </div>
                            {/* ... (autres champs similaires) ... */}
                             <div>
                                <label htmlFor="message" className="block text-sm font-bold text-slate-700 mb-2">Message *</label>
                                <textarea id="message" name="message" rows="5" value={formData.message} onChange={handleChange}
                                    className={`w-full px-4 py-3 bg-slate-50 border ${errors.message ? 'border-red-300' : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'} rounded-xl focus:outline-none focus:ring-4 transition-all resize-none`} placeholder="Comment pouvons-nous vous aider ?"></textarea>
                            </div>

                            <button type="submit" disabled={isLoading} className="w-full bg-violet-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-500/50 disabled:opacity-50 transition-all shadow-lg">
                                {isLoading ? 'Envoi en cours...' : 'Envoyer le message'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </section>
    </div>
);
}