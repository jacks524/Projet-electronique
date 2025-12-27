"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';

export default function StudentsByClasses() {
    const router = useRouter();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // TODO: Appeler les endpoints pour récupérer les données
            // const departmentsData = await departmentService.getAll();
            // const classesData = await classService.getByDepartment(user.departmentId);

            // Données mockées pour l'instant
            const mockDepartments = [
                { id: 1, name: 'Informatique' },
                { id: 2, name: 'Mathématiques' }
            ];

            const mockClasses = [
                {
                    id: 1,
                    name: '3GI',
                    departmentId: 1,
                    department: { name: 'Informatique' },
                    studentCount: 45,
                    level: 'Licence 3'
                },
                {
                    id: 2,
                    name: '4GI',
                    departmentId: 1,
                    department: { name: 'Informatique' },
                    studentCount: 38,
                    level: 'Master 1'
                }
            ];

            setDepartments(mockDepartments);
            setClasses(mockClasses);

        } catch (error) {
            toast.error("Erreur lors du chargement des classes");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClasses = selectedDepartment
        ? classes.filter(c => c.departmentId === parseInt(selectedDepartment))
        : classes;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26419] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement des classes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#1B396A]">Étudiants par Classes</h1>
                    <p className="text-gray-600 mt-1">Gérez les étudiants organisés par classe</p>
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

            {/* Filtres */}
            <div className="bg-white shadow rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                            Filtrer par département
                        </label>
                        <select
                            id="department"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm rounded-md"
                        >
                            <option value="">Tous les départements</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Liste des classes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune classe trouvée</h3>
                        <p className="mt-1 text-sm text-gray-500">Commencez par créer une classe.</p>
                    </div>
                ) : (
                    filteredClasses.map((classe) => (
                        <Link
                            key={classe.id}
                            href={`/chief/students/classes/${classe.id}`}
                            className="block"
                        >
                            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer border-2 border-transparent hover:border-[#F26419]">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-[#1B396A] mb-2">
                                            {classe.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3">
                                            {classe.department?.name}
                                        </p>
                                        <div className="flex items-center text-sm text-gray-500 mb-2">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                            </svg>
                                            {classe.level}
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-[#F26419] to-[#FF7A47] rounded-full flex items-center justify-center">
                                            <span className="text-2xl font-bold text-white">
                                                {classe.studentCount}
                                            </span>
                                        </div>
                                        <p className="text-xs text-center text-gray-500 mt-1">étudiants</p>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                                    <span className="text-sm text-[#F26419] font-medium flex items-center">
                                        Voir les étudiants
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
        </div>
    );
}