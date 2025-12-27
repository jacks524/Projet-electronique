"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../../../context/authContext';
import departmentService from '../../../../services/departmentService';
import userService from '../../../../services/userService';
import toast from 'react-hot-toast';

export default function CreateUser() {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuthContext();

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingDepartments, setLoadingDepartments] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        phoneNumber: '',
        password: '',
        password_confirmation: '',
        role: 'TEACHER',
        departmentId: '',
        matricule: '',
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };


    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) { router.push('/auth/login'); return; }

        const loadInitialData = async () => {
            try {
                setLoadingDepartments(true);
                const depts = await departmentService.getAll();
                setDepartments(depts.map(d => ({ id: d.departmentId, nom: d.name, code: d.code })));
            } catch (error) {
                toast.error("Impossible de charger les départements.");
            } finally {
                setLoadingDepartments(false);
            }
        };
        loadInitialData();

    }, [isAuthenticated, authLoading, router]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (name === 'name' || name === 'email') {
            const nameValue = name === 'name' ? value : formData.name;
            const emailValue = name === 'email' ? value : formData.email;

            if (nameValue && emailValue) {
                const autoUsername = generateUsername(nameValue, emailValue);
                setFormData(prev => ({
                    ...prev,
                    [name]: value,
                    username: autoUsername
                }));
            }
        }

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const generateUsername = (name, email) => {
        const namePart = name.trim().toLowerCase().replace(/\s+/g, '');
        const emailPart = email.split('@')[0] || '';
        return (namePart.slice(0, 6) + emailPart.slice(0, 4)).replace(/[^a-z0-9]/g, '');
    };

    const validateForm = () => {
        const newErrors = {};

        // Validation nom
        if (!formData.name.trim()) {
            newErrors.name = "Le nom complet est requis";
        } else if (formData.name.trim().length < 2) {
            newErrors.name = "Le nom doit contenir au moins 2 caractères";
        }

        // Validation email
        if (!formData.email.trim()) {
            newErrors.email = "L'adresse email est requise";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "L'adresse email n'est pas valide";
        }

        // Validation username
        if (!formData.username.trim()) {
            newErrors.username = "Le nom d'utilisateur est requis";
        } else if (formData.username.length < 3) {
            newErrors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et tirets bas";
        }

        // Validation téléphone
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Le numéro de téléphone est requis";
        } else if (!/^[\+]?[0-9\s\-\(\)]{8,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
            newErrors.phoneNumber = "Le numéro de téléphone n'est pas valide";
        }

        // Validation mot de passe
        if (!formData.password) {
            newErrors.password = "Le mot de passe est requis";
        } else if (formData.password.length < 6) {
            newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre";
        }

        // Validation confirmation mot de passe
        if (!formData.password_confirmation) {
            newErrors.password_confirmation = "La confirmation du mot de passe est requise";
        } else if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = "Les mots de passe ne correspondent pas";
        }

        // Validation rôle
        if (!formData.role) {
            newErrors.role = "Le rôle est requis";
        }

        // Validation département pour les enseignants et chefs de département
        //if ((formData.role === 'TEACHER' || formData.role === 'DEPARTMENT_MANAGER') && !formData.departmentId) {
            //newErrors.departmentId = "Le département est requis pour ce rôle";
        //}

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Veuillez corriger les erreurs dans le formulaire.");
            return;
        }
        setLoading(true);
        setErrors({});

        try {
            await userService.register(formData);
            toast.success(`Utilisateur "${formData.name}" créé avec succès !`);
            router.push('/admin/users');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const roleOptions = [
        {
            value: 'TEACHER',
            label: 'Enseignant',
            description: 'Peut gérer ses cours et prendre les présences',
            icon: '🎓'
        },
        {
            value: 'DEPARTMENT_MANAGER',
            label: 'Chef de Département',
            description: 'Peut gérer un département et ses enseignants',
            icon: '👨‍💼'
        },
        {
            value:'ADMIN',
            label: 'Administrateur',
            description: 'Accès complet au système',
            icon: '⚙️'
        }
    ];

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-4">
                            <li>
                                <Link href="/admin/dashboard" className="text-gray-500 hover:text-[#F26419] transition-colors duration-200">
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                                    </svg>
                                </Link>
                            </li>
                            <li className="flex items-center">
                                <svg className="h-4 w-4 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <Link href="/admin/users" className="text-gray-500 hover:text-[#F26419] transition-colors duration-200">
                                    Utilisateurs
                                </Link>
                            </li>
                            <li className="flex items-center">
                                <svg className="h-4 w-4 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <span className="text-[#F26419] font-medium">Créer</span>
                            </li>
                        </ol>
                    </nav>
                    <h1 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Créer un nouvel utilisateur
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Ajoutez un nouvel administrateur, chef de département ou enseignant au système.
                    </p>
                </div>
            </div>


            {/* Formulaire */}
            <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-8">

                        {/* Section Informations personnelles */}
                        <div className="space-y-6">
                            <div className="border-b border-gray-200 pb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
                                        <p className="text-sm text-gray-500">Renseignez les informations de base de l&apos;utilisateur</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nom complet */}
                                <div className="space-y-2">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Nom complet <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7-7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-[#F26419] focus:border-transparent transition-all duration-200 ${
                                                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                            placeholder="Dr. Aminata Sow Fall"
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="text-sm text-red-600 flex items-center space-x-1">
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                            </svg>
                                            <span>{errors.name}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Adresse email <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                            </svg>
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-[#F26419] focus:border-transparent transition-all duration-200 ${
                                                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                            placeholder="aminata.sow@studam.edu"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-sm text-red-600 flex items-center space-x-1">
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                            </svg>
                                            <span>{errors.email}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Nom d'utilisateur */}
                                <div className="space-y-2">
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                        Nom d&apos;utilisateur <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            name="username"
                                            id="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-[#F26419] focus:border-transparent transition-all duration-200 ${
                                                errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                            placeholder="Généré automatiquement"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 flex items-center space-x-1">
                                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                                        </svg>
                                        <span>Généré automatiquement mais peut être modifié</span>
                                    </p>
                                    {errors.username && (
                                        <p className="text-sm text-red-600 flex items-center space-x-1">
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                            </svg>
                                            <span>{errors.username}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Téléphone */}
                                <div className="space-y-2">
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                        Numéro de téléphone <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            id="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-[#F26419] focus:border-transparent transition-all duration-200 ${
                                                errors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                            placeholder="+221 77 123 45 67"
                                        />
                                    </div>
                                    {errors.phoneNumber && (
                                        <p className="text-sm text-red-600 flex items-center space-x-1">
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                            </svg>
                                            <span>{errors.phoneNumber}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Matricule*/}
                                <div className="space-y-2">
                                    <label htmlFor="matricule" className="block text-sm font-medium text-gray-700">
                                        Matricule
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            name="matricule"
                                            id="matricule"
                                            value={formData.matricule}
                                            onChange={handleChange}
                                            className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-[#F26419] focus:border-transparent transition-all duration-200 ${
                                                errors.matricule ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                            placeholder="MAT-2024-001"
                                        />
                                    </div>
                                    {errors.matricule && (
                                        <p className="text-sm text-red-600 flex items-center space-x-1">
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                            </svg>
                                            <span>{errors.matricule}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section Rôle et Permissions */}
                        <div className="space-y-6">
                            <div className="border-b border-gray-200 pb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Rôle et permissions</h2>
                                        <p className="text-sm text-gray-500">Définissez le rôle et les accès de l&apos;utilisateur</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sélection de rôle moderne */}
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Rôle <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {roleOptions.map((option) => (
                                        <div key={option.value} className="relative">
                                            <input
                                                id={option.value}
                                                name="role"
                                                type="radio"
                                                value={option.value}
                                                checked={formData.role === option.value}
                                                onChange={handleChange}
                                                className="sr-only"
                                            />
                                            <label
                                                htmlFor={option.value}
                                                className={`cursor-pointer block p-4 border-2 rounded-xl transition-all duration-200 hover:shadow-md ${
                                                    formData.role === option.value
                                                        ? 'border-[#F26419] bg-orange-50 shadow-md'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <span className="text-2xl">{option.icon}</span>
                                                    <div className="flex-1">
                                                        <div className="flex items-center">
                                                            <span className="font-medium text-gray-900">{option.label}</span>
                                                            {formData.role === option.value && (
                                                                <svg className="ml-2 h-5 w-5 text-[#F26419]" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {errors.role && (
                                    <p className="text-sm text-red-600 flex items-center space-x-1">
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                        </svg>
                                        <span>{errors.role}</span>
                                    </p>
                                )}
                            </div>

                            {/* Département et Statut */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Département (conditionnel) */}
                                {(formData.role === 'TEACHER' || formData.role === 'DEPARTMENT_MANAGER') && (
                                    <div className="space-y-2">
                                        <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700">
                                            Département
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <select
                                                id="departmentId"
                                                name="departmentId"
                                                value={formData.departmentId}
                                                onChange={handleChange}
                                                disabled={loadingDepartments}
                                                className={`block w-full pl-10 pr-8 py-3 border rounded-xl focus:ring-2 focus:ring-[#F26419] focus:border-transparent transition-all duration-200 ${
                                                    errors.departmentId ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                                } ${loadingDepartments ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                            >
                                                <option value="">
                                                    {loadingDepartments ? 'Chargement...' : 'Sélectionner un département'}
                                                </option>
                                                {departments.map((dept) => (
                                                    <option key={dept.id} value={dept.id}>
                                                        {dept.nom} ({dept.code})
                                                    </option>
                                                ))}
                                            </select>
                                            {loadingDepartments && (
                                                <div className="absolute inset-y-0 right-8 flex items-center">
                                                    <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        {errors.departmentId && (
                                            <p className="text-sm text-red-600 flex items-center space-x-1">
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                                </svg>
                                                <span>{errors.departmentId}</span>
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Statut */}
                                <div className="space-y-2">
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                        Statut
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <div className={`h-2 w-2 rounded-full ${
                                                formData.status === 'active' ? 'bg-green-500' :
                                                    formData.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                                            }`}></div>
                                        </div>
                                        <select
                                            id="status"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="block w-full pl-8 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F26419] focus:border-transparent transition-all duration-200 hover:border-gray-400"
                                        >
                                            <option value="active">Actif</option>
                                            <option value="pending">En attente</option>
                                            <option value="inactive">Inactif</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section Sécurité */}
                        <div className="space-y-6">
                            <div className="border-b border-gray-200 pb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                                        <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
                                        <p className="text-sm text-gray-500">Définissez un mot de passe temporaire sécurisé</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Mot de passe */}
                                <div className="space-y-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Mot de passe <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            id="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-[#F26419] focus:border-transparent transition-all duration-200 ${
                                                errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                        >
                                            {showPassword ? (
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 00-.007.022m4.249 4.249l1.414 1.414M14.127 14.127a3 3 0 01-.007-.022m0 0l1.414 1.414m-1.414-1.414L8.464 8.464" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-red-600 flex items-center space-x-1">
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                            </svg>
                                            <span>{errors.password}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Confirmation mot de passe */}
                                <div className="space-y-2">
                                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                                        Confirmer le mot de passe <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="password_confirmation"
                                            id="password_confirmation"
                                            value={formData.password_confirmation}
                                            onChange={handleChange}
                                            className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-[#F26419] focus:border-transparent transition-all duration-200 ${
                                                errors.password_confirmation ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={toggleConfirmPasswordVisibility}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                        >
                                            {showConfirmPassword ? (
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 00-.007.022m4.249 4.249l1.414 1.414M14.127 14.127a3 3 0 01-.007-.022m0 0l1.414 1.414m-1.414-1.414L8.464 8.464" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && (
                                        <p className="text-sm text-red-600 flex items-center space-x-1">
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                            </svg>
                                            <span>{errors.password_confirmation}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Note importante avec design moderne */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-blue-800 mb-1">Information importante</h4>
                                        <p className="text-sm text-blue-700">
                                            L&apos;utilisateur recevra ses identifiants par email et devra changer son mot de passe lors de sa première connexion.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions avec design moderne */}
                    <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                        <div className="flex justify-end space-x-4">
                            <Link
                                href="/admin/users"
                                className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                            >
                                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Annuler
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-[#F26419] to-orange-500 hover:from-orange-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F26419] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Création en cours...
                                    </>
                                ) : (
                                    <>
                                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Créer l&apos;utilisateur
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <svg className="h-4 w-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Conseils et bonnes pratiques</h3>
                    </div>
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <span className="text-2xl">👥</span>
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Rôles et permissions</h4>
                                    <ul className="text-sm text-gray-600 space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <span className="text-green-500 mt-1">•</span>
                                            <span><strong>Enseignant</strong> : Gère ses cours et prend les présences</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <span className="text-blue-500 mt-1">•</span>
                                            <span><strong>Chef de Département</strong> : Supervise un département entier</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <span className="text-purple-500 mt-1">•</span>
                                            <span><strong>Administrateur</strong> : Accès complet au système</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <span className="text-2xl">✅</span>
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Bonnes pratiques</h4>
                                    <ul className="text-sm text-gray-600 space-y-2">
                                        <li className="flex items-start space-x-2">
                                            <span className="text-[#F26419] mt-1">•</span>
                                            <span>Utilisez l&apos;email institutionnel de l&apos;établissement</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <span className="text-[#F26419] mt-1">•</span>
                                            <span>Vérifiez que le département existe avant d&apos;assigner</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <span className="text-[#F26419] mt-1">•</span>
                                            <span>Informez l&apos;utilisateur de ses identifiants de connexion</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

