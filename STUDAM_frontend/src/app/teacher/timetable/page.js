"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '../../../context/authContext';
import timetableService from '../../../services/timetableService';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function TeacherTimetablePage() {
    const { user, isAuthenticated, loading: authLoading } = useAuthContext();
    const [schedules, setSchedules] = useState([]);
    const [filteredSchedules, setFilteredSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
    const [selectedDay, setSelectedDay] = useState('all');
    const [showExportMenu, setShowExportMenu] = useState(false);

    // Jours de la semaine
    const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

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
        if (authLoading || !user) return;
        loadTeacherTimetable();
    }, [user, authLoading]);

    const loadTeacherTimetable = async () => {
        try {
            setLoading(true);
            const timetablesData = await timetableService.getByTeacher(user.id);

            let allSchedules = [];
            timetablesData.forEach(tt => {
                if (tt.schedules) {
                    const schedulesWithContext = tt.schedules.map(s => ({
                        ...s,
                        timetableInfo: { id: tt.timetableId, semester: tt.semester }
                    }));
                    allSchedules.push(...schedulesWithContext);
                }
            });

            const formattedSchedules = allSchedules.map(s => ({
                id: s.scheduleId,
                day: s.day,
                time: `${String(s.startHour.hour).padStart(2, '0')}:${String(s.startHour.minute).padStart(2, '0')} - ${String(s.endHour.hour).padStart(2, '0')}:${String(s.endHour.minute).padStart(2, '0')}`,
                subject: s.subject,
                class: timetablesData.find(tt => tt.timetableId === s.timetableInfo.id)?.class || { name: 'N/A' },
                room: 'Salle à définir'
            }));

            setSchedules(formattedSchedules);
            setFilteredSchedules(formattedSchedules);

        } catch (error) {
            toast.error('Erreur lors du chargement de l\'emploi du temps');
        } finally {
            setLoading(false);
        }
    };

    const daysOfWeekMapping = {
        'Lundi': 'MONDAY',
        'Mardi': 'TUESDAY',
        'Mercredi': 'WEDNESDAY',
        'Jeudi': 'THURSDAY',
        'Vendredi': 'FRIDAY',
        'Samedi': 'SATURDAY'
    };

    const getScheduleForSlot = (day, timeSlot) => {
        const apiDay = daysOfWeekMapping[day];

        return filteredSchedules.find(schedule =>
            schedule.day === apiDay && schedule.time === timeSlot
        );
    };

    const getTodaySchedule = () => {
        const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
        return schedules.filter(schedule => {
            const scheduleDay = schedule.day || schedule.jour;
            return scheduleDay?.toLowerCase() === today.toLowerCase();
        });
    };

    const todaySchedule = getTodaySchedule();

    const exportTimetableToPDF = async () => {
        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');

            const doc = new jsPDF('l', 'mm', 'a4');

            doc.setFontSize(18);
            doc.setTextColor(242, 100, 25);
            doc.text('STUDAM - Emploi du Temps', 14, 15);

            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(`Enseignant: ${user.name}`, 14, 22);
            doc.text(`Semaine ${selectedWeek} - ${new Date().toLocaleDateString('fr-FR')}`, 14, 28);

            const tableData = [];
            const filteredDays = daysOfWeek.filter(day => selectedDay === 'all' || day === selectedDay);

            timeSlots.forEach(timeSlot => {
                const row = [timeSlot];

                filteredDays.forEach(day => {
                    const schedule = getScheduleForSlot(day, timeSlot);
                    if (schedule) {
                        const courseInfo = `${schedule.subject?.name || schedule.matiere?.libelle}\n${schedule.class?.name || schedule.classe?.nom}\n${schedule.room || schedule.salle}`;
                        row.push(courseInfo);
                    } else {
                        row.push('-');
                    }
                });

                tableData.push(row);
            });

            doc.autoTable({
                startY: 35,
                head: [['Horaire', ...filteredDays]],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [242, 100, 25],
                    textColor: [255, 255, 255],
                    fontSize: 10,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                bodyStyles: {
                    fontSize: 9,
                    cellPadding: 3,
                    valign: 'middle'
                },
                columnStyles: {
                    0: { cellWidth: 30, fontStyle: 'bold', halign: 'center' }
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                margin: { top: 35, left: 14, right: 14 }
            });

            const fileName = `emploi_du_temps_${user.name.replace(/\s+/g, '_')}_semaine${selectedWeek}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            toast.success('Emploi du temps exporté en PDF avec succès');
        } catch (error) {
            console.error('Erreur export PDF:', error);
            toast.error('Erreur lors de l\'export PDF');
        }
    };

    const exportTimetableToCSV = () => {
        try {
            const exportData = [];

            const header = ['Horaire', ...daysOfWeek.filter(day => selectedDay === 'all' || day === selectedDay)];
            exportData.push(header.join(';'));

            timeSlots.forEach(timeSlot => {
                const row = [timeSlot];

                daysOfWeek
                    .filter(day => selectedDay === 'all' || day === selectedDay)
                    .forEach(day => {
                        const schedule = getScheduleForSlot(day, timeSlot);
                        if (schedule) {
                            const courseInfo = `${schedule.subject?.name || schedule.matiere?.libelle} - ${schedule.class?.name || schedule.classe?.nom} - ${schedule.room || schedule.salle}`;
                            row.push(courseInfo);
                        } else {
                            row.push('');
                        }
                    });

                exportData.push(row.join(';'));
            });

            const csvContent = exportData.join('\n');
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');

            const fileName = `emploi_du_temps_${user.name.replace(/\s+/g, '_')}_semaine${selectedWeek}_${new Date().toISOString().split('T')[0]}.csv`;

            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();

            setShowExportMenu(false);
            toast.success('Emploi du temps exporté en CSV avec succès');
        } catch (error) {
            toast.error('Erreur lors de l\'export CSV');
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Chargement de votre emploi du temps...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mon Emploi du Temps</h1>
                    <p className="text-gray-600 mt-1">
                        Consultez votre planning de cours et vos horaires
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                    <Link
                        href="/teacher/dashboard"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Retour au dashboard
                    </Link>
                </div>
            </div>

            {/* Filtres et statistiques */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filtres */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Jour de la semaine
                                </label>
                                <select
                                    value={selectedDay}
                                    onChange={(e) => setSelectedDay(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                >
                                    <option value="all">Tous les jours</option>
                                    {daysOfWeek.map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Semaine
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="52"
                                    value={selectedWeek}
                                    onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistiques rapides */}
                <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-orange-600">{schedules.length}</p>
                            <p className="text-sm text-gray-600">Cours cette semaine</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{todaySchedule.length}</p>
                            <p className="text-sm text-gray-600">Cours aujourd'hui</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cours du jour */}
            {selectedDay === 'all' && todaySchedule.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-orange-50">
                        <h2 className="text-lg font-semibold text-gray-900">
                            📅 Cours aujourd'hui ({new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })})
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {todaySchedule.map((schedule, index) => (
                                <div key={index} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-gray-900">
                                            {schedule.subject?.name || schedule.matiere?.libelle}
                                        </h3>
                                        <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                            {schedule.time || schedule.horaire}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        {schedule.class?.name || schedule.classe?.nom}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {schedule.room || schedule.salle}
                                    </p>
                                    <div className="mt-3 flex space-x-2">
                                        <Link
                                            href={`/teacher/attendance?course=${schedule.subject?.id || schedule.matiere?.id}&class=${schedule.class?.id || schedule.classe?.id}`}
                                            className="flex-1 text-center px-3 py-1.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded transition-colors"
                                        >
                                            Présences
                                        </Link>
                                        <Link
                                            href={`/teacher/courses/${schedule.subject?.id || schedule.matiere?.id}`}
                                            className="flex-1 text-center px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-100 hover:bg-orange-200 rounded transition-colors"
                                        >
                                            Détails
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Grille de l'emploi du temps */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {selectedDay === 'all' ? 'Emploi du temps complet' : `Emploi du temps - ${selectedDay}`}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Semaine {selectedWeek} • {filteredSchedules.length} cours programmés
                            </p>
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                Exporter
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>

                            {showExportMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setShowExportMenu(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                        <button
                                            onClick={exportTimetableToPDF}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
                                        >
                                            <svg className="w-4 h-4 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                            </svg>
                                            Exporter en PDF
                                        </button>
                                        <button
                                            onClick={exportTimetableToCSV}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
                                        >
                                            <svg className="w-4 h-4 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                            </svg>
                                            Exporter en CSV
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Horaire
                            </th>
                            {daysOfWeek
                                .filter(day => selectedDay === 'all' || day === selectedDay)
                                .map((day) => (
                                    <th key={day} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {day}
                                    </th>
                                ))
                            }
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {timeSlots.map((timeSlot) => (
                            <tr key={timeSlot} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                                    {timeSlot}
                                </td>
                                {daysOfWeek
                                    .filter(day => selectedDay === 'all' || day === selectedDay)
                                    .map((day) => {
                                        const schedule = getScheduleForSlot(day, timeSlot);
                                        return (
                                            <td key={day} className="px-3 py-3">
                                                {schedule ? (
                                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 hover:shadow-md transition-all cursor-pointer h-full min-h-[100px]">
                                                        <div className="font-semibold text-gray-900 text-sm mb-1">
                                                            {schedule.subject?.name || schedule.matiere?.libelle}
                                                        </div>
                                                        <div className="text-xs text-gray-600 mb-1">
                                                            {schedule.class?.name || schedule.classe?.nom}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mb-2">
                                                            {schedule.room || schedule.salle}
                                                        </div>
                                                        <div className="flex space-x-1 mt-2">
                                                            <Link
                                                                href={`/teacher/attendance?course=${schedule.subject?.id || schedule.matiere?.id}&class=${schedule.class?.id || schedule.classe?.id}`}
                                                                className="flex-1 text-center px-2 py-1 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded transition-colors"
                                                            >
                                                                Présences
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 h-full min-h-[100px] flex items-center justify-center">
                                                        <span className="text-gray-400 text-xs">Aucun cours</span>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })
                                }
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}