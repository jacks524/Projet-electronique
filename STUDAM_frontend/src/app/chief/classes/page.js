"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import classService from '../../../services/classService';
import departmentService from '../../../services/departmentService';
import { useAuthContext } from '../../../context/authContext';
import Button from '../../../components/ui/Button';
import toast from 'react-hot-toast';

export default function ClassesPage() {
    const router = useRouter();
    const { user } = useAuthContext();
    const [classes, setClasses] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');

    useEffect(() => {
        loadClasses();
    }, [user]);

    const loadClasses = async () => {
        try {
            setLoading(true);

            if (!user?.departmentNames || user.departmentNames.length === 0) {
                toast.error("Aucun département assigné");
                return;
            }

            const allDepartments = await departmentService.getAll();
            const targetDepartment = allDepartments.find(
                d => d.name === user.departmentNames[0]
            );

            if (!targetDepartment) {
                throw new Error("Département non trouvé");
            }

            const classesData = await classService.getByDepartment(targetDepartment.departmentId);

            setClasses(classesData);
            setFilteredClasses(classesData);
        } catch (error) {
            toast.error("Erreur lors du chargement des classes");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredClasses(classes);
        } else {
            const filtered = classes.filter(classe =>
                classe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                classe.code.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredClasses(filtered);
        }
    }, [searchTerm, classes]);

    const handleDeleteClass = async (classId, className) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la classe "${className}" ? Cette action est irréversible.`)) {
            return;
        }

        try {
            // TODO: Implémenter l'appel API
            // await classService.delete(classId);
            toast.success("Classe supprimée avec succès");
            loadClasses();
        } catch (error) {
            toast.error("Erreur lors de la suppression");
            console.error(error);
        }
    };

    const sortedClasses = [...filteredClasses].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'code':
                return a.code.localeCompare(b.code);
            case 'students':
                return (b.studentNumber || 0) - (a.studentNumber || 0);
            default:
                return 0;
        }
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-[#312e81]">
                            Gestion des classes
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {classes.length} classe(s) • Département: {user?.departmentNames?.[0]}
                        </p>
                    </div>
                    <Link href="/chief/classes/create">
                        <Button>
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Créer une classe
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total classes</p>
                            <p className="text-3xl font-bold text-[#312e81] mt-2">{classes.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total étudiants</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">
                                {classes.reduce((sum, c) => sum + (c.studentNumber || 0), 0)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Moyenne/classe</p>
                            <p className="text-3xl font-bold text-purple-600 mt-2">
                                {classes.length > 0
                                    ? Math.round(classes.reduce((sum, c) => sum + (c.studentNumber || 0), 0) / classes.length)
                                    : 0
                                }
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Capacité totale</p>
                            <p className="text-3xl font-bold text-violet-600 mt-2">
                                {classes.reduce((sum, c) => sum + (c.capacity || 0), 0)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white shadow rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher une classe..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm"
                        />
                    </div>

                    <div className="flex space-x-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm"
                        >
                            <option value="name">Nom</option>
                            <option value="code">Code</option>
                            <option value="students">Effectif</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Classes Grid */}
            {sortedClasses.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune classe trouvée</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? "Essayez avec d'autres mots-clés" : "Commencez par créer votre première classe"}
                    </p>
                    {!searchTerm && (
                        <div className="mt-6">
                            <Link href="/chief/classes/create">
                                <Button>
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Créer une classe
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedClasses.map((classe) => (
                        <div key={classe.classId} className="bg-white shadow rounded-lg p-6 hover:shadow-xl transition-shadow duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#312e81] to-[#4338ca] rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">{classe.code}</span>
                                    </div>
                                </div>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {classe.studentNumber || 0} étudiants
                                </span>
                            </div>

                            <h3 className="text-lg font-semibold text-[#312e81] mb-2">
                                {classe.name}
                            </h3>

                            {classe.description && (
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {classe.description}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                                <div className="flex space-x-2">
                                    <Link href={`/chief/classes/${classe.classId}`}>
                                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Voir détails">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                    </Link>
                                    <Link href={`/chief/classes/${classe.classId}/edit`}>
                                        <button className="p-2 text-[#312e81] hover:bg-gray-100 rounded-lg transition-colors" title="Modifier">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                    </Link>
                                    <Link href={`/chief/timetables/classes/${classe.classId}`}>
                                        <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Emploi du temps">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteClass(classe.classId, classe.name)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Supprimer"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}