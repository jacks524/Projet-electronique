"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import StudentModal from '@/components/students/StudentModal';
import ImportStudentsModal from '@/components/students/ImportStudentsModal';
import classService from '@/services/classService';
import studentService from '@/services/studentService';

const mapClass = (classe) => ({
  id: classe.classId,
  nom: classe.name,
  code: classe.code,
  level: classe.level || classe.code,
  departement: {
    id: classe.departementResponseDTO?.departmentId || classe.department?.departmentId || '',
    nom: classe.departementResponseDTO?.name || classe.department?.name || '',
  },
  subjects: Array.isArray(classe.subjects)
    ? classe.subjects.map((subject) => ({
        id: subject.subjectId,
        subjectId: subject.subjectId,
        name: subject.name,
        code: subject.code,
        semester: subject.semester,
      }))
    : [],
});

const mapStudent = (student, classesMap) => ({
  id: student.studentId,
  matricule: student.matricule,
  nom: student.name,
  email: student.email,
  phone: student.phoneNumber,
  classe: classesMap.get(String(student.classId)) || null,
  dateNaissance: student.birthDate,
  lieuNaissance: student.birthPlace,
  status: typeof student.active === 'boolean' ? (student.active ? 'active' : 'inactive') : 'active',
  catchUpAssignments: Array.isArray(student.catchUpAssignments)
    ? student.catchUpAssignments.map((assignment) => ({
        classId: assignment.classId,
        className: assignment.className,
        subjectIds: assignment.subjectIds || [],
        subjectNames: assignment.subjectNames || [],
      }))
    : [],
});

export default function ClassStudentsPage() {
  const params = useParams();
  const classId = params.classId;

  const [classe, setClasse] = useState(null);
  const [departmentClasses, setDepartmentClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (classId) {
      loadClassData();
    }
  }, [classId]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      const classData = await classService.getById(classId);
      const mappedClass = mapClass(classData);

      const departmentId = mappedClass.departement.id;
      const classesData = departmentId ? await classService.getByDepartment(departmentId) : [classData];
      const mappedClasses = (Array.isArray(classesData) ? classesData : [classData]).map(mapClass);
      const classesMap = new Map(mappedClasses.map((item) => [String(item.id), item]));

      const studentsData = await studentService.getByClass(classId, { page: 0, size: 2000 });

      setClasse(mappedClass);
      setDepartmentClasses(mappedClasses);
      setStudents(studentsData.map((student) => mapStudent(student, classesMap)));
    } catch (error) {
      toast.error(error.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(
    () =>
      students.filter((student) =>
        [student.nom, student.matricule, student.email]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [students, searchTerm]
  );

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
      const payload = {
        name: studentData.nom,
        email: studentData.email,
        phoneNumber: studentData.phone || null,
        matricule: studentData.matricule,
        classId: studentData.classeId,
        birthDate: studentData.dateNaissance,
        birthPlace: studentData.lieuNaissance || '',
        catchUpAssignments: studentData.catchUpAssignments,
      };

      if (selectedStudent?.id) {
        await studentService.update(selectedStudent.id, payload);
        toast.success('Étudiant modifié avec succès');
      } else {
        await studentService.create(payload);
        toast.success('Étudiant ajouté avec succès');
      }

      setShowStudentModal(false);
      setSelectedStudent(null);
      await loadClassData();
    } catch (error) {
      toast.error(error.message || 'Une erreur est survenue');
    }
  };

  const handleImportStudents = async (file, targetClassId) => {
    try {
      const result = await studentService.importStudents(file, targetClassId || classId);
      toast.success(`Import terminé: ${result.successCount || result.successfulImports?.length || 0} étudiant(s) ajoutés`);
      setShowImportModal(false);
      await loadClassData();
      return result;
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'importation");
      throw error;
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Supprimer ${studentName} ?`)) return;
    try {
      await studentService.remove(studentId);
      toast.success('Étudiant supprimé avec succès');
      await loadClassData();
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#7c3aed]" />
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#312e81]">Classe {classe?.nom}</h1>
          <p className="mt-1 text-gray-600">
            {classe?.departement?.nom} - {classe?.level} - {students.length} étudiant(s)
          </p>
        </div>
        <Link href="/chief/students/classes">
          <Button variant="secondary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Rechercher un étudiant..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 py-2 leading-5 placeholder-gray-500 focus:border-[#7c3aed] focus:outline-none focus:ring-[#7c3aed] sm:text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setShowImportModal(true)} variant="secondary">
            Importer
          </Button>
          <Button onClick={handleAddStudent}>
            Ajouter un étudiant
          </Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étudiant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classe principale</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rattrapages</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                  <tr key={student.id}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{student.nom}</div>
                      <div className="text-sm text-gray-500">{student.matricule}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {student.classe?.nom || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {student.catchUpAssignments?.length ? (
                        <div className="space-y-2">
                          {student.catchUpAssignments.map((assignment) => (
                            <div key={`${student.id}-${assignment.classId}`} className="rounded-lg bg-violet-50 px-3 py-2">
                              <div className="font-medium text-violet-900">{assignment.className}</div>
                              <div className="text-xs text-violet-700">
                                {(assignment.subjectNames || []).join(', ')}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        'Aucun'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>{student.email || '—'}</div>
                      <div className="text-gray-500">{student.phone || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex gap-3">
                        <button onClick={() => handleEditStudent(student)} className="text-[#312e81] hover:text-[#7c3aed]">
                          Modifier
                        </button>
                        <button onClick={() => handleDeleteStudent(student.id, student.nom)} className="text-red-600 hover:text-red-800">
                          Supprimer
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

      <StudentModal
        show={showStudentModal}
        student={selectedStudent}
        classes={departmentClasses}
        onClose={() => setShowStudentModal(false)}
        onSave={handleSaveStudent}
      />

      <ImportStudentsModal
        show={showImportModal}
        classes={departmentClasses}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportStudents}
      />
    </div>
  );
}
