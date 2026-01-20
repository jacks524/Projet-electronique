"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuthContext } from '@/context/authContext';
import subjectService from '@/services/subjectService';
import departmentService from '@/services/departmentService';
import classService from '@/services/classService';
import timetableService from '@/services/timetableService';

export default function SubjectsPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuthContext();

    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [classSubjectIds, setClassSubjectIds] = useState(null);
    const [error, setError] = useState('');
    const [department, setDepartment] = useState(null);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        loadData();
    }, [authLoading, isAuthenticated]);

    useEffect(() => {
        if (!selectedClass) {
            setClassSubjectIds(null);
            return;
        }
        loadClassSubjects(selectedClass);
    }, [selectedClass]);

    const resolveDepartment = (departmentsList) => {
        if (user?.departmentIdIfChief) {
            return departmentsList.find((dept) => dept.departmentId === user.departmentIdIfChief);
        }
        if (Array.isArray(user?.departmentsIds) && user.departmentsIds.length > 0) {
            return departmentsList.find((dept) => dept.departmentId === user.departmentsIds[0]);
        }
        if (Array.isArray(user?.departmentNames) && user.departmentNames.length > 0) {
            return departmentsList.find((dept) => dept.name === user.departmentNames[0]);
        }
        return null;
    };

    const normalizeSubjects = (items, departmentInfo, classesMap = {}) => {
        return (Array.isArray(items) ? items : []).map((subject) => ({
            id: subject.subjectId || subject.id,
            libelle: subject.name || subject.libelle || '--',
            code: subject.code || '--',
            credits: subject.credits || 0,
            heuresParSemaine: subject.heuresCoursParSemaine || subject.heuresParSemaine || 0,
            description: subject.description || '',
            teacher: subject.teacher || subject.enseignant || null,
            department: subject.department || subject.departement || departmentInfo || null,
            classe: subject.classe || classesMap[subject.subjectId] || null,
        }));
    };

    const loadData = async () => {
        setLoading(true);
        setError('');

        try {
            const departments = await departmentService.getAll();
            const targetDepartment = resolveDepartment(Array.isArray(departments) ? departments : []);

            if (!targetDepartment) {
                throw new Error("Aucun departement n'est assigne a votre compte.");
            }

            const [subjectsData, classesData] = await Promise.all([
                subjectService.getByDepartment(targetDepartment.departmentId),
                classService.getByDepartment(targetDepartment.departmentId),
            ]);

            const normalizedSubjects = normalizeSubjects(subjectsData, targetDepartment);
            const mappedClasses = (Array.isArray(classesData) ? classesData : []).map((classe) => ({
                id: classe.classId,
                name: classe.name,
                code: classe.code,
            }));

            setDepartment(targetDepartment);
            setSubjects(normalizedSubjects);
            setClasses(mappedClasses);

        } catch (error) {
            console.error('Erreur lors du chargement des matieres:', error);
            setError(error.message || 'Impossible de charger les matieres. Veuillez reessayer.');
        } finally {
            setLoading(false);
        }
    };

    const loadClassSubjects = async (classId) => {
        try {
            const timetableData = await timetableService.getByClass(classId);
            const schedules = Array.isArray(timetableData?.schedules) ? timetableData.schedules : [];
            const subjectIds = new Set();
            schedules.forEach((schedule) => {
                const id = schedule.subject?.subjectId || schedule.subject?.id;
                if (id) subjectIds.add(id);
            });
            setClassSubjectIds(Array.from(subjectIds));
        } catch (error) {
            toast.error(error.message || "Impossible de charger les matieres de la classe.");
            setClassSubjectIds([]);
        }
    };

    const filteredSubjects = classSubjectIds
        ? subjects.filter(subject => classSubjectIds.includes(subject.id))
        : subjects;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7c3aed]"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-[#312e81]">Matieres</h1>
                            <p className="mt-2 text-gray-600">
                                Gestion des matieres du departement {department?.name || ''}
                            </p>
                        </div>
                        <Link
                            href="/chief/subjects/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#7c3aed] hover:bg-opacity-90"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Ajouter une matiere
                        </Link>
                    </div>
                </div>

                <div className="mb-6 bg-white p-4 rounded-lg shadow">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-2">
                                Filtrer par classe
                            </label>
                            <select
                                id="class"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed]"
                            >
                                <option value="">Toutes les classes</option>
                                {classes.map((classe) => (
                                    <option key={classe.id} value={classe.id}>{classe.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <span className="text-sm text-gray-500">
                                {filteredSubjects.length} matiere(s) trouvee(s)
                            </span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {filteredSubjects.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8">
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune matiere</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Aucune matiere ne correspond aux criteres selectionnes.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredSubjects.map((subject) => (
                            <div key={subject.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <div className="h-10 w-10 bg-[#7c3aed] rounded-lg flex items-center justify-center">
                                                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <h3 className="text-lg font-medium text-[#312e81]">{subject.libelle}</h3>
                                                    <p className="text-sm text-gray-500">Code: {subject.code}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 space-y-2">
                                                <p className="text-sm text-gray-600">{subject.description || 'Aucune description fournie.'}</p>

                                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center">
                                                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        {subject.teacher?.name || subject.teacher?.nom || 'Enseignant non assigne'}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                        {subject.department?.name || 'Departement'}
                                                    </span>
                                                    {subject.classe && (
                                                        <span className="flex items-center">
                                                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                            </svg>
                                                            Classe: {subject.classe.name || subject.classe.nom || 'Non assignée'}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex gap-4 text-sm">
                                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                        {subject.credits} credits
                                                    </span>
                                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                                        {subject.heuresParSemaine}h/semaine
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end space-x-3">
                                        <Link
                                            href={`/chief/subjects/${subject.id}`}
                                            className="inline-flex items-center px-3 py-2 border border-gray-200 text-sm leading-4 font-medium rounded-md text-gray-700 hover:bg-gray-50"
                                        >
                                            Voir details
                                        </Link>
                                        <Link
                                            href={`/chief/timetables?subject=${subject.id}`}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#7c3aed] hover:bg-opacity-90"
                                        >
                                            Voir emploi du temps
                                        </Link>
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
