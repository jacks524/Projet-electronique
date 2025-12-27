"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '../../../../../components/ui/Button';
import TimetableGrid from '../../../../../components/timetable/TimetableGrid';

export default function ClassTimetablePage() {
    const params = useParams();
    const router = useRouter();
    const classId = params.classId;

    const [classe, setClasse] = useState(null);
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);

    const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const timeSlots = [
        '08:00 - 10:00',
        '10:00 - 12:00',
        '14:00 - 16:00',
        '16:00 - 18:00'
    ];

    useEffect(() => {
        loadData();
    }, [classId]);

    const loadData = async () => {
        try {
            setLoading(true);
            // TODO: Appeler les endpoints
            // const classData = await classService.getById(classId);
            // const timetableData = await timetableService.getByClass(classId);

            const mockClass = {
                id: classId,
                name: '3GI',
                level: 'Licence 3',
                studentCount: 45,
                department: { name: 'Informatique' }
            };

            const mockTimetable = [
                {
                    id: 1,
                    jour: 'Lundi',
                    horaire: '08:00 - 10:00',
                    matiere: {
                        id: 1,
                        libelle: 'Programmation Web',
                        code: 'INFO301',
                        enseignant: { id: 1, nom: 'Dr. Mamadou Diallo' }
                    },
                    salle: 'Salle A101'
                },
                {
                    id: 2,
                    jour: 'Lundi',
                    horaire: '14:00 - 16:00',
                    matiere: {
                        id: 2,
                        libelle: 'Base de données',
                        code: 'INFO302',
                        enseignant: { id: 2, nom: 'Prof. Aissatou Fall' }
                    },
                    salle: 'Labo Info 2'
                },
                {
                    id: 3,
                    jour: 'Mercredi',
                    horaire: '10:00 - 12:00',
                    matiere: {
                        id: 3,
                        libelle: 'Réseaux',
                        code: 'INFO303',
                        enseignant: { id: 3, nom: 'Dr. Omar Sow' }
                    },
                    salle: 'Salle B205'
                },
                {
                    id: 4,
                    jour: 'Vendredi',
                    horaire: '08:00 - 10:00',
                    matiere: {
                        id: 1,
                        libelle: 'Programmation Web',
                        code: 'INFO301',
                        enseignant: { id: 1, nom: 'Dr. Mamadou Diallo' }
                    },
                    salle: 'Salle A101'
                }
            ];

            setClasse(mockClass);
            setTimetable(mockTimetable);

        } catch (error) {
            toast.error("Erreur lors du chargement des données");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCellClick = (day, time, schedule) => {
        // Redirection vers la page d'édition ou modal
        if (schedule) {
            router.push(`/chief/timetables/classes/${classId}/edit?scheduleId=${schedule.id}`);
        } else {
            router.push(`/chief/timetables/classes/${classId}/edit?day=${day}&time=${time}`);
        }
    };

    const totalWeeklyHours = timetable.reduce((total, item) => {
        const [start, end] = item.horaire.split(' - ');
        const startTime = new Date(`2000-01-01 ${start}`);
        const endTime = new Date(`2000-01-01 ${end}`);
        const hours = (endTime - startTime) / (1000 * 60 * 60);
        return total + hours;
    }, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26419] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-[#1B396A]">Emploi du temps - {classe?.name}</h1>
                    <p className="text-gray-600 mt-1">{classe?.level} - {classe?.department.name}</p>
                </div>
                <div className="flex space-x-2">
                    <Link href={`/chief/timetables/classes/${classId}/edit`}>
                        <Button>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                            </svg>
                            Modifier
                        </Button>
                    </Link>
                    <Link href="/chief/timetables/classes">
                        <Button variant="secondary">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                            Retour
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Étudiants</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">{classe?.studentCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Cours</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">{timetable.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Heures/semaine</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">{totalWeeklyHours}h</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-orange-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Matières</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">
                                {[...new Set(timetable.map(t => t.matiere.id))].length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grille de l'emploi du temps */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Emploi du temps de la semaine</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Cliquez sur une cellule pour ajouter ou modifier un cours
                    </p>
                </div>
                <div className="p-6">
                    <TimetableGrid
                        daysOfWeek={daysOfWeek}
                        timeSlots={timeSlots}
                        schedules={timetable}
                        onCellClick={handleCellClick}
                    />
                </div>
            </div>

            {/* Liste détaillée des cours */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Liste des cours</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Jour
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Horaire
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Matière
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Enseignant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Salle
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {timetable.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun cours</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Commencez par ajouter des cours à l'emploi du temps.
                                    </p>
                                    <div className="mt-6">
                                        <Link href={`/chief/timetables/classes/${classId}/edit`}>
                                            <Button>
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                                                </svg>
                                                Ajouter un cours
                                            </Button>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            timetable
                                .sort((a, b) => {
                                    const dayOrder = daysOfWeek.indexOf(a.jour) - daysOfWeek.indexOf(b.jour);
                                    if (dayOrder !== 0) return dayOrder;
                                    return a.horaire.localeCompare(b.horaire);
                                })
                                .map((schedule) => (
                                    <tr key={schedule.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{schedule.jour}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {schedule.horaire}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{schedule.matiere.libelle}</div>
                                            <div className="text-sm text-gray-500">{schedule.matiere.code}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{schedule.matiere.enseignant.nom}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{schedule.salle}</div>
                                        </td>
                                    </tr>
                                ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={() => window.print()}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                    </svg>
                    Imprimer
                </Button>
            </div>
        </div>
    );
}