"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../../../../context/authContext';
import attendanceService from '../../../../../services/attendanceService';
import toast from 'react-hot-toast';

export default function AttendanceSessionDetailPage() {
    const params = useParams();
    const { user, loading: authLoading } = useAuthContext();
    const sessionId = params.sessionId;

    const [sessionDetails, setSessionDetails] = useState(null);
    const [studentsAttendance, setStudentsAttendance] = useState([]);
    const [modifiedAttendances, setModifiedAttendances] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (authLoading || !user) return;
        if (sessionId) {
            loadSessionDetails();
        }
    }, [sessionId, user, authLoading]);

    const loadSessionDetails = async () => {
        try {
            setLoading(true);
            const [sessionAttendances, teacherSessions] = await Promise.all([
                attendanceService.getSessionDetails(sessionId),
                attendanceService.getSessionsByTeacher(user.id)
            ]);

            const sessionMeta = (Array.isArray(teacherSessions) ? teacherSessions : [])
                .find((session) => String(session.attendanceSessionId || session.sessionId || session.id) === String(sessionId));

            const sessionDate = sessionMeta?.date || sessionMeta?.sessionDate || sessionMeta?.createdAt;
            const subjectName = sessionMeta?.subjectName || sessionMeta?.subject?.name || sessionMeta?.courseName || 'Cours';
            const subjectCode = sessionMeta?.subjectCode || sessionMeta?.subject?.code || sessionMeta?.courseCode || '';
            const className = sessionMeta?.className || sessionMeta?.clazzName || sessionMeta?.timetable?.clazz?.name || '';
            const totalStudents = sessionMeta?.totalStudents || sessionMeta?.total || (sessionMeta?.totalPresent || 0);

            const mappedAttendances = (Array.isArray(sessionAttendances) ? sessionAttendances : []).map((attendance) => {
                const student = attendance.student || attendance.studentDTO || attendance.studentResponse || {};
                return {
                    id: attendance.attendanceId || attendance.id,
                    matricule: student.matricule || attendance.studentMatricule || '',
                    name: student.name || attendance.studentName || '',
                    email: student.email || '',
                    status: attendance.attendanceStatus || attendance.status,
                    timestamp: attendance.presenceLoggedAt || attendance.loggedAt || sessionDate,
                };
            });

            setSessionDetails({
                id: sessionMeta?.attendanceSessionId || sessionMeta?.sessionId || sessionMeta?.id || parseInt(sessionId, 10),
                date: sessionDate,
                time: sessionDate ? new Date(sessionDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
                courseName: subjectName,
                courseCode: subjectCode,
                className,
                method: sessionMeta?.method || sessionMeta?.attendanceMethod || 'automatic',
                totalStudents: totalStudents || mappedAttendances.length,
            });

            setStudentsAttendance(mappedAttendances);

        } catch (error) {
            toast.error('Erreur lors du chargement des détails de la session');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (attendanceId, newStatus) => {
        setModifiedAttendances(prev => ({
            ...prev,
            [attendanceId]: newStatus
        }));
        setHasChanges(true);
    };

    const getCurrentStatus = (attendance) => {
        if (modifiedAttendances[attendance.id]) {
            return typeof modifiedAttendances[attendance.id] === 'string'
                ? modifiedAttendances[attendance.id]
                : modifiedAttendances[attendance.id].status;
        }
        return attendance.status;
    };

    const handleSaveChanges = async () => {
        if (!hasChanges) return;
        setSaving(true);

        const updatePromises = Object.entries(modifiedAttendances).map(([attendanceId, modification]) => {
            const payload = {
                attendanceStatus: typeof modification === 'string' ? modification : modification.status,
            };
            return attendanceService.updateAttendance(attendanceId, payload);
        });

        try {
            await toast.promise(
                Promise.all(updatePromises),
                {
                    loading: 'Sauvegarde des modifications...',
                    success: 'Modifications enregistrées !',
                    error: 'Une erreur est survenue.'
                }
            );
            setHasChanges(false);
            setModifiedAttendances({});

            loadSessionDetails();

        } catch (error) {
        } finally {
            setSaving(false);
        }
    };

    const getAttendanceStats = () => {
        const present = studentsAttendance.filter(student =>
            getCurrentStatus(student) === 'PRESENT'
        ).length;
        const absent = studentsAttendance.filter(student =>
            getCurrentStatus(student) === 'ABSENT'
        ).length;
        return { present, absent, late: 0 };
    };

    const stats = getAttendanceStats();

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Chargement des détails de la session...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!sessionDetails) {
        return (
            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Session non trouvée</h3>
                        <p className="text-gray-500 mb-6">La session demandée n'existe pas ou vous n'y avez pas accès.</p>
                        <Link
                            href="/teacher/attendance/history"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors"
                        >
                            Retour à l'historique
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête et navigation */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/teacher/attendance/history"
                        className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Retour à l'historique
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Détails de la Session</h1>
                        <p className="text-gray-600 mt-1">Vérifiez et corrigez les présences des étudiants</p>
                    </div>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                        </svg>
                        Imprimer
                    </button>
                </div>
            </div>

            {/* Informations de la session */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">{sessionDetails.courseName}</h2>
                        <p className="text-gray-600">{sessionDetails.courseCode} • {sessionDetails.className}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Date et heure</p>
                        <p className="font-medium text-gray-900">
                            {new Date(sessionDetails.date).toLocaleDateString('fr-FR')} • {sessionDetails.time}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Méthode</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            sessionDetails.method === 'automatic'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                        }`}>
                            {sessionDetails.method === 'automatic' ? 'Automatique' : 'Manuelle'}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Statistiques</p>
                        <p className="font-medium text-gray-900">
                        {stats.present} présents • {stats.absent} absents
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistiques en temps réel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-green-600">{stats.present}</div>
                    <div className="text-sm text-green-700 mt-1">Présents</div>
                    <div className="text-xs text-green-600 mt-2">
                        {Math.round((stats.present / sessionDetails.totalStudents) * 100)}% de la classe
                    </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-red-600">{stats.absent}</div>
                    <div className="text-sm text-red-700 mt-1">Absents</div>
                    <div className="text-xs text-red-600 mt-2">
                        {Math.round((stats.absent / sessionDetails.totalStudents) * 100)}% de la classe
                    </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-slate-700">{sessionDetails.totalStudents}</div>
                    <div className="text-sm text-slate-700 mt-1">Enregistrements</div>
                    <div className="text-xs text-slate-500 mt-2">
                        Modification unitaire par étudiant
                    </div>
                </div>
            </div>

            {/* Liste des étudiants avec statuts modifiables */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Feuille de Présence</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {studentsAttendance.length} étudiant(s) • Cliquez sur les statuts pour les modifier
                            </p>
                        </div>
                        {hasChanges && (
                            <div className="flex items-center space-x-3">
                                <span className="text-sm text-amber-600 font-medium">
                                    Modifications non sauvegardées
                                </span>
                                <button
                                    onClick={() => {
                                        setModifiedAttendances({});
                                        setHasChanges(false);
                                    }}
                                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveChanges}
                                    disabled={saving}
                                    className="px-4 py-1 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 rounded-lg transition-colors flex items-center"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Sauvegarde...
                                        </>
                                    ) : (
                                        'Sauvegarder'
                                    )}
                                </button>
                            </div>
                        )}
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
                                Étudiant
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Statut
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Horodatage
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {studentsAttendance.map((attendance) => {
                            const currentStatus = getCurrentStatus(attendance);

                            return (
                                <tr key={attendance.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {attendance.matricule}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {attendance.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {attendance.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex justify-center space-x-2">
                                            <button
                                                onClick={() => handleStatusChange(attendance.id, 'PRESENT')}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                    currentStatus === 'PRESENT'
                                                        ? 'bg-green-100 text-green-800 ring-2 ring-green-500'
                                                        : 'bg-gray-100 text-gray-800 hover:bg-green-50'
                                                }`}
                                            >
                                                ✅ Présent
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(attendance.id, 'ABSENT')}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                    currentStatus === 'ABSENT'
                                                        ? 'bg-red-100 text-red-800 ring-2 ring-red-500'
                                                        : 'bg-gray-100 text-gray-800 hover:bg-red-50'
                                                }`}
                                            >
                                                ❌ Absent
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(attendance.timestamp).toLocaleString('fr-FR')}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Légende et informations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Guide de Correction</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Statuts de présence</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center">
                                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                <strong>Présent</strong> - L'étudiant était présent au cours
                            </li>
                            <li className="flex items-center">
                                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                <strong>Absent</strong> - L'étudiant n'était pas présent
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Bonnes pratiques</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>• Les modifications sont sauvegardées individuellement</li>
                            <li>• Une action ne modifie que l'étudiant sélectionné</li>
                            <li>• Vous pouvez imprimer cette feuille pour archivage</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
