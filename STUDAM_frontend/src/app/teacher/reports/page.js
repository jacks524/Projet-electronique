"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuthContext } from '../../../context/authContext';
import reportService from '../../../services/reportService';
import attendanceService from '../../../services/attendanceService';
import toast from 'react-hot-toast';

export default function TeacherReportsPage() {
    const { user, loading: authLoading } = useAuthContext();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        if (authLoading || !user?.id) return;
        loadReports();
    }, [user, authLoading]);

    const loadReports = async () => {
        try {
            setLoading(true);

            const [validated, teacherSessions] = await Promise.all([
                reportService.getValidatedReports(user.id),
                attendanceService.getSessionsByTeacher(user.id),
            ]);

            const ownSessionIds = new Set((Array.isArray(teacherSessions) ? teacherSessions : []).map((s) => String(s.attendanceSessionId || s.sessionId || s.id)).filter(Boolean));

            const sanitized = (Array.isArray(validated) ? validated : []).filter((report) => {
                const id = String(report.id || report.raw?.attendanceSessionId || report.raw?.sessionId || report.raw?.id || '');
                if (id && ownSessionIds.size > 0) return ownSessionIds.has(id);
                if (report.raw?.teacherId) return String(report.raw.teacherId) === String(user.id);
                return true;
            });

            setReports(sanitized);
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors du chargement des rapports');
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = useMemo(() => {
        let filtered = [...reports];

        if (searchTerm) {
            const key = searchTerm.toLowerCase();
            filtered = filtered.filter((report) =>
                (report.subject?.name || '').toLowerCase().includes(key) ||
                (report.class?.name || '').toLowerCase().includes(key) ||
                String(report.date || '').includes(searchTerm)
            );
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter((report) => report.status === filterStatus);
        }

        return filtered;
    }, [reports, searchTerm, filterStatus]);

    const stats = useMemo(() => {
        const totalReports = reports.length;
        let present = 0;
        let total = 0;
        reports.forEach((r) => {
            const p = Number.parseInt(r.presentCount || 0, 10) || 0;
            const t = Number.parseInt(r.totalStudents || 0, 10) || 0;
            present += p;
            total += t;
        });
        const averageRate = total > 0 ? Math.round((present / total) * 100) : 0;
        return {
            totalReports,
            totalStudentsMeasured: total,
            averageRate,
        };
    }, [reports]);

    const getStatusBadge = (status) => {
        if (status === 'VALIDATED') return 'bg-green-100 text-green-800';
        if (status === 'PENDING') return 'bg-yellow-100 text-yellow-800';
        if (status === 'REJECTED') return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status) => {
        if (status === 'VALIDATED') return 'Valide';
        if (status === 'PENDING') return 'En attente';
        if (status === 'REJECTED') return 'Rejete';
        return status;
    };

    const sanitizeSegment = (value) => (value || '').toString().replace(/[^A-Za-z0-9]+/g, '_');

    const downloadReportCsv = (report) => {
        if (!report?.id) {
            toast.error('Session introuvable pour export CSV.');
            return;
        }

        const task = (async () => {
            const blob = await attendanceService.downloadSessionCsv(report.id);
            const subjectPart = sanitizeSegment(report.subject?.name || 'presence');
            const classPart = sanitizeSegment(report.class?.name || 'classe');
            const datePart = report.date ? new Date(report.date).toISOString().split('T')[0] : 'date';
            const fileName = `${subjectPart}_${classPart}_${datePart}.csv`;

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        })();

        toast.promise(task, {
            loading: 'Telechargement en cours...',
            success: 'CSV telecharge.',
            error: 'Echec du telechargement.',
        });
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Chargement des rapports...</p>
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
                    <h1 className="text-2xl font-bold text-gray-900">Mes Rapports de Presence</h1>
                    <p className="text-gray-600 mt-1">Rapports et statistiques uniquement de l&apos;enseignant connecte</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Link href="/teacher/dashboard" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">Retour au dashboard</Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p><p className="text-sm text-gray-600">Rapports valides</p></div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><p className="text-2xl font-bold text-gray-900">{stats.totalStudentsMeasured}</p><p className="text-sm text-gray-600">Etudiants mesures</p></div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"><p className="text-2xl font-bold text-gray-900">{stats.averageRate}%</p><p className="text-sm text-gray-600">Taux moyen de presence</p></div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Matiere, classe, date..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="all">Tous les statuts</option>
                        <option value="VALIDATED">Valides</option>
                        <option value="PENDING">En attente</option>
                        <option value="REJECTED">Rejetes</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-lg font-semibold text-gray-900">Fiches de presence ({filteredReports.length})</h2></div>
                {filteredReports.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">Aucun rapport trouve.</div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredReports.map((report) => (
                            <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{report.subject?.name || 'Matiere'}</h3>
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(report.status)}`}>{getStatusLabel(report.status)}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                            <div>{report.class?.name || 'Classe'}</div>
                                            <div>{report.date ? new Date(report.date).toLocaleDateString('fr-FR') : '-'}</div>
                                            <div>{report.presentCount || 0} presents / {report.totalStudents || 0} etudiants</div>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex space-x-2">
                                        <button onClick={() => downloadReportCsv(report)} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">Telecharger CSV</button>
                                        <Link href={`/teacher/attendance/history/${report.id}`} className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors">Voir details</Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
