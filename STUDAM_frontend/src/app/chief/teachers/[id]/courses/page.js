"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';

export default function TeacherCoursesPage() {
    const params = useParams();
    const router = useRouter();
    const teacherId = params.id;

    const [teacher, setTeacher] = useState(null);
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState('all');

    const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    useEffect(() => {
        loadData();
    }, [teacherId]);

    const loadData = async () => {
        try {
            setLoading(true);
            // TODO: Appeler les endpoints
            // const teacherData = await userService.getById(teacherId);
            // const timetableData = await timetableService.getByTeacher(teacherId);

            const mockTeacher = {
                id: teacherId,
                name: 'Dr. Mamadou Diallo',
                email: 'mamadou.diallo@email.com',
                department: { name: 'Informatique' }
            };

            const mockTimetable = [
                {
                    id: 1,
                    day: 'Lundi',
                    startTime: '08:00',
                    endTime: '10:00',
                    subject: { id: 1, libelle: 'Programmation Web', code: 'INFO301' },
                    class: { id: 1, name: '3GI', level: 'Licence 3' },
                    room: 'Salle A101'
                },
                {
                    id: 2,
                    day: 'Lundi',
                    startTime: '14:00',
                    endTime: '16:00',
                    subject: { id: 2, libelle: 'Base de données', code: 'INFO302' },
                    class: { id: 2, name: '4GI', level: 'Master 1' },
                    room: 'Salle B205'
                },
                {
                    id: 3,
                    day: 'Mercredi',
                    startTime: '10:00',
                    endTime: '12:00',
                    subject: { id: 1, libelle: 'Programmation Web', code: 'INFO301' },
                    class: { id: 1, name: '3GI', level: 'Licence 3' },
                    room: 'Salle A101'
                },
                {
                    id: 4,
                    day: 'Vendredi',
                    startTime: '08:00',
                    endTime: '11:00',
                    subject: { id: 3, libelle: 'Développement Mobile', code: 'INFO303' },
                    class: { id: 3, name: '5GI', level: 'Master 2' },
                    room: 'Labo Info 1'
                }
            ];

            setTeacher(mockTeacher);
            setTimetable(mockTimetable);

        } catch (error) {
            toast.error("Erreur lors du chargement des données");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTimetable = selectedDay === 'all'
        ? timetable
        : timetable.filter(item => item.day === selectedDay);

    const groupedByDay = daysOfWeek.reduce((acc, day) => {
        acc[day] = filteredTimetable.filter(item => item.day === day);
        return acc;
    }, {});

    const totalHoursPerWeek = timetable.reduce((total, item) => {
        const start = new Date(`2000-01-01 ${item.startTime}`);
        const end = new Date(`2000-01-01 ${item.endTime}`);
        const hours = (end - start) / (1000 * 60 * 60);
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
            {/* En-tête */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-[#312e81]">Emploi du temps</h1>
                    <p className="text-gray-600 mt-1">{teacher?.name} - {teacher?.department.name}</p>
                </div>
                <Link href={`/chief/teachers/${teacherId}`}>
                    <Button variant="secondary">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        Retour
                    </Button>
                </Link>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Heures/semaine</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">{totalHoursPerWeek}h</p>
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
                            <p className="text-sm font-medium text-gray-500">Cours/semaine</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">{timetable.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Matières</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">
                                {[...new Set(timetable.map(t => t.subject.id))].length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-violet-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Classes</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">
                                {[...new Set(timetable.map(t => t.class.id))].length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtre par jour */}
            <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center space-x-2 overflow-x-auto">
                    <button
                        onClick={() => setSelectedDay('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                            selectedDay === 'all'
                                ? 'bg-[#7c3aed] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Tous les jours
                    </button>
                    {daysOfWeek.map((day) => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                                selectedDay === day
                                    ? 'bg-[#7c3aed] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>

            {/* Emploi du temps */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {selectedDay === 'all' ? (
                    <div className="divide-y divide-gray-200">
                        {daysOfWeek.map((day) => {
                            const dayCourses = groupedByDay[day];
                            if (dayCourses.length === 0) return null;

                            return (
                                <div key={day} className="p-6">
                                    <h3 className="text-lg font-semibold text-[#312e81] mb-4">{day}</h3>
                                    <div className="space-y-3">
                                        {dayCourses.map((course) => (
                                            <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#7c3aed] transition-colors">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3">
                                                            <span className="px-3 py-1 bg-[#7c3aed] text-white rounded-full text-sm font-medium">
                                                                {course.startTime} - {course.endTime}
                                                            </span>
                                                            <h4 className="font-semibold text-gray-900">{course.subject.libelle}</h4>
                                                            <span className="text-sm text-gray-500">({course.subject.code})</span>
                                                        </div>
                                                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                                                            <span className="flex items-center">
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                                                </svg>
                                                                {course.class.name} ({course.class.level})
                                                            </span>
                                                            <span className="flex items-center">
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                                </svg>
                                                                {course.room}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Link href={`/chief/subjects/${course.subject.id}`}>
                                                        <button className="text-[#7c3aed] hover:text-[#6d28d9]">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                                                            </svg>
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        {filteredTimetable.length === 0 && (
                            <div className="p-12 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun cours</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Cet enseignant n'a pas encore de cours dans son emploi du temps.
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-6">
                        {filteredTimetable.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun cours ce jour</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Aucun cours programmé pour {selectedDay}.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredTimetable.map((course) => (
                                    <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#7c3aed] transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <span className="px-3 py-1 bg-[#7c3aed] text-white rounded-full text-sm font-medium">
                                                        {course.startTime} - {course.endTime}
                                                    </span>
                                                    <h4 className="font-semibold text-gray-900">{course.subject.libelle}</h4>
                                                    <span className="text-sm text-gray-500">({course.subject.code})</span>
                                                </div>
                                                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                                                    <span className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                                        </svg>
                                                        {course.class.name} ({course.class.level})
                                                    </span>
                                                    <span className="flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                        </svg>
                                                        {course.room}
                                                    </span>
                                                </div>
                                            </div>
                                            <Link href={`/chief/subjects/${course.subject.id}`}>
                                                <button className="text-[#7c3aed] hover:text-[#6d28d9]">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                                                    </svg>
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={() => window.print()}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                    </svg>
                    Imprimer
                </Button>
                <Link href="/chief/timetables">
                    <Button>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        Gérer l'emploi du temps
                    </Button>
                </Link>
            </div>
        </div>
    );
}