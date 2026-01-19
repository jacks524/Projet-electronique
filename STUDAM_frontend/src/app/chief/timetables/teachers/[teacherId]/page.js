"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import timetableService from '../../../../../services/timetableService';
import userService from '../../../../../services/userService';
import Button from '../../../../../components/ui/Button';
import toast from 'react-hot-toast';

export default function TeacherTimetablePage() {
    const router = useRouter();
    const params = useParams();
    const teacherId = params.teacherId;

    const [teacher, setTeacher] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);

    const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const timeSlots = ['08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00'];

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
    }, [teacherId]);

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
            const [teacherData, timetableData] = await Promise.all([
                userService.getById(teacherId),
                timetableService.getByTeacher(teacherId)
            ]);

            setTeacher(teacherData);

            const timetableSchedules = Array.isArray(timetableData?.schedules) ? timetableData.schedules : [];
            const mappedSchedules = timetableSchedules.map((schedule) => {
                const start = formatTime(schedule.startHour);
                const end = formatTime(schedule.endHour);
                return {
                    jour: dayMap[schedule.day] || schedule.day,
                    horaire: `${start} - ${end}`,
                    matiere: {
                        libelle: schedule.subject?.name,
                        code: schedule.subject?.code,
                        classe: {
                            id: schedule.classe?.classId,
                            nom: schedule.classe?.name
                        }
                    }
                };
            });

            setSchedules(mappedSchedules);
        } catch (error) {
            toast.error("Erreur lors du chargement des donnees");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const findSchedule = (day, time) => {
        return schedules.find(
            schedule => schedule.jour === day && schedule.horaire === time
        );
    };

    const handlePrint = () => {
        window.print();
    };

    const totalHours = schedules.reduce((total, item) => {
        const [start, end] = item.horaire.split(' - ');
        const startTime = parseTimeToMinutes(start);
        const endTime = parseTimeToMinutes(end);
        const hours = Math.max(0, (endTime - startTime) / 60);
        return total + hours;
    }, 0);

    const classesCount = new Set(schedules.map((t) => t.matiere?.classe?.id).filter(Boolean)).size;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed]"></div>
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Enseignant non trouve</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-[#312e81]">
                            Emploi du temps
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Enseignant : <span className="font-semibold">{teacher.name}</span>
                        </p>
                        <p className="text-gray-500 text-sm">
                            Email : {teacher.email}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button onClick={handlePrint} variant="secondary">
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Imprimer
                        </Button>
                        <Link href="/chief/timetables/teachers">
                            <Button variant="secondary">
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Retour
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="w-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Horaire
                            </th>
                            {daysOfWeek.map((day) => (
                                <th key={day} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                                            className="px-1 py-1 text-sm"
                                        >
                                            {schedule ? (
                                                <div className="p-3 rounded-md bg-violet-100 border border-violet-200 h-full min-h-[80px]">
                                                    <div className="font-medium text-[#312e81]">
                                                        {schedule.matiere?.libelle}
                                                    </div>
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        {schedule.matiere?.classe?.nom}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-3 rounded-md bg-gray-50 border border-gray-100 h-full min-h-[80px] flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs">Libre</span>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Total de cours
                                </dt>
                                <dd className="flex items-baseline">
                                    <div className="text-2xl font-semibold text-gray-900">
                                        {schedules.length}
                                    </div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Heures/semaine
                                </dt>
                                <dd className="flex items-baseline">
                                    <div className="text-2xl font-semibold text-gray-900">
                                        {totalHours}h
                                    </div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">
                                    Classes differentes
                                </dt>
                                <dd className="flex items-baseline">
                                    <div className="text-2xl font-semibold text-gray-900">
                                        {classesCount}
                                    </div>
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
