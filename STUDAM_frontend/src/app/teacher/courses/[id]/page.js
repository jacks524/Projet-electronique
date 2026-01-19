"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../../../context/authContext';
import classService from '../../../../services/classService';
import studentService from '../../../../services/studentService';
import toast from 'react-hot-toast';

export default function CourseDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuthContext();
    const courseId = params.id;

    const [course, setCourse] = useState(null);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState({});
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading || !user) return;
        loadCourseData();
    }, [courseId, user, authLoading]);

    const loadCourseData = async () => {
        try {
            setLoading(true);
            const allClassesForTeacher = await classService.getByTeacher(user.id);

            const relevantClasses = allClassesForTeacher.filter(cls =>
                cls.subjects && cls.subjects.some(subj => subj.subjectId.toString() === courseId)
            );
            setClasses(relevantClasses);

            if (relevantClasses.length > 0) {
                const subjectInfo = relevantClasses[0].subjects.find(s => s.subjectId.toString() === courseId);
                setCourse(subjectInfo);
            }

            if (relevantClasses.length > 0) {
                const studentPromises = relevantClasses.map(cls => studentService.getByClass(cls.classId));
                const studentsByClass = await Promise.all(studentPromises);
                const allStudents = studentsByClass.flat();
                const uniqueStudents = Array.from(new Map(allStudents.map(s => [s.studentId, s])).values());
                setStudents(uniqueStudents);
            }

        } catch (error) {
            toast.error('Erreur lors du chargement des détails du cours');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Chargement des détails du cours...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Cours non trouvé</h3>
                        <p className="text-gray-500 mb-6">Le cours demandé n'existe pas ou vous n'y avez pas accès.</p>
                        <Link
                            href="/teacher/courses"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors"
                        >
                            Retour aux cours
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête avec navigation */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/teacher/courses"
                        className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Retour aux cours
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
                        <p className="text-gray-600 mt-1">{course.code} • {course.department?.name}</p>
                    </div>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                    <Link
                        href={`/teacher/attendance?course=${courseId}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Gérer les présences
                    </Link>
                    <Link
                        href={`/teacher/reports?course=${courseId}`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Générer rapport
                    </Link>
                </div>
            </div>

            {/* Navigation par onglets */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {['overview', 'classes', 'students', 'attendance'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                                activeTab === tab
                                    ? 'border-violet-500 text-violet-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab === 'overview' && 'Vue d\'ensemble'}
                            {tab === 'classes' && `Classes (${classes.length})`}
                            {tab === 'students' && `Étudiants (${students.length})`}
                            {tab === 'attendance' && 'Présences'}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Contenu des onglets */}
            <div className="mt-6">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Informations du cours */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Description du cours</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    {course.description || "Aucune description disponible."}
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                    <div>
                                        <p className="text-sm text-gray-500">Crédits</p>
                                        <p className="font-semibold text-gray-900">{course.credits || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Heures/semaine</p>
                                        <p className="font-semibold text-gray-900">{course.hoursPerWeek || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total d'heures</p>
                                        <p className="font-semibold text-gray-900">{course.totalHours || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Semestre</p>
                                        <p className="font-semibold text-gray-900">{course.semester || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Statistiques de présence */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques de présence</h2>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">{attendanceStats.totalStudents || 0}</p>
                                        <p className="text-sm text-blue-600">Étudiants</p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">{attendanceStats.averageAttendance || 0}%</p>
                                        <p className="text-sm text-green-600">Présence moy.</p>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <p className="text-2xl font-bold text-purple-600">{attendanceStats.completedSessions || 0}/{attendanceStats.totalSessions || 0}</p>
                                        <p className="text-sm text-purple-600">Séances</p>
                                    </div>
                                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                                        <p className="text-2xl font-bold text-amber-600">{attendanceStats.pendingValidations || 0}</p>
                                        <p className="text-sm text-amber-600">À valider</p>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <p className="text-2xl font-bold text-gray-600">{classes.length}</p>
                                        <p className="text-sm text-gray-600">Classes</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions rapides */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
                                <div className="space-y-3">
                                    <Link
                                        href={`/teacher/attendance?course=${courseId}`}
                                        className="flex items-center p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                                    >
                                        <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                            <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        </div>
                                        Valider les présences
                                    </Link>
                                    <Link
                                        href={`/teacher/timetable?course=${courseId}`}
                                        className="flex items-center p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                                    >
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                        </div>
                                        Voir l'emploi du temps
                                    </Link>
                                    <Link
                                        href={`/teacher/reports?course=${courseId}`}
                                        className="flex items-center p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                                    >
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                            </svg>
                                        </div>
                                        Générer un rapport
                                    </Link>
                                </div>
                            </div>

                            {/* Prochain cours */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Prochain cours</h3>
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <p className="font-medium text-blue-900">4GI-A</p>
                                    <p className="text-sm text-blue-700">Lundi 10h-13h</p>
                                    <p className="text-sm text-blue-600">Bâtiment A, Salle 301</p>
                                    <p className="text-xs text-blue-500 mt-2">Dans 2 jours</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'classes' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Classes assignées</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {classes.length} classe(s) suivent ce cours
                            </p>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {classes.map((classItem) => (
                                <div key={classItem.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                                                <span className="font-bold text-violet-600">{classItem.name}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{classItem.name} - {classItem.level}</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {classItem.studentCount} étudiants • {classItem.schedule}
                                                </p>
                                                <p className="text-sm text-gray-500">{classItem.room}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Link
                                                href={`/teacher/attendance?course=${courseId}&class=${classItem.id}`}
                                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                                            >
                                                Présences
                                            </Link>
                                            <Link
                                                href={`/teacher/courses/${courseId}/class/${classItem.id}`}
                                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                                            >
                                                Détails
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Étudiants inscrits</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {students.length} étudiant(s) suivent ce cours
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="text"
                                        placeholder="Rechercher un étudiant..."
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Étudiant
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Classe
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Taux de présence
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="font-medium text-gray-900">{student.name}</div>
                                                <div className="text-sm text-gray-500">{student.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {student.class}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{ width: `${student.attendanceRate}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-gray-900">{student.attendanceRate}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Link
                                                href={`/teacher/attendance?student=${student.id}&course=${courseId}`}
                                                className="text-violet-600 hover:text-violet-900 mr-4"
                                            >
                                                Voir présences
                                            </Link>
                                            <button className="text-gray-600 hover:text-gray-900">
                                                Contacter
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Historique des présences</h2>
                            <p className="text-gray-600">Fonctionnalité à implémenter avec les données réelles des APIs.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}