import React, { useState, useEffect } from 'react';

const ProfileInfo = ({ user, onUpdateProfile }) => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    phone: '',
    bio: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.nom) newErrors.nom = "Le nom est requis";
    if (!formData.email) newErrors.email = "L'email est requis";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    // Réinitialiser les erreurs en mode édition
    if (!isEditing) {
      setErrors({});
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
        <button
          type="button"
          onClick={toggleEdit}
          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md ${
            isEditing 
              ? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              : 'text-white bg-[#1B396A] hover:bg-opacity-90'
          }`}
        >
          {isEditing ? (
            <>
              <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Annuler
            </>
          ) : (
            <>
              <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Modifier
            </>
          )}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                Nom complet
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="nom"
                  id="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-[#F26419] focus:border-[#F26419] block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.nom ? 'border-red-500' : ''
                  }`}
                />
                {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom}</p>}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`shadow-sm focus:ring-[#F26419] focus:border-[#F26419] block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Numéro de téléphone
              </label>
              <div className="mt-1">
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-[#F26419] focus:border-[#F26419] block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <div className="mt-1">
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-[#F26419] focus:border-[#F26419] block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Quelques mots à propos de vous..."
                ></textarea>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Une courte biographie qui apparaîtra sur votre profil.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={toggleEdit}
              className="mr-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B396A]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#F26419] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F26419]"
            >
              Enregistrer
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white overflow-hidden">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Nom complet</dt>
              <dd className="mt-1 text-sm text-gray-900">{formData.nom}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Adresse email</dt>
              <dd className="mt-1 text-sm text-gray-900">{formData.email}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Numéro de téléphone</dt>
              <dd className="mt-1 text-sm text-gray-900">{formData.phone || '—'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Rôle</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.role === 'super_admin' ? 'Super Administrateur' : 
                 user.role === 'admin' ? 'Administrateur' : 
                 user.role === 'chef_departement' ? 'Chef de département' : 
                 'Enseignant'}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Bio</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formData.bio || 'Aucune biographie renseignée.'}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;