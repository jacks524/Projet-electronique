"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthContext } from '../../../context/authContext';
import toast from 'react-hot-toast';

// Illustration SVG personnalisée pour le système biométrique
const BiometricIllustration = () => (
  <svg className="w-full h-auto max-w-lg mx-auto" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Fond avec cercles décoratifs */}
    <circle cx="300" cy="300" r="250" fill="white" fillOpacity="0.05"/>
    <circle cx="300" cy="300" r="200" fill="white" fillOpacity="0.08"/>
    
    {/* Serveur/Machine biométrique */}
    <g transform="translate(200, 280)">
      <rect x="0" y="0" width="200" height="240" rx="12" fill="white" opacity="0.95"/>
      <rect x="15" y="15" width="170" height="50" rx="6" fill="#E9D5FF" opacity="0.6"/>
      <circle cx="30" cy="40" r="8" fill="#A855F7"/>
      <circle cx="55" cy="40" r="8" fill="#8B5CF6"/>
      <rect x="75" y="32" width="100" height="4" rx="2" fill="#D8B4FE"/>
      <rect x="75" y="44" width="80" height="4" rx="2" fill="#E9D5FF"/>
      
      {/* Écran du scanner */}
      <rect x="40" y="80" width="120" height="130" rx="8" fill="#1F2937"/>
      
      {/* Empreinte digitale animée */}
      <g transform="translate(100, 145)">
        <ellipse cx="0" cy="0" rx="35" ry="40" fill="none" stroke="#8B5CF6" strokeWidth="2.5" opacity="0.9">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
        </ellipse>
        <path d="M 0,-30 Q 10,-25 10,-15 Q 10,-5 0,0 Q -10,-5 -10,-15 Q -10,-25 0,-30" 
              fill="none" stroke="#A855F7" strokeWidth="2.5" opacity="0.8"/>
        <path d="M 0,-20 Q 7,-17 7,-10 Q 7,-3 0,0 Q -7,-3 -7,-10 Q -7,-17 0,-20" 
              fill="none" stroke="#C084FC" strokeWidth="2" opacity="0.7"/>
        <path d="M 0,-12 Q 4,-10 4,-6 Q 4,-2 0,0 Q -4,-2 -4,-6 Q -4,-10 0,-12" 
              fill="none" stroke="#E9D5FF" strokeWidth="1.5"/>
      </g>
      
      {/* LED indicatrice */}
      <circle cx="100" cy="225" r="6" fill="#10B981">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
      </circle>
    </g>
    
    {/* Personne 1 - À gauche avec téléphone */}
    <g transform="translate(80, 220)">
      <ellipse cx="40" cy="90" rx="25" ry="35" fill="white" opacity="0.9"/>
      <circle cx="40" cy="40" r="22" fill="white" opacity="0.9"/>
      <path d="M 20,35 Q 40,15 60,35 L 60,45 Q 40,25 20,45 Z" fill="#1F2937"/>
      <rect x="45" y="65" width="30" height="8" rx="4" fill="white" opacity="0.9" transform="rotate(-30 45 69)"/>
      <rect x="72" y="50" width="18" height="28" rx="3" fill="#8B5CF6"/>
      <rect x="74" y="53" width="14" height="20" rx="1" fill="#C084FC" opacity="0.6"/>
      <rect x="30" y="115" width="10" height="45" rx="5" fill="white" opacity="0.9"/>
      <rect x="45" y="115" width="10" height="45" rx="5" fill="white" opacity="0.9"/>
      <ellipse cx="35" cy="165" rx="12" ry="6" fill="#1F2937"/>
      <ellipse cx="50" cy="165" rx="12" ry="6" fill="#1F2937"/>
    </g>
    
    {/* Personne 2 - À droite avec ordinateur */}
    <g transform="translate(380, 180)">
      <ellipse cx="40" cy="100" rx="28" ry="40" fill="white" opacity="0.9"/>
      <circle cx="40" cy="35" r="24" fill="white" opacity="0.9"/>
      <path d="M 18,30 Q 40,10 62,30 L 60,50 Q 40,45 20,50 Z" fill="#1F2937"/>
      <path d="M 20,40 Q 15,55 18,65" stroke="#1F2937" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M 60,40 Q 65,55 62,65" stroke="#1F2937" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <rect x="15" y="70" width="50" height="35" rx="3" fill="#A855F7" opacity="0.8"/>
      <rect x="18" y="73" width="44" height="25" rx="2" fill="#1F2937"/>
      <line x1="40" y1="73" x2="40" y2="98" stroke="#8B5CF6" strokeWidth="1"/>
      <rect x="25" y="130" width="12" height="50" rx="6" fill="white" opacity="0.9"/>
      <rect x="43" y="130" width="12" height="50" rx="6" fill="white" opacity="0.9"/>
      <ellipse cx="31" cy="185" rx="14" ry="7" fill="#1F2937"/>
      <ellipse cx="49" cy="185" rx="14" ry="7" fill="#1F2937"/>
    </g>
    
    {/* Feuilles décoratives */}
    <g transform="translate(520, 420)">
      <ellipse cx="0" cy="0" rx="25" ry="45" fill="#8B5CF6" opacity="0.4" transform="rotate(25)"/>
      <ellipse cx="5" cy="-10" rx="20" ry="38" fill="white" opacity="0.3" transform="rotate(25)"/>
    </g>
    
    <g transform="translate(50, 500)">
      <ellipse cx="0" cy="0" rx="30" ry="50" fill="#A855F7" opacity="0.3" transform="rotate(-20)"/>
      <ellipse cx="-5" cy="5" rx="22" ry="40" fill="white" opacity="0.2" transform="rotate(-20)"/>
    </g>
    
    {/* Icônes flottantes */}
    <g transform="translate(120, 150)">
      <circle cx="0" cy="0" r="20" fill="#8B5CF6" opacity="0.6">
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-10; 0,0" dur="3s" repeatCount="indefinite"/>
      </circle>
      <path d="M -8,-3 L 0,5 L 8,-3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </g>
    
    <g transform="translate(480, 120)">
      <circle cx="0" cy="0" r="18" fill="#A855F7" opacity="0.5">
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,8; 0,0" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <rect x="-6" y="-6" width="12" height="12" rx="2" fill="white"/>
    </g>
  </svg>
);

