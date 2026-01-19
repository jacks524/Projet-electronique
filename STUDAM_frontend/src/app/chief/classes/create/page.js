"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../../../context/authContext';
import departmentService from '../../../../services/departmentService';
import classService from '../../../../services/classService';
import Button from '../../../../components/ui/Button';
import toast from 'react-hot-toast';

export default function CreateClassPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [departmentId, setDepartmentId] = useState(null);
    const [departmentName, setDepartmentName] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        capacity: ''
    });
    const [errors, setErrors] = useState({});

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
        loadDepartment();
    }, [user, isAuthenticated, authLoading, router]);

    const loadDepartment = async () => {
        try {
            const departments = await departmentService.getAll();
            const targetDepartment = resolveDepartment(Array.isArray(departments) ? departments : []);

            if (!targetDepartment) {
                toast.error("Aucun departement assigne");
                return;
            }

            setDepartmentId(targetDepartment.departmentId);
            setDepartmentName(targetDepartment.name);
        } catch (error) {
            toast.error("Erreur lors du chargement du departement");
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

        if (!formData.name.trim()) {
            newErrors.name = "Le nom de la classe est requis";
        }

        if (!formData.code.trim()) {
            newErrors.code = "Le code de la classe est requis";
        } else if (formData.code.length < 2) {
            newErrors.code = "Le code doit contenir au moins 2 caracteres";
        }

        if (formData.capacity && (isNaN(formData.capacity) || parseInt(formData.capacity) <= 0)) {
            newErrors.capacity = "La capacite doit etre un nombre positif";
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

        if (!departmentId) {
            toast.error("Impossible de creer la classe sans departement");
            return;
        }

        try {
            setLoading(true);

            await classService.create({
                name: formData.name,
                code: formData.code,
                description: formData.description,
                departmentId: departmentId,
                studentNumber: 0
            });

            toast.success("Classe creee avec succes !");
            router.push('/chief/classes');

        } catch (error) {
            toast.error(error.message || "Erreur lors de la creation de la classe");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-[#312e81]">
                            Creer une nouvelle classe
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Remplissez les informations de la classe
                        </p>
                    </div>
                    <Link href="/chief/classes">
                        <Button variant="secondary">
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Retour
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
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
                            placeholder="Ex: Genie Informatique 3eme annee"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

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
                            Un code court pour identifier la classe (2-10 caracteres)
                        </p>
                    </div>

                    <div>
                        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                            Capacite maximale
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
                            Nombre maximum d'etudiants (optionnel)
                        </p>
                    </div>

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
                            placeholder="Description de la classe, specialites, remarques..."
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Informations complementaires sur la classe (optionnel)
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-sm text-blue-800">
                                    La classe sera associee au departement : <strong>{departmentName || '---'}</strong>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creation...' : 'Creer la classe'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
