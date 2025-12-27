"use client";

import Link from 'next/link';
import { useState } from 'react';
import authService from '../../../services/authService';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Format d'email invalide");
            return;
        }
        setIsLoading(true);

        try {
            await authService.forgotPassword(email.trim().toLowerCase());
            setIsSubmitted(true);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setEmail(e.target.value);
        if (error) {
            setError('');
        }
    };

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
                            Mot de passe oublié
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {isSubmitted
                                ? "Vérifiez votre boîte email"
                                : "Entrez votre adresse email pour recevoir un lien de réinitialisation"
                            }
                        </p>
                    </div>

                    {isSubmitted ? (
                        /* Message de confirmation */
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                </svg>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Email envoyé !
                            </h3>

                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>.
                                <br />
                                Cliquez sur le lien dans l&apos; email pour créer un nouveau mot de passe.
                            </p>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-700">
                                            <strong>Note :</strong> Vérifiez également votre dossier spam si vous ne recevez pas l&apos; email.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => {
                                        setIsSubmitted(false);
                                        setEmail('');
                                    }}
                                    className="w-full bg-[#F26419] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#E55A1A] transition-colors"
                                >
                                    Renvoyer l&apos; email
                                </button>

                                <Link
                                    href="/auth/login"
                                    className="block w-full text-center border-2 border-[#1B396A] text-[#1B396A] px-6 py-3 rounded-lg font-medium hover:bg-[#1B396A] hover:text-white transition-colors"
                                >
                                    Retour à la connexion
                                </Link>
                            </div>
                        </div>
                    ) : (
                        /* Formulaire de demande */
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Message d'erreur */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Adresse email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={handleChange}
                                    className={`appearance-none relative block w-full px-3 py-3 border ${error ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:border-[#F26419] focus:z-10 sm:text-sm transition-colors`}
                                    placeholder="Entrez votre adresse email"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#F26419] to-[#FF7A47] hover:from-[#E55A1A] hover:to-[#F26419] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F26419] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Envoi en cours...
                                    </div>
                                ) : (
                                    'Envoyer le lien de réinitialisation'
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
                    )}

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