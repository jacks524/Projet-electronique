"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AttendanceFilter from '@/components/attendance/AttendanceFilter';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import AttendanceStats from '@/components/attendance/AttendanceStats';

export default function AttendancePage() {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [statsVisible, setStatsVisible] = useState(false);

    useEffect(() => {
        // Vérifier si l'utilisateur est connecté
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                router.push('/auth/login');
                return;
            }

            try {
                const currentUser = JSON.parse(userStr);
                setUser(currentUser);

                // Charger les courses et matières de l'utilisateur connecté (données fictives pour la démo)
                if (currentUser) {
                    setClasses(currentUser.classes || []);
                    setSubjects(currentUser.matieres || []);
                    // Si l'utilisateur a au moins une classe, la sélectionner par défaut
                    if (currentUser.classes && currentUser.classes.length > 0) {
                        setSelectedClassId(currentUser.classes[0].id);
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des données utilisateur:', error);
                router.push('/auth/login');
                return;
            }
        }

        setLoading(false);
    }, [router]);

    useEffect(() => {
        // Charger les étudiants et les présences quand la classe ou la matière est sélectionnée
        if (selectedClassId) {
            loadStudentsAndAttendance();
        }
    }, [selectedClassId, selectedSubjectId, selectedDate]);

    const loadStudentsAndAttendance = () => {
        // Simuler le chargement des données des étudiants et des présences
        setLoading(true);

        // Données fictives pour la démo
        setTimeout(() => {
            const mockStudents = [
                { id: 1, matricule: "INF001", nom: "Diallo Mamadou", email: "diallo.m@studam.edu", phone: "+(221) 77 123 45 67" },
                { id: 2, matricule: "INF002", nom: "Fall Aissatou", email: "fall.a@studam.edu", phone: "+(221) 77 234 56 78" },
                { id: 3, matricule: "INF003", nom: "Sow Abdoulaye", email: "sow.a@studam.edu", phone: "+(221) 77 345 67 89" },
                { id: 4, matricule: "INF004", nom: "Diop Fatou", email: "diop.f@studam.edu", phone: "+(221) 77 456 78 90" },
                { id: 5, matricule: "INF005", nom: "Kane Ousmane", email: "kane.o@studam.edu", phone: "+(221) 77 567 89 01" },
                { id: 6, matricule: "INF006", nom: "Ndiaye Mariama", email: "ndiaye.m@studam.edu", phone: "+(221) 77 678 90 12" },
                { id: 7, matricule: "INF007", nom: "Gueye Ibrahim", email: "gueye.i@studam.edu", phone: "+(221) 77 789 01 23" },
                { id: 8, matricule: "INF008", nom: "Mbaye Aminata", email: "mbaye.a@studam.edu", phone: "+(221) 77 890 12 34" }
            ];

            // Générer des statuts de présence aléatoires pour la démo
            const statuses = ['present', 'absent', 'late'];
            const mockAttendance = mockStudents.map(student => ({
                id: student.id,
                studentId: student.id,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                timestamp: new Date().toISOString(),
                notes: ""
            }));

            setStudents(mockStudents);
            setAttendance(mockAttendance);
            setLoading(false);
        }, 1000);
    };

    const handleFilterChange = (filters) => {
        if (filters.classId) setSelectedClassId(filters.classId);
        if (filters.subjectId) setSelectedSubjectId(filters.subjectId);
        if (filters.date) setSelectedDate(filters.date);
    };

    const handleAttendanceChange = (studentId, status, notes = "") => {
        setAttendance(prev =>
            prev.map(item =>
                item.studentId === studentId
                    ? { ...item, status, notes, timestamp: new Date().toISOString() }
                    : item
            )
        );
    };

    const handleSaveAttendance = () => {
        // Simuler la sauvegarde des présences
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            alert('Présences enregistrées avec succès !');
            setStatsVisible(true);
        }, 1000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F26419]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#1B396A]">Gestion des Présences</h1>
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            <li className="inline-flex items-center">
                                <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#F26419]">
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                                    </svg>
                                    Tableau de bord
                                </Link>
                            </li>
                            <li aria-current="page">
                                <div className="flex items-center">
                                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                                    </svg>
                                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Présences</span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                </div>

                {/* Filtres */}
                <div className="mb-6">
                    <AttendanceFilter
                        classes={classes}
                        subjects={subjects}
                        selectedClassId={selectedClassId}
                        selectedSubjectId={selectedSubjectId}
                        selectedDate={selectedDate}
                        onFilterChange={handleFilterChange}
                    />
                </div>

                {/* Tableau des présences */}
                {selectedClassId ? (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                            <h3 className="text-lg leading-6 font-medium text-[#1B396A]">
                                Feuille de présence
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                {selectedDate && new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                {selectedSubjectId && subjects.find(s => s.id === parseInt(selectedSubjectId)) &&
                                    ` - ${subjects.find(s => s.id === parseInt(selectedSubjectId)).libelle}`}
                                {selectedClassId && classes.find(c => c.id === parseInt(selectedClassId)) &&
                                    ` - ${classes.find(c => c.id === parseInt(selectedClassId)).nom}`}
                            </p>
                        </div>

                        <AttendanceTable
                            students={students}
                            attendance={attendance}
                            onAttendanceChange={handleAttendanceChange}
                        />

                        <div className="px-4 py-4 sm:px-6 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={handleSaveAttendance}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#F26419] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F26419]"
                            >
                                Enregistrer les présences
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:px-6">
                            <div className="text-center py-10">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune classe sélectionnée</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Veuillez sélectionner une classe pour afficher la feuille de présence.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Statistiques */}
                {statsVisible && selectedClassId && (
                    <div className="mt-6">
                        <AttendanceStats
                            attendance={attendance}
                            selectedClass={classes.find(c => c.id === parseInt(selectedClassId))}
                            selectedSubject={subjects.find(s => s.id === parseInt(selectedSubjectId))}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}