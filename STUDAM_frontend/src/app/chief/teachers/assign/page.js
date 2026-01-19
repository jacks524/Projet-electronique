"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';

export default function AssignTeacherPage() {
    const router = useRouter();

    const [teachers, setTeachers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // TODO: Appeler les endpoints
            // const teachersData = await userService.getTeachers();
            // const departmentsData = await departmentService.getAll();

            const mockTeachers = [
                { id: 1, name: 'Dr. Mamadou Diallo', email: 'mamadou@email.com', currentDepartments: [1] },
                { id: 2, name: 'Prof. Aissatou Fall', email: 'aissatou@email.com', currentDepartments: [2] },
                { id: 3, name: 'Dr. Omar Sow', email: 'omar@email.com', currentDepartments: [] }
            ];

            const mockDepartments = [
                { id: 1, name: 'Informatique', code: 'INFO' },
                { id: 2, name: 'Mathématiques', code: 'MATH' },
                { id: 3, name: 'Physique', code: 'PHY' },
                { id: 4, name: 'Chimie', code: 'CHIM' }
            ];

            setTeachers(mockTeachers);
            setDepartments(mockDepartments);

        } catch (error) {
            toast.error("Erreur lors du chargement des données");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleTeacherChange = (e) => {
        const teacherId = e.target.value;
        setSelectedTeacher(teacherId);

        if (teacherId) {
            const teacher = teachers.find(t => t.id === parseInt(teacherId));
            setSelectedDepartments(teacher?.currentDepartments || []);
        } else {
            setSelectedDepartments([]);
        }

        if (errors.teacher) {
            setErrors(prev => ({ ...prev, teacher: '' }));
        }
    };

    const handleDepartmentToggle = (departmentId) => {
        setSelectedDepartments(prev => {
            if (prev.includes(departmentId)) {
                return prev.filter(id => id !== departmentId);
            } else {
                return [...prev, departmentId];
            }
        });

        if (errors.departments) {
            setErrors(prev => ({ ...prev, departments: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!selectedTeacher) {
            newErrors.teacher = "Veuillez sélectionner un enseignant";
        }

        if (selectedDepartments.length === 0) {
            newErrors.departments = "Veuillez sélectionner au moins un département";
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setAssigning(true);

        try {
            // TODO: Appeler l'endpoint
            // await userService.assignToDepartments(selectedTeacher, selectedDepartments);

            toast.success("Enseignant assigné avec succès aux départements");
            router.push('/chief/teachers');

        } catch (error) {
            toast.error("Erreur lors de l'assignation");
            console.error(error);
        } finally {
            setAssigning(false);
        }
    };

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

    const selectedTeacherData = teachers.find(t => t.id === parseInt(selectedTeacher));

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#312e81]">Assigner un enseignant</h1>
                    <p className="text-gray-600 mt-1">Assignez un enseignant à un ou plusieurs départements</p>
                </div>
                <Link href="/chief/teachers">
                    <Button variant="secondary">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        Retour
                    </Button>
                </Link>
            </div>

            {/* Formulaire */}
            <div className="bg-white shadow rounded-lg">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Sélection de l'enseignant */}
                    <div>
                        <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 mb-1">
                            Sélectionner un enseignant <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="teacher"
                            name="teacher"
                            value={selectedTeacher}
                            onChange={handleTeacherChange}
                            className={`block w-full px-3 py-2 border ${errors.teacher ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm`}
                        >
                            <option value="">Choisir un enseignant</option>
                            {teachers.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.name} - {teacher.email}
                                </option>
                            ))}
                        </select>
                        {errors.teacher && (
                            <p className="mt-1 text-sm text-red-600">{errors.teacher}</p>
                        )}
                    </div>

                    {/* Informations sur l'enseignant sélectionné */}
                    {selectedTeacherData && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 bg-[#312e81] rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold">
                                            {selectedTeacherData.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="text-sm font-medium text-blue-900">{selectedTeacherData.name}</h3>
                                    <p className="text-sm text-blue-700 mt-1">{selectedTeacherData.email}</p>
                                    {selectedTeacherData.currentDepartments.length > 0 && (
                                        <p className="text-xs text-blue-600 mt-2">
                                            Actuellement assigné à {selectedTeacherData.currentDepartments.length} département(s)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sélection des départements */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Départements <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {departments.map((department) => (
                                <div
                                    key={department.id}
                                    onClick={() => handleDepartmentToggle(department.id)}
                                    className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                        selectedDepartments.includes(department.id)
                                            ? 'border-[#7c3aed] bg-violet-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                type="checkbox"
                                                checked={selectedDepartments.includes(department.id)}
                                                onChange={() => {}}
                                                className="h-4 w-4 text-[#7c3aed] focus:ring-[#7c3aed] border-gray-300 rounded"
                                            />
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-medium text-gray-900">
                                                    {department.name}
                                                </h4>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    {department.code}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {selectedDepartments.includes(department.id) && (
                                        <div className="absolute top-2 right-2">
                                            <svg className="h-5 w-5 text-[#7c3aed]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {errors.departments && (
                            <p className="mt-2 text-sm text-red-600">{errors.departments}</p>
                        )}
                    </div>

                    {/* Résumé */}
                    {selectedTeacher && selectedDepartments.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">Résumé de l'assignation</h3>
                                    <div className="mt-2 text-sm text-green-700">
                                        <p>
                                            <span className="font-medium">{selectedTeacherData?.name}</span> sera assigné à{' '}
                                            <span className="font-medium">{selectedDepartments.length}</span> département(s) :
                                        </p>
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            {selectedDepartments.map(deptId => {
                                                const dept = departments.find(d => d.id === deptId);
                                                return dept ? <li key={dept.id}>{dept.name}</li> : null;
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Boutons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <Link href="/chief/teachers">
                            <Button type="button" variant="secondary">
                                Annuler
                            </Button>
                        </Link>
                        <Button type="submit" disabled={assigning}>
                            {assigning ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Assignation...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                    </svg>
                                    Assigner
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}