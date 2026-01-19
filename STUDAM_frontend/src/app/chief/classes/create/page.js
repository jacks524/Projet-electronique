"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../../../context/authContext';
import departmentService from '../../../../services/departmentService';
import Button from '../../../../components/ui/Button';
import toast from 'react-hot-toast';

export default function CreateClassPage() {
    const router = useRouter();
    const { user } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [departmentId, setDepartmentId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        capacity: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadDepartment();
    }, [user]);

    const loadDepartment = async () => {
        try {
            if (!user?.departmentNames || user.departmentNames.length === 0) {
                toast.error("Aucun département assigné");
                return;
            }

            const allDepartments = await departmentService.getAll();
            const targetDepartment = allDepartments.find(
                d => d.name === user.departmentNames[0]
            );

            if (targetDepartment) {
                setDepartmentId(targetDepartment.departmentId);
            }
        } catch (error) {
            toast.error("Erreur lors du chargement du département");
            console.error(error);
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

        if (!departmentId) {
            toast.error("Impossible de créer la classe sans département");
            return;
        }

        try {
            setLoading(true);

            // TODO: Remplacer par l'appel API réel
            // const response = await classService.create({
            //     name: formData.name,
            //     code: formData.code,
            //     description: formData.description,
            //     departmentId: departmentId,
            //     capacity: formData.capacity ? parseInt(formData.capacity) : null
            // });

            // Simulation
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success("Classe créée avec succès !");
            router.push('/chief/classes');

        } catch (error) {
            toast.error(error.message || "Erreur lors de la création de la classe");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-[#312e81]">
                            Créer une nouvelle classe
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

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h4 className="text-sm font-medium text-blue-900">Information</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    La classe sera automatiquement associée à votre département : <strong>{user?.departmentNames?.[0]}</strong>
                                </p>
                                <p className="text-sm text-blue-700 mt-1">
                                    Après la création, vous pourrez ajouter des étudiants et configurer l'emploi du temps.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                        <Link href="/chief/classes">
                            <Button variant="secondary" type="button">
                                Annuler
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="min-w-[150px]"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Création...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Créer la classe
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Next Steps */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#312e81] mb-4">
                    Prochaines étapes après la création
                </h3>
                <ul className="space-y-3">
                    <li className="flex items-start">
                        <span className="flex items-center justify-center w-6 h-6 bg-[#7c3aed] text-white rounded-full text-sm font-bold mr-3 mt-0.5">1</span>
                        <div>
                            <p className="font-medium text-gray-900">Ajouter des étudiants</p>
                            <p className="text-sm text-gray-600">Importez la liste des étudiants via un fichier Excel</p>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <span className="flex items-center justify-center w-6 h-6 bg-[#7c3aed] text-white rounded-full text-sm font-bold mr-3 mt-0.5">2</span>
                        <div>
                            <p className="font-medium text-gray-900">Configurer l'emploi du temps</p>
                            <p className="text-sm text-gray-600">Définissez les créneaux horaires et les matières</p>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <span className="flex items-center justify-center w-6 h-6 bg-[#7c3aed] text-white rounded-full text-sm font-bold mr-3 mt-0.5">3</span>
                        <div>
                            <p className="font-medium text-gray-900">Assigner les enseignants</p>
                            <p className="text-sm text-gray-600">Attribuez les enseignants aux différentes matières</p>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
}