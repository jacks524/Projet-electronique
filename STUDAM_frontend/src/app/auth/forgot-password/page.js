"use client";

import Link from 'next/link';
import { useState } from 'react';

// Illustration pour mot de passe oublié
const ForgotPasswordIllustration = () => (
  <svg className="w-full h-auto max-w-md mx-auto" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="250" cy="250" r="180" fill="white" fillOpacity="0.08"/>
    <circle cx="250" cy="250" r="140" fill="white" fillOpacity="0.12"/>
    
    {/* Enveloppe principale */}
    <g transform="translate(150, 180)">
      <rect x="0" y="40" width="200" height="140" rx="8" fill="white" opacity="0.95"/>
      <path d="M 0,40 L 100,120 L 200,40" fill="#E9D5FF" opacity="0.8"/>
      <path d="M 0,40 L 100,120 L 200,40" stroke="#8B5CF6" strokeWidth="3" fill="none"/>
      
      {/* Lignes de texte dans l'enveloppe */}
      <line x1="30" y1="90" x2="170" y2="90" stroke="#C084FC" strokeWidth="3" strokeLinecap="round"/>
      <line x1="30" y1="110" x2="150" y2="110" stroke="#DDD6FE" strokeWidth="3" strokeLinecap="round"/>
      <line x1="30" y1="130" x2="160" y2="130" stroke="#E9D5FF" strokeWidth="2" strokeLinecap="round"/>
    </g>
    
    {/* Cadenas avec clé */}
    <g transform="translate(220, 260)">
      <rect x="0" y="20" width="60" height="50" rx="8" fill="#A855F7" opacity="0.9"/>
      <circle cx="30" cy="10" r="20" stroke="#8B5CF6" strokeWidth="4" fill="none"/>
      <circle cx="30" cy="45" r="6" fill="white">
        <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
      </circle>
    </g>
    
    {/* Clé flottante */}
    <g transform="translate(320, 240)">
      <circle cx="0" cy="0" r="12" fill="#FBBF24">
        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="4s" repeatCount="indefinite"/>
      </circle>
      <rect x="8" y="-3" width="35" height="6" rx="3" fill="#FBBF24"/>
      <rect x="35" y="-8" width="6" height="6" fill="#FBBF24"/>
      <rect x="40" y="-8" width="6" height="6" fill="#FBBF24"/>
    </g>
    
    {/* Particules flottantes */}
    <circle cx="120" cy="150" r="4" fill="#C084FC" opacity="0.6">
      <animate attributeName="cy" values="150;140;150" dur="3s" repeatCount="indefinite"/>
    </circle>
    <circle cx="380" cy="180" r="5" fill="#A855F7" opacity="0.5">
      <animate attributeName="cy" values="180;170;180" dur="2.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="140" cy="330" r="3" fill="#DDD6FE" opacity="0.7">
      <animate attributeName="cy" values="330;320;330" dur="3.5s" repeatCount="indefinite"/>
    </circle>
  </svg>
);

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

        // Simulation - remplacer par authService.forgotPassword(email)
        setTimeout(() => {
            setIsSubmitted(true);
            setIsLoading(false);
        }, 1500);
    };

    const handleChange = (e) => {
        setEmail(e.target.value);
        if (error) setError('');
    };

    return (
        <div className="min-h-screen flex bg-slate-900">
            {/* Colonne gauche - Formulaire */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-[45%] xl:w-[40%] bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 z-10 relative">
                <div className="mx-auto w-full max-w-sm lg:max-w-md">
                    <div className="mb-12">
                        <Link href="/" className="flex items-center space-x-2 group mb-8">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">
                                STUDAM<span className="text-violet-500">.</span>
                            </span>
                        </Link>
                        <h2 className="text-4xl font-bold text-white mb-3">
                            {isSubmitted ? "Check your email" : "Forgot Password"}
                        </h2>
                        <p className="text-slate-400 text-sm">
                            {isSubmitted
                                ? "We've sent you a reset link"
                                : "Enter your email to receive a reset link"}
                        </p>
                    </div>

                    {isSubmitted ? (
                        <div className="space-y-6">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 backdrop-blur-sm">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-green-400">Email sent successfully!</h3>
                                        <p className="mt-2 text-sm text-slate-300">
                                            We've sent a reset link to <strong className="text-white">{email}</strong>. 
                                            Click the link in the email to create a new password.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 backdrop-blur-sm">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                    <p className="ml-3 text-sm text-blue-300">
                                        Don't forget to check your spam folder
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => { setIsSubmitted(false); setEmail(''); }}
                                className="w-full py-3.5 px-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-all duration-200"
                            >
                                Resend email
                            </button>

                            <Link
                                href="/auth/login"
                                className="block w-full text-center py-3.5 px-4 bg-purple-600 rounded-xl text-white font-semibold hover:bg-purple-700 transition-all duration-200 shadow-lg shadow-purple-600/30"
                            >
                                Back to login
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 backdrop-blur-sm">
                                    <div className="flex">
                                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                        </svg>
                                        <p className="ml-3 text-sm text-red-300">{error}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="sr-only">Email address</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3.5 bg-white/5 backdrop-blur-sm border ${error ? 'border-red-500' : 'border-white/10'} rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-200`}
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="w-full py-3.5 px-4 bg-purple-600 rounded-xl text-white font-semibold hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/30 hover:scale-[1.02]"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    'Send reset link'
                                )}
                            </button>

                            <div className="text-center">
                                <Link
                                    href="/auth/login"
                                    className="text-sm text-slate-400 hover:text-purple-400 transition-colors"
                                >
                                    Back to login
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Colonne droite - Illustration */}
            <div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-purple-600 via-purple-500 to-violet-600 overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-transparent to-violet-700/30"/>
                <div className="absolute top-1/4 -right-24 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"/>
                <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}/>
                
                <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 py-16">
                    <div className="max-w-2xl w-full">
                        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
                            <div className="text-center mb-8">
                                <h2 className="text-5xl font-bold text-white mb-3">
                                    Don't worry!
                                </h2>
                                <p className="text-purple-100 text-lg">
                                    We'll help you reset your password
                                </p>
                            </div>
                            <ForgotPasswordIllustration />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}