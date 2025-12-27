"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';

export default function EditSubjectPage() {
    const params = useParams();
    const router = useRouter();
    const subjectId = params.id;

    const [formData, setFormData] = useState({
        libelle: '',
        code: '',
        description: '',
        credits: '',
        heuresCoursParSemaine: '',
        departmentId: '',
        teacherId: ''
    });

    const [departments, setDepartments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadData();
    }, [subjectId]);

    const loadData = async () => {
        try {
            setLoading(true);
            // TODO: Appeler les endpoints
            // const subjectData = await subjectService.getById(subjectId);
            // const departmentsData = await departmentService.getAll();
            // const teachersData = await userService.getTeachers();

            // Données mockées
            const mockSubject = {
                id: subjectId,
                libelle: 'Programmation Web',
                code: 'INFO301',
                description: 'Introduction aux technologies web modernes : HTML5, CSS3, JavaScript, React, Node.js.',
                credits: 3,
                heuresCoursParSemaine: 4,
                departmentId: 1,
                teacherId: 1
            };

            const mockDepartments = [
                { id: 1, name: 'Informatique' },
                { id: 2, name: 'Mathématiques' }
            ];

            const mockTeachers = [
                { id: 1, name: 'Dr. Mamadou Diallo' },
                { id: 2, name: 'Prof. Aissatou Fall' }
            ];

            setFormData({
                libelle: mockSubject.libelle,
                code: mockSubject.code,
                description: mockSubject.description || '',
                credits: mockSubject.credits.toString(),
                heuresCoursParSemaine: mockSubject.heuresCoursParSemaine.toString(),
                departmentId: mockSubject.departmentId.toString(),
                teacherId: mockSubject.teacherId.toString()
            });

            setDepartments(mockDepartments);
            setTeachers(mockTeachers);

        } catch (error) {
            toast.error("Erreur lors du chargement des données");
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
            newErrors.libelle = "Le libellé est requis";
        }

        if (!formData.code.trim()) {
            newErrors.code = "Le code est requis";
        }

        if (!formData.departmentId) {
            newErrors.departmentId = "Le département est requis";
        }

        if (!formData.teacherId) {
            newErrors.teacherId = "L'enseignant est requis";
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
            // TODO: Appeler l'endpoint
            // await subjectService.update(subjectId, {
            //     ...formData,
            //     credits: parseInt(formData.credits) || 0,
            //     heuresCoursParSemaine: parseInt(formData.heuresCoursParSemaine) || 0,
            //     departmentId: parseInt(formData.departmentId),
            //     teacherId: parseInt(formData.teacherId)
            // });

            toast.success("Matière modifiée avec succès");
            router.push(`/chief/subjects/${subjectId}`);

        } catch (error) {
            toast.error("Erreur lors de la modification");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

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
                    <h1 className="text-3xl font-bold text-[#1B396A]">Modifier la matière</h1>
                    <p className="text-gray-600 mt-1">Mettez à jour les informations de la matière</p>
                </div>
                <Link href={`/chief/subjects/${subjectId}`}>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Libellé */}
                        <div>
                            <label htmlFor="libelle" className="block text-sm font-medium text-gray-700 mb-1">
                                Libellé de la matière <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="libelle"
                                name="libelle"
                                value={formData.libelle}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.libelle ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                            />
                            {errors.libelle && (
                                <p className="mt-1 text-sm text-red-600">{errors.libelle}</p>
                            )}
                        </div>

                        {/* Code */}
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                                Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="code"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.code ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm uppercase`}
                            />
                            {errors.code && (
                                <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                            )}
                        </div>

                        {/* Département */}
                        <div>
                            <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-1">
                                Département <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="departmentId"
                                name="departmentId"
                                value={formData.departmentId}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.departmentId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                            >
                                <option value="">Sélectionner</option>
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

                        {/* Enseignant */}
                        <div>
                            <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 mb-1">
                                Enseignant <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="teacherId"
                                name="teacherId"
                                value={formData.teacherId}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.teacherId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                            >
                                <option value="">Sélectionner</option>
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

                        {/* Crédits */}
                        <div>
                            <label htmlFor="credits" className="block text-sm font-medium text-gray-700 mb-1">
                                Crédits
                            </label>
                            <input
                                type="number"
                                id="credits"
                                name="credits"
                                min="1"
                                value={formData.credits}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                            />
                        </div>

                        {/* Heures */}
                        <div>
                            <label htmlFor="heuresCoursParSemaine" className="block text-sm font-medium text-gray-700 mb-1">
                                Heures/semaine
                            </label>
                            <input
                                type="number"
                                id="heuresCoursParSemaine"
                                name="heuresCoursParSemaine"
                                min="1"
                                value={formData.heuresCoursParSemaine}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Description */}
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
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                        />
                    </div>

                    {/* Boutons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <Link href={`/chief/subjects/${subjectId}`}>
                            <Button type="button" variant="secondary">
                                Annuler
                            </Button>
                        </Link>
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
