"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '../../../../context/authContext';
import departmentService from '../../../../services/departmentService';
import userService from '../../../../services/userService';
import Button from '../../../../components/ui/Button';
import toast from 'react-hot-toast';

export default function TeachersReportPage() {
    const { user } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const [teachers, setTeachers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        loadTeachers();
    }, [user]);

    const loadTeachers = async () => {
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

            const teachersData = await userService.getUsersByRoleAndDepartment(
                'TEACHER',
                targetDepartment.departmentId
            );

            // Enrichir les données avec des statistiques simulées
            const enrichedTeachers = teachersData.map(teacher => ({
                ...teacher,
                totalClasses: Math.floor(Math.random() * 5) + 2,
                totalStudents: Math.floor(Math.random() * 100) + 30,
                hoursPerWeek: Math.floor(Math.random() * 15) + 8,
                attendanceRate: Math.floor(Math.random() * 20) + 80,
                status: teacher.active ? 'active' : 'inactive'
            }));

            setTeachers(enrichedTeachers);

        } catch (error) {
            toast.error("Erreur lors du chargement des enseignants");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTeachers = teachers.filter(teacher =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedTeachers = [...filteredTeachers].sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
            case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            case 'classes':
                aValue = a.totalClasses;
                bValue = b.totalClasses;
                break;
            case 'students':
                aValue = a.totalStudents;
                bValue = b.totalStudents;
                break;
            case 'hours':
                aValue = a.hoursPerWeek;
                bValue = b.hoursPerWeek;
                break;
            case 'rate':
                aValue = a.attendanceRate;
                bValue = b.attendanceRate;
                break;
            default:
                return 0;
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleExportExcel = () => {
        toast.success("Export Excel en cours...");
        // TODO: Implémenter l'export Excel
    };

    const handleExportPDF = () => {
        window.print();
    };

    const totalHours = teachers.reduce((sum, t) => sum + t.hoursPerWeek, 0);
    const avgStudents = teachers.length > 0
        ? Math.round(teachers.reduce((sum, t) => sum + t.totalStudents, 0) / teachers.length)
        : 0;
    const avgRate = teachers.length > 0
        ? Math.round(teachers.reduce((sum, t) => sum + t.attendanceRate, 0) / teachers.length)
        : 0;

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
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-[#312e81]">
                            Rapport des enseignants
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Vue d'ensemble de {teachers.length} enseignant(s)
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button onClick={handleExportExcel} variant="secondary">
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Exporter Excel
                        </Button>
                        <Button onClick={handleExportPDF} variant="secondary">
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Imprimer PDF
                        </Button>
                        <Link href="/chief/reports">
                            <Button variant="secondary">Retour</Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total enseignants</p>
                            <p className="text-3xl font-bold text-[#312e81] mt-2">{teachers.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total heures/sem.</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{totalHours}h</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Moy. étudiants</p>
                            <p className="text-3xl font-bold text-purple-600 mt-2">{avgStudents}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Taux moy. présence</p>
                            <p className="text-3xl font-bold text-violet-600 mt-2">{avgRate}%</p>
                        </div>
                        <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
                            placeholder="Rechercher un enseignant..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm"
                        />
                    </div>

                    <div className="flex space-x-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm"
                        >
                            <option value="name">Nom</option>
                            <option value="classes">Nombre de classes</option>
                            <option value="students">Nombre d'étudiants</option>
                            <option value="hours">Heures/semaine</option>
                            <option value="rate">Taux de présence</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#7c3aed] focus:border-[#7c3aed]"
                        >
                            {sortOrder === 'asc' ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Teachers Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Enseignant
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('classes')}>
                                Classes
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('students')}>
                                Étudiants
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('hours')}>
                                Heures/sem.
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Statut
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {sortedTeachers.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun enseignant trouvé</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {searchTerm ? "Essayez avec d'autres mots-clés" : "Aucun enseignant disponible"}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            sortedTeachers.map((teacher) => (
                                <tr key={teacher.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center text-white font-semibold">
                                                    {teacher.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {teacher.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {teacher.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="text-sm text-gray-900">{teacher.totalClasses}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="text-sm text-gray-900">{teacher.totalStudents}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="text-sm text-gray-900">{teacher.hoursPerWeek}h</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="w-20">
                                                <div className="text-sm font-medium text-gray-900">{teacher.attendanceRate}%</div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                                    <div
                                                        className={`h-1.5 rounded-full ${
                                                            teacher.attendanceRate >= 90 ? 'bg-green-500' :
                                                                teacher.attendanceRate >= 75 ? 'bg-yellow-500' :
                                                                    'bg-red-500'
                                                        }`}
                                                        style={{ width: `${teacher.attendanceRate}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                teacher.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {teacher.status === 'active' ? 'Actif' : 'Inactif'}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <Link
                                            href={`/chief/teachers/${teacher.id}`}
                                            className="text-[#7c3aed] hover:text-[#6d28d9]"
                                        >
                                            Détails
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Performance Chart Placeholder */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#312e81] mb-4">
                    Répartition de la charge de travail
                </h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                        </svg>
                        <p className="text-gray-500">Graphique de répartition</p>
                        <p className="text-sm text-gray-400 mt-1">À implémenter avec une bibliothèque de graphiques</p>
                    </div>
                </div>
            </div>

            {/* Top Performers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[#312e81] mb-4">
                        Meilleurs taux de présence
                    </h3>
                    <div className="space-y-3">
                        {[...teachers]
                            .sort((a, b) => b.attendanceRate - a.attendanceRate)
                            .slice(0, 5)
                            .map((teacher, index) => (
                                <div key={teacher.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                            index === 0 ? 'bg-yellow-500' :
                                                index === 1 ? 'bg-gray-400' :
                                                    index === 2 ? 'bg-violet-600' :
                                                        'bg-gray-300'
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{teacher.name}</p>
                                            <p className="text-xs text-gray-500">{teacher.totalClasses} classe(s)</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-green-600">{teacher.attendanceRate}%</p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[#312e81] mb-4">
                        Plus grande charge de travail
                    </h3>
                    <div className="space-y-3">
                        {[...teachers]
                            .sort((a, b) => b.hoursPerWeek - a.hoursPerWeek)
                            .slice(0, 5)
                            .map((teacher, index) => (
                                <div key={teacher.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{teacher.name}</p>
                                            <p className="text-xs text-gray-500">{teacher.totalStudents} étudiant(s)</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-blue-600">{teacher.hoursPerWeek}h</p>
                                        <p className="text-xs text-gray-500">{teacher.totalClasses} classes</p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#312e81] mb-4">
                    Observations et recommandations
                </h3>
                <ul className="space-y-3">
                    {teachers.filter(t => t.attendanceRate < 70).length > 0 && (
                        <li className="flex items-start p-3 bg-red-50 rounded-lg">
                            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <p className="font-medium text-red-900">Enseignants avec taux faible</p>
                                <p className="text-sm text-red-700 mt-1">
                                    {teachers.filter(t => t.attendanceRate < 70).length} enseignant(s) ont un taux de présence inférieur à 70%. Un accompagnement peut être nécessaire.
                                </p>
                            </div>
                        </li>
                    )}
                    {teachers.filter(t => t.hoursPerWeek > 20).length > 0 && (
                        <li className="flex items-start p-3 bg-yellow-50 rounded-lg">
                            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="font-medium text-yellow-900">Charge de travail élevée</p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    {teachers.filter(t => t.hoursPerWeek > 20).length} enseignant(s) ont plus de 20h/semaine. Envisagez une redistribution.
                                </p>
                            </div>
                        </li>
                    )}
                    {teachers.filter(t => t.attendanceRate >= 95).length > 0 && (
                        <li className="flex items-start p-3 bg-green-50 rounded-lg">
                            <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="font-medium text-green-900">Excellents résultats</p>
                                <p className="text-sm text-green-700 mt-1">
                                    {teachers.filter(t => t.attendanceRate >= 95).length} enseignant(s) maintiennent un taux de présence supérieur à 95%. Excellente performance !
                                </p>
                            </div>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}