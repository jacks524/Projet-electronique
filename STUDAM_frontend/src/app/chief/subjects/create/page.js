"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { useAuthContext } from '@/context/authContext';

export default function CreateSubjectPage() {
    const router = useRouter();
    const { user } = useAuthContext();

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
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // TODO: Appeler les endpoints
            // const departmentsData = await departmentService.getAll();
            // const teachersData = await userService.getTeachers();

            // Données mockées
            const mockDepartments = [
                { id: 1, name: 'Informatique' },
                { id: 2, name: 'Mathématiques' },
                { id: 3, name: 'Physique' }
            ];

            const mockTeachers = [
                { id: 1, name: 'Dr. Mamadou Diallo', email: 'mamadou@email.com' },
                { id: 2, name: 'Prof. Aissatou Fall', email: 'aissatou@email.com' },
                { id: 3, name: 'Dr. Omar Sow', email: 'omar@email.com' }
            ];

            setDepartments(mockDepartments);
            setTeachers(mockTeachers);

        } catch (error) {
            toast.error("Erreur lors du chargement des données");
            console.error(error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Effacer l'erreur du champ modifié
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
        } else if (formData.code.length < 4) {
            newErrors.code = "Le code doit contenir au moins 4 caractères";
        }

        if (!formData.departmentId) {
            newErrors.departmentId = "Le département est requis";
        }

        if (!formData.teacherId) {
            newErrors.teacherId = "L'enseignant est requis";
        }

        if (formData.credits && (isNaN(formData.credits) || formData.credits < 1)) {
            newErrors.credits = "Le nombre de crédits doit être un nombre positif";
        }

        if (formData.heuresCoursParSemaine && (isNaN(formData.heuresCoursParSemaine) || formData.heuresCoursParSemaine < 1)) {
            newErrors.heuresCoursParSemaine = "Le nombre d'heures doit être un nombre positif";
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
            // TODO: Appeler l'endpoint
            // await subjectService.create({
            //     ...formData,
            //     credits: parseInt(formData.credits) || 0,
            //     heuresCoursParSemaine: parseInt(formData.heuresCoursParSemaine) || 0,
            //     departmentId: parseInt(formData.departmentId),
            //     teacherId: parseInt(formData.teacherId)
            // });

            toast.success("Matière créée avec succès");
            router.push('/chief/subjects');

        } catch (error) {
            toast.error(error.message || "Erreur lors de la création de la matière");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#1B396A]">Créer une matière</h1>
                    <p className="text-gray-600 mt-1">Ajoutez une nouvelle matière au département</p>
                </div>
                <Link href="/chief/subjects">
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
                                placeholder="Ex: Programmation Web"
                            />
                            {errors.libelle && (
                                <p className="mt-1 text-sm text-red-600">{errors.libelle}</p>
                            )}
                        </div>

                        {/* Code */}
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                                Code de la matière <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="code"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.code ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm uppercase`}
                                placeholder="Ex: INFO301"
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
                                <option value="">Sélectionner un département</option>
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
                                Enseignant responsable <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="teacherId"
                                name="teacherId"
                                value={formData.teacherId}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.teacherId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                            >
                                <option value="">Sélectionner un enseignant</option>
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
                                Nombre de crédits
                            </label>
                            <input
                                type="number"
                                id="credits"
                                name="credits"
                                min="1"
                                value={formData.credits}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.credits ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                                placeholder="Ex: 3"
                            />
                            {errors.credits && (
                                <p className="mt-1 text-sm text-red-600">{errors.credits}</p>
                            )}
                        </div>

                        {/* Heures par semaine */}
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
                                className={`block w-full px-3 py-2 border ${errors.heuresCoursParSemaine ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                                placeholder="Ex: 4"
                            />
                            {errors.heuresCoursParSemaine && (
                                <p className="mt-1 text-sm text-red-600">{errors.heuresCoursParSemaine}</p>
                            )}
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
                            placeholder="Description de la matière, objectifs, contenu..."
                        />
                    </div>

                    {/* Boutons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <Link href="/chief/subjects">
                            <Button type="button" variant="secondary">
                                Annuler
                            </Button>
                        </Link>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Création...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                    </svg>
                                    Créer la matière
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}