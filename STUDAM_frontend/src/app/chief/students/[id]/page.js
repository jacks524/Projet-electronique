"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import studentService from '@/services/studentService';

export default function StudentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const studentId = params.id;

    const [student, setStudent] = useState(null);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        loadStudentData();
    }, [studentId]);

    const normalizeStudent = (data) => {
        if (!data) return null;

        const classInfo = data.classResponseDTO || data.classe || data.classEntity || data.class || {};
        const departmentInfo = classInfo.departementResponseDTO || classInfo.department || classInfo.departement || {};

        return {
            id: data.studentId || data.id || studentId,
            matricule: data.matricule || '--',
            nom: data.name || data.nom || 'Etudiant',
            email: data.email || '--',
            phone: data.phoneNumber || data.phone || '',
            dateNaissance: data.birthDate || data.dateNaissance || '',
            lieuNaissance: data.birthPlace || data.lieuNaissance || '',
            status: typeof data.active === 'boolean' ? (data.active ? 'active' : 'inactive') : 'active',
            classe: {
                name: classInfo.name || classInfo.nom || '--',
                level: classInfo.code || classInfo.level || '--',
                department: {
                    name: departmentInfo.name || departmentInfo.nom || '--'
                }
            },
            dateInscription: data.createdDate || data.dateInscription || ''
        };
    };

    const loadStudentData = async () => {
        try {
            setLoading(true);
            const studentData = await studentService.getById(studentId);
            const normalized = normalizeStudent(studentData);
            setStudent(normalized);
            setAttendanceHistory([]);
        } catch (error) {
            toast.error(error.message || "Erreur lors du chargement des donnees");
        } finally {
            setLoading(false);
        }
    };

    const calculateAttendanceStats = () => {
        const total = attendanceHistory.length;
        const present = attendanceHistory.filter(a => a.status === 'present').length;
        const absent = attendanceHistory.filter(a => a.status === 'absent').length;
        const late = attendanceHistory.filter(a => a.status === 'late').length;

        return {
            total,
            present,
            absent,
            late,
            presentRate: total > 0 ? ((present / total) * 100).toFixed(1) : 0
        };
    };

    const stats = calculateAttendanceStats();

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

    if (!student) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600">Etudiant non trouve</p>
                    <Link href="/chief/students" className="mt-4 text-[#7c3aed] hover:underline">
                        Retour a la liste
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#312e81]">Profil de l'etudiant</h1>
                    <p className="text-gray-600 mt-1">Details et historique complet</p>
                </div>
                <Link href="/chief/students">
                    <Button variant="secondary">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        Retour
                    </Button>
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-[#312e81] to-[#4338ca] px-6 py-8">
                    <div className="flex items-center space-x-6">
                        <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center">
                            <span className="text-4xl font-bold text-[#7c3aed]">
                                {student.nom.split(' ').map(n => n[0]).join('')}
                            </span>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-white">{student.nom}</h2>
                            <p className="text-blue-100 text-lg mt-1">{student.matricule}</p>
                            <div className="flex items-center space-x-4 mt-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    student.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {student.status === 'active' ? 'Actif' : 'Inactif'}
                                </span>
                                <span className="text-blue-100">
                                    {student.classe.name} - {student.classe.level}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-6 py-4 bg-gray-50 border-b">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                        <div className="text-sm text-gray-600">Presents</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                        <div className="text-sm text-gray-600">Absents</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                        <div className="text-sm text-gray-600">Retards</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#7c3aed]">{stats.presentRate}%</div>
                        <div className="text-sm text-gray-600">Taux de presence</div>
                    </div>
                </div>

                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px px-6">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`py-4 px-6 border-b-2 font-medium text-sm ${
                                activeTab === 'info'
                                    ? 'border-[#7c3aed] text-[#7c3aed]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Informations
                        </button>
                        <button
                            onClick={() => setActiveTab('attendance')}
                            className={`py-4 px-6 border-b-2 font-medium text-sm ${
                                activeTab === 'attendance'
                                    ? 'border-[#7c3aed] text-[#7c3aed]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Historique de presence
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                                <dl className="space-y-3">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{student.email}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Telephone</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{student.phone || '--'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Date de naissance</dt>
                                        <dd className="text-sm text-gray-900 mt-1">
                                            {student.dateNaissance ? new Date(student.dateNaissance).toLocaleDateString('fr-FR') : '--'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Lieu de naissance</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{student.lieuNaissance || '--'}</dd>
                                    </div>
                                </dl>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations academiques</h3>
                                <dl className="space-y-3">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Classe</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{student.classe.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Niveau</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{student.classe.level}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Departement</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{student.classe.department.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Date d'inscription</dt>
                                        <dd className="text-sm text-gray-900 mt-1">
                                            {student.dateInscription ? new Date(student.dateInscription).toLocaleDateString('fr-FR') : '--'}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des presences</h3>
                            <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-6 text-center">
                                Aucune donnee de presence disponible pour le moment.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
