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
            content: "Avenue de l'Université, Dakar, Sénégal",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
            )
        },
        {
            title: "Email",
            content: "contact@studam.edu",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
            )
        },
        {
            title: "Téléphone",
            content: "+221 33 825 75 28",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
            )
        },
        {
            title: "Horaires",
            content: "Lun-Ven: 8h00-18h00",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            )
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
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#1B396A] to-[#2A5490] text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            Contactez-nous
                        </h1>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                            Notre équipe est là pour répondre à toutes vos questions sur STUDAM et vous accompagner dans la mise en place de votre solution de gestion des présences.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contenu principal */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-3 lg:gap-12">

                        {/* Informations de contact */}
                        <div className="lg:col-span-1 mb-12 lg:mb-0">
                            <div className="bg-gray-50 rounded-2xl p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    Informations de contact
                                </h2>

                                <div className="space-y-6">
                                    {contactInfo.map((info, index) => (
                                        <div key={index} className="flex items-start space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-[#F26419] to-[#FF7A47] rounded-xl flex items-center justify-center text-white flex-shrink-0">
                                                {info.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                    {info.title}
                                                </h3>
                                                <p className="text-gray-600">
                                                    {info.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Réseaux sociaux */}
                                <div className="mt-8 pt-8 border-t border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-4">Suivez-nous</h3>
                                    <div className="flex space-x-4">
                                        {[
                                            { name: 'LinkedIn', icon: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' },
                                            { name: 'Twitter', icon: 'M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' },
                                            { name: 'Facebook', icon: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z' }
                                        ].map((social, index) => (
                                            <a
                                                key={index}
                                                href="#"
                                                className="w-10 h-10 bg-[#1B396A] rounded-lg flex items-center justify-center text-white hover:bg-[#F26419] transition-colors"
                                                aria-label={social.name}
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path fillRule="evenodd" d={social.icon} clipRule="evenodd" />
                                                </svg>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Formulaire de contact */}
                        <div className="lg:col-span-2">
                            {isSubmitted ? (
                                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                        Message envoyé avec succès !
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.
                                    </p>
                                    <button
                                        onClick={() => setIsSubmitted(false)}
                                        className="bg-[#F26419] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#E55A1A] transition-colors"
                                    >
                                        Envoyer un autre message
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white border border-gray-200 rounded-2xl p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                        Envoyez-nous un message
                                    </h2>

                                    {errors.general && (
                                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                            <p className="text-red-700">{errors.general}</p>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nom complet *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="nom"
                                                    name="nom"
                                                    value={formData.nom}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 border ${errors.nom ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:border-transparent transition-colors`}
                                                    placeholder="Votre nom complet"
                                                />
                                                {errors.nom && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:border-transparent transition-colors`}
                                                    placeholder="votre@email.com"
                                                />
                                                {errors.email && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="entreprise" className="block text-sm font-medium text-gray-700 mb-2">
                                                Établissement / Entreprise
                                            </label>
                                            <input
                                                type="text"
                                                id="entreprise"
                                                name="entreprise"
                                                value={formData.entreprise}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:border-transparent transition-colors"
                                                placeholder="Nom de votre établissement"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="sujet" className="block text-sm font-medium text-gray-700 mb-2">
                                                Sujet *
                                            </label>
                                            <select
                                                id="sujet"
                                                name="sujet"
                                                value={formData.sujet}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border ${errors.sujet ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:border-transparent transition-colors`}
                                            >
                                                <option value="">Sélectionnez un sujet</option>
                                                <option value="demo">Demande de démonstration</option>
                                                <option value="tarifs">Information sur les tarifs</option>
                                                <option value="support">Support technique</option>
                                                <option value="partenariat">Partenariat</option>
                                                <option value="autre">Autre</option>
                                            </select>
                                            {errors.sujet && (
                                                <p className="mt-1 text-sm text-red-600">{errors.sujet}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                                Message *
                                            </label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                rows="6"
                                                value={formData.message}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border ${errors.message ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:border-transparent transition-colors resize-none`}
                                                placeholder="Décrivez votre demande en détail..."
                                            ></textarea>
                                            {errors.message && (
                                                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-gradient-to-r from-[#F26419] to-[#FF7A47] text-white px-8 py-4 rounded-lg font-semibold hover:from-[#E55A1A] hover:to-[#F26419] focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Envoi en cours...
                                                </div>
                                            ) : (
                                                'Envoyer le message'
                                            )}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Questions fréquentes
                        </h2>
                        <p className="text-lg text-gray-600">
                            Trouvez rapidement les réponses aux questions les plus courantes sur STUDAM.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {faqItems.map((item, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    {item.question}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {item.answer}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4">
                            Vous ne trouvez pas la réponse à votre question ?
                        </p>
                        <Link
                            href="/help"
                            className="inline-flex items-center text-[#F26419] hover:text-[#E55A1A] font-medium"
                        >
                            Consultez notre centre d&apos; aide
                            <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}