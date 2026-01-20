"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Button from '../../../../../components/ui/Button';
import classService from '../../../../../services/classService';
import toast from 'react-hot-toast';

export default function EditClassPage() {
    const router = useRouter();
    const params = useParams();
    const classId = params.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        capacity: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadClassData();
    }, [classId]);

    const loadClassData = async () => {
        try {
            setLoading(true);
            const classData = await classService.getById(classId);

            const capacityValue = classData.capacity ?? classData.maxStudents ?? '';

            // Extract department ID properly
            const deptId = classData.department?.departmentId ||
                classData.department?.id ||
                classData.departmentId;

            setFormData({
                name: classData.name || '',
                code: classData.code || '',
                description: classData.description || '',
                capacity: capacityValue ? capacityValue.toString() : '',
                departmentId: deptId ? deptId.toString() : ''
            });

        } catch (error) {
            toast.error("Erreur lors du chargement des donnees");
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

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Le nom de la classe est requis";
        }

        if (!formData.code.trim()) {
            newErrors.code = "Le code de la classe est requis";
        } else if (formData.code.length < 2) {
            newErrors.code = "Le code doit contenir au moins 2 caractères";
        }

        if (formData.capacity && (isNaN(formData.capacity) || parseInt(formData.capacity) <= 0)) {
            newErrors.capacity = "La capacité doit être un nombre positif";
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setSaving(true);

            // Ensure departmentId is valid
            const deptId = formData.departmentId ? parseInt(formData.departmentId, 10) : null;
            if (!deptId || deptId === 0) {
                toast.error("Erreur: Departement invalide");
                setSaving(false);
                return;
            }

            await classService.update(classId, {
                name: formData.name,
                code: formData.code,
                description: formData.description,
                capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
                departmentId: deptId
            });

            toast.success("Classe modifiee avec succes !");
            router.push(`/chief/classes/${classId}`);

        } catch (error) {
            toast.error(error.message || "Erreur lors de la modification");
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
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-[#312e81]">
                            Modifier la classe
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Code: {formData.code}
                        </p>
                    </div>
                    <Link href={`/chief/classes/${classId}`}>
                        <Button variant="secondary">
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Retour
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white shadow rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Nom de la classe <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent`}
                            placeholder="Ex: Génie Informatique 3ème année"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    {/* Code */}
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                            Code de la classe <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="code"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border ${errors.code ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent`}
                            placeholder="Ex: GI3"
                            maxLength={10}
                        />
                        {errors.code && (
                            <p className="mt-1 text-sm text-red-500">{errors.code}</p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                            Un code court pour identifier la classe (2-10 caractères)
                        </p>
                    </div>

                    {/* Capacity */}
                    <div>
                        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                            Capacité maximale
                        </label>
                        <input
                            type="number"
                            id="capacity"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border ${errors.capacity ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent`}
                            placeholder="Ex: 40"
                            min="1"
                        />
                        {errors.capacity && (
                            <p className="mt-1 text-sm text-red-500">{errors.capacity}</p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                            Nombre maximum d'étudiants (optionnel)
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
                            placeholder="Description de la classe, spécialités, remarques..."
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Informations complémentaires sur la classe (optionnel)
                        </p>
                    </div>

                    {/* Warning Box */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <h4 className="text-sm font-medium text-yellow-900">Attention</h4>
                                <p className="text-sm text-yellow-700 mt-1">
                                    La modification du code de la classe peut affecter les emplois du temps et les rapports existants.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                        <Link href={`/chief/classes/${classId}`}>
                            <Button variant="secondary" type="button">
                                Annuler
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="min-w-[150px]"
                        >
                            {saving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Enregistrer
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            {/* History/Activity Log */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#312e81] mb-4">
                    Historique des modifications
                </h3>
                <div className="space-y-3">
                    <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-900">Classe créée</p>
                            <p className="text-xs text-gray-500 mt-1">15 janvier 2024 à 10:30</p>
                        </div>
                    </div>
                    <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-900">Capacité modifiée de 40 à 50</p>
                            <p className="text-xs text-gray-500 mt-1">20 janvier 2024 à 14:15</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}