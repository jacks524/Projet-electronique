"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '../../../../../components/ui/Button';
import TimetableGrid from '../../../../../components/timetable/TimetableGrid';
import classService from '../../../../../services/classService';
import timetableService from '../../../../../services/timetableService';

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

    const dayMap = {
        MONDAY: 'Lundi',
        TUESDAY: 'Mardi',
        WEDNESDAY: 'Mercredi',
        THURSDAY: 'Jeudi',
        FRIDAY: 'Vendredi',
        SATURDAY: 'Samedi',
        SUNDAY: 'Dimanche'
    };

    useEffect(() => {
        loadData();
    }, [classId]);

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        return timeStr.substring(0, 5);
    };

    const parseTimeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':').map(Number);
        if (parts.length < 2) return 0;
        return parts[0] * 60 + parts[1];
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [classData, timetableData] = await Promise.all([
                classService.getById(classId),
                timetableService.getByClass(classId)
            ]);

            setClasse({
                id: classData.classId,
                name: classData.name,
                level: classData.code || '---',
                studentCount: classData.studentNumber || 0,
                department: { name: classData.departementResponseDTO?.name || '' }
            });

            const schedules = Array.isArray(timetableData?.schedules) ? timetableData.schedules : [];
            const mappedSchedules = schedules.map((schedule) => {
                const start = formatTime(schedule.startHour);
                const end = formatTime(schedule.endHour);
                return {
                    jour: dayMap[schedule.day] || schedule.day,
                    horaire: `${start} - ${end}`,
                    matiere: {
                        id: schedule.subject?.subjectId,
                        libelle: schedule.subject?.name,
                        code: schedule.subject?.code,
                        enseignant: {
                            id: schedule.teacher?.id,
                            nom: schedule.teacher?.name
                        }
                    }
                };
            });

            setTimetable(mappedSchedules);

        } catch (error) {
            toast.error("Erreur lors du chargement des donnees");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCellClick = (day, time, schedule) => {
        if (schedule) {
            router.push(`/chief/timetables/classes/${classId}/edit?day=${day}&time=${time}`);
        } else {
            router.push(`/chief/timetables/classes/${classId}/edit?day=${day}&time=${time}`);
        }
    };

    const totalWeeklyHours = timetable.reduce((total, item) => {
        const [start, end] = item.horaire.split(' - ');
        const startTime = parseTimeToMinutes(start);
        const endTime = parseTimeToMinutes(end);
        const hours = Math.max(0, (endTime - startTime) / 60);
        return total + hours;
    }, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-[#312e81]">Emploi du temps - {classe?.name}</h1>
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Etudiants</p>
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
                        <div className="flex-shrink-0 bg-violet-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Matieres</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">
                                {[...new Set(timetable.map(t => t.matiere?.id).filter(Boolean))].length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

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

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Liste des cours</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Matiere
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Enseignant
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {timetable.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-sm text-gray-500">
                                    Aucun cours enregistre.
                                </td>
                            </tr>
                        ) : (
                            timetable.map((cours, index) => (
                                <tr key={`${cours.matiere?.code}-${index}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {cours.matiere?.libelle}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {cours.matiere?.code}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {cours.matiere?.enseignant?.nom}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
