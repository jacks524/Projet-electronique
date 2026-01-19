"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../../../context/authContext';
import departmentService from '../../../../services/departmentService';
import userService from '../../../../services/userService';
import toast from 'react-hot-toast';

export default function CreateDepartment() {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [chiefSearchTerm, setChiefSearchTerm] = useState('');
    const [chiefSearchResults, setChiefSearchResults] = useState([]);
    const [selectedChief, setSelectedChief] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        departmentManagerId: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        const loadChiefs = async () => {
            try {
                const chiefs = await userService.getAvailableManagers();
                setAvailableChiefs(chiefs);
            } catch (error) {
                toast.error(error.message);
            }
        };
        loadChiefs();
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (chiefSearchTerm.length > 2) {
                try {
                    const results = await userService.searchUsers(chiefSearchTerm, 'name');
                    setChiefSearchResults(results);
                } catch (error) {
                    toast.error("Erreur lors de la recherche du chef.");
                }
            } else {
                setChiefSearchResults([]);
            }
        }, 300); // Délai de 300ms

        return () => clearTimeout(delayDebounceFn);
    }, [chiefSearchTerm]);

    const handleSelectChief = (chief) => {
        setSelectedChief(chief);
        setChiefSearchTerm(chief.name);
        setFormData(prev => ({ ...prev, departmentManagerId: chief.id }));
        setChiefSearchResults([]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'name') {
            const autoCode = value
                .toUpperCase()
                .replace(/[^A-Z\s]/g, '')
                .split(' ')
                .map(word => word.slice(0, 4))
                .join('')
                .slice(0, 8);

            setFormData(prev => ({
                ...prev,
                name: value,
                code: autoCode
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Le nom est requis";
        if (!formData.code.trim()) newErrors.code = "Le code est requis";
        if (!formData.description.trim()) newErrors.description = "La description est requise";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }
        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                code: formData.code,
                description: formData.description,
            };

            if (formData.departmentManagerId) {
                payload.departmentManagerId = formData.departmentManagerId;
            }
            await departmentService.create(payload);

            toast.success('Département créé avec succès !');
            router.push('/admin/departments');

        } catch (error) {
            toast.error(error.message || 'La création a échoué.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* En-tête moderne */}
                <div className="mb-8">
                    <nav className="flex items-center space-x-2 text-sm font-medium mb-6">
                        <Link href="/admin/dashboard" className="text-slate-500 hover:text-violet-600 transition-colors duration-200 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            </svg>
                            Dashboard
                        </Link>
                        <span className="text-slate-400">•</span>
                        <Link href="/admin/departments" className="text-slate-500 hover:text-violet-600 transition-colors duration-200">
                            Départements
                        </Link>
                        <span className="text-slate-400">•</span>
                        <span className="text-violet-600 font-semibold">Nouveau</span>
                    </nav>

                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl mb-4 shadow-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">
                            Créer un nouveau département
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Ajoutez un nouveau département académique avec ses informations essentielles
                        </p>
                    </div>
                </div>

                {/* Messages de notification */}
                {errors.general && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">{errors.general}</p>
                            </div>
                        </div>
                    </div>
                )}


                {/* Formulaire principal */}
                <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="space-y-8">

                            {/* Nom du département */}
                            <div className="group">
                                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                                    Nom du département *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:bg-white ${
                                            errors.name
                                                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                                : 'border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200'
                                        }`}
                                        placeholder="Ex: Sciences Informatiques et Technologies"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <svg className="w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                </div>
                                {errors.name && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                        </svg>
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Code du département */}
                            <div className="group">
                                <label htmlFor="code" className="block text-sm font-semibold text-slate-700 mb-2">
                                    Code du département *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="code"
                                        id="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-slate-900 placeholder-slate-400 uppercase font-mono transition-all duration-200 focus:outline-none focus:bg-white ${
                                            errors.code
                                                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                                : 'border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200'
                                        }`}
                                        placeholder="SCITECH"
                                        maxLength="8"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <svg className="w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                        </svg>
                                    </div>
                                </div>
                                {errors.code && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                        </svg>
                                        {errors.code}
                                    </p>
                                )}
                                <p className="mt-2 text-xs text-slate-500 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Code unique généré automatiquement, modifiable (2-8 caractères)
                                </p>
                            </div>

                            {/* Description */}
                            <div className="group">
                                <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                                    Description *
                                </label>
                                <div className="relative">
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={4}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:bg-white resize-none ${
                                            errors.description
                                                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                                : 'border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200'
                                        }`}
                                        placeholder="Décrivez la mission, les objectifs et les domaines d'expertise de ce département. Cette description aidera à identifier clairement le rôle et les responsabilités du département au sein de l'établissement..."
                                    />
                                    <div className="absolute top-3 right-3">
                                        <svg className="w-5 h-5 text-slate-400 group-focus-within:text-violet-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                        </svg>
                                    </div>
                                </div>
                                {errors.description && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                        </svg>
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="group">
                                <label htmlFor="chiefSearch" className="block text-sm font-semibold text-slate-700 mb-2">
                                    Chef de département
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="chiefSearch"
                                        value={chiefSearchTerm}
                                        onChange={(e) => {
                                            setChiefSearchTerm(e.target.value);
                                            setSelectedChief(null); // Réinitialiser si l'utilisateur change le texte
                                            setFormData(prev => ({...prev, departmentManagerId: ''}));
                                        }}
                                        className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:bg-white resize-none`}
                                        placeholder="Tapez un nom pour rechercher..."
                                    />
                                    {/* Affichage des résultats de recherche */}
                                    {chiefSearchResults.length > 0 && (
                                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto">
                                            {chiefSearchResults.map((chief) => (
                                                <li
                                                    key={chief.id}
                                                    onClick={() => handleSelectChief(chief)}
                                                    className="px-4 py-2 hover:bg-violet-100 cursor-pointer"
                                                >
                                                    {chief.name} ({chief.email})
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                {errors.departmentManagerId && <p className="mt-2 text-sm text-red-600">{errors.departmentManagerId}</p>}
                            </div>

                        </div>



                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-slate-200">
                            <Link
                                href="/admin/departments"
                                className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 text-center border-2 border-slate-200 hover:border-slate-300"
                            >
                                Annuler
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Création en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span>Créer le département</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Conseils d'aide */}
                <div className="mt-8 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-blue-900 mb-3">
                                Conseils pour la création
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                                <div className="space-y-2">
                                    <p className="font-medium">✓ Nom du département</p>
                                    <p>Choisissez un nom clair et descriptif qui reflète la mission</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="font-medium">✓ Code unique</p>
                                    <p>Le code est généré automatiquement mais reste modifiable</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="font-medium">✓ Description complète</p>
                                    <p>Décrivez clairement les objectifs et domaines d&apos;expertise</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="font-medium">✓ Évolutif</p>
                                    <p>Vous pourrez modifier ces informations après création</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
