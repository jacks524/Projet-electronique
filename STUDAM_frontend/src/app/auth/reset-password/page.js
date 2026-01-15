"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Illustration pour reset password
const ResetPasswordIllustration = () => (
  <svg className="w-full h-auto max-w-md mx-auto" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="250" cy="250" r="180" fill="white" fillOpacity="0.08"/>
    <circle cx="250" cy="250" r="140" fill="white" fillOpacity="0.12"/>
    
    {/* Bouclier de sécurité */}
    <g transform="translate(180, 150)">
      <path d="M 70,0 L 140,30 L 140,120 Q 140,180 70,220 Q 0,180 0,120 L 0,30 Z" fill="white" opacity="0.95"/>
      <path d="M 70,20 L 120,40 L 120,110 Q 120,155 70,185 Q 20,155 20,110 L 20,40 Z" fill="#E9D5FF"/>
      
      {/* Check mark animé */}
      <g transform="translate(35, 85)">
        <path d="M 10,20 L 25,35 L 55,5" stroke="#8B5CF6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <animate attributeName="stroke-dasharray" values="0,100;100,0" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="stroke-dashoffset" values="100;0" dur="2s" repeatCount="indefinite"/>
        </path>
      </g>
    </g>
    
    {/* Cadenas ouvert */}
    <g transform="translate(300, 280)">
      <circle cx="20" cy="0" r="18" stroke="#FBBF24" strokeWidth="4" fill="none"/>
      <rect x="10" y="-5" width="6" height="15" fill="#FBBF24"/>
      <rect x="0" y="20" width="40" height="35" rx="6" fill="#A855F7" opacity="0.9"/>
      <circle cx="20" cy="37" r="5" fill="white">
        <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite"/>
      </circle>
    </g>
    
    {/* Clé magique */}
    <g transform="translate(100, 300)">
      <circle cx="0" cy="0" r="15" fill="#10B981">
        <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="5s" repeatCount="indefinite"/>
      </circle>
      <rect x="10" y="-4" width="40" height="8" rx="4" fill="#10B981"/>
      <rect x="42" y="-10" width="8" height="8" fill="#10B981"/>
      <rect x="48" y="-10" width="8" height="8" fill="#10B981"/>
      
      {/* Étoiles autour */}
      <circle cx="-25" cy="-15" r="3" fill="#FBBF24">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="60" cy="-20" r="2" fill="#C084FC">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="0.5s"/>
      </circle>
      <circle cx="-20" cy="20" r="2.5" fill="#E9D5FF">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite" begin="1s"/>
      </circle>
    </g>
    
    {/* Particules */}
    <circle cx="150" cy="180" r="4" fill="#C084FC" opacity="0.6">
      <animate attributeName="cy" values="180;170;180" dur="3s" repeatCount="indefinite"/>
    </circle>
    <circle cx="370" cy="200" r="5" fill="#A855F7" opacity="0.5">
      <animate attributeName="cy" values="200;190;200" dur="2.5s" repeatCount="indefinite"/>
    </circle>
  </svg>
);

export default function ResetPasswordPage() {
    const [token, setToken] = useState('demo-token');
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.newPassword) {
            newErrors.newPassword = "Le nouveau mot de passe est requis";
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = "Au moins 6 caractères requis";
        }
        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
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

        // Simulation - remplacer par authService.resetPassword
        setTimeout(() => {
            setIsSuccess(true);
            setIsLoading(false);
        }, 1500);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex bg-slate-900">
                <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-[45%] xl:w-[40%] bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 z-10 relative">
                    <div className="mx-auto w-full max-w-sm lg:max-w-md">
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm border border-green-500/30">
                                <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                </svg>
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">Password changed!</h2>
                                <p className="text-slate-400">Your password has been successfully reset</p>
                            </div>

                            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 backdrop-blur-sm">
                                <p className="text-sm text-green-300">
                                    You can now log in with your new password
                                </p>
                            </div>

                            <Link
                                href="/auth/login"
                                className="block w-full py-3.5 px-4 bg-purple-600 rounded-xl text-white font-semibold hover:bg-purple-700 transition-all duration-200 shadow-lg shadow-purple-600/30"
                            >
                                Log in now
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-purple-600 via-purple-500 to-violet-600 overflow-hidden items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-transparent to-violet-700/30"/>
                    <div className="relative z-10 px-12">
                        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 shadow-2xl max-w-2xl">
                            <div className="text-center mb-8">
                                <h2 className="text-5xl font-bold text-white mb-3">All set!</h2>
                                <p className="text-purple-100 text-lg">Your account is now secure</p>
                            </div>
                            <ResetPasswordIllustration />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                        <h2 className="text-4xl font-bold text-white mb-3">Reset Password</h2>
                        <p className="text-slate-400 text-sm">Create your new secure password</p>
                    </div>

                    <div className="space-y-6">
                        {Object.keys(errors).length > 0 && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 backdrop-blur-sm">
                                <div className="flex">
                                    <svg className="h-5 w-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                    </svg>
                                    <p className="ml-3 text-sm text-red-300">Please correct the errors below</p>
                                </div>
                            </div>
                        )}

                        {/* New Password */}
                        <div>
                            <label htmlFor="newPassword" className="sr-only">New password</label>
                            <div className="relative">
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="New password"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3.5 pr-12 bg-white/5 backdrop-blur-sm border ${errors.newPassword ? 'border-red-500' : 'border-white/10'} rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-200`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-purple-400 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <p className="mt-2 text-sm text-red-400 flex items-center">
                                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                    </svg>
                                    {errors.newPassword}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">Confirm password</label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3.5 pr-12 bg-white/5 backdrop-blur-sm border ${errors.confirmPassword ? 'border-red-500' : 'border-white/10'} rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-200`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-purple-400 transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-2 text-sm text-red-400 flex items-center">
                                    <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                    </svg>
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {/* Security tip */}
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 backdrop-blur-sm">
                            <div className="flex">
                                <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                                </svg>
                                <p className="ml-3 text-sm text-blue-300">
                                    Use at least 6 characters with letters, numbers and symbols
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !token}
                            className="w-full py-3.5 px-4 bg-purple-600 rounded-xl text-white font-semibold hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/30 hover:scale-[1.02]"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                    </svg>
                                    Resetting...
                                </span>
                            ) : (
                                'Reset password'
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
                                    Create new<br/>password
                                </h2>
                                <p className="text-purple-100 text-lg">
                                    Secure your account with a strong password
                                </p>
                            </div>
                            <ResetPasswordIllustration />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}