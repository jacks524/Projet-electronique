"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SubjectsPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Vérifier si l'utilisateur est connecté
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                router.push('/auth/login');
                return;
            }

            try {
                const currentUser = JSON.parse(userStr);
                setUser(currentUser);
                loadSubjects();
                loadDepartments();
            } catch (error) {
                console.error('Erreur lors de la récupération des données utilisateur:', error);
                router.push('/auth/login');
                return;
            }
        }
    }, [router]);

    const loadSubjects = async () => {
        setLoading(true);
        setError('');

        try {
            // TODO: Remplacer par un vrai appel API
            // const response = await fetch('http://agence-voyage.ddns.net:9026/api/subjects', {
            //   headers: {
            //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
            //     'Content-Type': 'application/json'
            //   }
            // });

            // Simulation temporaire en attendant la connexion backend
            setTimeout(() => {
                setSubjects([
                    {
                        id: 1,
                        libelle: 'Programmation Web',
                        code: 'INFO301',
                        credits: 4,
                        heuresParSemaine: 6,
                        departement: { id: 1, nom: 'Informatique' },
                        enseignant: { nom: 'Dr. Amadou Diallo' },
                        description: 'Introduction aux technologies web modernes'
                    },
                    {
                        id: 2,
                        libelle: 'Systèmes d\'exploitation',
                        code: 'INFO204',
                        credits: 3,
                        heuresParSemaine: 4,
                        departement: { id: 1, nom: 'Informatique' },
                        enseignant: { nom: 'Prof. Fatou Fall' },
                        description: 'Concepts fondamentaux des systèmes d\'exploitation'
                    },
                    {
                        id: 3,
                        libelle: 'Réseaux Informatiques',
                        code: 'INFO305',
                        credits: 4,
                        heuresParSemaine: 5,
                        departement: { id: 1, nom: 'Informatique' },
                        enseignant: { nom: 'Dr. Moussa Sow' },
                        description: 'Architecture et protocoles des réseaux'
                    },
                    {
                        id: 4,
                        libelle: 'Base de Données',
                        code: 'INFO203',
                        credits: 4,
                        heuresParSemaine: 5,
                        departement: { id: 1, nom: 'Informatique' },
                        enseignant: { nom: 'Dr. Aisha Kane' },
                        description: 'Conception et gestion des bases de données'
                    },
                    {
                        id: 5,
                        libelle: 'Intelligence Artificielle',
                        code: 'INFO401',
                        credits: 5,
                        heuresParSemaine: 6,
                        departement: { id: 1, nom: 'Informatique' },
                        enseignant: { nom: 'Prof. Ibrahim Sarr' },
                        description: 'Algorithmes et techniques d\'IA'
                    }
                ]);
                setLoading(false);
            }, 500);

        } catch (error) {
            console.error('Erreur lors du chargement des matières:', error);
            setError('Impossible de charger les matières. Veuillez réessayer.');
            setLoading(false);
        }
    };

    const loadDepartments = async () => {
        try {
            // TODO: Remplacer par un vrai appel API
            setDepartments([
                { id: 1, nom: 'Informatique' },
                { id: 2, nom: 'Mathématiques' },
                { id: 3, nom: 'Physique' }
            ]);
        } catch (error) {
            console.error('Erreur lors du chargement des départements:', error);
        }
    };

    const filteredSubjects = selectedDepartment
        ? subjects.filter(subject => subject.departement.id.toString() === selectedDepartment)
        : subjects;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F26419]"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-[#1B396A]">Matières</h1>
                            <p className="mt-2 text-gray-600">
                                Gestion des matières et des enseignements
                            </p>
                        </div>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F26419]"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                            Retour au dashboard
                        </Link>
                    </div>
                </div>

                {/* Filtres */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                                Filtrer par département
                            </label>
                            <select
                                id="department"
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419]"
                            >
                                <option value="">Tous les départements</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>{dept.nom}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
              <span className="text-sm text-gray-500">
                {filteredSubjects.length} matière(s) trouvée(s)
              </span>
                        </div>
                    </div>
                </div>

                {/* Message d'erreur */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                            </svg>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Liste des matières */}
                {filteredSubjects.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8">
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune matière</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Aucune matière ne correspond aux critères sélectionnés.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredSubjects.map((subject) => (
                            <div key={subject.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <div className="h-10 w-10 bg-[#F26419] rounded-lg flex items-center justify-center">
                                                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <h3 className="text-lg font-medium text-[#1B396A]">{subject.libelle}</h3>
                                                    <p className="text-sm text-gray-500">Code: {subject.code}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 space-y-2">
                                                <p className="text-sm text-gray-600">{subject.description}</p>

                                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                              {subject.enseignant.nom}
                          </span>
                                                    <span className="flex items-center">
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                                                        {subject.departement.nom}
                          </span>
                                                </div>

                                                <div className="flex gap-4 text-sm">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {subject.credits} crédits
                          </span>
                                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            {subject.heuresParSemaine}h/semaine
                          </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end space-x-3">
                                        <Link
                                            href={`/src/app/chief/subjects/${subject.id}/attendance`}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#F26419] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F26419]"
                                        >
                                            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                            Voir présences
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions rapides */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/presence"
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-[#F26419]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-[#1B396A]">Prendre les présences</h3>
                                <p className="text-sm text-gray-500">Enregistrer les présences pour vos matières</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/admin/teachers"
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-[#1B396A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-[#1B396A]">Gérer les enseignants</h3>
                                <p className="text-sm text-gray-500">Consulter et gérer les enseignants</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/timetable"
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-[#1B396A]">Emploi du temps</h3>
                                <p className="text-sm text-gray-500">Consulter les plannings des matières</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}