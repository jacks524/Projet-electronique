"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '../../../../components/ui/Button';
import { useAuthContext } from '../../../../context/authContext';
import departmentService from '../../../../services/departmentService';
import classService from '../../../../services/classService';
import subjectService from '../../../../services/subjectService';
import userService from '../../../../services/userService';
import timetableService from '../../../../services/timetableService';
import scheduleService from '../../../../services/scheduleService';

export default function CreateTimetablePage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuthContext();

    const [formData, setFormData] = useState({
        classId: '',
        subjectId: '',
        teacherId: '',
        day: '',
        startTime: '',
        endTime: '',
        room: ''
    });

    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const dayEnum = {
        Lundi: 'MONDAY',
        Mardi: 'TUESDAY',
        Mercredi: 'WEDNESDAY',
        Jeudi: 'THURSDAY',
        Vendredi: 'FRIDAY',
        Samedi: 'SATURDAY'
    };

    const resolveDepartment = (departmentsList) => {
        if (user?.departmentIdIfChief) {
            return departmentsList.find((dept) => dept.departmentId === user.departmentIdIfChief);
        }
        if (Array.isArray(user?.departmentsIds) && user.departmentsIds.length > 0) {
            return departmentsList.find((dept) => dept.departmentId === user.departmentsIds[0]);
        }
        if (Array.isArray(user?.departmentNames) && user.departmentNames.length > 0) {
            return departmentsList.find((dept) => dept.name === user.departmentNames[0]);
        }
        return null;
    };

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        loadData();
    }, [isAuthenticated, authLoading, router]);

    const loadData = async () => {
        try {
            const departments = await departmentService.getAll();
            const targetDepartment = resolveDepartment(Array.isArray(departments) ? departments : []);

            if (!targetDepartment) {
                throw new Error('Departement introuvable');
            }

            const [classesData, subjectsData, teachersData] = await Promise.all([
                classService.getByDepartment(targetDepartment.departmentId),
                subjectService.getByDepartment(targetDepartment.departmentId),
                userService.getUsersByRoleAndDepartment('TEACHER', targetDepartment.departmentId)
            ]);

            setClasses(classesData.map(c => ({ id: c.classId, name: c.name, level: c.code || '---' })));
            setSubjects(subjectsData.map(s => ({ id: s.subjectId || s.id, libelle: s.name || s.libelle, code: s.code })));
            setTeachers(teachersData.map(t => ({ id: t.id, name: t.name })));

        } catch (error) {
            toast.error('Erreur lors du chargement des donnees');
            console.error(error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.classId) newErrors.classId = "La classe est requise";
        if (!formData.subjectId) newErrors.subjectId = "La matiere est requise";
        if (!formData.teacherId) newErrors.teacherId = "L'enseignant est requis";
        if (!formData.day) newErrors.day = "Le jour est requis";
        if (!formData.startTime) newErrors.startTime = "L'heure de debut est requise";
        if (!formData.endTime) newErrors.endTime = "L'heure de fin est requise";

        if (formData.startTime && formData.endTime) {
            if (formData.startTime >= formData.endTime) {
                newErrors.endTime = "L'heure de fin doit etre apres l'heure de debut";
            }
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

        setLoading(true);

        try {
            const timetable = await timetableService.getByClass(parseInt(formData.classId));

            if (!timetable?.timetableId) {
                toast.error("Aucun emploi du temps n'existe pour cette classe. Creez-le d'abord.");
                setLoading(false);
                return;
            }

            await scheduleService.create({
                day: dayEnum[formData.day],
                startHour: formData.startTime,
                endHour: formData.endTime,
                subjectId: parseInt(formData.subjectId),
                timetableId: timetable.timetableId,
                teacherId: parseInt(formData.teacherId)
            });

            toast.success("Cours ajoute avec succes a l'emploi du temps");
            router.push(`/chief/timetables/classes/${formData.classId}`);

        } catch (error) {
            toast.error(error.message || "Erreur lors de la creation");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#312e81]">Ajouter un cours</h1>
                    <p className="text-gray-600 mt-1">Creez un nouveau cours dans l'emploi du temps</p>
                </div>
                <Link href="/chief/timetables">
                    <Button variant="secondary">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        Retour
                    </Button>
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-1">
                                Classe <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="classId"
                                name="classId"
                                value={formData.classId}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.classId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm`}
                            >
                                <option value="">Selectionner une classe</option>
                                {classes.map((classe) => (
                                    <option key={classe.id} value={classe.id}>
                                        {classe.name} - {classe.level}
                                    </option>
                                ))}
                            </select>
                            {errors.classId && (
                                <p className="mt-1 text-sm text-red-600">{errors.classId}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700 mb-1">
                                Matiere <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="subjectId"
                                name="subjectId"
                                value={formData.subjectId}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.subjectId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm`}
                            >
                                <option value="">Selectionner une matiere</option>
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.libelle} ({subject.code})
                                    </option>
                                ))}
                            </select>
                            {errors.subjectId && (
                                <p className="mt-1 text-sm text-red-600">{errors.subjectId}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-1">
                                Enseignant <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="teacherId"
                                name="teacherId"
                                value={formData.teacherId}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.teacherId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm`}
                            >
                                <option value="">Selectionner un enseignant</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.name}
                                    </option>
                                ))}
                            </select>
                            {errors.teacherId && (
                                <p className="mt-1 text-sm text-red-600">{errors.teacherId}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
                                Jour <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="day"
                                name="day"
                                value={formData.day}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.day ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm`}
                            >
                                <option value="">Selectionner un jour</option>
                                {daysOfWeek.map((day) => (
                                    <option key={day} value={day}>
                                        {day}
                                    </option>
                                ))}
                            </select>
                            {errors.day && (
                                <p className="mt-1 text-sm text-red-600">{errors.day}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                                Heure de debut <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                id="startTime"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.startTime ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm`}
                            />
                            {errors.startTime && (
                                <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                                Heure de fin <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                id="endTime"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.endTime ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm`}
                            />
                            {errors.endTime && (
                                <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#7c3aed] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7c3aed] disabled:opacity-60"
                        >
                            {loading ? 'Enregistrement...' : 'Ajouter le cours'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
