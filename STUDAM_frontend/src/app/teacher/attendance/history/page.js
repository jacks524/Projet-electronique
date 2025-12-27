"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '../../../../context/authContext';
import attendanceService from '../../../../services/attendanceService';
import subjectService from '../../../../services/subjectService';
import classService from '../../../../services/classService';
import toast from 'react-hot-toast';

export default function AttendanceHistoryPage() {
    const { user, isAuthenticated, loading: authLoading } = useAuthContext();
    const [attendanceSessions, setAttendanceSessions] = useState([]);
    const [filteredSessions, setFilteredSessions] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        subjectId: '',
        classId: '',
        dateRange: 'all',
        startDate: '',
        endDate: ''
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        if (authLoading || !user) return;
        loadInitialData();
    }, [user, authLoading]);

    const loadInitialData = async () => {
        try {
            setLoading(true);

            const [teacherSubjects, teacherClasses] = await Promise.all([
                subjectService.getByTeacher(user.id),
                classService.getByTeacher(user.id)
            ]);

            setSubjects(teacherSubjects);
            setClasses(teacherClasses);

            const mockSessions = [
                { id: 1, date: "2024-01-15", time: "10:00-13:00", courseName: "Algorithmique Avancée", courseCode: "ALG-401", className: "4GI-A", classId: 101, present: 25, absent: 2, late: 1, totalStudents: 28, method: "automatic" },
            ];
            setAttendanceSessions(mockSessions);
            setFilteredSessions(mockSessions);

        } catch (error) {
            toast.error('Erreur lors du chargement des données initiales.');
        } finally {
            setLoading(false);
        }
    };

    // Appliquer les filtres
    useEffect(() => {
        let filtered = [...attendanceSessions];

        // Filtre par matière
        if (filters.subjectId) {
            filtered = filtered.filter(session =>
                session.courseCode === filters.subjectId
            );
        }

        // Filtre par classe
        if (filters.classId) {
            filtered = filtered.filter(session =>
                session.classId === parseInt(filters.classId)
            );
        }

        // Filtre par date
        if (filters.dateRange !== 'all') {
            const today = new Date();
            const startDate = new Date();

            switch (filters.dateRange) {
                case 'today':
                    startDate.setDate(today.getDate());
                    break;
                case 'week':
                    startDate.setDate(today.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(today.getMonth() - 1);
                    break;
                case 'custom':
                    if (filters.startDate) {
                        const customStart = new Date(filters.startDate);
                        filtered = filtered.filter(session =>
                            new Date(session.date) >= customStart
                        );
                    }
                    if (filters.endDate) {
                        const customEnd = new Date(filters.endDate);
                        customEnd.setHours(23, 59, 59, 999);
                        filtered = filtered.filter(session =>
                            new Date(session.date) <= customEnd
                        );
                    }
                    break;
            }

            if (filters.dateRange !== 'custom') {
                filtered = filtered.filter(session =>
                    new Date(session.date) >= startDate && new Date(session.date) <= today
                );
            }
        }

        setFilteredSessions(filtered);
        setCurrentPage(1); // Reset à la première page lors du filtrage
    }, [filters, attendanceSessions]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleExport = async (sessionId, format) => {
        const exportPromise = new Promise(async (resolve, reject) => {
            try {
                const fileBlob = await attendanceService.exportSession(sessionId, format);
                const url = window.URL.createObjectURL(fileBlob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `presence_session_${sessionId}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);

                resolve();
            } catch (error) {
                reject(error);
            }
        });

        toast.promise(exportPromise, {
            loading: `Génération du fichier ${format.toUpperCase()}...`,
            success: `Fichier téléchargé avec succès !`,
            error: `Le téléchargement a échoué.`,
        });
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSessions = filteredSessions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getAttendanceRate = (session) => {
        return Math.round((session.present / session.totalStudents) * 100);
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Chargement de l'historique des présences...</p>
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
                    <h1 className="text-2xl font-bold text-gray-900">Historique des Présences</h1>
                    <p className="text-gray-600 mt-1">
                        Consultez, filtrez et accédez aux détails de toutes vos sessions de cours passées
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

            {/* Filtres */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Filtre par matière */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Matière
                        </label>
                        <select
                            value={filters.subjectId}
                            onChange={(e) => handleFilterChange('subjectId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        >
                            <option value="">Toutes les matières</option>
                            {subjects.map((subject) => (
                                <option key={subject.subjectId} value={subject.code}>
                                    {subject.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filtre par classe */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Classe
                        </label>
                        <select
                            value={filters.classId}
                            onChange={(e) => handleFilterChange('classId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        >
                            <option value="">Toutes les classes</option>
                            {classes.map((classe) => (
                                <option key={classe.id} value={classe.id}>
                                    {classe.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filtre par période */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Période
                        </label>
                        <select
                            value={filters.dateRange}
                            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        >
                            <option value="all">Toutes les dates</option>
                            <option value="today">Aujourd'hui</option>
                            <option value="week">7 derniers jours</option>
                            <option value="month">30 derniers jours</option>
                            <option value="custom">Période personnalisée</option>
                        </select>
                    </div>

                    {/* Actions des filtres */}
                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({
                                subjectId: '',
                                classId: '',
                                dateRange: 'all',
                                startDate: '',
                                endDate: ''
                            })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            Réinitialiser
                        </button>
                    </div>
                </div>

                {/* Dates personnalisées */}
                {filters.dateRange === 'custom' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date de début
                            </label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date de fin
                            </label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Résumé des résultats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-600">
                            {filteredSessions.length} session(s) trouvée(s)
                        </p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                        <span className="text-sm text-gray-600">
                            Page {currentPage} sur {totalPages}
                        </span>
                    </div>
                </div>
            </div>

            {/* Liste des sessions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {currentSessions.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune session trouvée</h3>
                        <p className="text-gray-500">
                            Aucune session de présence ne correspond à vos critères de recherche.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date & Heure
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cours & Classe
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statistiques
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Méthode
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {currentSessions.map((session) => (
                                    <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {new Date(session.date).toLocaleDateString('fr-FR')}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {session.time}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {session.courseName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {session.courseCode} • {session.className}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {getAttendanceRate(session)}%
                                                </div>
                                                <div className="text-xs text-gray-500 space-x-2">
                                                    <span className="text-green-600">✅ {session.present}</span>
                                                    <span className="text-red-600">❌ {session.absent}</span>
                                                    {session.late > 0 && (
                                                        <span className="text-amber-600">⏰ {session.late}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    session.method === 'automatic'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {session.method === 'automatic' ? 'Automatique' : 'Manuelle'}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <Link
                                                    href={`/teacher/attendance/history/${session.id}`}
                                                    className="text-orange-600 hover:text-orange-900 px-3 py-1 rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors"
                                                >
                                                    Voir / Corriger
                                                </Link>
                                                <div className="relative group">
                                                    <button className="text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                        </svg>
                                                        Exporter
                                                    </button>
                                                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => handleExport(session.id, 'pdf')}
                                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                            >
                                                                📄 Télécharger en PDF
                                                            </button>
                                                            <button
                                                                onClick={() => handleExport(session.id, 'excel')}
                                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                                            >
                                                                📊 Télécharger en Excel
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredSessions.length)} sur {filteredSessions.length} sessions
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                        >
                                            Précédent
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                            <button
                                                key={number}
                                                onClick={() => paginate(number)}
                                                className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                                                    currentPage === number
                                                        ? 'bg-orange-600 text-white border-orange-600'
                                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {number}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                        >
                                            Suivant
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Résumé statistique */}
            {filteredSessions.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Résumé Statistique</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {Math.round(filteredSessions.reduce((acc, session) => acc + getAttendanceRate(session), 0) / filteredSessions.length)}%
                            </div>
                            <div className="text-sm text-green-700">Taux de présence moyen</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {filteredSessions.length}
                            </div>
                            <div className="text-sm text-blue-700">Sessions totales</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                                {filteredSessions.filter(s => s.method === 'automatic').length}
                            </div>
                            <div className="text-sm text-purple-700">Sessions automatiques</div>
                        </div>
                        <div className="text-center p-4 bg-amber-50 rounded-lg">
                            <div className="text-2xl font-bold text-amber-600">
                                {filteredSessions.filter(s => s.method === 'manual').length}
                            </div>
                            <div className="text-sm text-amber-700">Sessions manuelles</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}