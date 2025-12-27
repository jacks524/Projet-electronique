"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../../../context/authContext';
import timetableService from '../../../../services/timetableService';
import studentService from '../../../../services/studentService';
//import attendanceService from '../../../../services/attendanceService';
import toast from 'react-hot-toast';

export default function TakeAttendancePage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuthContext();

    const [todaySchedules, setTodaySchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [students, setStudents] = useState([]);
    const [attendances, setAttendances] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    // Date du jour au format YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    const todayFormatted = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    useEffect(() => {
        if (authLoading || !user) return;
        loadTodaySchedules();
    }, [user, authLoading]);

    const loadTodaySchedules = async () => {
        try {
            setLoading(true);
            const allTimetables = await timetableService.getAll();

            const todayDay = new Date().toLocaleString('en-US', { weekday: 'long' }).toUpperCase(); // ex: "MONDAY"
            let schedulesForToday = [];

            allTimetables.forEach(timetable => {
                if (timetable.schedules) {
                    const filtered = timetable.schedules.filter(s =>
                        s.teacher?.id === user.id && s.day === todayDay
                    );
                    schedulesForToday.push(...filtered);
                }
            });

            const formattedSchedules = schedulesForToday.map(s => ({
                id: s.scheduleId,
                courseName: s.subject.name,
                courseCode: s.subject.code,
                className: allTimetables.find(t => t.timetableId === s.timetable.timetableId)?.class?.name || 'Classe inconnue',
                classId: allTimetables.find(t => t.timetableId === s.timetable.timetableId)?.class?.classId || null,
                time: `${String(s.startHour.hour).padStart(2, '0')}:${String(s.startHour.minute).padStart(2, '0')} - ${String(s.endHour.hour).padStart(2, '0')}:${String(s.endHour.minute).padStart(2, '0')}`,
                room: 'Salle à définir', // L'API ne fournit pas cette info
            }));

            setTodaySchedules(formattedSchedules);

        } catch (error) {
            toast.error('Erreur lors du chargement de vos cours du jour.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCourse = async (schedule) => {
        if (!schedule.classId) {
            toast.error("Impossible de trouver les étudiants car la classe n'est pas définie pour ce cours.");
            return;
        }
        try {
            setLoading(true);
            setSelectedSchedule(schedule);

            const studentsData = await studentService.getByClass(schedule.classId);
            setStudents(studentsData);

            const initialAttendances = {};
            studentsData.forEach(student => {
                initialAttendances[student.studentId] = 'PRESENT';
            });
            setAttendances(initialAttendances);

            setCurrentStep(2);
        } catch (error) {
            toast.error('Erreur lors du chargement des étudiants.');
        } finally {
            setLoading(false);
        }
    };

    const handleAttendanceChange = (studentId, status) => {
        setAttendances(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSubmitAttendance = async () => {
        if (!selectedSchedule) return;

        try {
            setSubmitting(true);
            const attendanceData = {
                scheduleId: selectedSchedule.id,
                date: today,
                attendances: students.map(student => ({
                    studentId: student.studentId,
                    status: attendances[student.studentId] || 'ABSENT'
                }))
            };

            console.log('Données à envoyer:', attendanceData);

            await new Promise(resolve => setTimeout(resolve, 2000));

            toast.success('Feuille de présence enregistrée avec succès !');

            router.push('/teacher/attendance?success=true');

        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
            toast.error('Erreur lors de l\'enregistrement de la présence');
        } finally {
            setSubmitting(false);
        }
    };

    const getAttendanceStats = () => {
        const present = Object.values(attendances).filter(status => status === 'PRESENT').length;
        const absent = Object.values(attendances).filter(status => status === 'ABSENT').length;
        const late = Object.values(attendances).filter(status => status === 'LATE').length;

        return { present, absent, late };
    };

    const stats = getAttendanceStats();

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Chargement de vos cours...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête et navigation */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Prendre les Présences</h1>
                    <p className="text-gray-600 mt-1">
                        {currentStep === 1 ? 'Sélectionnez un cours' : 'Marquez les présences des étudiants'}
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                    <Link
                        href="/teacher/attendance"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Retour au hub
                    </Link>
                </div>
            </div>

            {/* Indicateur de progression */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                    <div className={`flex items-center ${currentStep >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-orange-100 border border-orange-300' : 'bg-gray-100 border border-gray-300'}`}>
                            1
                        </div>
                        <span className="ml-2 font-medium">Sélection du cours</span>
                    </div>
                    <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
                    <div className={`flex items-center ${currentStep >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-orange-100 border border-orange-300' : 'bg-gray-100 border border-gray-300'}`}>
                            2
                        </div>
                        <span className="ml-2 font-medium">Prise de présence</span>
                    </div>
                </div>
            </div>

            {/* Étape 1 : Sélection du cours */}
            {currentStep === 1 && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Vos Cours Aujourd'hui</h2>
                                <p className="text-gray-600 mt-1">{todayFormatted}</p>
                            </div>
                            <div className="text-sm text-gray-500">
                                {todaySchedules.length} cours programmé(s)
                            </div>
                        </div>

                        {todaySchedules.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cours aujourd'hui</h3>
                                <p className="text-gray-500">
                                    Vous n'avez pas de cours programmé pour aujourd'hui.
                                </p>
                                <Link
                                    href="/teacher/timetable"
                                    className="inline-flex items-center mt-4 px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-500"
                                >
                                    Voir mon emploi du temps complet →
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {todaySchedules.map((schedule) => (
                                    <div
                                        key={schedule.id}
                                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-orange-300 transition-all cursor-pointer bg-white"
                                        onClick={() => handleSelectCourse(schedule)}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 text-lg mb-1">
                                                    {schedule.courseName}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-2">{schedule.courseCode}</p>
                                                <div className="space-y-2 text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                                        </svg>
                                                        {schedule.className} • {schedule.totalStudents} étudiants
                                                    </div>
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                        </svg>
                                                        {schedule.time}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                                        </svg>
                                                        {schedule.room}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-4">
                                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="mt-4 text-center">
                                            <button className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium">
                                                Prendre les présences
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Étape 2 : Prise de présence */}
            {currentStep === 2 && selectedSchedule && (
                <div className="space-y-6">
                    {/* En-tête du cours sélectionné */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                                    </svg>
                                </button>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{selectedSchedule.courseName}</h2>
                                    <p className="text-gray-600">
                                        {selectedSchedule.className} • {selectedSchedule.time} • {selectedSchedule.room}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Date</p>
                                <p className="font-medium text-gray-900">{todayFormatted}</p>
                            </div>
                        </div>
                    </div>

                    {/* Statistiques en temps réel */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                            <div className="text-sm text-green-700">Présents</div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                            <div className="text-sm text-red-700">Absents</div>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-amber-600">{stats.late}</div>
                            <div className="text-sm text-amber-700">Retards</div>
                        </div>
                    </div>

                    {/* Liste des étudiants */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Liste des Étudiants</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {students.length} étudiant(s) • Marquez le statut de présence pour chaque étudiant
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => {
                                            // Marquer tous comme présents
                                            const allPresent = {};
                                            students.forEach(student => {
                                                allPresent[student.id] = 'PRESENT';
                                            });
                                            setAttendances(allPresent);
                                        }}
                                        className="px-3 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                    >
                                        Tout marquer présent
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Matricule
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nom de l'étudiant
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut de présence
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {students.map((student) => (
                                    <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{student.matricule}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                <div className="text-sm text-gray-500">{student.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => handleAttendanceChange(student.id, 'PRESENT')}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                        attendances[student.id] === 'PRESENT'
                                                            ? 'bg-green-100 text-green-800 ring-2 ring-green-500'
                                                            : 'bg-gray-100 text-gray-800 hover:bg-green-50'
                                                    }`}
                                                >
                                                    ✅ Présent
                                                </button>
                                                <button
                                                    onClick={() => handleAttendanceChange(student.studentId, 'PRESENT')}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                        attendances[student.id] === 'ABSENT'
                                                            ? 'bg-red-100 text-red-800 ring-2 ring-red-500'
                                                            : 'bg-gray-100 text-gray-800 hover:bg-red-50'
                                                    }`}
                                                >
                                                    ❌ Absent
                                                </button>
                                                <button
                                                    onClick={() => handleAttendanceChange(student.id, 'LATE')}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                        attendances[student.id] === 'LATE'
                                                            ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-500'
                                                            : 'bg-gray-100 text-gray-800 hover:bg-amber-50'
                                                    }`}
                                                >
                                                    ⏰ Retard
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Actions finales */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            <div className="text-sm text-gray-600">
                                <p>Vérifiez les statuts avant de valider la feuille de présence.</p>
                                <p className="font-medium mt-1">
                                    Présents: {stats.present} • Absents: {stats.absent} • Retards: {stats.late}
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                    Changer de cours
                                </button>
                                <button
                                    onClick={handleSubmitAttendance}
                                    disabled={submitting}
                                    className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            Valider la feuille de présence
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}