"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../../../../context/authContext';
import departmentService from '../../../../../services/departmentService';
import userService from '../../../../../services/userService';
import toast from 'react-hot-toast';

export default function EditDepartment() {
    const router = useRouter();
    const params = useParams();
    const departmentId = params.id;
    const { isAuthenticated, loading: authLoading } = useAuthContext();

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        departmentManagerId: '',
    });

    const [chiefSearchTerm, setChiefSearchTerm] = useState('');
    const [chiefSearchResults, setChiefSearchResults] = useState([]);
    const [selectedChiefName, setSelectedChiefName] = useState('');

    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!departmentId || !isAuthenticated) return;

        const loadInitialData = async () => {
            try {
                setLoading(true);
                const deptData = await departmentService.getById(departmentId);

                setFormData({
                    name: deptData.name || '',
                    code: deptData.code || '',
                    description: deptData.description || '',
                    departmentManagerId: deptData.departmentManager ? deptData.departmentManager.id : '',
                });

                if (deptData.departmentManager) {
                    const managerName = deptData.departmentManager.name;
                    setSelectedChiefName(managerName);
                    setChiefSearchTerm(managerName);
                }
            } catch (error) {
                toast.error("Impossible de charger les données du département.");
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [isAuthenticated, departmentId]);

    useEffect(() => {
        const debounce = setTimeout(async () => {
            if (chiefSearchTerm.length > 2 && chiefSearchTerm !== selectedChiefName) {
                const results = await userService.searchUsers(chiefSearchTerm, 'name');
                setChiefSearchResults(results);
            } else {
                setChiefSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(debounce);
    }, [chiefSearchTerm, selectedChiefName]);


    useEffect(() => {
        const debounce = setTimeout(async () => {
            if (chiefSearchTerm.length > 2 && chiefSearchTerm !== selectedChiefName) {
                const results = await userService.searchUsers(chiefSearchTerm, 'name');
                setChiefSearchResults(results);
            } else {
                setChiefSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(debounce);
    }, [chiefSearchTerm, selectedChiefName]);

    const handleSelectChief = (chief) => {
        setFormData(prev => ({ ...prev, departmentManagerId: chief.id }));
        setSelectedChiefName(chief.name);
        setChiefSearchTerm(chief.name);
        setChiefSearchResults([]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const newErrors = {};

        // Validation nom
        if (!formData.name.trim()) {
            newErrors.name = "Le nom du département est requis";
        } else if (formData.name.trim().length < 3) {
            newErrors.name = "Le nom doit contenir au moins 3 caractères";
        }

        // Validation code
        if (!formData.code.trim()) {
            newErrors.code = "Le code du département est requis";
        } else if (formData.code.length < 2 || formData.code.length > 8) {
            newErrors.code = "Le code doit contenir entre 2 et 8 caractères";
        } else if (!/^[A-Z0-9]+$/.test(formData.code)) {
            newErrors.code = "Le code ne peut contenir que des lettres majuscules et des chiffres";
        }

        // Validation description
        if (!formData.description.trim()) {
            newErrors.description = "La description est requise";
        } else if (formData.description.trim().length < 10) {
            newErrors.description = "La description doit contenir au moins 10 caractères";
        }

        // Validation email (optionnel mais doit être valide si fourni)
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "L'adresse email n'est pas valide";
        }

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
            await departmentService.update(departmentId, formData);
            toast.success('Département mis à jour avec succès !');
            router.push(`/admin/departments/${departmentId}`);
        } catch (error) {
            toast.error(error.message || 'La mise à jour a échoué.');
        } finally {
            setLoading(false);
        }
    };

    if (loading||authLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement des données...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="bg-white shadow-sm border-b border-gray-200 -mx-6 -mt-6 px-6 pt-6 pb-8">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex-1 min-w-0">
                        <nav className="flex mb-6" aria-label="Breadcrumb">
                            <ol className="flex items-center space-x-2">
                                <li>
                                    <Link href="/admin/dashboard" className="text-gray-500 hover:text-[#7c3aed] transition-all duration-200 hover:scale-105">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                                        </svg>
                                    </Link>
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    <Link href="/admin/departments" className="text-gray-500 hover:text-[#7c3aed] transition-all duration-200 font-medium">
                                        Départements
                                    </Link>
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    <Link href={`/admin/departments/${departmentId}`} className="text-gray-500 hover:text-[#7c3aed] transition-all duration-200 font-medium">
                                        {formData.name}
                                    </Link>
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    <span className="text-[#7c3aed] font-semibold">Modifier</span>
                                </li>
                            </ol>
                        </nav>
                        <div className="mt-4">
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-[#7c3aed] to-violet-500 rounded-lg flex items-center justify-center mr-4">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                </div>
                                Modifier le département
                            </h1>
                            <p className="mt-2 text-lg text-gray-600">
                                Modifiez les informations du département <span className="font-semibold text-[#7c3aed]">{formData.name}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {errors.general && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-red-800">{errors.general}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Formulaire */}
            <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="px-8 py-8">
                        <div className="space-y-12">

                            {/* Informations de base */}
                            <div>
                                <div className="flex items-center mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            Informations de base
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Modifiez les informations principales du département
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                                    {/* Nom du département */}
                                    <div className="group">
                                        <label htmlFor="nom" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Nom du département *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="name"
                                                id="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={`block w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 
                                                        ${errors.name
                                                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-200 bg-gray-50 focus:border-[#7c3aed] focus:ring-[#7c3aed] focus:bg-white'
                                                } 
                                                        text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-20`}
                                                placeholder="Ex: Informatique et Technologies"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <svg className={`w-5 h-5 ${errors.name ? 'text-red-400' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
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
                                        <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Code du département *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="code"
                                                id="code"
                                                value={formData.code}
                                                onChange={handleChange}
                                                className={`block w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 uppercase font-mono
                                                        ${errors.code
                                                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-200 bg-gray-50 focus:border-[#7c3aed] focus:ring-[#7c3aed] focus:bg-white'
                                                } 
                                                        text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-20`}
                                                placeholder="INFO"
                                                maxLength="8"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-xs text-gray-400 font-mono">{formData.code.length}/8</span>
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
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mt-8">
                                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <div className="relative">
                                            <textarea
                                                id="description"
                                                name="description"
                                                rows={4}
                                                value={formData.description}
                                                onChange={handleChange}
                                                className={`block w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 resize-none
                                                    ${errors.description
                                                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500'
                                                    : 'border-gray-200 bg-gray-50 focus:border-[#7c3aed] focus:ring-[#7c3aed] focus:bg-white'
                                                } 
                                                    text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-20`}
                                                placeholder="Décrivez la mission, les objectifs et les domaines d'expertise de ce département..."
                                            />
                                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                            {formData.description.length} caractères
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
                            </div>

                            {/* Gestion et contact */}
                            <div>
                                <div className="flex items-center mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            Gestion et contact
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Informations de direction et de contact du département
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                                    <div className="group">
                                        <label htmlFor="chief-search" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Chef de département
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="chief-search"
                                                value={chiefSearchTerm}
                                                onChange={(e) => {
                                                    setChiefSearchTerm(e.target.value);
                                                    if (e.target.value !== selectedChiefName) {
                                                        setFormData(prev => ({ ...prev, departmentManagerId: '' }));
                                                    }
                                                }}
                                                placeholder="Rechercher par nom..."
                                                className="block w-full px-4 py-3 border-2 border-gray-200 bg-gray-50 rounded-xl transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-opacity-20 focus:border-[#7c3aed] focus:bg-white appearance-none"
                                            />

                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                </svg>
                                            </div>
                                            {chiefSearchResults.length > 0 && (
                                                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
                                                    {chiefSearchResults.map((chief) => (
                                                        <li
                                                            key={chief.id}
                                                            onClick={() => handleSelectChief(chief)}
                                                            className="px-4 py-3 cursor-pointer hover:bg-violet-50"
                                                        >
                                                            <p className="font-medium text-gray-900">{chief.name}</p>
                                                            <p className="text-sm text-gray-500">{chief.email}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        {errors.departmentManagerId && <p className="mt-2 text-sm text-red-600">{errors.departmentManagerId}</p>}
                                    </div>
                                </div>
                            </div>


                            {/* Email */}
                            <div className="group">
                                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-3">
                                    Email du département
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`block w-full px-6 py-4 border-2 rounded-2xl transition-all duration-300 text-gray-900 placeholder-gray-400 shadow-lg hover:shadow-xl focus:shadow-2xl transform hover:-translate-y-1 focus:-translate-y-1
                                                            ${errors.email
                                            ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-200 bg-white/80 focus:border-[#7c3aed] focus:ring-[#7c3aed] hover:border-gray-300'
                                        } 
                                                            focus:outline-none focus:ring-4 focus:ring-opacity-20`}
                                        placeholder="info@studam.edu"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <svg className={`w-5 h-5 ${errors.email ? 'text-red-400' : 'text-gray-300 group-hover:text-[#7c3aed] group-focus-within:text-[#7c3aed]'} transition-colors duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                                        </svg>
                                    </div>
                                </div>
                                {errors.email && (
                                    <div className="mt-3 flex items-center text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                        </svg>
                                        <span className="text-sm font-medium">{errors.email}</span>
                                    </div>
                                )}
                            </div>

                            {/* Téléphone */}
                            <div className="group">
                                <label htmlFor="telephone" className="block text-sm font-bold text-gray-700 mb-3">
                                    Téléphone
                                </label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        name="telephone"
                                        id="telephone"
                                        value={formData.telephone}
                                        onChange={handleChange}
                                        className="block w-full px-6 py-4 border-2 border-gray-200 bg-white/80 rounded-2xl transition-all duration-300 text-gray-900 placeholder-gray-400 shadow-lg hover:shadow-xl focus:shadow-2xl transform hover:-translate-y-1 focus:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[#7c3aed] focus:ring-opacity-20 focus:border-[#7c3aed] hover:border-gray-300"
                                        placeholder="+237 679865432"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-300 group-hover:text-[#7c3aed] group-focus-within:text-[#7c3aed] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Adresse */}
                            <div className="group lg:col-span-2">
                                <label htmlFor="adresse" className="block text-sm font-bold text-gray-700 mb-3">
                                    Adresse physique
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="adresse"
                                        id="adresse"
                                        value={formData.adresse}
                                        onChange={handleChange}
                                        className="block w-full px-6 py-4 border-2 border-gray-200 bg-white/80 rounded-2xl transition-all duration-300 text-gray-900 placeholder-gray-400 shadow-lg hover:shadow-xl focus:shadow-2xl transform hover:-translate-y-1 focus:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[#7c3aed] focus:ring-opacity-20 focus:border-[#7c3aed] hover:border-gray-300"
                                        placeholder="Bâtiment A, 2ème étage, Campus Principal"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-300 group-hover:text-[#7c3aed] group-focus-within:text-[#7c3aed] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-4 py-4 sm:px-6 flex justify-end space-x-3">
                        <Link
                            href={`/admin/departments/${departmentId}`}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7c3aed]"
                        >
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#7c3aed] hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Mise à jour...
                                </>
                            ) : (
                                'Mettre à jour'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-12 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-100/50 to-yellow-100/50 rounded-3xl blur-3xl"></div>
                <div className="relative bg-gradient-to-r from-amber-50/80 to-yellow-50/80 backdrop-blur-xl border border-amber-200/30 rounded-3xl p-8">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mr-4">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-amber-900">
                            Informations importantes
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50">
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                </div>
                                <h4 className="text-lg font-bold text-amber-900">Changement de chef</h4>
                            </div>
                            <ul className="space-y-2 text-amber-800">
                                <li className="flex items-center">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                                    Le changement de chef sera effectif immédiatement
                                </li>
                                <li className="flex items-center">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                                    L&apos;ancien chef sera notifié automatiquement
                                </li>
                                <li className="flex items-center">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                                    Les permissions seront transférées
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50">
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                                <h4 className="text-lg font-bold text-amber-900">Modification du statut</h4>
                            </div>
                            <ul className="space-y-2 text-amber-800">
                                <li className="flex items-center">
                                    <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                                    Un département inactif masque ses cours
                                </li>
                                <li className="flex items-center">
                                    <div className="w-2 h-2 bg-violet-400 rounded-full mr-3"></div>
                                    Les enseignants ne peuvent plus prendre de présences
                                </li>
                                <li className="flex items-center">
                                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                                    Les étudiants gardent leur accès en lecture
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}