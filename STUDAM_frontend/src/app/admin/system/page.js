"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SystemSettings() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        // Paramètres généraux
        siteName: 'STUDAM',
        siteDescription: 'Système de Gestion des Présences',
        timezone: 'Africa/Dakar',
        language: 'fr',
        dateFormat: 'DD/MM/YYYY',

        // Paramètres de session
        sessionTimeout: 1440, // minutes
        autoLogout: true,
        maxLoginAttempts: 5,
        lockoutDuration: 30,

        // Paramètres email
        emailEnabled: true,
        smtpHost: '',
        smtpPort: 587,
        smtpUsername: '',
        smtpPassword: '',
        fromEmail: 'noreply@studam.edu',
        fromName: 'STUDAM System',

        // Paramètres notifications
        enableNotifications: true,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,

        // Paramètres de sauvegarde
        autoBackup: true,
        backupFrequency: 'daily',
        backupRetention: 30,
        backupLocation: 'local',

        // Paramètres de maintenance
        maintenanceMode: false,
        maintenanceMessage: 'Le système est en maintenance. Veuillez réessayer plus tard.',

        // Paramètres de sécurité
        forceHttps: true,
        enableTwoFactor: false,
        passwordExpiry: 90,
        minPasswordLength: 8
    });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                router.push('/auth/login');
                return;
            }

            try {
                const currentUser = JSON.parse(userStr);
                if (!['admin', 'super_admin', 'ADMIN'].includes(currentUser.role)) {
                    router.push('/dashboard');
                    return;
                }

                setUser(currentUser);
                loadSystemSettings();
            } catch (error) {
                console.error('Erreur:', error);
                router.push('/auth/login');
            }
        }
    }, [router]);

    const loadSystemSettings = async () => {
        try {
            // Simulation - à remplacer par appel API réel
            console.log('Chargement des paramètres système...');
        } catch (error) {
            console.error('Erreur lors du chargement des paramètres:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Effacer l'erreur correspondante
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            // Simulation d'appel API
            await new Promise(resolve => setTimeout(resolve, 1000));

            setSuccessMessage('Paramètres système mis à jour avec succès !');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            setErrors({ general: 'Erreur lors de la sauvegarde des paramètres' });
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'general', name: 'Général', icon: '⚙️' },
        { id: 'security', name: 'Sécurité', icon: '🔒' },
        { id: 'email', name: 'Email', icon: '📧' },
        { id: 'notifications', name: 'Notifications', icon: '🔔' },
        { id: 'backup', name: 'Sauvegardes', icon: '💾' },
        { id: 'maintenance', name: 'Maintenance', icon: '🔧' }
    ];

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Paramètres Système
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Configurez les paramètres globaux de votre système STUDAM.
                    </p>
                </div>
                <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
                    <Link
                        href="/admin/system/security"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Sécurité avancée
                    </Link>
                    <Link
                        href="/admin/system/logs"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Voir les logs
                    </Link>
                </div>
            </div>

            {/* Messages */}
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

            {successMessage && (
                <div className="rounded-md bg-green-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">{successMessage}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Onglets */}
            <div className="bg-white shadow rounded-lg">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${
                                    activeTab === tab.id
                                        ? 'border-[#F26419] text-[#F26419]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <form onSubmit={handleSave} className="p-6">

                    {/* Onglet Général */}
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Paramètres généraux</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Configuration de base de votre système.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                                        Nom du site
                                    </label>
                                    <input
                                        type="text"
                                        name="siteName"
                                        id="siteName"
                                        value={settings.siteName}
                                        onChange={handleChange}
                                        className="mt-1 focus:ring-[#F26419] focus:border-[#F26419] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                                        Fuseau horaire
                                    </label>
                                    <select
                                        id="timezone"
                                        name="timezone"
                                        value={settings.timezone}
                                        onChange={handleChange}
                                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                                    >
                                        <option value="Africa/Dakar">Africa/Dakar</option>
                                        <option value="Africa/Abidjan">Africa/Abidjan</option>
                                        <option value="Africa/Casablanca">Africa/Casablanca</option>
                                        <option value="UTC">UTC</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-6">
                                    <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                                        Description du site
                                    </label>
                                    <input
                                        type="text"
                                        name="siteDescription"
                                        id="siteDescription"
                                        value={settings.siteDescription}
                                        onChange={handleChange}
                                        className="mt-1 focus:ring-[#F26419] focus:border-[#F26419] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                                        Langue par défaut
                                    </label>
                                    <select
                                        id="language"
                                        name="language"
                                        value={settings.language}
                                        onChange={handleChange}
                                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                                    >
                                        <option value="fr">Français</option>
                                        <option value="en">English</option>
                                        <option value="ar">العربية</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700">
                                        Format de date
                                    </label>
                                    <select
                                        id="dateFormat"
                                        name="dateFormat"
                                        value={settings.dateFormat}
                                        onChange={handleChange}
                                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                                    >
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Onglet Sécurité */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Paramètres de sécurité</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Configurez les mesures de sécurité de votre système.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700">
                                        Timeout de session (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        name="sessionTimeout"
                                        id="sessionTimeout"
                                        value={settings.sessionTimeout}
                                        onChange={handleChange}
                                        className="mt-1 focus:ring-[#F26419] focus:border-[#F26419] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-gray-700">
                                        Tentatives de connexion max
                                    </label>
                                    <input
                                        type="number"
                                        name="maxLoginAttempts"
                                        id="maxLoginAttempts"
                                        value={settings.maxLoginAttempts}
                                        onChange={handleChange}
                                        className="mt-1 focus:ring-[#F26419] focus:border-[#F26419] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>

                                <div className="sm:col-span-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center">
                                            <input
                                                id="autoLogout"
                                                name="autoLogout"
                                                type="checkbox"
                                                checked={settings.autoLogout}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-[#F26419] focus:ring-[#F26419] border-gray-300 rounded"
                                            />
                                            <label htmlFor="autoLogout" className="ml-2 block text-sm text-gray-900">
                                                Déconnexion automatique
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                id="forceHttps"
                                                name="forceHttps"
                                                type="checkbox"
                                                checked={settings.forceHttps}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-[#F26419] focus:ring-[#F26419] border-gray-300 rounded"
                                            />
                                            <label htmlFor="forceHttps" className="ml-2 block text-sm text-gray-900">
                                                Forcer HTTPS
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                id="enableTwoFactor"
                                                name="enableTwoFactor"
                                                type="checkbox"
                                                checked={settings.enableTwoFactor}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-[#F26419] focus:ring-[#F26419] border-gray-300 rounded"
                                            />
                                            <label htmlFor="enableTwoFactor" className="ml-2 block text-sm text-gray-900">
                                                Authentification à deux facteurs
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Onglet Email */}
                    {activeTab === 'email' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Configuration Email</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Paramètres SMTP pour l&apos;envoi d&apos;emails.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-6">
                                    <div className="flex items-center">
                                        <input
                                            id="emailEnabled"
                                            name="emailEnabled"
                                            type="checkbox"
                                            checked={settings.emailEnabled}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-[#F26419] focus:ring-[#F26419] border-gray-300 rounded"
                                        />
                                        <label htmlFor="emailEnabled" className="ml-2 block text-sm text-gray-900">
                                            Activer les emails
                                        </label>
                                    </div>
                                </div>

                                {settings.emailEnabled && (
                                    <>
                                        <div className="sm:col-span-3">
                                            <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700">
                                                Serveur SMTP
                                            </label>
                                            <input
                                                type="text"
                                                name="smtpHost"
                                                id="smtpHost"
                                                value={settings.smtpHost}
                                                onChange={handleChange}
                                                placeholder="smtp.gmail.com"
                                                className="mt-1 focus:ring-[#F26419] focus:border-[#F26419] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                            />
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700">
                                                Port SMTP
                                            </label>
                                            <input
                                                type="number"
                                                name="smtpPort"
                                                id="smtpPort"
                                                value={settings.smtpPort}
                                                onChange={handleChange}
                                                className="mt-1 focus:ring-[#F26419] focus:border-[#F26419] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                            />
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700">
                                                Email expéditeur
                                            </label>
                                            <input
                                                type="email"
                                                name="fromEmail"
                                                id="fromEmail"
                                                value={settings.fromEmail}
                                                onChange={handleChange}
                                                className="mt-1 focus:ring-[#F26419] focus:border-[#F26419] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                            />
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label htmlFor="fromName" className="block text-sm font-medium text-gray-700">
                                                Nom expéditeur
                                            </label>
                                            <input
                                                type="text"
                                                name="fromName"
                                                id="fromName"
                                                value={settings.fromName}
                                                onChange={handleChange}
                                                className="mt-1 focus:ring-[#F26419] focus:border-[#F26419] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Onglet Notifications */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Notifications</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Configurez les types de notifications.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        id="enableNotifications"
                                        name="enableNotifications"
                                        type="checkbox"
                                        checked={settings.enableNotifications}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-[#F26419] focus:ring-[#F26419] border-gray-300 rounded"
                                    />
                                    <label htmlFor="enableNotifications" className="ml-2 block text-sm text-gray-900">
                                        Activer les notifications
                                    </label>
                                </div>

                                {settings.enableNotifications && (
                                    <div className="ml-6 space-y-4">
                                        <div className="flex items-center">
                                            <input
                                                id="emailNotifications"
                                                name="emailNotifications"
                                                type="checkbox"
                                                checked={settings.emailNotifications}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-[#F26419] focus:ring-[#F26419] border-gray-300 rounded"
                                            />
                                            <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                                                Notifications par email
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                id="smsNotifications"
                                                name="smsNotifications"
                                                type="checkbox"
                                                checked={settings.smsNotifications}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-[#F26419] focus:ring-[#F26419] border-gray-300 rounded"
                                            />
                                            <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-900">
                                                Notifications SMS
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                id="pushNotifications"
                                                name="pushNotifications"
                                                type="checkbox"
                                                checked={settings.pushNotifications}
                                                onChange={handleChange}
                                                className="h-4 w-4 text-[#F26419] focus:ring-[#F26419] border-gray-300 rounded"
                                            />
                                            <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-900">
                                                Notifications push
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Onglet Sauvegardes */}
                    {activeTab === 'backup' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Sauvegardes automatiques</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Configuration des sauvegardes du système.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-6">
                                    <div className="flex items-center">
                                        <input
                                            id="autoBackup"
                                            name="autoBackup"
                                            type="checkbox"
                                            checked={settings.autoBackup}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-[#F26419] focus:ring-[#F26419] border-gray-300 rounded"
                                        />
                                        <label htmlFor="autoBackup" className="ml-2 block text-sm text-gray-900">
                                            Activer les sauvegardes automatiques
                                        </label>
                                    </div>
                                </div>

                                {settings.autoBackup && (
                                    <>
                                        <div className="sm:col-span-3">
                                            <label htmlFor="backupFrequency" className="block text-sm font-medium text-gray-700">
                                                Fréquence
                                            </label>
                                            <select
                                                id="backupFrequency"
                                                name="backupFrequency"
                                                value={settings.backupFrequency}
                                                onChange={handleChange}
                                                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                                            >
                                                <option value="hourly">Toutes les heures</option>
                                                <option value="daily">Quotidienne</option>
                                                <option value="weekly">Hebdomadaire</option>
                                                <option value="monthly">Mensuelle</option>
                                            </select>
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label htmlFor="backupRetention" className="block text-sm font-medium text-gray-700">
                                                Rétention (jours)
                                            </label>
                                            <input
                                                type="number"
                                                name="backupRetention"
                                                id="backupRetention"
                                                value={settings.backupRetention}
                                                onChange={handleChange}
                                                className="mt-1 focus:ring-[#F26419] focus:border-[#F26419] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Onglet Maintenance */}
                    {activeTab === 'maintenance' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Mode maintenance</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Activez le mode maintenance pour effectuer des mises à jour.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-6">
                                    <div className="flex items-center">
                                        <input
                                            id="maintenanceMode"
                                            name="maintenanceMode"
                                            type="checkbox"
                                            checked={settings.maintenanceMode}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-[#F26419] focus:ring-[#F26419] border-gray-300 rounded"
                                        />
                                        <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                                            Activer le mode maintenance
                                        </label>
                                    </div>
                                    {settings.maintenanceMode && (
                                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                            <p className="text-sm text-yellow-800">
                                                ⚠️ Le mode maintenance empêchera les utilisateurs d&apos;accéder au système.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="sm:col-span-6">
                                    <label htmlFor="maintenanceMessage" className="block text-sm font-medium text-gray-700">
                                        Message de maintenance
                                    </label>
                                    <textarea
                                        id="maintenanceMessage"
                                        name="maintenanceMessage"
                                        rows={3}
                                        value={settings.maintenanceMessage}
                                        onChange={handleChange}
                                        className="mt-1 focus:ring-[#F26419] focus:border-[#F26419] block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        placeholder="Message affiché aux utilisateurs..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#F26419] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sauvegarde...
                                </>
                            ) : (
                                'Sauvegarder les paramètres'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Informations système */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Informations système
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900">Version STUDAM</h4>
                        <p className="text-2xl font-bold text-[#F26419]">v2.1.0</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900">Dernière mise à jour</h4>
                        <p className="text-sm text-gray-600">03 Janvier 2025</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900">Status serveur</h4>
                        <p className="text-sm text-green-600 font-medium">🟢 En ligne</p>
                    </div>
                </div>
            </div>
        </div>
    );
}