"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import ScheduleModal from '@/components/timetable/ScheduleModal';

export default function EditClassTimetablePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const classId = params.classId;

    const [classe, setClasse] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const timeSlots = ['08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00'];

    useEffect(() => {
        loadData();

        // Vérifier si on doit ouvrir le modal directement
        const day = searchParams.get('day');
        const time = searchParams.get('time');
        const scheduleId = searchParams.get('scheduleId');

        if (day && time) {
            setSelectedDay(day);
            setSelectedTime(time);
            setShowModal(true);
        } else if (scheduleId) {
            // Charger et éditer un schedule existant
            setShowModal(true);
        }
    }, [classId, searchParams]);

    const loadData = async () => {
        try {
            setLoading(true);
            // TODO: Appeler les endpoints

            const mockClass = {
                id: classId,
                name: '3GI',
                level: 'Licence 3',
                department: { name: 'Informatique' }
            };

            const mockSubjects = [
                { id: 1, libelle: 'Programmation Web', code: 'INFO301', enseignant: { id: 1, nom: 'Dr. Mamadou Diallo' } },
                { id: 2, libelle: 'Base de données', code: 'INFO302', enseignant: { id: 2, nom: 'Prof. Aissatou Fall' } },
                { id: 3, libelle: 'Réseaux', code: 'INFO303', enseignant: { id: 3, nom: 'Dr. Omar Sow' } }
            ];

            const mockSchedules = [
                {
                    id: 1,
                    jour: 'Lundi',
                    horaire: '08:00 - 10:00',
                    matiere: mockSubjects[0],
                    notes: 'Cours en salle informatique'
                }
            ];

            setClasse(mockClass);
            setSubjects(mockSubjects);
            setSchedules(mockSchedules);

        } catch (error) {
            toast.error("Erreur lors du chargement");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCellClick = (day, time, schedule) => {
        setSelectedDay(day);
        setSelectedTime(time);
        setSelectedSchedule(schedule);
        setShowModal(true);
    };

    const handleSave = async (scheduleData) => {
        try {
            // TODO: Appeler l'endpoint
            toast.success(selectedSchedule ? "Cours modifié" : "Cours ajouté");
            setShowModal(false);
            loadData();
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement");
        }
    };

    const handleDelete = async (scheduleId) => {
        try {
            // TODO: Appeler l'endpoint
            toast.success("Cours supprimé");
            setShowModal(false);
            loadData();
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const findSchedule = (day, time) => {
        return schedules.find(s => s.jour === day && s.horaire === time);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#312e81]">Modifier l'emploi du temps</h1>
                    <p className="text-gray-600 mt-1">{classe?.name} - {classe?.level}</p>
                </div>
                <Link href={`/chief/timetables/classes/${classId}`}>
                    <Button variant="secondary">Retour</Button>
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="w-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horaire</th>
                            {daysOfWeek.map((day) => (
                                <th key={day} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                    {day}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {timeSlots.map((time) => (
                            <tr key={time}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                                    {time}
                                </td>
                                {daysOfWeek.map((day) => {
                                    const schedule = findSchedule(day, time);
                                    return (
                                        <td
                                            key={`${day}-${time}`}
                                            className={`px-1 py-1 text-sm ${schedule ? 'cursor-pointer hover:bg-violet-50' : 'cursor-pointer hover:bg-gray-50'}`}
                                            onClick={() => handleCellClick(day, time, schedule)}
                                        >
                                            {schedule ? (
                                                <div className="p-2 rounded-md bg-violet-100 border border-violet-200 h-full min-h-[80px]">
                                                    <div className="font-medium text-[#312e81]">{schedule.matiere?.libelle}</div>
                                                    <div className="text-xs text-gray-500">Code: {schedule.matiere?.code}</div>
                                                    <div className="text-xs text-gray-500">Prof: {schedule.matiere?.enseignant?.nom}</div>
                                                </div>
                                            ) : (
                                                <div className="p-2 rounded-md bg-gray-50 border border-gray-100 h-full min-h-[80px] flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs">Cliquez pour ajouter</span>
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

            <ScheduleModal
                show={showModal}
                onClose={() => setShowModal(false)}
                day={selectedDay}
                time={selectedTime}
                schedule={selectedSchedule}
                classId={classId}
                className={classe?.name}
                subjects={subjects}
                onSave={handleSave}
                onDelete={handleDelete}
            />
        </div>
    );
}