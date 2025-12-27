"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StudentsFilter from '@/components/students/StudentsFilter';
import StudentsList from '@/components/students/StudentsList';
import StudentModal from '@/components/students/StudentModal';
import ImportStudentsModal from '@/components/students/ImportStudentsModal';

export default function StudentsPage() {
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    class: '',
    department: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.push('/auth/login');
        return;
      }
      
      try {
        const currentUser = JSON.parse(userStr);
        setUser(currentUser);
        
        // Charger les données
        loadStudents();
        loadClasses();
        loadDepartments();
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
        router.push('/auth/login');
        return;
      }
    }
  }, [router]);

  const loadStudents = () => {
    setLoading(true);
    
    // Données fictives pour la démo
    setTimeout(() => {
      const mockStudents = [
        { 
          id: 1, 
          matricule: "INF001", 
          nom: "Amadou Diallo", 
          email: "a.diallo@students.studam.edu",
          phone: "(+221) 77 123 45 67", 
          classe: { id: 2, nom: "4GI", departement: { id: 1, nom: "Informatique" } },
          dateNaissance: "1998-05-12",
          lieuNaissance: "Dakar, Sénégal",
          status: 'active'
        },
        { 
          id: 2, 
          matricule: "INF002", 
          nom: "Fatou Fall", 
          email: "f.fall@students.studam.edu",
          phone: "(+221) 77 234 56 78", 
          classe: { id: 2, nom: "4GI", departement: { id: 1, nom: "Informatique" } },
          dateNaissance: "1999-03-24",
          lieuNaissance: "Saint-Louis, Sénégal",
          status: 'active'
        },
        { 
          id: 3, 
          matricule: "INF003", 
          nom: "Moussa Sow", 
          email: "m.sow@students.studam.edu",
          phone: "(+221) 77 345 67 89", 
          classe: { id: 1, nom: "3GI", departement: { id: 1, nom: "Informatique" } },
          dateNaissance: "2000-08-17",
          lieuNaissance: "Thiès, Sénégal",
          status: 'active'
        },
        { 
          id: 4, 
          matricule: "MAT001", 
          nom: "Aissatou Ndiaye", 
          email: "a.ndiaye@students.studam.edu",
          phone: "(+221) 77 456 78 90", 
          classe: { id: 4, nom: "3MAT", departement: { id: 2, nom: "Mathématiques" } },
          dateNaissance: "1999-11-30",
          lieuNaissance: "Mbour, Sénégal",
          status: 'active'
        },
        { 
          id: 5, 
          matricule: "INF004", 
          nom: "Ousmane Faye", 
          email: "o.faye@students.studam.edu",
          phone: "(+221) 77 567 89 01", 
          classe: { id: 3, nom: "5GI", departement: { id: 1, nom: "Informatique" } },
          dateNaissance: "1997-07-05",
          lieuNaissance: "Dakar, Sénégal",
          status: 'inactive'
        }
      ];
      
      setStudents(mockStudents);
      setLoading(false);
    }, 1000);
  };

  const loadClasses = () => {
    // Données fictives pour la démo
    const mockClasses = [
      { id: 1, nom: "3GI", departement: { id: 1, nom: "Informatique" } },
      { id: 2, nom: "4GI", departement: { id: 1, nom: "Informatique" } },
      { id: 3, nom: "5GI", departement: { id: 1, nom: "Informatique" } },
      { id: 4, nom: "3MAT", departement: { id: 2, nom: "Mathématiques" } },
      { id: 5, nom: "4MAT", departement: { id: 2, nom: "Mathématiques" } },
      { id: 6, nom: "3GC", departement: { id: 3, nom: "Génie Civil" } }
    ];
    
    setClasses(mockClasses);
  };

  const loadDepartments = () => {
    // Données fictives pour la démo
    const mockDepartments = [
      { id: 1, nom: "Informatique" },
      { id: 2, nom: "Mathématiques" },
      { id: 3, nom: "Génie Civil" },
      { id: 4, nom: "Génie Électrique" },
      { id: 5, nom: "Gestion" }
    ];
    
    setDepartments(mockDepartments);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const filteredStudents = students.filter(student => {
    // Filtrer par recherche de texte
    if (filters.search && !student.nom.toLowerCase().includes(filters.search.toLowerCase()) && 
        !student.matricule.toLowerCase().includes(filters.search.toLowerCase()) &&
        !student.email.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Filtrer par classe
    if (filters.class && student.classe.id !== parseInt(filters.class)) {
      return false;
    }
    
    // Filtrer par département
    if (filters.department && student.classe.departement.id !== parseInt(filters.department)) {
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

  const handleSaveStudent = (studentData) => {
    if (studentData.id) {
      // Mise à jour d'un étudiant existant
      setStudents(prev => 
        prev.map(item => 
          item.id === studentData.id ? { ...item, ...studentData } : item
        )
      );
      
      setSuccessMessage('Étudiant modifié avec succès');
    } else {
      // Ajout d'un nouvel étudiant
      const newStudent = {
        ...studentData,
        id: students.length + 1,
        status: 'active'
      };
      
      setStudents(prev => [...prev, newStudent]);
      setSuccessMessage('Étudiant ajouté avec succès');
    }
    
    setShowModal(false);
    setSelectedStudent(null);
    
    // Effacer le message après 3 secondes
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
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

  const handleImportStudents = (file, classId) => {
    setLoading(true);
    
    // Simuler l'importation
    setTimeout(() => {
      setShowImportModal(false);
      setSuccessMessage('Étudiants importés avec succès');
      loadStudents();  // Recharger la liste des étudiants
      
      // Effacer le message après 3 secondes
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 2000);
  };

  const handleOpenImportModal = () => {
    setShowImportModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F26419]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#1B396A]">Gestion des Étudiants</h1>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#F26419]">
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
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Étudiants</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Messages de succès ou d'erreur */}
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

        {/* Filtres et boutons d'actions */}
        <div className="mb-6 flex flex-col lg:flex-row justify-between gap-4">
          <StudentsFilter 
            classes={classes}
            departments={departments}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          
          <div className="flex gap-2 lg:ml-4">
            <button
              type="button"
              onClick={handleOpenImportModal}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B396A]"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"/>
              </svg>
              Importer
            </button>
            <button
              type="button"
              onClick={handleAddStudent}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#F26419] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F26419]"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Ajouter
            </button>
          </div>
        </div>

        {/* Liste des étudiants */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-[#1B396A]">
              Liste des Étudiants
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {filteredStudents.length} étudiant(s) trouvé(s)
            </p>
          </div>
          
          <StudentsList 
            students={filteredStudents}
            onEdit={handleEditStudent}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </div>

      {/* Modal pour ajouter/modifier un étudiant */}
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

      {/* Modal pour importer des étudiants */}
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