"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import StudentModal from '@/components/students/StudentModal';
import ImportStudentsModal from '@/components/students/ImportStudentsModal';

export default function ClassStudentsPage() {
    const params = useParams();
    const router = useRouter();
    const classId = params.classId;

    const [classe, setClasse] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadClassData();
    }, [classId]);

    const loadClassData = async () => {
        try {
            setLoading(true);
            // TODO: Appeler les endpoints
            // const classData = await classService.getById(classId);
            // const studentsData = await studentService.getByClass(classId);

            // Données mockées
            const mockClass = {
                id: classId,
                name: '3GI',
                department: { name: 'Informatique' },
                level: 'Licence 3',
                studentCount: 45
            };

            const mockStudents = [
                {
                    id: 1,
                    matricule: 'STU2024001',
                    nom: 'Mamadou Diallo',
                    email: 'mamadou.diallo@email.com',
                    phone: '+221 77 123 45 67',
                    dateNaissance: '2001-05-15',
                    lieuNaissance: 'Dakar',
                    status: 'active',
                    classe: mockClass
                },
                {
                    id: 2,
                    matricule: 'STU2024002',
                    nom: 'Aissatou Fall',
                    email: 'aissatou.fall@email.com',
                    phone: '+221 77 234 56 78',
                    dateNaissance: '2002-03-20',
                    lieuNaissance: 'Thiès',
                    status: 'active',
                    classe: mockClass
                },
                {
                    id: 3,
                    matricule: 'STU2024003',
                    nom: 'Omar Sow',
                    email: 'omar.sow@email.com',
                    phone: '+221 77 345 67 89',
                    dateNaissance: '2001-11-08',
                    lieuNaissance: 'Saint-Louis',
                    status: 'inactive',
                    classe: mockClass
                }
            ];

            setClasse(mockClass);
            setStudents(mockStudents);

        } catch (error) {
            toast.error("Erreur lors du chargement des données");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = () => {
        setSelectedStudent(null);
        setShowStudentModal(true);
    };

    const handleEditStudent = (student) => {
        setSelectedStudent(student);
        setShowStudentModal(true);
    };

    const handleSaveStudent = async (studentData) => {
        try {
            // TODO: Appeler l'endpoint
            // if (selectedStudent) {
            //     await studentService.update(selectedStudent.id, studentData);
            //     toast.success("Étudiant modifié avec succès");
            // } else {
            //     await studentService.create(studentData);
            //     toast.success("Étudiant ajouté avec succès");
            // }

            toast.success(selectedStudent ? "Étudiant modifié avec succès" : "Étudiant ajouté avec succès");
            setShowStudentModal(false);
            loadClassData();

        } catch (error) {
            toast.error("Une erreur est survenue");
            console.error(error);
        }
    };

    const handleImportStudents = async (file, classId) => {
        try {
            // TODO: Appeler l'endpoint
            // const formData = new FormData();
            // formData.append('file', file);
            // formData.append('classId', classId);
            // await studentService.import(formData);

            toast.success("Étudiants importés avec succès");
            setShowImportModal(false);
            loadClassData();

        } catch (error) {
            toast.error("Erreur lors de l'importation");
            console.error(error);
        }
    };

    const handleToggleStatus = async (studentId) => {
        try {
            // TODO: Appeler l'endpoint
            // const student = students.find(s => s.id === studentId);
            // if (student.status === 'active') {
            //     await studentService.deactivate(studentId);
            // } else {
            //     await studentService.activate(studentId);
            // }

            toast.success("Statut modifié avec succès");
            loadClassData();

        } catch (error) {
            toast.error("Erreur lors de la modification");
            console.error(error);
        }
    };

    const filteredStudents = students.filter(student =>
        student.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed] mx-auto"></div>
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
                    <h1 className="text-3xl font-bold text-[#312e81]">
                        Classe {classe?.name}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {classe?.department?.name} - {classe?.level} - {students.length} étudiants
                    </p>
                </div>
                <Link href="/chief/students/classes">
                    <Button variant="secondary">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                        Retour
                    </Button>
                </Link>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex-1 w-full sm:w-auto">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher un étudiant..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm"
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button onClick={() => setShowImportModal(true)} variant="secondary">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                        </svg>
                        Importer
                    </Button>
                    <Button onClick={handleAddStudent}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Ajouter un étudiant
                    </Button>
                </div>
            </div>

            {/* Tableau des étudiants */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Étudiant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Informations
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Statut
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                    Aucun étudiant trouvé
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map((student) => (
                                <tr key={student.id} className={student.status === 'inactive' ? 'bg-gray-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-[#7c3aed] rounded-full flex items-center justify-center">
                                                    <span className="text-white font-medium text-sm">
                                                        {student.nom.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {student.nom}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {student.matricule}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{student.email}</div>
                                        <div className="text-sm text-gray-500">{student.phone || '—'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(student.dateNaissance).toLocaleDateString('fr-FR')}
                                        </div>
                                        <div className="text-sm text-gray-500">{student.lieuNaissance}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                student.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {student.status === 'active' ? 'Actif' : 'Inactif'}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditStudent(student)}
                                                className="text-[#312e81] hover:text-[#7c3aed]"
                                            >
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(student.id)}
                                                className={student.status === 'active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                                            >
                                                {student.status === 'active' ? (
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                                                    </svg>
                                                ) : (
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <StudentModal
                show={showStudentModal}
                student={selectedStudent}
                classes={[classe]}
                onClose={() => setShowStudentModal(false)}
                onSave={handleSaveStudent}
            />

            <ImportStudentsModal
                show={showImportModal}
                classes={[classe]}
                onClose={() => setShowImportModal(false)}
                onImport={handleImportStudents}
            />
        </div>
    );
}