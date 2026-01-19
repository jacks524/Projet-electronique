"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import studentService from '../../../../services/studentService';
import classService from '../../../../services/classService';
import timetableService from '../../../../services/timetableService';
import Button from '../../../../components/ui/Button';
import toast from 'react-hot-toast';

export default function ClassDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const classId = params.id;

    const [loading, setLoading] = useState(true);
    const [classData, setClassData] = useState(null);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('students');

    useEffect(() => {
        loadClassData();
    }, [classId]);

    const loadClassData = async () => {
        try {
            setLoading(true);

            const [classInfo, studentsData, timetableData] = await Promise.all([
                classService.getById(classId),
                studentService.getByClass(classId, { page: 0, size: 2000 }),
                timetableService.getByClass(classId)
            ]);

            setClassData({
                classId: classInfo.classId,
                name: classInfo.name,
                code: classInfo.code,
                description: classInfo.description,
                studentNumber: classInfo.studentNumber || 0,
                department: classInfo.departementResponseDTO
                    ? { id: classInfo.departementResponseDTO.departmentId, name: classInfo.departementResponseDTO.name }
                    : null
            });

            const mappedStudents = (studentsData || []).map((student) => ({
                id: student.studentId,
                matricule: student.matricule,
                nom: student.name,
                email: student.email,
                phone: student.phoneNumber,
                dateNaissance: student.birthDate,
                lieuNaissance: student.birthPlace,
                status: 'active'
            }));

            const schedules = Array.isArray(timetableData?.schedules) ? timetableData.schedules : [];
            const subjectMap = new Map();
            const teacherMap = new Map();

            schedules.forEach((schedule) => {
                if (schedule.subject?.subjectId) {
                    subjectMap.set(schedule.subject.subjectId, schedule.subject);
                }
                if (schedule.teacher?.id) {
                    teacherMap.set(schedule.teacher.id, schedule.teacher);
                }
            });

            setStudents(mappedStudents);
            setSubjects(Array.from(subjectMap.values()));
            setTeachers(Array.from(teacherMap.values()));

        } catch (error) {
            toast.error("Erreur lors du chargement des donnees");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteClass = async () => {
        if (!window.confirm("Etes-vous sur de vouloir supprimer cette classe ? Cette action est irreversible.")) {
            return;
        }

        try {
            await classService.remove(classId);
            toast.success("Classe supprimee avec succes");
            router.push('/chief/classes');
        } catch (error) {
            toast.error("Erreur lors de la suppression");
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed]"></div>
            </div>
        );
    }

    if (!classData) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Classe non trouvee</p>
                <Link href="/chief/classes">
                    <Button className="mt-4">Retour aux classes</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#312e81] to-[#4338ca] rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-xl">{classData.code}</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[#312e81]">
                                {classData.name}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {classData.department?.name || '---'} - Code: {classData.code}
                            </p>
                            {classData.description && (
                                <p className="text-gray-500 text-sm mt-2">
                                    {classData.description}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={`/chief/classes/${classId}/edit`}>
                            <Button variant="secondary">
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Modifier
                            </Button>
                        </Link>
                        <Button variant="danger" onClick={handleDeleteClass}>
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Supprimer
                        </Button>
                        <Link href="/chief/classes">
                            <Button variant="secondary">Retour</Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Etudiants</p>
                            <p className="text-3xl font-bold text-[#312e81] mt-2">
                                {classData.studentNumber}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Taux de presence</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">N/A</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Matieres</p>
                            <p className="text-3xl font-bold text-purple-600 mt-2">{subjects.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Enseignants</p>
                            <p className="text-3xl font-bold text-violet-600 mt-2">{teachers.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        {[
                            { id: 'students', label: 'Etudiants' },
                            { id: 'subjects', label: 'Matieres' },
                            { id: 'schedule', label: 'Emploi du temps' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-[#7c3aed] text-[#7c3aed]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'students' && (
                        <div>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Rechercher un etudiant..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Etudiant</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Naissance</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredStudents.map((student) => (
                                        <tr key={student.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{student.nom}</div>
                                                <div className="text-sm text-gray-500">{student.matricule}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div>{student.email}</div>
                                                <div>{student.phone || '---'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div>{student.dateNaissance || '---'}</div>
                                                <div>{student.lieuNaissance || '---'}</div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'subjects' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {subjects.length == 0 ? (
                                <div className="text-sm text-gray-500">Aucune matiere associee.</div>
                            ) : (
                                subjects.map((subject) => (
                                    <div key={subject.subjectId} className="border border-gray-200 rounded-lg p-4">
                                        <div className="font-semibold text-gray-900">{subject.name}</div>
                                        <div className="text-sm text-gray-500">{subject.code}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div>
                            <Link href={`/chief/timetables/classes/${classId}`} className="text-[#7c3aed] hover:underline">
                                Voir l'emploi du temps de cette classe
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
