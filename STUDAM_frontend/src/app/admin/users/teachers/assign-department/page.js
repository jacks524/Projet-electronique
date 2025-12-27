"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../../../../context/authContext';
import userService from '../../../../../services/userService';
import departmentService from '../../../../../services/departmentService';
import toast from 'react-hot-toast';
import { getRoleLabel } from '../../../../../lib/roles';

export default function AssignTeacherToDepartment() {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuthContext();

    const [unassignedTeachers, setUnassignedTeachers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) { router.push('/auth/login'); return; }
        loadData();
    }, [isAuthenticated, authLoading, router]);

    const loadData = async () => {
        try {
            setLoading(true);

            const [usersResponse, departmentsData] = await Promise.all([
                userService.getAllUsersWithPagination(0, 1000),
                departmentService.getAll()
            ]);

            const candidates = usersResponse
                .filter(user =>
                        user.roles && user.roles.some(r =>
                            r.role.toUpperCase() === 'TEACHER' || r.role.toUpperCase() === 'DEPARTMENT_MANAGER'
                        )
                )
                .filter(user =>
                    !user.departmentNames || user.departmentNames.length === 0
                );

            setUnassignedTeachers(candidates);
            setDepartments(departmentsData);

        } catch (error) {
            toast.error(error.message || "Erreur lors du chargement des données.");
            console.error("Erreur détaillée dans loadData:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTeacherSelection = (teacherId, isChecked) => {
        setSelectedTeacherIds(prev => {
            if (isChecked) {
                return [...prev, teacherId];
            } else {
                return prev.filter(id => id !== teacherId);
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedTeacherIds.length === unassignedTeachers.length) {
            setSelectedTeacherIds([]);
        } else {
            setSelectedTeacherIds(unassignedTeachers.map(t => t.id));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedTeacherIds.length === 0 || !selectedDepartmentId) {
            toast.error("Veuillez sélectionner au moins un enseignant et un département.");
            return;
        }
        setSubmitting(true);

        const assignmentPromises = selectedTeacherIds.map(teacherId =>
            userService.assignToDepartments(teacherId, [parseInt(selectedDepartmentId)])
        );

        try {
            await toast.promise(
                Promise.all(assignmentPromises),
                {
                    loading: 'Assignation en cours...',
                    success: 'Enseignant(s) assigné(s) avec succès !',
                    error: 'Une ou plusieurs assignations ont échoué.'
                }
            );
            router.push('/admin/users/teachers');
        } catch (error) {
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26419] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête avec breadcrumb */}
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-4">
                            <li>
                                <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-500">
                                    <svg className="flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                                    </svg>
                                </Link>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    <Link href="/admin/users/teachers" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                        Enseignants
                                    </Link>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    <span className="ml-4 text-sm font-medium text-gray-500">Assigner à un département</span>
                                </div>
                            </li>
                        </ol>
                    </nav>
                    <h1 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Assigner des Enseignants à un Département
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Sélectionnez les enseignants sans département et assignez-les à un département existant.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Liste des enseignants non assignés */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Enseignants disponibles ({unassignedTeachers.length})
                            </h3>
                            {unassignedTeachers.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleSelectAll}
                                    className="text-sm text-[#F26419] hover:text-orange-600 font-medium"
                                >
                                    {selectedTeacherIds.length === unassignedTeachers.length
                                        ? 'Tout désélectionner'
                                        : 'Tout sélectionner'}
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {unassignedTeachers.length > 0 ? (
                                unassignedTeachers.map((teacher) => (
                                    <div
                                        key={teacher.id}
                                        onClick={() => handleTeacherSelection(teacher.id, !selectedTeacherIds.includes(teacher.id))}
                                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                            selectedTeacherIds.includes(teacher.id)
                                                ? 'border-[#F26419] bg-orange-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <label className="cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedTeacherIds.includes(teacher.id)}
                                                onChange={(e) => handleTeacherSelection(teacher.id, e.target.checked)}
                                                className="sr-only"
                                            />

                                            <div className="flex items-start">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-[#1B396A] to-[#2563eb] rounded-full flex items-center justify-center text-white font-bold">
                                                        {teacher.name.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>

                                                <div className="ml-4 flex-1">
                                                    <h4 className="text-lg font-medium text-gray-900 mb-1">
                                                        {teacher.name}
                                                    </h4>

                                                    <div className="space-y-2 text-sm text-gray-600">
                                                        <div className="flex items-center">
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                                            </svg>
                                                            {teacher.email}
                                                        </div>
                                                        {teacher.roles && teacher.roles.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {teacher.roles.map(roleObj => {
                                                                    const isManager = roleObj.role === 'DEPARTMENT_MANAGER';
                                                                    return (
                                                                        <span
                                                                            key={roleObj.id}
                                                                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                                isManager
                                                                                    ? 'bg-purple-100 text-purple-800'
                                                                                    : 'bg-blue-100 text-blue-800'
                                                                            }`}
                                                                        >
                                                                            {isManager && (
                                                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                                    <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-.992 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd"/>
                                                                                </svg>
                                                                            )}
                                                                            {getRoleLabel(roleObj.role)}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="ml-4">
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                                        selectedTeacherIds.includes(teacher.id)
                                                            ? 'bg-[#F26419] border-[#F26419]'
                                                            : 'border-gray-300'
                                                    }`}>
                                                        {selectedTeacherIds.includes(teacher.id) && (
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun enseignant disponible</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Tous les enseignants sont déjà assignés à un département.
                                    </p>
                                </div>
                            )}
                        </div>

                        {selectedTeacherIds.length > 0 && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    <span className="font-medium">{selectedTeacherIds.length}</span> enseignant(s) sélectionné(s)
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sélection du département */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                            Département de destination
                        </h3>

                        {departments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {departments.map((dept) => (
                                    <div
                                        key={dept.departmentId}
                                        className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                                            selectedDepartmentId === dept.departmentId.toString()
                                                ? 'border-[#F26419] bg-orange-50 shadow-md'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => {
                                            if (selectedDepartmentId === dept.departmentId.toString()) {
                                                setSelectedDepartmentId('');
                                            } else {
                                                setSelectedDepartmentId(dept.departmentId.toString());
                                            }
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="department"
                                            value={dept.departmentId}
                                            checked={selectedDepartmentId === dept.departmentId.toString()}
                                            onChange={() => {}}
                                            className="sr-only"
                                        />

                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-[#1B396A] to-[#2563eb] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                                        {dept.code || dept.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="ml-3 flex-1">
                                                        <h4 className="text-base font-semibold text-gray-900 line-clamp-1">
                                                            {dept.name}
                                                        </h4>
                                                    </div>
                                                </div>

                                                {dept.description && (
                                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                        {dept.description}
                                                    </p>
                                                )}

                                                {dept.code && (
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                                                        </svg>
                                                        Code: {dept.code}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="ml-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                    selectedDepartmentId === dept.departmentId.toString()
                                                        ? 'bg-[#F26419] border-[#F26419]'
                                                        : 'border-gray-300'
                                                }`}>
                                                    {selectedDepartmentId === dept.departmentId.toString() && (
                                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun département disponible</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Veuillez créer un département avant d'assigner des enseignants.
                                </p>
                            </div>
                        )}

                        {selectedDepartmentId && (
                            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                    <p className="text-sm text-green-800 font-medium">
                                        Département sélectionné : {departments.find(d => d.departmentId.toString() === selectedDepartmentId)?.name}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                    <Link
                        href="/admin/users/teachers"
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F26419]"
                    >
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        disabled={selectedTeacherIds.length === 0 || !selectedDepartmentId || submitting}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#F26419] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Assignation en cours...
                            </>
                        ) : (
                            'Assigner au département'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}