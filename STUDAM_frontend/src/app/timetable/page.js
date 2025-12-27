"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TimetablePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timetable, setTimetable] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
    const [selectedClass, setSelectedClass] = useState('');
    const [classes, setClasses] = useState([]);
    const [error, setError] = useState('');

    // Jours de la semaine
    const daysOfWeek = [
        { id: 'lundi', label: 'Lundi' },
        { id: 'mardi', label: 'Mardi' },
        { id: 'mercredi', label: 'Mercredi' },
        { id: 'jeudi', label: 'Jeudi' },
        { id: 'vendredi', label: 'Vendredi' },
        { id: 'samedi', label: 'Samedi' }
    ];

    // Créneaux horaires
    const timeSlots = [
        '08:00 - 09:30',
        '09:45 - 11:15',
        '11:30 - 13:00',
        '14:00 - 15:30',
        '15:45 - 17:15',
        '17:30 - 19:00'
    ];

    function getCurrentWeek() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const diff = now - start;
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        return Math.floor(diff / oneWeek) + 1;
    }

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
                loadClasses();
                loadTimetable();
            } catch (error) {
                console.error('Erreur lors de la récupération des données utilisateur:', error);
                router.push('/auth/login');
                return;
            }
        }
    }, [router]);

    const loadClasses = async () => {
        try {
            // TODO: Remplacer par un vrai appel API
            setClasses([
                { id: 1, nom: '3GI' },
                { id: 2, nom: '4GI' },
                { id: 3, nom: '5GI' }
            ]);
        } catch (error) {
            console.error('Erreur lors du chargement des courses:', error);
        }
    };

    const loadTimetable = async () => {
        setLoading(true);
        setError('');

        try {
            // TODO: Remplacer par un vrai appel API
            // const response = await fetch(`http://agence-voyage.ddns.net:9026/api/timetable?week=${selectedWeek}&class=${selectedClass}`, {
            //   headers: {
            //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
            //     'Content-Type': 'application/json'
            //   }
            // });

            // Simulation temporaire en attendant la connexion backend
            setTimeout(() => {
                setTimetable([
                    {
                        jour: 'lundi',
                        creneaux: [
                            {
                                heure: '08:00 - 09:30',
                                matiere: 'Programmation Web',
                                code: 'INFO301',
                                enseignant: 'Dr. Amadou Diallo',
                                salle: 'Lab Info 1',
                                classe: '4GI'
                            },
                            {
                                heure: '09:45 - 11:15',
                                matiere: 'Base de Données',
                                code: 'INFO203',
                                enseignant: 'Dr. Aisha Kane',
                                salle: 'Salle 205',
                                classe: '4GI'
                            }
                        ]
                    },
                    {
                        jour: 'mardi',
                        creneaux: [
                            {
                                heure: '08:00 - 09:30',
                                matiere: 'Réseaux Informatiques',
                                code: 'INFO305',
                                enseignant: 'Dr. Moussa Sow',
                                salle: 'Lab Réseau',
                                classe: '4GI'
                            },
                            {
                                heure: '14:00 - 15:30',
                                matiere: 'Systèmes d\'exploitation',
                                code: 'INFO204',
                                enseignant: 'Prof. Fatou Fall',
                                salle: 'Salle 301',
                                classe: '4GI'
                            }
                        ]
                    },
                    {
                        jour: 'mercredi',
                        creneaux: [
                            {
                                heure: '09:45 - 11:15',
                                matiere: 'Intelligence Artificielle',
                                code: 'INFO401',
                                enseignant: 'Prof. Ibrahim Sarr',
                                salle: 'Lab IA',
                                classe: '5GI'
                            }
                        ]
                    },
                    {
                        jour: 'jeudi',
                        creneaux: [
                            {
                                heure: '08:00 - 09:30',
                                matiere: 'Programmation Web',
                                code: 'INFO301',
                                enseignant: 'Dr. Amadou Diallo',
                                salle: 'Lab Info 2',
                                classe: '4GI'
                            },
                            {
                                heure: '15:45 - 17:15',
                                matiere: 'Base de Données',
                                code: 'INFO203',
                                enseignant: 'Dr. Aisha Kane',
                                salle: 'Lab BDD',
                                classe: '4GI'
                            }
                        ]
                    },
                    {
                        jour: 'vendredi',
                        creneaux: [
                            {
                                heure: '08:00 - 09:30',
                                matiere: 'Réseaux Informatiques',
                                code: 'INFO305',
                                enseignant: 'Dr. Moussa Sow',
                                salle: 'Lab Réseau',
                                classe: '4GI'
                            }
                        ]
                    }
                ]);
                setLoading(false);
            }, 500);

        } catch (error) {
            console.error('Erreur lors du chargement de l\'emploi du temps:', error);
            setError('Impossible de charger l\'emploi du temps. Veuillez réessayer.');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadTimetable();
        }
    }, [selectedWeek, selectedClass]);

    const getCourseForSlot = (day, timeSlot) => {
        const daySchedule = timetable.find(d => d.jour === day);
        if (!daySchedule) return null;

        return daySchedule.creneaux.find(c => c.heure === timeSlot);
    };

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
                            <h1 className="text-3xl font-bold text-[#1B396A]">Emploi du Temps</h1>
                            <p className="mt-2 text-gray-600">
                                Planification des cours et des horaires
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
                            <label htmlFor="week" className="block text-sm font-medium text-gray-700 mb-2">
                                Semaine
                            </label>
                            <input
                                type="number"
                                id="week"
                                min="1"
                                max="52"
                                value={selectedWeek}
                                onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419]"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-2">
                                Classe
                            </label>
                            <select
                                id="class"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419]"
                            >
                                <option value="">Toutes les classes</option>
                                {classes.map((classe) => (
                                    <option key={classe.id} value={classe.id}>{classe.nom}</option>
                                ))}
                            </select>
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

                {/* Grille de l'emploi du temps */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Horaires
                                </th>
                                {daysOfWeek.map((day) => (
                                    <th key={day.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {day.label}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {timeSlots.map((timeSlot) => (
                                <tr key={timeSlot} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                                        {timeSlot}
                                    </td>
                                    {daysOfWeek.map((day) => {
                                        const course = getCourseForSlot(day.id, timeSlot);
                                        return (
                                            <td key={day.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {course ? (
                                                    <div className="bg-[#F26419] bg-opacity-10 border-l-4 border-[#F26419] p-3 rounded">
                                                        <div className="text-sm font-medium text-[#1B396A]">
                                                            {course.matiere}
                                                        </div>
                                                        <div className="text-xs text-gray-600 mt-1">
                                                            {course.code} • {course.classe}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {course.enseignant}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {course.salle}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-16 flex items-center justify-center text-gray-400">
                                                        -
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

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
                                <p className="text-sm text-gray-500">Marquer les présences pour les cours</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/subjects"
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-[#1B396A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-[#1B396A]">Voir les matières</h3>
                                <p className="text-sm text-gray-500">Consulter toutes les matières</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/classes"
                        className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
                    >
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-[#1B396A]">Voir les classes</h3>
                                <p className="text-sm text-gray-500">Consulter toutes les classes</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}