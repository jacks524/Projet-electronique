"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';

export default function StudentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const studentId = params.id;

    const [student, setStudent] = useState(null);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info'); // info, attendance, performance

    useEffect(() => {
        loadStudentData();
    }, [studentId]);

    const loadStudentData = async () => {
        try {
            setLoading(true);
            // TODO: Appeler les endpoints
            // const studentData = await studentService.getById(studentId);
            // const attendanceData = await attendanceService.getByStudent(studentId);

            // Données mockées
            const mockStudent = {
                id: studentId,
                matricule: 'STU2024001',
                nom: 'Mamadou Diallo',
                email: 'mamadou.diallo@email.com',
                phone: '+221 77 123 45 67',
                dateNaissance: '2001-05-15',
                lieuNaissance: 'Dakar',
                status: 'active',
                classe: {
                    id: 1,
                    name: '3GI',
                    department: { name: 'Informatique' },
                    level: 'Licence 3'
                },
                dateInscription: '2021-09-01',
                photo: null
            };

            const mockAttendance = [
                {
                    id: 1,
                    date: '2025-01-15',
                    subject: { name: 'Programmation Web', code: 'INFO301' },
                    status: 'present',
                    hour: '08:00 - 10:00'
                },
                {
                    id: 2,
                    date: '2025-01-14',
                    subject: { name: 'Base de données', code: 'INFO302' },
                    status: 'present',
                    hour: '10:00 - 12:00'
                },
                {
                    id: 3,
                    date: '2025-01-13',
                    subject: { name: 'Réseaux', code: 'INFO303' },
                    status: 'absent',
                    hour: '14:00 - 16:00'
                },
                {
                    id: 4,
                    date: '2025-01-12',
                    subject: { name: 'Programmation Web', code: 'INFO301' },
                    status: 'late',
                    hour: '08:00 - 10:00'
                }
            ];

            setStudent(mockStudent);
            setAttendanceHistory(mockAttendance);

        } catch (error) {
            toast.error("Erreur lors du chargement des données");
            console.error(error);
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26419] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600">Étudiant non trouvé</p>
                    <Link href="/chief/students" className="mt-4 text-[#F26419] hover:underline">
                        Retour à la liste
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#1B396A]">Profil de l'étudiant</h1>
                    <p className="text-gray-600 mt-1">Détails et historique complet</p>
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

            {/* Carte principale */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-[#1B396A] to-[#2A5490] px-6 py-8">
                    <div className="flex items-center space-x-6">
                        <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center">
                            <span className="text-4xl font-bold text-[#F26419]">
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

                {/* Statistiques de présence */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-6 py-4 bg-gray-50 border-b">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                        <div className="text-sm text-gray-600">Présents</div>
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
                        <div className="text-2xl font-bold text-[#F26419]">{stats.presentRate}%</div>
                        <div className="text-sm text-gray-600">Taux de présence</div>
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
                            onClick={() => setActiveTab('attendance')}
                            className={`py-4 px-6 border-b-2 font-medium text-sm ${
                                activeTab === 'attendance'
                                    ? 'border-[#F26419] text-[#F26419]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Historique de présence
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
                                        <dd className="text-sm text-gray-900 mt-1">{student.email}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{student.phone || '—'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Date de naissance</dt>
                                        <dd className="text-sm text-gray-900 mt-1">
                                            {new Date(student.dateNaissance).toLocaleDateString('fr-FR')}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Lieu de naissance</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{student.lieuNaissance}</dd>
                                    </div>
                                </dl>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations académiques</h3>
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
                                        <dt className="text-sm font-medium text-gray-500">Département</dt>
                                        <dd className="text-sm text-gray-900 mt-1">{student.classe.department.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Date d'inscription</dt>
                                        <dd className="text-sm text-gray-900 mt-1">
                                            {new Date(student.dateInscription).toLocaleDateString('fr-FR')}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des présences</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Matière
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Horaire
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Statut
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {attendanceHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                                Aucun historique de présence
                                            </td>
                                        </tr>
                                    ) : (
                                        attendanceHistory.map((record) => (
                                            <tr key={record.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(record.date).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {record.subject.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {record.subject.code}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {record.hour}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            record.status === 'present'
                                                                ? 'bg-green-100 text-green-800'
                                                                : record.status === 'absent'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {record.status === 'present' ? 'Présent' : record.status === 'absent' ? 'Absent' : 'Retard'}
                                                        </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}