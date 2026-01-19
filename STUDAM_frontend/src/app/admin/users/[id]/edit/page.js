"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "../../../../../context/authContext";
import departmentService from "../../../../../services/departmentService";
import userService from "../../../../../services/userService";
import toast from "react-hot-toast";

export default function EditUser() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id;
    const { isAuthenticated, loading: authLoading } = useAuthContext();

    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        username: "",
        phoneNumber: "",
        matricule: "",
        role: "TEACHER",
        departmentIds: [],
        active: true,
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (authLoading || !userId) return;
        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }
        loadInitialData();
    }, [isAuthenticated, authLoading, router, userId]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [userData, deptsData] = await Promise.all([
                userService.getById(userId),
                departmentService.getAll(),
            ]);

            setDepartments(deptsData.map(d => ({ id: d.departmentId, nom: d.name, code: d.code })));

            const mappedIds = Array.isArray(userData.departmentsIds) && userData.departmentsIds.length > 0
                ? userData.departmentsIds.map(id => String(id))
                : userData.departmentNames && userData.departmentNames.length > 0
                ? userData.departmentNames
                    .map(name => String(deptsData.find(d => d.name === name)?.departmentId || ""))
                    .filter(Boolean)
                : [];

            setFormData({
                name: userData.name || "",
                email: userData.email || "",
                username: userData.username || "",
                phoneNumber: userData.phoneNumber || "",
                matricule: userData.matricule || "",
                role: userData.roles && userData.roles.length > 0 ? userData.roles[0].role : "TEACHER",
                departmentIds: mappedIds,
                active: typeof userData.active === "boolean" ? userData.active : true,
            });
        } catch (error) {
            toast.error("Impossible de charger les donnees de l'utilisateur.");
            router.push("/admin/users");
        } finally {
            setLoading(false);
            setLoadingDepartments(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            if (name === "role" && value === "DEPARTMENT_MANAGER" && Array.isArray(prev.departmentIds)) {
                next.departmentIds = prev.departmentIds.slice(0, 1);
            }
            return next;
        });

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleDepartmentChange = (e) => {
        const selectedIds = Array.from(e.target.selectedOptions).map(option => option.value);

        setFormData(prev => {
            const next = { ...prev, departmentIds: selectedIds };
            if (prev.role === "DEPARTMENT_MANAGER" && selectedIds.length > 1) {
                next.departmentIds = selectedIds.slice(0, 1);
            }
            return next;
        });

        if (errors.departmentIds) {
            setErrors(prev => ({
                ...prev,
                departmentIds: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Le nom complet est requis";
        }

        if (!formData.email.trim()) {
            newErrors.email = "L'adresse email est requise";
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = "L'adresse email n'est pas valide";
        }

        if (!formData.username.trim()) {
            newErrors.username = "Le nom d'utilisateur est requis";
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Le numero de telephone est requis";
        }

        if (!formData.matricule.trim()) {
            newErrors.matricule = "Le matricule est requis";
        }

        if (!formData.role) {
            newErrors.role = "Le role est requis";
        }

        const departmentIds = Array.isArray(formData.departmentIds) ? formData.departmentIds : [];
        if ((formData.role === "TEACHER" || formData.role === "DEPARTMENT_MANAGER") && departmentIds.length === 0) {
            newErrors.departmentIds = "Le departement est requis pour ce role";
        }

        if (formData.role === "DEPARTMENT_MANAGER" && departmentIds.length != 1) {
            newErrors.departmentIds = "Le chef doit appartenir a un seul departement";
        }

        return newErrors;
    };
    const parseFieldErrors = (message) => {
        const lower = String(message || "").toLowerCase();
        const fieldErrors = {};
        const messages = [];

        if (lower.includes("matricule")) {
            fieldErrors.matricule = "Ce matricule est deja utilise";
            messages.push(fieldErrors.matricule);
        }
        if (lower.includes("telephone") || lower.includes("phone")) {
            fieldErrors.phoneNumber = "Ce numero de telephone est deja utilise";
            messages.push(fieldErrors.phoneNumber);
        }
        if (lower.includes("email")) {
            fieldErrors.email = "Cet email est deja utilise";
            messages.push(fieldErrors.email);
        }
        if (lower.includes("username") || lower.includes("login") || lower.includes("nom d'utilisateur") || lower.includes("nom dutilisateur")) {
            fieldErrors.username = "Ce nom d'utilisateur est deja utilise";
            messages.push(fieldErrors.username);
        }
        if (lower.includes("departement") && lower.includes("chef")) {
            fieldErrors.departmentIds = "Ce departement a deja un chef";
            messages.push(fieldErrors.departmentIds);
        }

        return {
            fieldErrors,
            toastMessage: messages.length ? messages.join(" ") : message,
        };
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Veuillez corriger les erreurs dans le formulaire.");
            return;
        }
        setLoading(true);

        try {
            await userService.update(userId, {
                ...formData,
                departmentIds: Array.isArray(formData.departmentIds) ? formData.departmentIds : [],
                active: Boolean(formData.active),
            });
            toast.success("Utilisateur mis a jour avec succes !");
            router.push("/admin/users");
        } catch (error) {
            const message = error?.message || "La mise a jour a echoue.";
            const { fieldErrors, toastMessage } = parseFieldErrors(message);
            if (Object.keys(fieldErrors).length > 0) {
                setErrors(prev => ({ ...prev, ...fieldErrors }));
            }
            toast.error(toastMessage);
        } finally {
            setLoading(false);
        }
    };

    const roleOptions = [
        {
            value: "TEACHER",
            label: "Enseignant",
            description: "Peut gerer ses cours et prendre les presences",
            icon: (
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
        {
            value: "DEPARTMENT_MANAGER",
            label: "Chef de departement",
            description: "Supervise un departement et ses enseignants",
            icon: (
                <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M4 21V4a1 1 0 011-1h14a1 1 0 011 1v17" />
                </svg>
            ),
        },
        {
            value: "ADMIN",
            label: "Administrateur",
            description: "Acces complet au systeme",
            icon: (
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
    ];

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-[#7c3aed] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">Chargement de l'utilisateur...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-4">
                            <li>
                                <Link href="/admin/dashboard" className="text-gray-500 hover:text-[#7c3aed] transition-colors duration-200">
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                    </svg>
                                </Link>
                            </li>
                            <li className="flex items-center">
                                <svg className="h-4 w-4 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <Link href="/admin/users" className="text-gray-500 hover:text-[#7c3aed] transition-colors duration-200">
                                    Utilisateurs
                                </Link>
                            </li>
                            <li className="flex items-center">
                                <svg className="h-4 w-4 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <span className="text-[#7c3aed] font-medium">Modifier</span>
                            </li>
                        </ol>
                    </nav>
                    <h1 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Modifier l'utilisateur : {formData.name}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Mettez a jour les informations de l'utilisateur.
                    </p>
                </div>
            </div>

            <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-8">
                        <div className="space-y-6">
                            <div className="border-b border-gray-200 pb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
                                        <p className="text-sm text-gray-500">Modifiez les informations de base de l'utilisateur</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Nom complet <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`block w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all duration-200 ${
                                            errors.name ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                                        }`}
                                        placeholder="Dr. Aminata Sow Fall"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Adresse email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`block w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all duration-200 ${
                                            errors.email ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                                        }`}
                                        placeholder="aminata.sow@studam.edu"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                        Nom d'utilisateur <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        id="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className={`block w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all duration-200 ${
                                            errors.username ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                                        }`}
                                        placeholder="Nom d'utilisateur"
                                    />
                                    {errors.username && (
                                        <p className="text-sm text-red-600">{errors.username}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                        Numero de telephone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        id="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className={`block w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all duration-200 ${
                                            errors.phoneNumber ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                                        }`}
                                        placeholder="+221 77 123 45 67"
                                    />
                                    {errors.phoneNumber && (
                                        <p className="text-sm text-red-600">{errors.phoneNumber}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="matricule" className="block text-sm font-medium text-gray-700">
                                        Matricule <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="matricule"
                                        id="matricule"
                                        value={formData.matricule}
                                        onChange={handleChange}
                                        className={`block w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all duration-200 ${
                                            errors.matricule ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                                        }`}
                                        placeholder="MAT-2024-001"
                                    />
                                    {errors.matricule && (
                                        <p className="text-sm text-red-600">{errors.matricule}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="border-b border-gray-200 pb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Role et permissions</h2>
                                        <p className="text-sm text-gray-500">Modifiez le role, le departement et le statut</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {roleOptions.map((option) => (
                                        <div key={option.value} className="relative">
                                            <input
                                                id={option.value}
                                                name="role"
                                                type="radio"
                                                value={option.value}
                                                checked={formData.role === option.value}
                                                onChange={handleChange}
                                                className="sr-only"
                                            />
                                            <label
                                                htmlFor={option.value}
                                                className={`cursor-pointer block p-4 border-2 rounded-xl transition-all duration-200 hover:shadow-md ${
                                                    formData.role === option.value
                                                        ? 'border-[#7c3aed] bg-violet-50 shadow-md'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <span className="text-2xl">{option.icon}</span>
                                                    <div className="flex-1">
                                                        <div className="flex items-center">
                                                            <span className="font-medium text-gray-900">{option.label}</span>
                                                            {formData.role === option.value && (
                                                                <svg className="ml-2 h-5 w-5 text-[#7c3aed]" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {errors.role && (
                                    <p className="text-sm text-red-600">{errors.role}</p>
                                )}
                            </div>

                            {(formData.role === "TEACHER" || formData.role === "DEPARTMENT_MANAGER") && (
                                <div className="space-y-2">
                                    <label htmlFor="departmentIds" className="block text-sm font-medium text-gray-700">
                                        Departements <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="departmentIds"
                                            name="departmentIds"
                                            multiple
                                            size={Math.min(6, Math.max(3, departments.length))}
                                            value={formData.departmentIds}
                                            onChange={handleDepartmentChange}
                                            disabled={loadingDepartments}
                                            className={`block w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all duration-200 ${
                                                errors.departmentIds ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                                            } ${loadingDepartments ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                        >
                                            {departments.map((dept) => (
                                                <option key={dept.id} value={dept.id}>
                                                    {dept.nom} ({dept.code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {formData.role === "DEPARTMENT_MANAGER"
                                            ? "Chef de departement: selectionnez un seul departement."
                                            : "Vous pouvez selectionner plusieurs departements."}
                                    </p>
                                    {errors.departmentIds && (
                                        <p className="text-sm text-red-600">{errors.departmentIds}</p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="active" className="block text-sm font-medium text-gray-700">
                                    Statut
                                </label>
                                <select
                                    id="active"
                                    name="active"
                                    value={formData.active ? "active" : "inactive"}
                                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.value === "active" }))}
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all duration-200 hover:border-gray-400"
                                >
                                    <option value="active">Actif</option>
                                    <option value="inactive">Inactif</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                        <div className="flex justify-end space-x-4">
                            <Link
                                href="/admin/users"
                                className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                            >
                                Annuler
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-[#7c3aed] to-violet-500 hover:from-violet-600 hover:to-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7c3aed] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                                {loading ? "Mise a jour en cours..." : "Mettre a jour l'utilisateur"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

