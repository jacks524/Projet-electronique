"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuthContext } from '../../../context/authContext';
import timetableService from '../../../services/timetableService';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_LABELS = {
    MONDAY: 'Lundi',
    TUESDAY: 'Mardi',
    WEDNESDAY: 'Mercredi',
    THURSDAY: 'Jeudi',
    FRIDAY: 'Vendredi',
    SATURDAY: 'Samedi',
};

const toTime = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value.slice(0, 5);
    if (typeof value === 'object' && typeof value.hour === 'number') {
        return `${String(value.hour).padStart(2, '0')}:${String(value.minute || 0).padStart(2, '0')}`;
    }
    return '';
};

const currentDayKey = () => {
    const jsDay = new Date().getDay();
    const map = { 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY', 4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY' };
    return map[jsDay] || null;
};

export default function TeacherTimetablePage() {
    const { user, loading: authLoading } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const [schedules, setSchedules] = useState([]);
    const [selectedDay, setSelectedDay] = useState('all');
    const [showExportMenu, setShowExportMenu] = useState(false);

    useEffect(() => {
        if (authLoading || !user?.id) return;
        loadTeacherTimetable();
    }, [user, authLoading]);

    const loadTeacherTimetable = async () => {
        try {
            setLoading(true);
            const timetablesData = await timetableService.getByTeacher(user.id);
            const list = Array.isArray(timetablesData) ? timetablesData : [];

            const flattened = [];
            list.forEach((tt) => {
                const classInfo = tt.class || tt.classResponseDTO || tt.classe || {};
                const schedulesList = Array.isArray(tt?.schedules) ? tt.schedules : [];
                schedulesList.forEach((s) => {
                    flattened.push({
                        id: s.scheduleId || s.id,
                        day: s.day,
                        start: toTime(s.startHour || s.startTime),
                        end: toTime(s.endHour || s.endTime),
                        timeLabel: `${toTime(s.startHour || s.startTime)} - ${toTime(s.endHour || s.endTime)}`,
                        subject: s.subject || {},
                        class: s.classResponseDTO || s.class || classInfo || {},
                        room: s.room || s.salle || '',
                    });
                });
            });

            setSchedules(flattened);
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors du chargement de l'emploi du temps");
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    const visibleDays = selectedDay === 'all' ? DAYS : [selectedDay];

    const timeSlots = useMemo(() => {
        const uniq = Array.from(new Set(schedules.map((s) => s.timeLabel).filter(Boolean)));
        uniq.sort((a, b) => a.localeCompare(b));
        return uniq;
    }, [schedules]);

    const visibleSchedules = useMemo(() => {
        if (selectedDay === 'all') return schedules;
        return schedules.filter((s) => s.day === selectedDay);
    }, [schedules, selectedDay]);

    const todaySchedules = useMemo(() => {
        const day = currentDayKey();
        if (!day) return [];
        return schedules.filter((s) => s.day === day);
    }, [schedules]);

    const getScheduleForSlot = (day, timeLabel) => visibleSchedules.find((s) => s.day === day && s.timeLabel === timeLabel);

    const exportTimetableToPDF = () => {
        try {
            const doc = new jsPDF('l', 'mm', 'a4');
            doc.setFontSize(16);
            doc.text('STUDAM - Emploi du temps enseignant', 14, 16);
            doc.setFontSize(10);
            doc.text(`Enseignant: ${user?.name || '---'}`, 14, 22);
            doc.text(`Genere le ${new Date().toLocaleString('fr-FR')}`, 14, 28);

            const rows = timeSlots.map((slot) => {
                const line = [slot];
                visibleDays.forEach((day) => {
                    const schedule = getScheduleForSlot(day, slot);
                    if (!schedule) {
                        line.push('-');
                        return;
                    }
                    const subjectName = schedule.subject?.name || schedule.subject?.label || 'Cours';
                    const className = schedule.class?.name || schedule.class?.className || 'Classe';
                    line.push(`${subjectName}\n${className}`);
                });
                return line;
            });

            doc.autoTable({
                startY: 34,
                head: [['Horaire', ...visibleDays.map((d) => DAY_LABELS[d] || d)]],
                body: rows,
                theme: 'grid',
                headStyles: { fillColor: [124, 58, 237] },
            });

            doc.save(`emploi-temps-${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success('Export PDF termine.');
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'export PDF");
        }
    };

    const exportTimetableToCSV = () => {
        try {
            const header = ['Horaire', ...visibleDays.map((d) => DAY_LABELS[d] || d)];
            const rows = timeSlots.map((slot) => {
                const row = [slot];
                visibleDays.forEach((day) => {
                    const schedule = getScheduleForSlot(day, slot);
                    if (!schedule) {
                        row.push('');
                        return;
                    }
                    const subjectName = schedule.subject?.name || schedule.subject?.label || 'Cours';
                    const className = schedule.class?.name || schedule.class?.className || 'Classe';
                    row.push(`${subjectName} - ${className}`);
                });
                return row;
            });

            const csv = [header, ...rows]
                .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
                .join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `emploi-temps-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            setShowExportMenu(false);
            toast.success('Export CSV termine.');
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'export CSV");
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Chargement de votre emploi du temps...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mon Emploi du Temps</h1>
                    <p className="text-gray-600 mt-1">Genere automatiquement depuis vos classes et matieres affectees</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                    <Link href="/teacher/dashboard" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">Retour au dashboard</Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Jour de la semaine</label>
                        <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="all">Tous les jours</option>
                            {DAYS.map((day) => <option key={day} value={day}>{DAY_LABELS[day]}</option>)}
                        </select>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center"><p className="text-2xl font-bold text-violet-600">{schedules.length}</p><p className="text-sm text-gray-600">Cours planifies</p></div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center"><p className="text-2xl font-bold text-blue-600">{todaySchedules.length}</p><p className="text-sm text-gray-600">Cours aujourd&apos;hui</p></div>
                </div>
            </div>

            {todaySchedules.length > 0 && selectedDay === 'all' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-violet-50"><h2 className="text-lg font-semibold text-gray-900">Cours aujourd&apos;hui</h2></div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {todaySchedules.map((schedule) => (
                            <div key={`${schedule.id}-${schedule.timeLabel}`} className="border border-violet-200 rounded-lg p-4 bg-violet-50">
                                <h3 className="font-semibold text-gray-900">{schedule.subject?.name || 'Cours'}</h3>
                                <p className="text-sm text-gray-600">{schedule.class?.name || 'Classe'}</p>
                                <p className="text-sm text-gray-500">{schedule.timeLabel}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Emploi du temps</h2>
                        <p className="text-sm text-gray-600 mt-1">{visibleSchedules.length} cours affiches</p>
                    </div>
                    <div className="relative">
                        <button onClick={() => setShowExportMenu(!showExportMenu)} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">Exporter</button>
                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                <button onClick={exportTimetableToPDF} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Exporter en PDF</button>
                                <button onClick={exportTimetableToCSV} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Exporter en CSV</button>
                            </div>
                        )}
                    </div>
                </div>

                {timeSlots.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">Aucun cours planifie.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horaire</th>
                                {visibleDays.map((day) => <th key={day} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{DAY_LABELS[day]}</th>)}
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {timeSlots.map((slot) => (
                                <tr key={slot}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">{slot}</td>
                                    {visibleDays.map((day) => {
                                        const schedule = getScheduleForSlot(day, slot);
                                        return (
                                            <td key={`${day}-${slot}`} className="px-3 py-3">
                                                {schedule ? (
                                                    <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 min-h-[90px]">
                                                        <div className="font-semibold text-gray-900 text-sm mb-1">{schedule.subject?.name || 'Cours'}</div>
                                                        <div className="text-xs text-gray-600 mb-1">{schedule.class?.name || 'Classe'}</div>
                                                        <div className="text-xs text-gray-500">{schedule.room || '-'}</div>
                                                    </div>
                                                ) : (
                                                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 min-h-[90px] flex items-center justify-center text-gray-400 text-xs">Aucun cours</div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
