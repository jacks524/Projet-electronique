"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import ScheduleModal from '@/components/timetable/ScheduleModal';
import classService from '@/services/classService';
import timetableService from '@/services/timetableService';
import subjectService from '@/services/subjectService';
import scheduleService from '@/services/scheduleService';

export default function EditClassTimetablePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const classId = params.classId;

    const [classe, setClasse] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [timetableId, setTimetableId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const timeSlots = ['08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00'];
    const dayEnum = {
        Lundi: 'MONDAY',
        Mardi: 'TUESDAY',
        Mercredi: 'WEDNESDAY',
        Jeudi: 'THURSDAY',
        Vendredi: 'FRIDAY',
        Samedi: 'SATURDAY'
    };
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

        const day = searchParams.get('day');
        const time = searchParams.get('time');

        if (day && time) {
            setSelectedDay(day);
            setSelectedTime(time);
            setShowModal(true);
        }
    }, [classId, searchParams]);

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        return timeStr.substring(0, 5);
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
                department: { name: classData.departementResponseDTO?.name || '' }
            });

            const timetableSchedules = Array.isArray(timetableData?.schedules) ? timetableData.schedules : [];
            const mappedSchedules = timetableSchedules.map((schedule) => {
                const start = formatTime(schedule.startHour);
                const end = formatTime(schedule.endHour);
                return {
                    id: schedule.scheduleId || schedule.id,
                    jour: dayMap[schedule.day] || schedule.day,
                    horaire: `${start} - ${end}`,
                    matiere: {
                        id: schedule.subject?.subjectId || schedule.subject?.id,
                        libelle: schedule.subject?.name || schedule.subject?.libelle,
                        code: schedule.subject?.code,
                        enseignant: {
                            id: schedule.teacher?.id,
                            nom: schedule.teacher?.name
                        }
                    }
                };
            });

            setSchedules(mappedSchedules);
            setTimetableId(timetableData?.timetableId || timetableData?.id || null);

            if (classData?.departementResponseDTO?.departmentId) {
                const subjectsData = await subjectService.getByDepartment(classData.departementResponseDTO.departmentId);
                setSubjects((Array.isArray(subjectsData) ? subjectsData : []).map((subject) => ({
                    id: subject.subjectId || subject.id,
                    libelle: subject.name || subject.libelle,
                    code: subject.code,
                    teacherId: subject.teacher?.id || subject.teacherId,
                })));
            } else {
                setSubjects([]);
            }

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
            if (!timetableId) {
                toast.error("Aucun emploi du temps n'existe pour cette classe.");
                return;
            }

            const [startTime, endTime] = scheduleData.horaire.split(' - ');
            const subjectId = scheduleData.matiere?.id;
            const subjectMeta = subjects.find((subject) => subject.id === subjectId);
            const teacherId = subjectMeta?.teacherId || scheduleData.matiere?.enseignant?.id;

            if (!teacherId) {
                toast.error("Aucun enseignant associe a cette matiere.");
                return;
            }

            const payload = {
                day: dayEnum[scheduleData.jour],
                startHour: startTime,
                endHour: endTime,
                subjectId: subjectId,
                timetableId: timetableId,
                teacherId: teacherId
            };

            if (selectedSchedule?.id) {
                await scheduleService.update(selectedSchedule.id, payload);
                toast.success("Cours modifie");
            } else {
                await scheduleService.create(payload);
                toast.success("Cours ajoute");
            }

            setShowModal(false);
            await loadData();
        } catch (error) {
            toast.error(error.message || "Erreur lors de l'enregistrement");
        }
    };

    const handleDelete = async (scheduleId) => {
        if (!window.confirm("Voulez-vous vraiment supprimer ce cours ?")) {
            return;
        }

        try {
            await scheduleService.remove(scheduleId);
            toast.success("Cours supprimé avec succès");
            setShowModal(false);
            await loadData();
        } catch (error) {
            toast.error(error.message || "Erreur lors de la suppression du cours");
            console.error(error);
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
                                                        <div className="text-xs text-gray-500">Prof: {schedule.matiere?.enseignant?.nom || '---'}</div>
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
