"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../../../context/authContext';
import userService from '../../../../services/userService';
import subjectService from '../../../../services/subjectService';
import toast from 'react-hot-toast';

export default function UserDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id;
    const { isAuthenticated, loading: authLoading } = useAuthContext();

    const [userData, setUserData] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        if (userId) {
            loadUserDetails();
        }
    }, [isAuthenticated, authLoading, router, userId]);

    const loadUserDetails = async () => {
        try {
            setLoading(true);
            const data = await userService.getById(userId);
            console.log("Données brutes de l'utilisateur reçues de l'API:", data);

            let teacherSubjects = [];
            const isTeacher = data.roles.some(r => r.role === 'TEACHER' || r.role === 'DEPARTMENT_MANAGER');
            if (isTeacher) {
                teacherSubjects = await subjectService.getByTeacher(userId);
            }

            setUserData({ ...data, isActive: data.active });
            setSubjects(teacherSubjects);

        } catch (error) {
            toast.error("Impossible de charger les détails.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        try {
            const actionPromise = userData.isActive
                ? await userService.deactivate(userId)
                : await userService.activate(userId);

            await toast.promise(actionPromise, {
                loading: 'Mise à jour...',
                success: 'Statut mis à jour !',
                error: 'La mise à jour a échoué.'
            });

            setUserData(prev => ({...prev, isActive: !prev.isActive}));
        } catch (error) {
            toast.error("Erreur lors du changement de statut");
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${userData.name} ?`)) {
            const deletePromise = userService.remove(userId);

            toast.promise(deletePromise, {
                loading: 'Suppression en cours...',
                success: () => {
                    router.push('/admin/users');
                    return 'Utilisateur supprimé avec succès.';
                },
                error: (err) => err.message || 'La suppression a échoué.'
            });
        }
    };

    // Composant pour les informations détaillées
    const UserInformation = () => {
        return (
            <div className="space-y-6">
                {/* Informations personnelles */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-[#F26419]" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        Informations Personnelles
                    </h3>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <dt className="text-sm font-medium text-gray-500 mb-1">Nom complet</dt>
                            <dd className="text-base text-gray-900 font-medium">{userData.name || 'Non renseigné'}</dd>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <dt className="text-sm font-medium text-gray-500 mb-1">Email</dt>
                            <dd className="text-base text-gray-900">{userData.email || 'Non renseigné'}</dd>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <dt className="text-sm font-medium text-gray-500 mb-1">Nom d&apos;utilisateur</dt>
                            <dd className="text-base text-gray-900">{userData.username || 'Non renseigné'}</dd>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <dt className="text-sm font-medium text-gray-500 mb-1">Matricule</dt>
                            <dd className="text-base text-gray-900">{userData.matricule || 'Non renseigné'}</dd>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <dt className="text-sm font-medium text-gray-500 mb-1">Téléphone</dt>
                            <dd className="text-base text-gray-900">{userData.phoneNumber || 'Non renseigné'}</dd>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <dt className="text-sm font-medium text-gray-500 mb-1">Statut</dt>
                            <dd>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                    userData.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {userData.isActive ? 'Actif' : 'Inactif'}
                                </span>
                            </dd>
                        </div>
                        {userData.bio && (
                            <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                                <dt className="text-sm font-medium text-gray-500 mb-1">Bio</dt>
                                <dd className="text-base text-gray-900">{userData.bio}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Rôles et permissions */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-[#F26419]" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                        Rôles et Permissions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {userData.roles && userData.roles.length > 0 ? (
                            userData.roles.map((role, index) => (
                                <span key={index}
                                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-[#1B396A] to-[#437DE0] text-white">
                                    {role.role || role}
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-500 text-sm">Aucun rôle assigné</span>
                        )}
                    </div>
                </div>

                {/* Départements */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-[#F26419]" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                        Département(s)
                    </h3>
                    {userData && userData.departmentsNames && userData.departmentsNames.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {userData.departmentsNames.map((departmentName, index) => (
                                <span key={index}
                                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                    {departmentName}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">Aucun département assigné</p>
                    )}
                </div>
            </div>
        );
    };

    // Composant pour les matières enseignées
    const SubjectsSection = () => {

        return (
            <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-[#F26419]" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                        </svg>
                        Matières Enseignées
                    </h3>
                    {subjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {subjects.map((subject) => (
                                <div key={subject.subjectId}
                                     className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#F26419] transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{subject.name}</p>
                                            <p className="text-sm text-gray-500 mt-1">Code: {subject.code}</p>
                                        </div>
                                        <span
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F26419] text-white">
                                            Actif
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">Aucune matière assignée pour le moment.</p>
                    )}
                </div>
            </div>
        );
    };

    // Composant pour les statistiques
    const StatisticsSection = () => {
        const stats = [
            {label: 'Cours assignés', value: userData.coursesCount || 0, icon: 'book', color: 'blue'},
            {label: 'Classes', value: userData.classesCount || 0, icon: 'users', color: 'green'},
            {label: 'Taux de présence', value: `${userData.attendanceRate || 95}%`, icon: 'check', color: 'purple'},
            {label: 'Heures enseignées', value: userData.hoursCount || 0, icon: 'clock', color: 'orange'}
        ];

        const getIconColor = (color) => {
            const colors = {
                blue: 'bg-blue-100 text-blue-600',
                green: 'bg-green-100 text-green-600',
                purple: 'bg-purple-100 text-purple-600',
                orange: 'bg-orange-100 text-orange-600'
            };
            return colors[color] || colors.blue;
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index}
                         className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div
                                className={`w-12 h-12 rounded-lg flex items-center justify-center ${getIconColor(stat.color)}`}>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="animate-spin h-12 w-12 mx-auto border-4 border-[#F26419] border-t-transparent rounded-full mb-4"></div>
                    <p className="text-gray-600 text-lg">Chargement des détails...</p>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 text-lg mb-4">Utilisateur non trouvé</p>
                    <Link href="/admin/users" className="text-[#F26419] hover:underline">
                        Retour à la liste
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Fil d'Ariane */}
                <nav className="mb-6 flex items-center text-sm text-gray-500">
                    <Link href="/admin/users" className="hover:text-[#F26419] transition-colors">
                        Utilisateurs
                    </Link>
                    <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"/>
                    </svg>
                    <span className="text-gray-900 font-medium">{userData.name}</span>
                </nav>

                {/* En-tête du profil */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-[#1B396A] to-[#437DE0] px-6 py-8">
                        <div className="flex flex-col sm:flex-row items-center justify-between">
                            <div className="flex flex-col sm:flex-row items-center">
                                <div
                                    className="flex-shrink-0 h-24 w-24 bg-white rounded-full flex items-center justify-center text-[#1B396A] text-3xl font-bold mb-4 sm:mb-0 shadow-lg">
                                    {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="sm:ml-6 text-center sm:text-left">
                                    <h1 className="text-3xl font-bold text-white">{userData.name}</h1>
                                    <p className="text-blue-100 mt-1 text-lg">{userData.email}</p>
                                    <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                                        {userData.roles && userData.roles.map((role, index) => (
                                            <span key={index}
                                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white border border-white border-opacity-30">
                                                {role.role || role}
                                            </span>
                                        ))}
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                userData.isActive
                                                    ? 'bg-green-500 bg-opacity-90 text-white'
                                                    : 'bg-red-500 bg-opacity-90 text-white'
                                            }`}>
                                            {userData.isActive ? 'Actif' : 'Inactif'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions rapides */}
                            <div className="flex gap-2 mt-4 sm:mt-0">
                                <button
                                    onClick={handleToggleStatus}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        userData.isActive
                                            ? 'bg-red-500 hover:bg-red-600 text-white'
                                            : 'bg-green-500 hover:bg-green-600 text-white'
                                    }`}
                                >
                                    {userData.isActive ? 'Désactiver' : 'Activer'}
                                </button>
                                <Link
                                    href={`/admin/users/${userId}/edit`}
                                    className="px-4 py-2 bg-white text-[#1B396A] rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                                >
                                    Modifier
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Supprimer
                                </button>
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
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                                onClick={() => setActiveTab('info')}
                            >
                                Informations
                            </button>
                            <button
                                className={`relative px-6 py-4 font-medium text-sm border-b-2 transition-all duration-200 ${
                                    activeTab === 'subjects'
                                        ? 'border-[#F26419] text-[#F26419] bg-white'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                                onClick={() => setActiveTab('subjects')}
                            >
                                Matières
                            </button>
                            <button
                                className={`relative px-6 py-4 font-medium text-sm border-b-2 transition-all duration-200 ${
                                    activeTab === 'stats'
                                        ? 'border-[#F26419] text-[#F26419] bg-white'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                                onClick={() => setActiveTab('stats')}
                            >
                                Statistiques
                            </button>
                        </nav>
                    </div>

                    {/* Contenu des onglets */}
                    <div className="p-6">
                        {activeTab === 'info' && <UserInformation userData={userData} />}
                        {activeTab === 'subjects' && <SubjectsSection subjects={subjects} />}
                        {activeTab === 'stats' && <StatisticsSection userData={userData} />}
                    </div>
                </div>
            </div>
        </div>
    );
}