import React, { useState, useEffect } from 'react';

const TeacherModal = ({ 
  show, 
  teacher = null, 
  departments = [], 
  subjects = [], 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    id: null,
    nom: '',
    email: '',
    phone: '',
    departement: null,
    matieres: [],
    isChefDepartement: false,
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [availableSubjects, setAvailableSubjects] = useState([]);

  useEffect(() => {
    if (teacher) {
      setFormData({
        id: teacher.id,
        nom: teacher.nom,
        email: teacher.email,
        phone: teacher.phone,
        departement: teacher.departement,
        matieres: teacher.matieres,
        isChefDepartement: teacher.isChefDepartement,
        password: '' // Ne pas afficher le mot de passe existant
      });
      
      // Filtrer les matières par département
      if (teacher.departement) {
        setAvailableSubjects(
          subjects.filter(s => s.departement && s.departement.id === teacher.departement.id)
        );
      }
    } else {
      setFormData({
        id: null,
        nom: '',
        email: '',
        phone: '',
        departement: null,
        matieres: [],
        isChefDepartement: false,
        password: ''
      });
    }
  }, [teacher, subjects]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'departement') {
      const selectedDepartment = departments.find(d => d.id === parseInt(value));
      
      // Mettre à jour le département et réinitialiser les matières
      setFormData(prev => ({
        ...prev,
        departement: selectedDepartment || null,
        matieres: []
      }));
      
      // Mettre à jour les matières disponibles
      if (selectedDepartment) {
        setAvailableSubjects(
          subjects.filter(s => s.departement && s.departement.id === selectedDepartment.id)
        );
      } else {
        setAvailableSubjects([]);
      }
    } else if (name === 'isChefDepartement') {
      setFormData(prev => ({
        ...prev,
        isChefDepartement: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubjectChange = (e) => {
    const { value, checked } = e.target;
    const subjectId = parseInt(value);
    
    if (checked) {
      // Ajouter la matière si elle n'est pas déjà présente
      if (!formData.matieres.some(m => m.id === subjectId)) {
        const subjectToAdd = subjects.find(s => s.id === subjectId);
        setFormData(prev => ({
          ...prev,
          matieres: [...prev.matieres, subjectToAdd]
        }));
      }
    } else {
      // Retirer la matière
      setFormData(prev => ({
        ...prev,
        matieres: prev.matieres.filter(m => m.id !== subjectId)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.nom) newErrors.nom = "Le nom est requis";
    if (!formData.email) newErrors.email = "L'email est requis";
    if (!formData.departement) newErrors.departement = "Le département est requis";
    if (!teacher && !formData.password) newErrors.password = "Le mot de passe est requis pour un nouvel enseignant";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave(formData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-[#1B396A]">
              {teacher ? 'Modifier un enseignant' : 'Ajouter un enseignant'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Fermer</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nom"
                id="nom"
                className={`mt-1 block w-full border ${errors.nom ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                value={formData.nom}
                onChange={handleChange}
                required
              />
              {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className={`mt-1 block w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="departement" className="block text-sm font-medium text-gray-700">
                Département <span className="text-red-500">*</span>
              </label>
              <select
                id="departement"
                name="departement"
                className={`mt-1 block w-full bg-white border ${errors.departement ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                value={formData.departement?.id || ''}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner un département</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.nom}
                  </option>
                ))}
              </select>
              {errors.departement && <p className="mt-1 text-sm text-red-500">{errors.departement}</p>}
            </div>
            
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between">
                <label htmlFor="matieres" className="block text-sm font-medium text-gray-700">
                  Matières
                </label>
                <span className="text-xs text-gray-500">
                  Sélectionnez d'abord un département
                </span>
              </div>
              
              {formData.departement ? (
                <div className="mt-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {availableSubjects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableSubjects.map(subject => (
                        <div key={subject.id} className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id={`subject-${subject.id}`}
                              name={`subject-${subject.id}`}
                              type="checkbox"
                              value={subject.id}
                              checked={formData.matieres.some(m => m.id === subject.id)}
                              onChange={handleSubjectChange}
                              className="focus:ring-[#F26419] h-4 w-4 text-[#F26419] border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor={`subject-${subject.id}`} className="font-medium text-gray-700">
                              {subject.libelle}
                            </label>
                            <p className="text-gray-500">{subject.code}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 py-2">
                      Aucune matière disponible pour ce département
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-2 p-4 border border-gray-200 border-dashed rounded-md bg-gray-50 text-center">
                  <p className="text-sm text-gray-500">
                    Veuillez d'abord sélectionner un département
                  </p>
                </div>
              )}
            </div>
            
            {!teacher && (
              <div className="sm:col-span-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className={`mt-1 block w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                  value={formData.password}
                  onChange={handleChange}
                  required={!teacher}
                />
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>
            )}
            
            {teacher && (
              <div className="sm:col-span-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Nouveau mot de passe (laisser vide pour ne pas modifier)
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            )}
            
            <div className="sm:col-span-2">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="isChefDepartement"
                    name="isChefDepartement"
                    type="checkbox"
                    checked={formData.isChefDepartement}
                    onChange={handleChange}
                    className="focus:ring-[#F26419] h-4 w-4 text-[#F26419] border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="isChefDepartement" className="font-medium text-gray-700">
                    Chef de département
                  </label>
                  <p className="text-gray-500">
                    Désigner cet enseignant comme chef du département sélectionné
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#F26419] text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F26419] sm:ml-3 sm:w-auto sm:text-sm"
            >
              {teacher ? 'Enregistrer les modifications' : 'Ajouter'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B396A] sm:mt-0 sm:w-auto sm:text-sm"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherModal;