"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StudentsFilter from '@/components/students/StudentsFilter';
import StudentsList from '@/components/students/StudentsList';
import StudentModal from '@/components/students/StudentModal';
import ImportStudentsModal from '@/components/students/ImportStudentsModal';
import { useAuthContext } from '@/context/authContext';
import departmentService from '@/services/departmentService';
import classService from '@/services/classService';
import studentService from '@/services/studentService';

export default function StudentsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuthContext();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    class: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

    const userRole = user?.role?.toUpperCase();
    if (!['DEPARTMENT_MANAGER', 'ADMIN'].includes(userRole)) {
      router.push('/dashboard');
      return;
    }

    loadData();
  }, [user, isAuthenticated, authLoading, router]);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const departments = await departmentService.getAll();
      const targetDepartment = resolveDepartment(Array.isArray(departments) ? departments : []);

      if (!targetDepartment) {
        throw new Error('Aucun departement assigne a votre compte.');
      }

      if (!targetDepartment) {
        throw new Error('Departement introuvable.');
      }

      const classesData = await classService.getByDepartment(targetDepartment.departmentId);
      const mappedClasses = classesData.map((classe) => ({
        id: classe.classId,
        nom: classe.name,
        code: classe.code,
        departement: {
          id: classe.departementResponseDTO?.departmentId || targetDepartment.departmentId,
          nom: classe.departementResponseDTO?.name || targetDepartment.name,
        }
      }));

      const studentsByClass = await Promise.all(
        mappedClasses.map(async (classe) => {
          const classStudents = await studentService.getByClass(classe.id, { page: 0, size: 2000 });
          return classStudents.map((student) => ({
            id: student.studentId,
            matricule: student.matricule,
            nom: student.name,
            email: student.email,
            phone: student.phoneNumber,
            classe,
            dateNaissance: student.birthDate,
            lieuNaissance: student.birthPlace,
            status: typeof student.active === 'boolean' ? (student.active ? 'active' : 'inactive') : 'active',
          }));
        })
      );

      setClasses(mappedClasses);
      setStudents(studentsByClass.flat());
    } catch (error) {
      setErrorMessage(error?.message || 'Erreur lors du chargement des etudiants.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const filteredStudents = students.filter(student => {
    if (
      filters.search &&
      !student.nom.toLowerCase().includes(filters.search.toLowerCase()) &&
      !student.matricule.toLowerCase().includes(filters.search.toLowerCase()) &&
      !student.email.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    if (filters.class && student.classe?.id !== parseInt(filters.class)) {
      return false;
    }

    return true;
  });

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setShowModal(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleSaveStudent = async (studentData) => {
    setErrorMessage('');

    try {
      const payload = {
        name: studentData.nom,
        email: studentData.email,
        phoneNumber: studentData.phone || null,
        matricule: studentData.matricule,
        classId: studentData.classe?.id,
        birthDate: studentData.dateNaissance,
        birthPlace: studentData.lieuNaissance || '',
      };

      if (studentData.id) {
        await studentService.update(studentData.id, payload);
        setSuccessMessage('Etudiant modifie avec succes');
      } else {
        await studentService.create(payload);
        setSuccessMessage('Etudiant ajoute avec succes');
      }

      setShowModal(false);
      setSelectedStudent(null);
      await loadData();

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setErrorMessage(error?.message || "Erreur lors de l'enregistrement de l'etudiant.");
    }
  };

  const handleToggleStatus = (studentId) => {
    setStudents(prev =>
      prev.map(student =>
        student.id === studentId
          ? { ...student, status: student.status === 'active' ? 'inactive' : 'active' }
          : student
      )
    );
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Etes-vous sur de vouloir supprimer l'etudiant "${studentName}" ? Cette action est irreversible.`)) {
      return;
    }

    try {
      await studentService.remove(studentId);
      setSuccessMessage('Etudiant supprime avec succes');
      await loadData();
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      setErrorMessage(error?.message || "Erreur lors de la suppression de l'etudiant.");
    }
  };

  const handleImportStudents = async (file, classId) => {
    try {
      const result = await studentService.importStudents(file, classId);

      // Show detailed feedback could be done here or in the modal
      // For now, we'll close the modal and show a summary toast
      // But better: return the result to the modal to show details

      await loadData();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleOpenImportModal = () => {
    setShowImportModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7c3aed]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#312e81]">Gestion des Etudiants</h1>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#7c3aed]">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  Tableau de bord
                </Link>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Etudiants</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {successMessage && (
          <div className="mb-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-col lg:flex-row justify-between gap-4">
          <StudentsFilter
            classes={classes}
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          <div className="flex gap-2 lg:ml-4">
            <button
              type="button"
              onClick={handleOpenImportModal}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#312e81]"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
              </svg>
              Importer
            </button>
            <button
              type="button"
              onClick={handleAddStudent}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#7c3aed] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7c3aed]"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Ajouter
            </button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-[#312e81]">
              Liste des Etudiants
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {filteredStudents.length} etudiant(s) trouve(s)
            </p>
          </div>

          <StudentsList
            students={filteredStudents}
            onEdit={handleEditStudent}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteStudent}
          />
        </div>
      </div>

      {showModal && (
        <StudentModal
          show={showModal}
          student={selectedStudent}
          classes={classes}
          onClose={() => {
            setShowModal(false);
            setSelectedStudent(null);
          }}
          onSave={handleSaveStudent}
        />
      )}

      {showImportModal && (
        <ImportStudentsModal
          show={showImportModal}
          classes={classes}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportStudents}
        />
      )}
    </div>
  );
}
