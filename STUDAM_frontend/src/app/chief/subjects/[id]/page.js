"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';

export default function SubjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const subjectId = params.id;

    const [subject, setSubject] = useState(null);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadSubjectData();
    }, [subjectId]);

    const loadSubjectData = async () => {
        try {
            setLoading(true);
            // TODO: Appeler les endpoints
            // const subjectData = await subjectService.getById(subjectId);
            // const classesData = await classService.getBySubject(subjectId);

            // Données mockées
            const mockSubject = {
                id: subjectId,
                libelle: 'Programmation Web',
                code: 'INFO301',
                description: 'Introduction aux technologies web modernes : HTML5, CSS3, JavaScript, React, Node.js. Développement d\'applications web full-stack.',
                credits: 3,
                heuresCoursParSemaine: 4,
                department: {
                    id: 1,
                    name: 'Informatique'
                },
                teacher: {
                    id: 1,
                    name: 'Dr. Mamadou Diallo',
                    email: 'mamadou@email.com'
                },
                createdAt: '2024-09-01',
                totalSessions: 24,
                completedSessions: 18
            };

            const mockClasses = [
                { id: 1, name: '3GI', studentCount: 45, level: 'Licence 3' },
                { id: 2, name: '4GI', studentCount: 38, level: 'Master 1' }
            ];

            setSubject(mockSubject);
            setClasses(mockClasses);

        } catch (error) {
            toast.error("Erreur lors du chargement des données");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette matière ? Cette action est irréversible.')) {
            return;
        }

        setDeleting(true);

        try {
            // TODO: Appeler l'endpoint
            // await subjectService.delete(subjectId);

            toast.success("Matière supprimée avec succès");
            router.push('/chief/subjects');

        } catch (error) {
            toast.error("Erreur lors de la suppression");
            console.error(error);
        } finally {
            setDeleting(false);
        }
    };

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

    if (!subject) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600">Matière non trouvée</p>
                    <Link href="/chief/subjects" className="mt-4 text-[#7c3aed] hover:underline">
                        Retour à la liste
                    </Link>
                </div>
            </div>
        );
    }

    const progressPercentage = subject.totalSessions > 0
        ? Math.round((subject.completedSessions / subject.totalSessions) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-[#312e81]">{subject.libelle}</h1>
                    <p className="text-gray-600 mt-1">Code: {subject.code}</p>
                </div>
                <div className="flex space-x-2">
                    <Link href={`/chief/subjects/${subjectId}/edit`}>
                        <Button variant="secondary">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                            </svg>
                            Modifier
                        </Button>
                    </Link>
                    <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                        {deleting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Suppression...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                                Supprimer
                            </>
                        )}
                    </Button>
                    <Link href="/chief/subjects">
                        <Button variant="secondary">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                            Retour
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Crédits</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">{subject.credits}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Heures/semaine</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">{subject.heuresCoursParSemaine}h</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Classes</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">{classes.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-violet-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Progression</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">{progressPercentage}%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informations principales */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Détails de la matière */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails de la matière</h2>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Code</dt>
                                <dd className="mt-1 text-sm text-gray-900">{subject.code}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Département</dt>
                                <dd className="mt-1 text-sm text-gray-900">{subject.department.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Enseignant responsable</dt>
                                <dd className="mt-1 text-sm text-gray-900">{subject.teacher.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Email de l'enseignant</dt>
                                <dd className="mt-1 text-sm text-gray-900">{subject.teacher.email}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Date de création</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {new Date(subject.createdAt).toLocaleDateString('fr-FR')}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Sessions</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {subject.completedSessions} / {subject.totalSessions} complétées
                                </dd>
                            </div>
                        </dl>

                        {subject.description && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <dt className="text-sm font-medium text-gray-500 mb-2">Description</dt>
                                <dd className="text-sm text-gray-900 leading-relaxed">{subject.description}</dd>
                            </div>
                        )}
                    </div>

                    {/* Classes associées */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Classes associées</h2>
                        {classes.length === 0 ? (
                            <p className="text-sm text-gray-500">Aucune classe associée à cette matière.</p>
                        ) : (
                            <div className="space-y-3">
                                {classes.map((classe) => (
                                    <div key={classe.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#7c3aed] transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#7c3aed] to-[#a855f7] rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">{classe.name[0]}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{classe.name}</p>
                                                <p className="text-xs text-gray-500">{classe.level} - {classe.studentCount} étudiants</p>
                                            </div>
                                        </div>
                                        <Link href={`/chief/classes/${classe.id}`}>
                                            <button className="text-sm text-[#7c3aed] hover:text-[#6d28d9] font-medium">
                                                Voir détails →
                                            </button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Barre latérale - Actions rapides */}
                <div className="space-y-6">
                    {/* Progression du cours */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression du cours</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600">Sessions complétées</span>
                                    <span className="font-medium text-gray-900">{progressPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-[#7c3aed] to-[#a855f7] h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="text-center pt-2 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                    {subject.completedSessions} sessions sur {subject.totalSessions}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions rapides */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                        <div className="space-y-3">
                            <Link href={`/chief/subjects/${subjectId}/edit`} className="block">
                                <button className="w-full px-4 py-2 bg-[#312e81] text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium">
                                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                                    </svg>
                                    Modifier la matière
                                </button>
                            </Link>

                            <Link href={`/chief/timetables?subject=${subjectId}`} className="block">
                                <button className="w-full px-4 py-2 bg-white border-2 border-[#7c3aed] text-[#7c3aed] rounded-lg hover:bg-[#7c3aed] hover:text-white transition-colors text-sm font-medium">
                                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                    </svg>
                                    Voir l'emploi du temps
                                </button>
                            </Link>

                            <Link href={`/chief/reports/attendance?subject=${subjectId}`} className="block">
                                <button className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                    Rapport de présence
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Informations supplémentaires */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">Information</h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>Cette matière est enseignée dans {classes.length} classe{classes.length > 1 ? 's' : ''}.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
