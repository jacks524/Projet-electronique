"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';

export default function EditTeacherPage() {
    const params = useParams();
    const router = useRouter();
    const teacherId = params.id;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        phoneNumber: '',
        matricule: '',
        departmentId: ''
    });

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadData();
    }, [teacherId]);

    const loadData = async () => {
        try {
            setLoading(true);
            // TODO: Appeler les endpoints
            // const teacherData = await userService.getById(teacherId);
            // const departmentsData = await departmentService.getAll();

            const mockTeacher = {
                id: teacherId,
                name: 'Dr. Mamadou Diallo',
                email: 'mamadou.diallo@email.com',
                username: 'mdiallo',
                phoneNumber: '+221 77 123 45 67',
                matricule: 'TEACH2024001',
                departmentId: 1
            };

            const mockDepartments = [
                { id: 1, name: 'Informatique' },
                { id: 2, name: 'Mathématiques' },
                { id: 3, name: 'Physique' }
            ];

            setFormData({
                name: mockTeacher.name,
                email: mockTeacher.email,
                username: mockTeacher.username,
                phoneNumber: mockTeacher.phoneNumber || '',
                matricule: mockTeacher.matricule,
                departmentId: mockTeacher.departmentId.toString()
            });

            setDepartments(mockDepartments);

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

        if (!formData.name.trim()) {
            newErrors.name = "Le nom est requis";
        }

        if (!formData.email.trim()) {
            newErrors.email = "L'email est requis";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "L'email n'est pas valide";
        }

        if (!formData.username.trim()) {
            newErrors.username = "Le nom d'utilisateur est requis";
        }

        if (!formData.matricule.trim()) {
            newErrors.matricule = "Le matricule est requis";
        }

        if (!formData.departmentId) {
            newErrors.departmentId = "Le département est requis";
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
            // await userService.update(teacherId, {
            //     ...formData,
            //     departmentId: parseInt(formData.departmentId)
            // });

            toast.success("Enseignant modifié avec succès");
            router.push(`/chief/teachers/${teacherId}`);

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
                    <h1 className="text-3xl font-bold text-[#1B396A]">Modifier l'enseignant</h1>
                    <p className="text-gray-600 mt-1">Mettez à jour les informations de l'enseignant</p>
                </div>
                <Link href={`/chief/teachers/${teacherId}`}>
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
                        {/* Nom complet */}
                        <div className="md:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Nom complet <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Téléphone */}
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Numéro de téléphone
                            </label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                            />
                        </div>

                        {/* Nom d'utilisateur */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Nom d'utilisateur <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.username ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                            />
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                            )}
                        </div>

                        {/* Matricule */}
                        <div>
                            <label htmlFor="matricule" className="block text-sm font-medium text-gray-700 mb-1">
                                Matricule <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="matricule"
                                name="matricule"
                                value={formData.matricule}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.matricule ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                            />
                            {errors.matricule && (
                                <p className="mt-1 text-sm text-red-600">{errors.matricule}</p>
                            )}
                        </div>

                        {/* Département */}
                        <div className="md:col-span-2">
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
                    </div>

                    {/* Information */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">Remarque</h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>Pour modifier le mot de passe, utilisez la fonction de réinitialisation.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Boutons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <Link href={`/chief/teachers/${teacherId}`}>
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
