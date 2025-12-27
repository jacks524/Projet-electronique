"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';

export default function TimetablesPage() {
    const router = useRouter();

    const [view, setView] = useState('classes'); // 'classes' ou 'teachers'
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // TODO: Appeler les endpoints
            // const classesData = await classService.getByDepartment(userDepartmentId);
            // const teachersData = await userService.getTeachers();

            const mockClasses = [
                {
                    id: 1,
                    name: '3GI',
                    level: 'Licence 3',
                    studentCount: 45,
                    courseCount: 8,
                    department: { name: 'Informatique' }
                },
                {
                    id: 2,
                    name: '4GI',
                    level: 'Master 1',
                    studentCount: 38,
                    courseCount: 6,
                    department: { name: 'Informatique' }
                },
                {
                    id: 3,
                    name: '5GI',
                    level: 'Master 2',
                    studentCount: 32,
                    courseCount: 7,
                    department: { name: 'Informatique' }
                }
            ];

            const mockTeachers = [
                {
                    id: 1,
                    name: 'Dr. Mamadou Diallo',
                    email: 'mamadou@email.com',
                    courseCount: 12,
                    hoursPerWeek: 18,
                    department: { name: 'Informatique' }
                },
                {
                    id: 2,
                    name: 'Prof. Aissatou Fall',
                    email: 'aissatou@email.com',
                    courseCount: 10,
                    hoursPerWeek: 15,
                    department: { name: 'Informatique' }
                },
                {
                    id: 3,
                    name: 'Dr. Omar Sow',
                    email: 'omar@email.com',
                    courseCount: 8,
                    hoursPerWeek: 12,
                    department: { name: 'Informatique' }
                }
            ];

            setClasses(mockClasses);
            setTeachers(mockTeachers);

        } catch (error) {
            toast.error("Erreur lors du chargement des données");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClasses = classes.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.level.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredTeachers = teachers.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#1B396A]">Emplois du temps</h1>
                    <p className="text-gray-600 mt-1">Gérez les emplois du temps des classes et des enseignants</p>
                </div>
                <Link href="/chief/timetables/create">
                    <Button>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Créer un cours
                    </Button>
                </Link>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Enseignants</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">{teachers.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                        </div>
                        <div className="ml-5">
                            <p className="text-sm font-medium text-gray-500">Total cours</p>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">
                                {classes.reduce((sum, c) => sum + c.courseCount, 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barre d'actions */}
            <div className="bg-white shadow rounded-lg p-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    {/* Onglets de vue */}
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setView('classes')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                view === 'classes'
                                    ? 'bg-[#F26419] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Par classes
                        </button>
                        <button
                            onClick={() => setView('teachers')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                view === 'teachers'
                                    ? 'bg-[#F26419] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Par enseignants
                        </button>
                    </div>

                    {/* Recherche */}
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Liste des classes */}
            {view === 'classes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClasses.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune classe trouvée</h3>
                            <p className="mt-1 text-sm text-gray-500">Aucune classe ne correspond à votre recherche.</p>
                        </div>
                    ) : (
                        filteredClasses.map((classe) => (
                            <Link key={classe.id} href={`/chief/timetables/classes/${classe.id}`}>
                                <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer border-2 border-transparent hover:border-[#F26419]">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-[#1B396A] mb-1">
                                                {classe.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">{classe.level}</p>
                                            <p className="text-xs text-gray-500 mt-1">{classe.department.name}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#F26419] to-[#FF7A47] rounded-full flex items-center justify-center">
                                            <span className="text-lg font-bold text-white">{classe.name[0]}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
                                            </svg>
                                            {classe.studentCount} étudiants
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                            </svg>
                                            {classe.courseCount} cours
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                                        <span className="text-sm text-[#F26419] font-medium flex items-center">
                                            Voir l'emploi du temps
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}

            {/* Liste des enseignants */}
            {view === 'teachers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeachers.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun enseignant trouvé</h3>
                            <p className="mt-1 text-sm text-gray-500">Aucun enseignant ne correspond à votre recherche.</p>
                        </div>
                    ) : (
                        filteredTeachers.map((teacher) => (
                            <Link key={teacher.id} href={`/chief/timetables/teachers/${teacher.id}`}>
                                <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer border-2 border-transparent hover:border-[#F26419]">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-[#1B396A] mb-1">
                                                {teacher.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">{teacher.email}</p>
                                            <p className="text-xs text-gray-500 mt-1">{teacher.department.name}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#1B396A] to-[#2A5490] rounded-full flex items-center justify-center">
                                            <span className="text-sm font-bold text-white">
                                                {teacher.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                            </svg>
                                            {teacher.courseCount} cours
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                            {teacher.hoursPerWeek}h/semaine
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                                        <span className="text-sm text-[#F26419] font-medium flex items-center">
                                            Voir l'emploi du temps
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}