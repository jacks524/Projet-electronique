"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '../../../../components/ui/Button';

export default function CreateTimetablePage() {
    const router = useRouter();

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

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // TODO: Appeler les endpoints
            const mockClasses = [
                { id: 1, name: '3GI', level: 'Licence 3' },
                { id: 2, name: '4GI', level: 'Master 1' },
                { id: 3, name: '5GI', level: 'Master 2' }
            ];

            const mockSubjects = [
                { id: 1, libelle: 'Programmation Web', code: 'INFO301', teacherId: 1 },
                { id: 2, libelle: 'Base de données', code: 'INFO302', teacherId: 2 },
                { id: 3, libelle: 'Réseaux', code: 'INFO303', teacherId: 3 }
            ];

            const mockTeachers = [
                { id: 1, name: 'Dr. Mamadou Diallo' },
                { id: 2, name: 'Prof. Aissatou Fall' },
                { id: 3, name: 'Dr. Omar Sow' }
            ];

            setClasses(mockClasses);
            setSubjects(mockSubjects);
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

        // Si on change la matière, auto-sélectionner l'enseignant
        if (name === 'subjectId' && value) {
            const subject = subjects.find(s => s.id === parseInt(value));
            if (subject) {
                setFormData(prev => ({
                    ...prev,
                    teacherId: subject.teacherId.toString()
                }));
            }
        }

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
        if (!formData.subjectId) newErrors.subjectId = "La matière est requise";
        if (!formData.teacherId) newErrors.teacherId = "L'enseignant est requis";
        if (!formData.day) newErrors.day = "Le jour est requis";
        if (!formData.startTime) newErrors.startTime = "L'heure de début est requise";
        if (!formData.endTime) newErrors.endTime = "L'heure de fin est requise";

        if (formData.startTime && formData.endTime) {
            if (formData.startTime >= formData.endTime) {
                newErrors.endTime = "L'heure de fin doit être après l'heure de début";
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
            // TODO: Appeler l'endpoint
            // await timetableService.create({
            //     ...formData,
            //     classId: parseInt(formData.classId),
            //     subjectId: parseInt(formData.subjectId),
            //     teacherId: parseInt(formData.teacherId)
            // });

            toast.success("Cours ajouté avec succès à l'emploi du temps");
            router.push(`/chief/timetables/classes/${formData.classId}`);

        } catch (error) {
            toast.error(error.message || "Erreur lors de la création");
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
                    <h1 className="text-3xl font-bold text-[#1B396A]">Ajouter un cours</h1>
                    <p className="text-gray-600 mt-1">Créez un nouveau cours dans l'emploi du temps</p>
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

            {/* Formulaire */}
            <div className="bg-white shadow rounded-lg">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Classe */}
                        <div>
                            <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-1">
                                Classe <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="classId"
                                name="classId"
                                value={formData.classId}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.classId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                            >
                                <option value="">Sélectionner une classe</option>
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

                        {/* Matière */}
                        <div>
                            <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700 mb-1">
                                Matière <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="subjectId"
                                name="subjectId"
                                value={formData.subjectId}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.subjectId ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                            >
                                <option value="">Sélectionner une matière</option>
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

                        {/* Jour */}
                        <div>
                            <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
                                Jour <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="day"
                                name="day"
                                value={formData.day}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.day ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                            >
                                <option value="">Sélectionner un jour</option>
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

                        {/* Heure de début */}
                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                                Heure de début <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                id="startTime"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                className={`block w-full px-3 py-2 border ${errors.startTime ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                            />
                            {errors.startTime && (
                                <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
                            )}
                        </div>

                        {/* Heure de fin */}
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
                                className={`block w-full px-3 py-2 border ${errors.endTime ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                            />
                            {errors.endTime && (
                                <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                            )}
                        </div>

                        {/* Salle */}
                        <div className="md:col-span-2">
                            <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-1">
                                Salle
                            </label>
                            <input
                                type="text"
                                id="room"
                                name="room"
                                value={formData.room}
                                onChange={handleChange}
                                placeholder="Ex: Salle A101, Labo Info 2"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Aperçu */}
                    {formData.classId && formData.subjectId && formData.day && formData.startTime && formData.endTime && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">Aperçu du cours</h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <p>
                                            <span className="font-medium">
                                                {subjects.find(s => s.id === parseInt(formData.subjectId))?.libelle}
                                            </span>
                                            {' '}pour la classe{' '}
                                            <span className="font-medium">
                                                {classes.find(c => c.id === parseInt(formData.classId))?.name}
                                            </span>
                                        </p>
                                        <p className="mt-1">
                                            {formData.day} de {formData.startTime} à {formData.endTime}
                                            {formData.room && ` - ${formData.room}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Boutons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <Link href="/chief/timetables">
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
                                    Créer le cours
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}