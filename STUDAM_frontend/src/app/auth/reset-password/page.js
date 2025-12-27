"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import authService from '../../../services/authService';
import toast from 'react-hot-toast';

function ResetPasswordComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [token, setToken] = useState(null);
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
        } else {
            toast.error("Token de réinitialisation manquant ou invalide.");
            router.push('/auth/login');
        }
    }, [searchParams, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.newPassword) {
            newErrors.newPassword = "Le nouveau mot de passe est requis.";
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = "Le mot de passe doit contenir au moins 6 caractères.";
        }
        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";
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
        setIsLoading(true);

        try {
            await authService.resetPassword(token, formData.newPassword);
            toast.success("Votre mot de passe a été réinitialisé avec succès !");
            setIsSuccess(true);
            setTimeout(() => {
                router.push('/auth/login');
            }, 3000);
        } catch (error) {
            toast.error(error.message || "La réinitialisation a échoué.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    </svg>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Mot de passe modifié !
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                    Votre mot de passe a été réinitialisé avec succès.
                    <br />
                    Vous allez être redirigé vers la page de connexion.
                </p>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-700">
                                <strong>Succès :</strong> Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                            </p>
                        </div>
                    </div>
                </div>

                <Link
                    href="/auth/login"
                    className="block w-full bg-[#F26419] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#E55A1A] transition-colors"
                >
                    Se connecter maintenant
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Messages d'erreur globaux */}
            {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">Veuillez corriger les erreurs ci-dessous</p>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe *
                </label>
                <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-3 py-3 border ${errors.newPassword ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:border-[#F26419] focus:z-10 sm:text-sm transition-colors`}
                    placeholder="Entrez votre nouveau mot de passe"
                    required
                />
                {errors.newPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        {errors.newPassword}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe *
                </label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`appearance-none relative block w-full px-3 py-3 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:border-[#F26419] focus:z-10 sm:text-sm transition-colors`}
                    placeholder="Confirmez votre nouveau mot de passe"
                    required
                />
                {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        {errors.confirmPassword}
                    </p>
                )}
            </div>

            {/* Indication de sécurité */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            <strong>Sécurité :</strong> Utilisez un mot de passe d&apos;au moins 6 caractères avec des lettres, chiffres et symboles.
                        </p>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading || !token}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#F26419] to-[#FF7A47] hover:from-[#E55A1A] hover:to-[#F26419] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F26419] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
                {isLoading ? (
                    <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Réinitialisation en cours...
                    </div>
                ) : (
                    'Réinitialiser le mot de passe'
                )}
            </button>

            <div className="text-center">
                <Link
                    href="/auth/login"
                    className="font-medium text-[#F26419] hover:text-[#E55A1A] underline text-sm"
                >
                    Retour à la page de connexion
                </Link>
            </div>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1B396A] to-[#2A5490] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 bg-gradient-to-r from-[#F26419] to-[#FF7A47] rounded-full flex items-center justify-center mb-4">
                            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-[#1B396A]">
                            STUDAM
                        </h1>
                        <h2 className="mt-4 text-xl font-semibold text-gray-900">
                            Créer un nouveau mot de passe
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Entrez votre nouveau mot de passe pour sécuriser votre compte
                        </p>
                    </div>

                    <Suspense fallback={
                        <div className="text-center py-8">
                            <div className="animate-spin h-8 w-8 mx-auto border-4 border-[#F26419] border-t-transparent rounded-full"></div>
                            <p className="mt-4 text-gray-600">Chargement...</p>
                        </div>
                    }>
                        <ResetPasswordComponent />
                    </Suspense>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-500">
                            © 2025 STUDAM - Système de gestion des présences
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Développé par Bioclass Innovators
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}