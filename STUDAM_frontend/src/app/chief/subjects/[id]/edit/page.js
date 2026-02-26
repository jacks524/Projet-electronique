"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { useAuthContext } from '@/context/authContext';
import subjectService from '@/services/subjectService';
import departmentService from '@/services/departmentService';
import userService from '@/services/userService';
import classService from '@/services/classService';

export default function EditSubjectPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthContext();
    const subjectId = params.id;

    const [formData, setFormData] = useState({
        libelle: '',
        code: '',
        description: '',
        semester: '',
        credits: '',
        heuresCoursParSemaine: '',
        departmentId: '',
        teacherId: '',
        classes: []
    });

    const [departments, setDepartments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadData();
    }, [subjectId]);

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

    const loadData = async () => {
        try {
            setLoading(true);
            const [subjectData, departmentsData] = await Promise.all([
                subjectService.getById(subjectId),
                departmentService.getAll(),
            ]);

            const chiefDepartment = resolveDepartment(Array.isArray(departmentsData) ? departmentsData : []);

            if (!chiefDepartment) {
                throw new Error("Aucun departement n'est assigne a votre compte.");
            }

            // Load teachers and classes for the department
            const [teachersData, classesData] = await Promise.all([
                userService.getUsersByRoleAndDepartment('TEACHER', chiefDepartment.departmentId),
                classService.getByDepartment(chiefDepartment.departmentId)
            ]);

            setDepartments(Array.isArray(departmentsData) ? departmentsData : []);

            setDepartments([{ id: chiefDepartment.departmentId, name: chiefDepartment.name }]);
            setTeachers(Array.isArray(teachersData) ? teachersData : []);
            setClasses(Array.isArray(classesData) ? classesData : []);

            // Extract class IDs from subjectData if available
            const assignedClassIds = subjectData?.classes ? subjectData.classes.map(c => c.id || c.classId) : [];

            setFormData({
                libelle: subjectData?.name || subjectData?.libelle || '',
                code: subjectData?.code || '',
                description: subjectData?.description || '',
                semester: subjectData?.semester || subjectData?.semestre || '',
                credits: subjectData?.credits ? subjectData.credits.toString() : '',
                heuresCoursParSemaine: subjectData?.heuresCoursParSemaine ? subjectData.heuresCoursParSemaine.toString() : '',
                departmentId: chiefDepartment.departmentId.toString(),
                teacherId: subjectData?.teacher?.id ? subjectData.teacher.id.toString() : (subjectData?.teacherId ? subjectData.teacherId.toString() : ''),
                classes: assignedClassIds
            });

        } catch (error) {
            toast.error(error.message || "Erreur lors du chargement des donnees");
            console.error(error);
        } finally {
            setLoading(false);
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

        if (!formData.libelle.trim()) {
            newErrors.libelle = "Le libelle est requis";
        }

        if (!formData.code.trim()) {
            newErrors.code = "Le code est requis";
        } else if (formData.code.length < 4) {
            newErrors.code = "Le code doit contenir au moins 4 caracteres";
        }

        if (!formData.departmentId) {
            newErrors.departmentId = "Le departement est requis";
        }

        if (!formData.teacherId) {
            newErrors.teacherId = "L'enseignant est requis";
        }

        if (!formData.semester) {
            newErrors.semester = "Le semestre est requis";
        }

        if (formData.credits && (isNaN(formData.credits) || formData.credits < 1)) {
            newErrors.credits = "Le nombre de credits doit etre un nombre positif";
        }

        if (formData.heuresCoursParSemaine && (isNaN(formData.heuresCoursParSemaine) || formData.heuresCoursParSemaine < 1)) {
            newErrors.heuresCoursParSemaine = "Le nombre d'heures doit etre un nombre positif";
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

        setSaving(true);

        try {
            await subjectService.update(subjectId, {
                name: formData.libelle,
                code: formData.code.toUpperCase(),
                description: formData.description,
                semester: formData.semester,
                credits: parseInt(formData.credits, 10) || 0,
                heuresCoursParSemaine: parseInt(formData.heuresCoursParSemaine, 10) || 0,
                departmentId: parseInt(formData.departmentId, 10),
                teacherId: parseInt(formData.teacherId, 10),
                classes: formData.classes
            });

            toast.success("Matiere modifiee avec succes");
            router.push(`/chief/subjects/${subjectId}`);

        } catch (error) {
            toast.error(error.message || "Erreur lors de la modification de la matiere");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#312e81]">Modifier la matiere</h1>
                    <p className="text-gray-600 mt-1">Mettez a jour les informations de la matiere</p>
                </div>
                <Link href={`/chief/subjects/${subjectId}`}>
                    <Button variant="secondary">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Retour
                    </Button>
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="libelle" className="block text-sm font-medium text-gray-700 mb-1">
                                Libelle de la matiere <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="libelle"
                                name="libelle"
                                value={formData.libelle}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.libelle ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm`}
                            />
                            {errors.libelle && (
                                <p className="mt-1 text-sm text-red-600">{errors.libelle}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                                Code de la matiere <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="code"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.code ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm uppercase`}
                            />
                            {errors.code && (
                                <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-1">
                                Departement <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="departmentId"
                                name="departmentId"
                                value={formData.departmentId}
                                onChange={handleChange}
                                disabled
                                className={`block w-full px-3 py-2 border ${errors.departmentId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm bg-gray-50`}
                            >
                                <option value="">Selectionner un departement</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                            {errors.departmentId && (
                                <p className="mt-1 text-sm text-red-600">{errors.departmentId}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-1">
                                Enseignant responsable <span className="text-red-500">*</span>
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

                        <div className="md:col-span-2">
                            <label htmlFor="classes" className="block text-sm font-medium text-gray-700 mb-1">
                                Classes assignées
                            </label>
                            <select
                                id="classes"
                                name="classes"
                                multiple
                                value={formData.classes}
                                onChange={(e) => {
                                    const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                    setFormData(prev => ({ ...prev, classes: selected }));
                                }}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm"
                                size="4"
                            >
                                {classes.map((classe) => (
                                    <option key={classe.classId} value={classe.classId}>
                                        {classe.name}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs classes.
                            </p>
                        </div>

                        <div>
                            <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                                Semestre <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="semester"
                                name="semester"
                                value={formData.semester}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.semester ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm`}
                            >
                                <option value="">Selectionner un semestre</option>
                                <option value="S1">S1</option>
                                <option value="S2">S2</option>
                            </select>
                            {errors.semester && (
                                <p className="mt-1 text-sm text-red-600">{errors.semester}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="credits" className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre de credits
                            </label>
                            <input
                                type="number"
                                id="credits"
                                name="credits"
                                min="1"
                                value={formData.credits}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.credits ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm`}
                            />
                            {errors.credits && (
                                <p className="mt-1 text-sm text-red-600">{errors.credits}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="heuresCoursParSemaine" className="block text-sm font-medium text-gray-700 mb-1">
                                Heures de cours par semaine
                            </label>
                            <input
                                type="number"
                                id="heuresCoursParSemaine"
                                name="heuresCoursParSemaine"
                                min="1"
                                value={formData.heuresCoursParSemaine}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.heuresCoursParSemaine ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm`}
                            />
                            {errors.heuresCoursParSemaine && (
                                <p className="mt-1 text-sm text-red-600">{errors.heuresCoursParSemaine}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows="4"
                            value={formData.description}
                            onChange={handleChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <Link href={`/chief/subjects/${subjectId}`}>
                            <Button type="button" variant="secondary">
                                Annuler
                            </Button>
                        </Link>
                        <Button type="submit" disabled={saving}>
                            {saving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enregistrement...
                                </>
                            ) : (
                                'Enregistrer les modifications'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