function LoginContent() {
  const { login } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get('message') === 'inscription-reussie') {
      toast.success('Inscription réussie ! Connectez-vous.');
      window.history.replaceState({}, '', '/auth/login');
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password) {
        setErrors({ username: !formData.username ? "Requis" : "", password: !formData.password ? "Requis" : "" });
        return;
    }
    setIsLoading(true);
    try {
      const { user } = await login(formData.username, formData.password);
      toast.success(`Bon retour, ${user.name.split(' ')[0]} !`);
      router.push(user.role === 'ADMIN' ? '/admin/dashboard' : '/profile');
    } catch (error) {
        toast.error(error.message || "Échec de la connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      
      {/* --- COLONNE GAUCHE (Formulaire Sombre) --- */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-[45%] xl:w-[40%] bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 z-10 relative">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-white mb-3">Login</h2>
            <p className="text-slate-400 text-sm">Enter your account details</p>
          </div>

          <div className="space-y-6">
            {/* Username - Input élégant avec fond blanc arrondi */}
            <div>
              <label htmlFor="username" className="sr-only">Nom d'utilisateur</label>
              <div className="relative">
                <input
                  id="username" 
                  name="username" 
                  type="text" 
                  autoComplete="username"
                  placeholder="Username"
                  value={formData.username} 
                  onChange={handleChange}
                  className={`w-full px-4 py-3.5 bg-white/5 backdrop-blur-sm border ${errors.username ? 'border-red-500' : 'border-white/10'} rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-200`}
                />
              </div>
              {errors.username && <p className="mt-2 text-xs text-red-500">{errors.username}</p>}
            </div>

            {/* Password - Input élégant avec fond blanc arrondi */}
            <div>
              <label htmlFor="password" className="sr-only">Mot de passe</label>
              <div className="relative">
                <input
                  id="password" 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  autoComplete="current-password"
                  placeholder="Password"
                  value={formData.password} 
                  onChange={handleChange}
                  className={`w-full px-4 py-3.5 pr-12 bg-white/5 backdrop-blur-sm border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all duration-200`}
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer z-10 text-slate-500 hover:text-purple-400 transition-colors" 
                  onClick={() => setShowPassword(!showPassword)}
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
              {errors.password && <p className="mt-2 text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Forgot Password */}
            <div className="text-left">
              <Link href="/auth/forgot-password" className="text-sm text-slate-400 hover:text-purple-400 transition-colors">
                Forgot Password?
              </Link>
            </div>

            {/* Bouton Login */}
            <button 
              type="submit" 
              disabled={isLoading} 
              onClick={handleSubmit}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] shadow-purple-600/30"
            >
              {isLoading ? 'Loading...' : 'Login'}
            </button>
          </div>

          {/* Section Inscription */}
          <div className="mt-10 flex items-center justify-between text-sm">
            <p className="text-slate-400">Don't have an account?</p>
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all duration-200"
            >
              Sign up
            </Link>
          </div>

          {/* Bouton démo dev */}
          {process.env.NODE_ENV === 'development' && (
            <button type="button" className="mt-8 w-full text-center text-sm text-slate-500 hover:text-violet-400">
              
            </button>
          )}
        </div>
      </div>

      {/* --- COLONNE DROITE (Visuel Violet) --- */}
      <div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-purple-600 via-purple-500 to-violet-600 overflow-hidden items-center justify-center">
        {/* Effets de fond */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-transparent to-violet-700/30"></div>
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>

        {/* Contenu */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 py-16">
          <div className="max-w-2xl w-full">
            {/* Card avec effet glassmorphism */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-5xl font-bold text-white mb-3">
                  Welcome to<br />STUDAM
                </h2>
                <p className="text-purple-100 text-lg">
                  Login to access your account
                </p>
              </div>
              
              {/* Illustration */}
              <div className="mt-8">
                <BiometricIllustration />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <LoginContent />
    </Suspense>
  );
}
