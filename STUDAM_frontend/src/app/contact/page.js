"use client";

import { useState } from 'react';

const initialFormData = {
    nom: '',
    poste: '',
    email: '',
    telephone: '',
    etablissement: '',
    ville: '',
    effectifEleves: '',
    besoin: '',
    budget: '',
    delai: '',
    message: ''
};

export default function ContactPage() {
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const contactInfo = [
        {
            title: 'Adresse',
            content: 'ENSPY, Yaounde, Cameroun',
            iconBg: 'bg-violet-100',
            iconColor: 'text-violet-600',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
        {
            title: 'Email',
            content: 'contact@studam.edu',
            iconBg: 'bg-violet-100',
            iconColor: 'text-violet-600',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            title: 'Telephone',
            content: '+237 6XX XX XX XX',
            iconBg: 'bg-violet-100',
            iconColor: 'text-violet-600',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a2 2 0 011.94 1.515l.57 2.279a2 2 0 01-.45 1.85l-1.2 1.2a16 16 0 006.3 6.3l1.2-1.2a2 2 0 011.85-.45l2.279.57A2 2 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            )
        },
        {
            title: 'Horaires',
            content: 'Lun-Ven: 8h00-18h00',
            iconBg: 'bg-violet-100',
            iconColor: 'text-violet-600',
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22a10 10 0 100-20 10 10 0 000 20z" />
                </svg>
            )
        }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nom.trim()) newErrors.nom = 'Le nom du responsable est requis';
        if (!formData.poste.trim()) newErrors.poste = 'Le poste est requis';

        if (!formData.email.trim()) {
            newErrors.email = 'L\'email professionnel est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Format d\'email invalide';
        }

        if (!formData.telephone.trim()) {
            newErrors.telephone = 'Le téléphone est requis';
        } else if (!/^\+?[\d\s()-]{8,}$/.test(formData.telephone)) {
            newErrors.telephone = 'Format de telephone invalide';
        }

        if (!formData.etablissement.trim()) newErrors.etablissement = 'Le nom de l\'établissement est requis';
        if (!formData.ville.trim()) newErrors.ville = 'La ville est requise';

        if (!formData.effectifEleves) {
            newErrors.effectifEleves = 'L\'effectif est requis';
        } else if (Number(formData.effectifEleves) <= 0) {
            newErrors.effectifEleves = 'L\'effectif doit être superieur a 0';
        }

        if (!formData.besoin) newErrors.besoin = 'Selectionnez le type de demande';
        if (!formData.delai) newErrors.delai = 'Selectionnez un delai de deploiement';

        if (!formData.message.trim()) {
            newErrors.message = 'Le message est requis';
        } else if (formData.message.trim().length < 20) {
            newErrors.message = 'Le message doit contenir au moins 20 caractères';
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
            await new Promise((resolve) => setTimeout(resolve, 1800));
            console.log('Demande de contact envoyée:', formData);
            setIsSubmitted(true);
            window.alert("Votre dossier est en cours d'étude , nous vous contacterons .");
            setFormData(initialFormData);
            setErrors({});
        } catch (error) {
            console.error('Erreur lors de la simulation d\'envoi:', error);
            setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
        } finally {
            setIsLoading(false);
        }
    };

    const inputBase = 'w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-4 transition-all';

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-violet-800 via-indigo-900 to-slate-900 text-white py-32 md:py-40">
                <div className="absolute inset-0 bg-[url('/contact/hero-presence-bg.svg')] bg-cover bg-center opacity-45" />
                <div className="absolute inset-0 bg-gradient-to-br from-violet-900/70 via-indigo-900/75 to-slate-950/80" />

                <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-5">Parlons de votre projet d&apos;etablissement</h1>
                    <p className="text-xl text-violet-100 max-w-3xl mx-auto leading-relaxed">
                        Vous gérez une ecole, une académie ou un institut ? Demandez une demo STUDAM, un devis ou des informations techniques détaillées.
                    </p>
                </div>
            </section>

            <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-12">
                {/* Info Cards */}
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
                </div>

                {/* Formulaire */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
                    {isSubmitted ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Demande enregistrée</h3>
                            <p className="text-slate-600 mb-8">Votre dossier est en cours d&apos;&eacute;tude , nous vous contacterons .</p>
                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="text-violet-600 font-medium hover:text-violet-700 underline"
                            >
                                Soumettre un nouveau dossier
                            </button>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Demande d&apos;informations / achat</h2>
                            <p className="text-slate-500 mb-8">Remplissez ce formulaire pour etre contacté par notre équipe commerciale.</p>

                            {errors.general && <p className="mb-4 text-sm text-red-600">{errors.general}</p>}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="nom" className="block text-sm font-bold text-slate-700 mb-2">Nom du responsable *</label>
                                        <input
                                            type="text"
                                            id="nom"
                                            name="nom"
                                            value={formData.nom}
                                            onChange={handleChange}
                                            className={`${inputBase} ${errors.nom ? 'border-red-300 ring-red-200' : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'}`}
                                            placeholder="Ex: Jean Dupont"
                                        />
                                        {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="poste" className="block text-sm font-bold text-slate-700 mb-2">Fonction *</label>
                                        <input
                                            type="text"
                                            id="poste"
                                            name="poste"
                                            value={formData.poste}
                                            onChange={handleChange}
                                            className={`${inputBase} ${errors.poste ? 'border-red-300 ring-red-200' : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'}`}
                                            placeholder="Ex: Proviseur / Directeur"
                                        />
                                        {errors.poste && <p className="mt-1 text-sm text-red-500">{errors.poste}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">Email professionnel *</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`${inputBase} ${errors.email ? 'border-red-300 ring-red-200' : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'}`}
                                            placeholder="contact@mon-ecole.edu"
                                        />
                                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="telephone" className="block text-sm font-bold text-slate-700 mb-2">Telephone *</label>
                                        <input
                                            type="tel"
                                            id="telephone"
                                            name="telephone"
                                            value={formData.telephone}
                                            onChange={handleChange}
                                            className={`${inputBase} ${errors.telephone ? 'border-red-300 ring-red-200' : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'}`}
                                            placeholder="+237 6XX XX XX XX"
                                        />
                                        {errors.telephone && <p className="mt-1 text-sm text-red-500">{errors.telephone}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="etablissement" className="block text-sm font-bold text-slate-700 mb-2">Nom de l&apos;etablissement *</label>
                                        <input
                                            type="text"
                                            id="etablissement"
                                            name="etablissement"
                                            value={formData.etablissement}
                                            onChange={handleChange}
                                            className={`${inputBase} ${errors.etablissement ? 'border-red-300 ring-red-200' : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'}`}
                                            placeholder="Ex: Lycee Moderne de Yaounde"
                                        />
                                        {errors.etablissement && <p className="mt-1 text-sm text-red-500">{errors.etablissement}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="ville" className="block text-sm font-bold text-slate-700 mb-2">Ville *</label>
                                        <input
                                            type="text"
                                            id="ville"
                                            name="ville"
                                            value={formData.ville}
                                            onChange={handleChange}
                                            className={`${inputBase} ${errors.ville ? 'border-red-300 ring-red-200' : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'}`}
                                            placeholder="Ex: Yaounde"
                                        />
                                        {errors.ville && <p className="mt-1 text-sm text-red-500">{errors.ville}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="effectifEleves" className="block text-sm font-bold text-slate-700 mb-2">Nombre d&apos;eleves *</label>
                                        <input
                                            type="number"
                                            id="effectifEleves"
                                            name="effectifEleves"
                                            min="1"
                                            value={formData.effectifEleves}
                                            onChange={handleChange}
                                            className={`${inputBase} ${errors.effectifEleves ? 'border-red-300 ring-red-200' : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'}`}
                                            placeholder="Ex: 1200"
                                        />
                                        {errors.effectifEleves && <p className="mt-1 text-sm text-red-500">{errors.effectifEleves}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="besoin" className="block text-sm font-bold text-slate-700 mb-2">Type de demande *</label>
                                        <select
                                            id="besoin"
                                            name="besoin"
                                            value={formData.besoin}
                                            onChange={handleChange}
                                            className={`${inputBase} ${errors.besoin ? 'border-red-300 ring-red-200' : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'}`}
                                        >
                                            <option value="">Selectionner...</option>
                                            <option value="informations">Informations détaillées</option>
                                            <option value="demo">Demande de demonstration</option>
                                            <option value="devis">Demande de devis / achat</option>
                                        </select>
                                        {errors.besoin && <p className="mt-1 text-sm text-red-500">{errors.besoin}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="budget" className="block text-sm font-bold text-slate-700 mb-2">Budget estimé</label>
                                        <select
                                            id="budget"
                                            name="budget"
                                            value={formData.budget}
                                            onChange={handleChange}
                                            className={`${inputBase} border-slate-200 focus:border-violet-500 focus:ring-violet-200`}
                                        >
                                            <option value="">Selectionner...</option>
                                            <option value="moins-1m">Moins de 1 000 000 FCFA</option>
                                            <option value="1m-5m">1 000 000 - 5 000 000 FCFA</option>
                                            <option value="5m-15m">5 000 000 - 15 000 000 FCFA</option>
                                            <option value="plus-15m">Plus de 15 000 000 FCFA</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="delai" className="block text-sm font-bold text-slate-700 mb-2">Delai souhaite de deploiement *</label>
                                        <select
                                            id="delai"
                                            name="delai"
                                            value={formData.delai}
                                            onChange={handleChange}
                                            className={`${inputBase} ${errors.delai ? 'border-red-300 ring-red-200' : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'}`}
                                        >
                                            <option value="">Selectionner...</option>
                                            <option value="immediat">Immediat (moins de 1 mois)</option>
                                            <option value="court">Court terme (1 a 3 mois)</option>
                                            <option value="moyen">Moyen terme (3 a 6 mois)</option>
                                            <option value="long">Long terme (plus de 6 mois)</option>
                                        </select>
                                        {errors.delai && <p className="mt-1 text-sm text-red-500">{errors.delai}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-bold text-slate-700 mb-2">Votre besoin en detail *</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="5"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className={`${inputBase} resize-none ${errors.message ? 'border-red-300 ring-red-200' : 'border-slate-200 focus:border-violet-500 focus:ring-violet-200'}`}
                                        placeholder="Precisez votre contexte: nombre de sites, classes, contraintes, objectifs de deployment..."
                                    />
                                    {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
                                </div>

                                <p className="text-xs text-slate-500">* Champs obligatoires</p>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-violet-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-500/50 disabled:opacity-50 transition-all shadow-lg"
                                >
                                    {isLoading ? 'Envoi en cours...' : 'Envoyer la demande'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
