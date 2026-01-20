"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '../../../context/authContext';
import subjectService from '../../../services/subjectService';
import timetableService from '../../../services/timetableService';
import toast from 'react-hot-toast';

export default function TeacherCoursesPage() {
    const { user, isAuthenticated, loading: authLoading } = useAuthContext();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const tryLoadData = () => {
            if (!authLoading && user) {
                loadTeacherData(user.id);
            }
        };
        tryLoadData();

    }, [user, authLoading]);

    const loadTeacherData = async (teacherId) => {
        try {
            setLoading(true);
            const [subjectsData, timetableData] = await Promise.all([
                subjectService.getByTeacher(teacherId),
                timetableService.getByTeacher(teacherId),
            ]);

            const normalizedSubjects = Array.isArray(subjectsData) ? subjectsData : [];
            const timetables = Array.isArray(timetableData) ? timetableData : (timetableData ? [timetableData] : []);
            const scheduleSubjects = timetables.flatMap((timetable) => {
                const schedules = Array.isArray(timetable?.schedules) ? timetable.schedules : [];
                return schedules.map((schedule) => schedule.subject).filter((subject) => subject && subject.subjectId);
            });

            const merged = [...normalizedSubjects, ...scheduleSubjects];
            const uniqueSubjects = Array.from(
                new Map(merged.map((subject) => [subject.subjectId, subject])).values()
            );

            setSubjects(uniqueSubjects);
        } catch (error) {
            toast.error(error.message || "Impossible de charger les cours.");
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
                            <p className="text-gray-600">Chargement de vos cours...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mes Cours</h1>
                        <p className="text-gray-600 mt-1">
                            Liste de tous les cours qui vous sont assignes
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

                {/* Message d'erreur */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                            </svg>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Liste des courses */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Vos Cours Assignes</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {subjects.length} cours trouves
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"></path>
                                    </svg>
                                    Filtrer
                                </button>
                            </div>
                        </div>
                    </div>

                    {subjects.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cours assigne</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Aucun cours ne vous est actuellement assigne. Contactez votre chef de departement pour obtenir des cours.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {subjects.map((subject) => (
                                <div key={subject.subjectId} className="border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 bg-white">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 text-lg mb-1">{subject.name}</h3>
                                                <p className="text-sm text-gray-600 mb-2 font-mono">{subject.code}</p>
                                                {subject.description && (
                                                    <p className="text-sm text-gray-500 line-clamp-2">{subject.description}</p>
                                                )}
                                            </div>
                                            <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-4">
                                                <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Informations supplementaires */}
                                        <div className="space-y-2 mb-4">
                                            {subject.department && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                                    </svg>
                                                    {subject.department.name}
                                                </div>
                                            )}
                                            {subject.credits && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                                    </svg>
                                                    {subject.credits} credits
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex space-x-2">
                                            <Link
                                                href={`/teacher/courses/${subject.subjectId}`}
                                                className="flex-1 text-center px-3 py-2 text-sm font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors"
                                            >
                                                Details du cours
                                            </Link>
                                            <Link
                                                href={`/teacher/attendance?course=${subject.subjectId}`}
                                                className="flex-1 text-center px-3 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                                            >
                                                Presences
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}