import React, { useState, useEffect } from 'react';

const StudentModal = ({ 
  show, 
  student = null, 
  classes = [], 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    id: null,
    matricule: '',
    nom: '',
    email: '',
    phone: '',
    classe: null,
    dateNaissance: '',
    lieuNaissance: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (student) {
      setFormData({
        id: student.id,
        matricule: student.matricule,
        nom: student.nom,
        email: student.email,
        phone: student.phone || '',
        classe: student.classe,
        dateNaissance: student.dateNaissance,
        lieuNaissance: student.lieuNaissance || ''
      });
    } else {
      setFormData({
        id: null,
        matricule: '',
        nom: '',
        email: '',
        phone: '',
        classe: null,
        dateNaissance: '',
        lieuNaissance: ''
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'classe') {
      const selectedClass = classes.find(c => c.id === parseInt(value));
      
      setFormData(prev => ({
        ...prev,
        classe: selectedClass || null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.matricule) newErrors.matricule = "Le matricule est requis";
    if (!formData.nom) newErrors.nom = "Le nom est requis";
    if (!formData.email) newErrors.email = "L'email est requis";
    if (!formData.classe) newErrors.classe = "La classe est requise";
    if (!formData.dateNaissance) newErrors.dateNaissance = "La date de naissance est requise";
    
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
              {student ? 'Modifier un étudiant' : 'Ajouter un étudiant'}
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
            <div>
              <label htmlFor="matricule" className="block text-sm font-medium text-gray-700">
                Matricule <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="matricule"
                id="matricule"
                className={`mt-1 block w-full border ${errors.matricule ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                value={formData.matricule}
                onChange={handleChange}
                required
              />
              {errors.matricule && <p className="mt-1 text-sm text-red-500">{errors.matricule}</p>}
            </div>
            
            <div>
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
              <label htmlFor="classe" className="block text-sm font-medium text-gray-700">
                Classe <span className="text-red-500">*</span>
              </label>
              <select
                id="classe"
                name="classe"
                className={`mt-1 block w-full bg-white border ${errors.classe ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                value={formData.classe?.id || ''}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner une classe</option>
                {classes.map((classe) => (
                  <option key={classe.id} value={classe.id}>
                    {classe.nom} - {classe.departement?.nom}
                  </option>
                ))}
              </select>
              {errors.classe && <p className="mt-1 text-sm text-red-500">{errors.classe}</p>}
            </div>
            
            <div>
              <label htmlFor="dateNaissance" className="block text-sm font-medium text-gray-700">
                Date de naissance <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dateNaissance"
                id="dateNaissance"
                className={`mt-1 block w-full border ${errors.dateNaissance ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm`}
                value={formData.dateNaissance}
                onChange={handleChange}
                required
              />
              {errors.dateNaissance && <p className="mt-1 text-sm text-red-500">{errors.dateNaissance}</p>}
            </div>
            
            <div>
              <label htmlFor="lieuNaissance" className="block text-sm font-medium text-gray-700">
                Lieu de naissance
              </label>
              <input
                type="text"
                name="lieuNaissance"
                id="lieuNaissance"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                value={formData.lieuNaissance}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#F26419] text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F26419] sm:ml-3 sm:w-auto sm:text-sm"
            >
              {student ? 'Enregistrer les modifications' : 'Ajouter'}
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

export default StudentModal;