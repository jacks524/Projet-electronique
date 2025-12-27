"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';

export default function TeacherDetailPage() {
    const params = useParams();
    const router = useRouter();
    const teacherId = params.id;

    const [teacher, setTeacher] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        loadTeacherData();
    }, [teacherId]);

    const loadTeacherData = async () => {
        try {
            setLoading(true);
            // TODO: Appeler les endpoints
            // const teacherData = await userService.getById(teacherId);
            // const subjectsData = await subjectService.getByTeacher(teacherId);
            // const classesData = await classService.getByTeacher(teacherId);

            const mockTeacher = {
                id: teacherId,
                name: 'Dr. Mamadou Diallo',
                email: 'mamadou.diallo@email.com',
                username: 'mdiallo',
                phoneNumber: '+221 77 123 45 67',
                matricule: 'TEACH2024001',
                status: 'active',
                department: {
                    id: 1,
                    name: 'Informatique'
                },
                createdAt: '2024-01-15',
                totalSessions: 45,
                completedSessions: 38
            };

            const mockSubjects = [
                { id: 1, libelle: 'Programmation Web', code: 'INFO301', credits: 3, heuresCoursParSemaine: 4 },
                { id: 2, libelle: 'Base de données', code: 'INFO302', credits: 4, heuresCoursParSemaine: 5 },
                { id: 3, libelle: 'Développement Mobile', code: 'INFO303', credits: 3, heuresCoursParSemaine: 4 }
            ];

            const mockClasses = [
                { id: 1, name: '3GI', level: 'Licence 3', studentCount: 45 },
                { id: 2, name: '4GI', level: 'Master 1', studentCount: 38 }
            ];

            setTeacher(mockTeacher);
            setSubjects(mockSubjects);
            setClasses(mockClasses);

        } catch (error) {
            toast.error("Erreur lors du chargement des données");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        try {
            // TODO: Appeler l'endpoint
            // if (teacher.status === 'active') {
            //     await userService.deactivate(teacherId);
            // } else {
            //     await userService.activate(teacherId);
            // }

            toast.success(`Enseignant ${teacher.status === 'active' ? 'désactivé' : 'activé'} avec succès`);
            loadTeacherData();

        } catch (error) {
            toast.error("Erreur lors de la modification du statut");
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ? Cette action est irréversible.')) {
            return;
        }

        setDeleting(true);

        try {
            // TODO: Appeler l'endpoint
            // await userService.remove(teacherId);

            toast.success("Enseignant supprimé avec succès");
            router.push('/chief/teachers');

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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26419] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600">Enseignant non trouvé</p>
                    <Link href="/chief/teachers" className="mt-4 text-[#F26419] hover:underline">
                        Retour à la liste
                    </Link>
                </div>
            </div>
        );
    }

    const progressPercentage = teacher.totalSessions > 0
        ? Math.round((teacher.completedSessions / teacher.totalSessions) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-[#1B396A]">{teacher.name}</h1>
                    <p className="text-gray-600 mt-1">{teacher.department.name}</p>
                </div>
                <div className="flex space-x-2">
                    <Link href={`/chief/teachers/${teacherId}/edit`}>
                        <Button variant="secondary">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                            </svg>
                            Modifier
                        </Button>
                    </Link>
                    <Button
                        variant={teacher.status === 'active' ? 'danger' : 'secondary'}
                        onClick={handleToggleStatus}
                    >
                        {teacher.status === 'active' ? 'Désactiver' : 'Activer'}
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                        Supprimer
                    </Button>
                    <Link href="/chief/teachers">
                        <Button variant="secondary">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                            Retour
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Carte profil */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-[#1B396A] to-[#2A5490] px-6 py-8">
                    <div className="flex items-center space-x-6">
                        <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center">
                            <span className="text-4xl font-bold text-[#F26419]">
                                {teacher.name.split(' ').map(n => n[0]).join('')}
                            </span>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-white">{teacher.name}</h2>
                            <p className="text-blue-100 text-lg mt-1">{teacher.matricule}</p>
                            <div className="flex items-center space-x-4 mt-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    teacher.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {teacher.status === 'active' ? 'Actif' : 'Inactif'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-6 py-4 bg-gray-50 border-b">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#1B396A]">{subjects.length}</div>
                        <div className="text-sm text-gray-600">Matières</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#1B396A]">{classes.length}</div>
                        <div className="text-sm text-gray-600">Classes</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#1B396A]">
                            {classes.reduce((sum, c) => sum + c.studentCount, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Étudiants</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#F26419]">{progressPercentage}%</div>
                        <div className="text-sm text-gray-600">Progression</div>
                    </div>
                </div>

                {/* Onglets */}
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px px-6">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`py-4 px-6 border-b-2 font-medium text-sm ${
                                activeTab === 'info'
                                    ? 'border-[#F26419] text-[#F26419]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Informations
                        </button>
                        <button
                            onClick={() => setActiveTab('subjects')}
                            className={`py-4 px-6 border-b-2 font-medium text-sm ${
                                activeTab === 'subjects'
                                    ? 'border-[#F26419] text-[#F26419]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Matières ({subjects.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('classes')}
                            className={`py-4 px-6 border-b-2 font-medium text-sm ${
                                activeTab === 'classes'
                                    ? 'border-[#F26419] text-[#F26419]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Classes ({classes.length})
                        </button>
                    </nav>
                </div>

                {/* Contenu des onglets */}
                <div className="p-6">
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                                <dl className="space-y-3">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{teacher.email}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{teacher.phoneNumber || '—'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Nom d'utilisateur</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{teacher.username}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Matricule</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{teacher.matricule}</dd>
                                    </div>
                                </dl>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations professionnelles</h3>
                                <dl className="space-y-3">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Département</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{teacher.department.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Date d'embauche</dt>
                                        <dd className="text-sm text-gray-900 mt-1">
                                            {new Date(teacher.createdAt).toLocaleDateString('fr-FR')}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Sessions complétées</dt>
                                        <dd className="text-sm text-gray-900 mt-1">
                                            {teacher.completedSessions} / {teacher.totalSessions}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    )}

                    {activeTab === 'subjects' && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Matières enseignées</h3>
                            {subjects.length === 0 ? (
                                <p className="text-sm text-gray-500">Aucune matière assignée.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {subjects.map((subject) => (
                                        <div key={subject.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#F26419] transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{subject.libelle}</h4>
                                                    <p className="text-sm text-gray-500 mt-1">Code: {subject.code}</p>
                                                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                                                        <span>{subject.credits} crédits</span>
                                                        <span>•</span>
                                                        <span>{subject.heuresCoursParSemaine}h/semaine</span>
                                                    </div>
                                                </div>
                                                <Link href={`/chief/subjects/${subject.id}`}>
                                                    <button className="text-[#F26419] hover:text-[#E55A1A]">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                                                        </svg>
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'classes' && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Classes enseignées</h3>
                            {classes.length === 0 ? (
                                <p className="text-sm text-gray-500">Aucune classe assignée.</p>
                            ) : (
                                <div className="space-y-3">
                                    {classes.map((classe) => (
                                        <div key={classe.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#F26419] transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-[#F26419] to-[#FF7A47] rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">{classe.name[0]}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{classe.name}</p>
                                                    <p className="text-xs text-gray-500">{classe.level} - {classe.studentCount} étudiants</p>
                                                </div>
                                            </div>
                                            <Link href={`/chief/classes/${classe.id}`}>
                                                <button className="text-sm text-[#F26419] hover:text-[#E55A1A] font-medium">
                                                    Voir détails →
                                                </button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}