"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { useAuthContext } from '@/context/authContext';
import departmentService from '@/services/departmentService';
import userService from '@/services/userService';

export default function CreateTeacherPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuthContext();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        matricule: '',
        departmentId: ''
    });

    const [departmentName, setDepartmentName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

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
            const chiefDepartmentId = user?.departmentIdIfChief;
            const fallbackId = Array.isArray(user?.departmentsIds) ? user.departmentsIds[0] : null;
            const selectedId = chiefDepartmentId || fallbackId;

            if (selectedId) {
                const dept = await departmentService.getById(selectedId);
                setDepartmentName(dept.name);
                setFormData(prev => ({ ...prev, departmentId: String(dept.departmentId) }));
                return;
            }

            if (!user?.departmentNames || user.departmentNames.length === 0) {
                toast.error("Aucun departement assigne");
                return;
            }

            const allDepartments = await departmentService.getAll();
            const targetDepartment = allDepartments.find(
                d => d.name === user.departmentNames[0]
            );

            if (targetDepartment) {
                setDepartmentName(targetDepartment.name);
                setFormData(prev => ({ ...prev, departmentId: String(targetDepartment.departmentId) }));
            }

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
            newErrors.name = "Le nom est requis";
        }

        if (!formData.email.trim()) {
            newErrors.email = "L'email est requis";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "L'email n'est pas valide";
        }

        if (!formData.username.trim()) {
            newErrors.username = "Le nom d'utilisateur est requis";
        } else if (formData.username.length < 4) {
            newErrors.username = "Le nom d'utilisateur doit contenir au moins 4 caracteres";
        }

        if (!formData.password) {
            newErrors.password = "Le mot de passe est requis";
        } else if (formData.password.length < 6) {
            newErrors.password = "Le mot de passe doit contenir au moins 6 caracteres";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
        }

        if (!formData.departmentId) {
            newErrors.departmentId = "Le departement est requis";
        }

        if (!formData.matricule.trim()) {
            newErrors.matricule = "Le matricule est requis";
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
            await userService.register({
                name: formData.name,
                email: formData.email,
                username: formData.username,
                password: formData.password,
                phoneNumber: formData.phoneNumber,
                matricule: formData.matricule,
                role: 'TEACHER',
                departmentIds: [formData.departmentId]
            });

            toast.success("Enseignant cree avec succes");
            router.push('/chief/teachers');

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
                    <h1 className="text-3xl font-bold text-[#312e81]">Creer un enseignant</h1>
                    <p className="text-gray-600 mt-1">Ajoutez un nouvel enseignant au systeme</p>
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

            <div className="bg-white shadow rounded-lg">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                className={`block w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm`}
                                placeholder="Ex: Dr. Mamadou Diallo"
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

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
                                className={`block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm`}
                                placeholder="enseignant@email.com"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Numero de telephone
                            </label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm"
                                placeholder="+221 77 123 45 67"
                            />
                        </div>

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
                                className={`block w-full px-3 py-2 border ${errors.username ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm`}
                                placeholder="enseignant123"
                            />
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                            )}
                        </div>

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
                                className={`block w-full px-3 py-2 border ${errors.matricule ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm`}
                                placeholder="TEACH2024"
                            />
                            {errors.matricule && (
                                <p className="mt-1 text-sm text-red-600">{errors.matricule}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-1">
                                Departement
                            </label>
                            <input
                                type="text"
                                id="departmentId"
                                value={departmentName || '---'}
                                disabled
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-600"
                            />
                            {errors.departmentId && (
                                <p className="mt-1 text-sm text-red-600">{errors.departmentId}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Mot de passe <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm`}
                                    placeholder="******"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500"
                                >
                                    {showPassword ? 'Masquer' : 'Afficher'}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmer le mot de passe <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm`}
                                placeholder="******"
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creation...' : 'Creer enseignant'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
