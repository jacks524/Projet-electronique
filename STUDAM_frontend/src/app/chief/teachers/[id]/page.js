"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import userService from '@/services/userService';
import subjectService from '@/services/subjectService';
import classService from '@/services/classService';
import timetableService from '@/services/timetableService';

export default function TeacherDetailPage() {
    const params = useParams();
    const router = useRouter();
    const teacherId = params.id;

    const [teacher, setTeacher] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        loadTeacherData();
    }, [teacherId]);

    const loadTeacherData = async () => {
        try {
            setLoading(true);
            const [teacherData, subjectsData, classesData, timetableData] = await Promise.all([
                userService.getById(teacherId),
                subjectService.getByTeacher(teacherId),
                classService.getByTeacher(teacherId),
                timetableService.getByTeacher(teacherId)
            ]);

            setTeacher({
                id: teacherData.id,
                name: teacherData.name,
                email: teacherData.email,
                username: teacherData.username,
                phoneNumber: teacherData.phoneNumber,
                matricule: teacherData.matricule,
                status: teacherData.active ? 'active' : 'inactive',
                department: {
                    id: teacherData.departmentsIds?.[0],
                    name: teacherData.departmentsNames?.[0] || '---'
                },
                createdAt: teacherData.createdDate,
            });

            setSubjects(subjectsData || []);

            // Calculate unique classes from subjects and classes data
            const uniqueClassIds = new Set();
            const classesMap = new Map();

            // Add classes from direct class assignments
            (classesData || []).forEach(c => {
                uniqueClassIds.add(c.classId);
                classesMap.set(c.classId, {
                    id: c.classId,
                    name: c.name,
                    level: c.code || '---',
                    studentCount: c.studentNumber || c.studentCount || 0
                });
            });

            // Map classes for display
            const mappedClasses = Array.from(classesMap.values());

            console.log('Classes data received:', classesData);
            console.log('Mapped classes:', mappedClasses);
            console.log('Total students:', mappedClasses.reduce((sum, c) => sum + c.studentCount, 0));

            setClasses(mappedClasses);

            // Get schedules and filter for today
            const schedulesList = Array.isArray(timetableData?.schedules) ? timetableData.schedules :
                (Array.isArray(timetableData) ? timetableData.flatMap(t => t.schedules || []) : []);

            setSchedules(schedulesList);

            // Calculate today's sessions
            const dayKeys = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
            const today = dayKeys[new Date().getDay()];
            const todaysSessions = schedulesList.filter(schedule => schedule.day === today);

        } catch (error) {
            toast.error("Erreur lors du chargement des donnees");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        try {
            if (teacher.status === 'active') {
                await userService.deactivate(teacherId);
            } else {
                await userService.activate(teacherId);
            }

            toast.success(`Enseignant ${teacher.status === 'active' ? 'desactive' : 'active'} avec succes`);
            loadTeacherData();

        } catch (error) {
            toast.error("Erreur lors de la modification du statut");
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Etes-vous sur de vouloir supprimer cet enseignant ? Cette action est irreversible.')) {
            return;
        }

        setDeleting(true);

        try {
            await userService.remove(teacherId);
            toast.success("Enseignant supprime avec succes");
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600">Enseignant non trouve</p>
                    <Link href="/chief/teachers" className="mt-4 text-[#7c3aed] hover:underline">
                        Retour a la liste
                    </Link>
                </div>
            </div>
        );
    }

    const dayKeys = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const today = dayKeys[new Date().getDay()];
    const plannedSessions = schedules.filter(schedule => schedule.day === today).length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-[#312e81]">{teacher.name}</h1>
                    <p className="text-gray-600 mt-1">{teacher.department.name}</p>
                </div>
                <div className="flex space-x-2">
                    <Link href={`/chief/teachers/${teacherId}/edit`}>
                        <Button variant="secondary">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Modifier
                        </Button>
                    </Link>
                    <Button
                        variant={teacher.status === 'active' ? 'danger' : 'secondary'}
                        onClick={handleToggleStatus}
                    >
                        {teacher.status === 'active' ? 'Desactiver' : 'Activer'}
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                        Supprimer
                    </Button>
                    <Link href="/chief/teachers">
                        <Button variant="secondary">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Retour
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-[#312e81] to-[#4338ca] px-6 py-8">
                    <div className="flex items-center space-x-6">
                        <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center">
                            <span className="text-4xl font-bold text-[#7c3aed]">
                                {teacher.name.split(' ').map(n => n[0]).join('')}
                            </span>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-white">{teacher.name}</h2>
                            <p className="text-blue-100 text-lg mt-1">{teacher.matricule}</p>
                            <div className="flex items-center space-x-4 mt-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${teacher.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {teacher.status === 'active' ? 'Actif' : 'Inactif'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-6 py-4 bg-gray-50 border-b">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#312e81]">{subjects.length}</div>
                        <div className="text-sm text-gray-600">Matieres</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#312e81]">{classes.length}</div>
                        <div className="text-sm text-gray-600">Classes</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#312e81]">
                            {classes.reduce((sum, c) => sum + c.studentCount, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Etudiants</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#7c3aed]">{plannedSessions}</div>
                        <div className="text-sm text-gray-600">Seances planifiees</div>
                    </div>
                </div>

                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px px-6">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`py-4 px-6 border-b-2 font-medium text-sm ${activeTab === 'info'
                                ? 'border-[#7c3aed] text-[#7c3aed]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Informations
                        </button>
                        <button
                            onClick={() => setActiveTab('subjects')}
                            className={`py-4 px-6 border-b-2 font-medium text-sm ${activeTab === 'subjects'
                                ? 'border-[#7c3aed] text-[#7c3aed]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Matieres
                        </button>
                        <button
                            onClick={() => setActiveTab('classes')}
                            className={`py-4 px-6 border-b-2 font-medium text-sm ${activeTab === 'classes'
                                ? 'border-[#7c3aed] text-[#7c3aed]'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Classes
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-base text-gray-900">{teacher.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Telephone</p>
                                <p className="text-base text-gray-900">{teacher.phoneNumber || '---'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Nom d'utilisateur</p>
                                <p className="text-base text-gray-900">{teacher.username}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Departement</p>
                                <p className="text-base text-gray-900">{teacher.department.name}</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'subjects' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {subjects.length === 0 ? (
                                <div className="text-sm text-gray-500">Aucune matiere associee.</div>
                            ) : (
                                subjects.map((subject) => (
                                    <div key={subject.subjectId || subject.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="font-semibold text-gray-900">{subject.name || subject.libelle}</div>
                                        <div className="text-sm text-gray-500">{subject.code}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'classes' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {classes.length === 0 ? (
                                <div className="text-sm text-gray-500">Aucune classe associee.</div>
                            ) : (
                                classes.map((classe) => (
                                    <div key={classe.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="font-semibold text-gray-900">{classe.name}</div>
                                        <div className="text-sm text-gray-500">{classe.level}</div>
                                        <div className="text-xs text-gray-400">{classe.studentCount} etudiants</div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
