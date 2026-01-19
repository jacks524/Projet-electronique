"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../../context/authContext';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import StatCard from '../../../components/dashboard/StatCard';
import Button from '../../../components/ui/Button';
import ClassList from '../../../components/dashboard/ClassList';
import SubjectList from '../../../components/dashboard/SubjectList';
import departmentService from '../../../services/departmentService';
import userService from "../../../services/userService";
import classService from "../../../services/classService";
import toast from "react-hot-toast";


export default function ChiefDashboard() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuthContext();
    const [departmentInfo, setDepartmentInfo] = useState({ name: '', stats: { teachers: 0, students: 0, classes: 0, attendanceRate: 0 }, recentTeachers: [], topClasses: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        const userRole = user?.role?.toUpperCase();
        if (!isAuthenticated || (userRole !== 'DEPARTMENT_MANAGER' && userRole !== 'ADMIN')) {
            router.push('/auth/login');
            return;
        }
        if (user && user.departmentNames && user.departmentNames.length > 0) {
            loadDashboardData(user.departmentNames[0]);
        } else {
            toast.error("Aucun département n'est assigné à votre compte.");
            setLoading(false);
        }

    }, [user, isAuthenticated, authLoading, router]);

    const loadDashboardData = async (departmentName) => {
        try {
            setLoading(true);

            const allDepartments = await departmentService.getAll();
            const targetDepartment = allDepartments.find(d => d.name === departmentName);

            if (!targetDepartment) {
                throw new Error(`Département "${departmentName}" non trouvé.`);
            }
            const departmentId = targetDepartment.departmentId;

            const [teachers, classes] = await Promise.all([
                userService.getUsersByRoleAndDepartment('TEACHER', departmentId),
                classService.getByDepartment({ departmentId, name: "temp", code: "temp", description: "temp" }),
            ]);

            const totalStudents = classes.reduce((sum, cls) => sum + (cls.studentNumber || 0), 0);

            setDepartmentInfo({
                name: targetDepartment.name,
                stats: {
                    teachers: teachers.length,
                    students: totalStudents,
                    classes: classes.length,
                    attendanceRate: 0
                },
                recentTeachers: teachers.slice(0, 3).map(t => ({ id: t.id, nom: t.name, email: t.email, dateAjout: t.createdDate })),
                topClasses: classes.sort((a, b) => b.studentNumber - a.studentNumber).slice(0, 3).map(c => ({ id: c.classId, nom: c.name, etudiantsCount: c.studentNumber }))
            });

        } catch (error) {
            toast.error(error.message || "Erreur de chargement du dashboard.");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
                </div>
            </div>
        );
    }

    if (!departmentInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600">Erreur lors du chargement des données</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-bold text-[#312e81]">
                    Dashboard - Département {departmentInfo.name}
                </h1>
                <DashboardHeader user={user} />
            </div>

            {/* Cartes de Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Enseignants"
                    count={departmentInfo.stats.teachers}
                    icon={
                        <svg className="w-8 h-8 text-[#7c3aed]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Étudiants"
                    count={departmentInfo.stats.students}
                    icon={
                        <svg className="w-8 h-8 text-[#7c3aed]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Classes"
                    count={departmentInfo.stats.classes}
                    icon={
                        <svg className="w-8 h-8 text-[#7c3aed]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    }
                />
                <StatCard
                    title="Taux de Présence"
                    count={`${departmentInfo.stats.attendanceRate}%`}
                    icon={
                        <svg className="w-8 h-8 text-[#7c3aed]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
            </div>

            {/* Actions Rapides */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-[#312e81] mb-4">Actions Rapides</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/chief/teachers/create">
                        <Button className="w-full justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Ajouter un enseignant
                        </Button>
                    </Link>
                    <Link href="/chief/classes/create">
                        <Button className="w-full justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Créer une nouvelle classe
                        </Button>
                    </Link>
                    <Link href="/chief/timetables">
                        <Button className="w-full justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Gérer l'emploi du temps
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Liste des enseignants récents */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-[#312e81]">Derniers enseignants ajoutés</h3>
                    </div>
                    {departmentInfo.recentTeachers.length === 0 ? (
                        <div className="px-4 py-4 sm:px-6">
                            <div className="text-sm text-gray-500">Aucun enseignant récemment ajouté.</div>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {departmentInfo.recentTeachers.map((teacher) => (
                                <li key={teacher.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-medium text-[#312e81]">
                                                {teacher.nom}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {teacher.email}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Ajouté le {new Date(teacher.dateAjout).toLocaleDateString('fr-FR')}
                                            </div>
                                        </div>
                                        <Link
                                            href={`/chief/teachers/${teacher.id}`}
                                            className="text-sm text-[#7c3aed] hover:text-opacity-80"
                                        >
                                            Voir détails
                                        </Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Classes avec le plus d'étudiants */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-[#312e81]">Classes les plus peuplées</h3>
                    </div>
                    {departmentInfo.topClasses.length === 0 ? (
                        <div className="px-4 py-4 sm:px-6">
                            <div className="text-sm text-gray-500">Aucune classe disponible.</div>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {departmentInfo.topClasses.map((classe) => (
                                <li key={classe.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-medium text-[#312e81]">
                                                {classe.nom}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {classe.etudiantsCount} étudiants
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          classe.etudiantsCount > 40
                              ? 'bg-green-100 text-green-800'
                              : classe.etudiantsCount > 30
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                      }`}>
                        {classe.etudiantsCount > 40 ? 'Élevé' : classe.etudiantsCount > 30 ? 'Moyen' : 'Faible'}
                      </span>
                                            <Link
                                                href={`/chief/classes/${classe.id}`}
                                                className="text-sm text-[#7c3aed] hover:text-opacity-80"
                                            >
                                                Gérer
                                            </Link>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}