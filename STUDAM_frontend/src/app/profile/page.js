"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../context/authContext';
import authService from '../../services/authService';
import userService from '../../services/userService';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, setUser: setUserInContext } = useAuthContext();

  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const ProfileInfo = () => {
    const [formData, setFormData] = useState({
      name: user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      username: user?.username || '',
      matricule: user?.matricule || '',
      bio: user?.bio || '', // Ajout du champ bio manquant
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUpdateProfile = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const updatedUserData = await userService.update(user.id, formData);
        setUserInContext(prevUser => ({ ...prevUser, ...updatedUserData }));
        toast.success('Profil mis à jour avec succès !');
      } catch (error) {
        toast.error(error.message || 'La mise à jour a échoué.');
      } finally {
        setLoading(false);
      }
    };

    return (
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet *
              </label>
              <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:border-[#F26419] focus:z-10 sm:text-sm transition-colors"
                  placeholder="Entrez votre nom complet"
                  required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email *
              </label>
              <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:border-[#F26419] focus:z-10 sm:text-sm transition-colors"
                  placeholder="Entrez votre adresse email"
                  required
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Nom d&apos;utilisateur
              </label>
              <input
                  type="text"
                  name="username"
                  id="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:border-[#F26419] focus:z-10 sm:text-sm transition-colors"
                  placeholder="Entrez votre nom d'utilisateur"
              />
            </div>

            <div>
              <label htmlFor="matricule" className="block text-sm font-medium text-gray-700 mb-2">
                Matricule
              </label>
              <input
                  type="text"
                  name="matricule"
                  id="matricule"
                  value={formData.matricule}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:border-[#F26419] focus:z-10 sm:text-sm transition-colors"
                  placeholder="Entrez votre matricule"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:border-[#F26419] focus:z-10 sm:text-sm transition-colors"
                  placeholder="Entrez votre numéro de téléphone"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:border-[#F26419] focus:z-10 sm:text-sm transition-colors resize-none"
                  placeholder="Quelques mots à propos de vous..."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
                type="submit"
                disabled={loading}
                className="group relative flex justify-center py-3 px-6 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#F26419] to-[#FF7A47] hover:from-[#E55A1A] hover:to-[#F26419] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F26419] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mise à jour...
                  </div>
              ) : (
                  'Mettre à jour le profil'
              )}
            </button>
          </div>
        </form>
    );
  };

  const PasswordChange = () => {
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [showPasswords, setShowPasswords] = useState({
      old: false,
      new: false,
      confirm: false
    });

    const toggleShowPassword = (field) => {
      setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handlePasswordInputChange = (e) => {
      const { name, value } = e.target;
      if (name === 'confirmPassword') {
        setConfirmPassword(value);
      } else {
        setPasswordData(prev => ({ ...prev, [name]: value }));
      }

      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    };

    const handleChangePassword = async (e) => {
      e.preventDefault();
      const newErrors = {};
      if (!passwordData.oldPassword) newErrors.oldPassword = "Le mot de passe actuel est requis.";
      if (!passwordData.newPassword) newErrors.newPassword = "Le nouveau mot de passe est requis.";
      if (passwordData.newPassword.length < 6) newErrors.newPassword = "Le mot de passe doit faire au moins 6 caractères.";
      if (passwordData.newPassword !== confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas.";

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setLoading(true);
      setErrors({});

      try {
        await authService.changePassword(passwordData.oldPassword, passwordData.newPassword);
        toast.success('Mot de passe changé avec succès !');
        setPasswordData({ oldPassword: '', newPassword: '' });
        setConfirmPassword('');
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    return (
        <form onSubmit={handleChangePassword} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe actuel *
              </label>
              <div className="relative">
                <input
                    type={showPasswords.old ? "text" : "password"}
                    name="oldPassword"
                    id="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordInputChange}
                    className={`appearance-none relative block w-full px-3 py-3 pr-10 border ${
                        errors.oldPassword ? 'border-red-500' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:border-[#F26419] focus:z-10 sm:text-sm transition-colors`}
                    required
                />
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => toggleShowPassword('old')}
                >
                  {showPasswords.old ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                      </svg>
                  ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                  )}
                </button>
              </div>
              {errors.oldPassword && <p className="text-red-500 text-sm mt-1">{errors.oldPassword}</p>}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe *
              </label>
              <div className="relative">
                <input
                    type={showPasswords.new ? "text" : "password"}
                    name="newPassword"
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    className={`appearance-none relative block w-full px-3 py-3 pr-10 border ${
                        errors.newPassword ? 'border-red-500' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:border-[#F26419] focus:z-10 sm:text-sm transition-colors`}
                    required
                />
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => toggleShowPassword('new')}
                >
                  {showPasswords.new ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                      </svg>
                  ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                  )}
                </button>
              </div>
              {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le nouveau mot de passe *
              </label>
              <div className="relative">
                <input
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={handlePasswordInputChange}
                    className={`appearance-none relative block w-full px-3 py-3 pr-10 border ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419] focus:border-[#F26419] focus:z-10 sm:text-sm transition-colors`}
                    required
                />
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => toggleShowPassword('confirm')}
                >
                  {showPasswords.confirm ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                      </svg>
                  ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
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

          <div className="flex justify-end">
            <button
                type="submit"
                disabled={loading}
                className="group relative flex justify-center py-3 px-6 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#F26419] to-[#FF7A47] hover:from-[#E55A1A] hover:to-[#F26419] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F26419] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Changement...
                  </div>
              ) : (
                  'Changer le mot de passe'
              )}
            </button>
          </div>
        </form>
    );
  };

  // Composant ActivityLog
  const ActivityLog = () => {
    const mockActivities = [
      {
        id: 1,
        action: 'Connexion',
        description: 'Connexion à la plateforme',
        timestamp: '2024-01-15 14:30:00',
        ip: '192.168.1.100',
        icon: 'login'
      },
      {
        id: 2,
        action: 'Mise à jour profil',
        description: 'Modification des informations personnelles',
        timestamp: '2024-01-14 09:15:00',
        ip: '192.168.1.100',
        icon: 'edit'
      },
      {
        id: 3,
        action: 'Prise de présence',
        description: 'Enregistrement des présences - Cours de Programmation Web',
        timestamp: '2024-01-13 10:00:00',
        ip: '192.168.1.100',
        icon: 'check'
      }
    ];

    const getIcon = (iconType) => {
      switch (iconType) {
        case 'login':
          return (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
          );
        case 'edit':
          return (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
          );
        case 'check':
          return (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
          );
        default:
          return (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
          );
      }
    };

    return (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Activité récente</h3>
            <div className="space-y-4">
              {mockActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-[#F26419] transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#F26419] to-[#FF7A47] rounded-full flex items-center justify-center">
                        {getIcon(activity.icon)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-400 space-x-2">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                        </svg>
                        <span>{activity.timestamp}</span>
                        <span>•</span>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd"/>
                        </svg>
                        <span>IP: {activity.ip}</span>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>
    );
  };

  if (authLoading && !user) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1B396A] to-[#2A5490] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-white border-t-transparent rounded-full mb-4"></div>
            <p className="text-white text-lg">Chargement du profil...</p>
          </div>
        </div>
    );
  }

  // User not found state
  if (!user) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1B396A] to-[#2A5490] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-white text-lg mb-4">Aucun utilisateur connecté</p>
            <Link
                href="/auth/login"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-[#1B396A] bg-white hover:bg-gray-100 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-xl rounded-xl overflow-hidden">
            {/* En-tête de profil */}
            <div className="bg-gradient-to-r from-[#1B396A] to-[#437DE0] px-6 py-8 sm:px-8 lg:px-10">
              <div className="flex flex-col sm:flex-row items-center">
                <div className="flex-shrink-0 h-24 w-24 bg-white rounded-full flex items-center justify-center text-[#1B396A] text-3xl font-bold mb-4 sm:mb-0 shadow-lg">
                  {(user.name || user.nom) ? (user.name || user.nom).split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                </div>
                <div className="sm:ml-6 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-white">{user.name || user.nom || 'Utilisateur'}</h2>
                  <p className="text-blue-100 mt-1 text-lg">{user.email || 'Email non renseigné'}</p>
                  <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white border border-white border-opacity-30">
                    {user.role?.toUpperCase() === 'SUPER_ADMIN' ? 'Super Administrateur' :
                        user.role?.toUpperCase() === 'ADMIN' ? 'Administrateur' :
                            user.role?.toUpperCase() === 'DEPARTMENT_MANAGER' ? 'Chef de département' :
                                user.role?.toUpperCase() === 'TEACHER' ? 'Enseignant' :
                                    'Utilisateur'}
                  </span>
                    {user.departement && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white border border-white border-opacity-30">
                      {user.departement.nom}
                    </span>
                    )}
                    {user.matricule && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white border border-white border-opacity-30">
                      Mat: {user.matricule}
                    </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Onglets */}
            <div className="border-b border-gray-200 bg-gray-50">
              <nav className="flex -mb-px">
                <button
                    className={`relative px-6 py-4 font-medium text-sm border-b-2 transition-all duration-200 ${
                        activeTab === 'info'
                            ? 'border-[#F26419] text-[#F26419] bg-white'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-white'
                    }`}
                    onClick={() => setActiveTab('info')}
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  Informations personnelles
                </button>
                <button
                    className={`relative px-6 py-4 font-medium text-sm border-b-2 transition-all duration-200 ${
                        activeTab === 'password'
                            ? 'border-[#F26419] text-[#F26419] bg-white'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-white'
                    }`}
                    onClick={() => setActiveTab('password')}
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                  </svg>
                  Changer de mot de passe
                </button>
                <button
                    className={`relative px-6 py-4 font-medium text-sm border-b-2 transition-all duration-200 ${
                        activeTab === 'activity'
                            ? 'border-[#F26419] text-[#F26419] bg-white'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-white'
                    }`}
                    onClick={() => setActiveTab('activity')}
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  Activité récente
                </button>
              </nav>
            </div>

            {/* Contenu des onglets */}
            <div className="px-6 py-8 sm:px-8 lg:px-10">
              {activeTab === 'info' && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Informations personnelles</h3>
                      <p className="text-sm text-gray-600">Mettez à jour vos informations personnelles et votre profil.</p>
                    </div>
                    <ProfileInfo />
                  </div>
              )}
              {activeTab === 'password' && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Changer le mot de passe</h3>
                      <p className="text-sm text-gray-600">Modifiez votre mot de passe pour sécuriser votre compte.</p>
                    </div>
                    <PasswordChange />
                  </div>
              )}
              {activeTab === 'activity' && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Activité récente</h3>
                      <p className="text-sm text-gray-600">Consultez l&apos;historique de vos activités sur la plateforme.</p>
                    </div>
                    <ActivityLog />
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}