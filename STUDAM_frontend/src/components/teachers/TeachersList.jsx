import React from 'react';

const TeachersList = ({ 
  teachers = [], 
  onEdit, 
  onToggleStatus,
  onToggleChefDepartement
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nom
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Département
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Matières
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {teachers.length === 0 && (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                Aucun enseignant trouvé
              </td>
            </tr>
          )}
          
          {teachers.map((teacher) => (
            <tr key={teacher.id} className={teacher.status === 'inactive' ? 'bg-gray-50' : ''}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-[#1B396A] rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {teacher.nom.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {teacher.nom}
                    </div>
                    {teacher.isChefDepartement && (
                      <div className="text-xs text-[#F26419]">
                        Chef de département
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{teacher.email}</div>
                <div className="text-sm text-gray-500">{teacher.phone}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{teacher.departement?.nom}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {teacher.matieres.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {teacher.matieres.slice(0, 2).map(matiere => (
                        <span key={matiere.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {matiere.libelle}
                        </span>
                      ))}
                      {teacher.matieres.length > 2 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{teacher.matieres.length - 2} autres
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Aucune matière assignée</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span 
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    teacher.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {teacher.status === 'active' ? 'Actif' : 'Inactif'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(teacher)}
                    className="text-[#1B396A] hover:text-[#F26419]"
                  >
                    <span className="sr-only">Modifier</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onToggleStatus(teacher.id)}
                    className={`${
                      teacher.status === 'active' 
                        ? 'text-red-600 hover:text-red-800' 
                        : 'text-green-600 hover:text-green-800'
                    }`}
                  >
                    <span className="sr-only">
                      {teacher.status === 'active' ? 'Désactiver' : 'Activer'}
                    </span>
                    {teacher.status === 'active' ? (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => onToggleChefDepartement(teacher.id)}
                    className={`${
                      teacher.isChefDepartement 
                        ? 'text-[#F26419] hover:text-[#D55615]' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    title={teacher.isChefDepartement ? "Retirer rôle de chef de département" : "Définir comme chef de département"}
                  >
                    <span className="sr-only">
                      {teacher.isChefDepartement ? "Retirer rôle de chef de département" : "Définir comme chef de département"}
                    </span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeachersList;