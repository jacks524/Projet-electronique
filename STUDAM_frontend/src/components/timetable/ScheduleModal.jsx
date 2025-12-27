import React, { useState, useEffect } from 'react';

const ScheduleModal = ({ 
  show, 
  onClose, 
  day, 
  time, 
  schedule, 
  classId, 
  className,
  subjects = [],
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    id: null,
    matiere: null,
    jour: day,
    horaire: time,
    notes: ''
  });

  useEffect(() => {
    if (schedule) {
      setFormData({
        id: schedule.id,
        matiere: schedule.matiere,
        jour: schedule.jour,
        horaire: schedule.horaire,
        notes: schedule.notes || ''
      });
    } else {
      setFormData({
        id: null,
        matiere: null,
        jour: day,
        horaire: time,
        notes: ''
      });
    }
  }, [schedule, day, time]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'matiere') {
      const selectedSubject = subjects.find(s => s.id === parseInt(value));
      setFormData(prev => ({
        ...prev,
        matiere: selectedSubject
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
    
    if (!formData.matiere) {
      alert('Veuillez sélectionner une matière');
      return;
    }
    
    onSave(formData);
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      onDelete(schedule.id);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-[#1B396A]">
            {schedule ? 'Modifier un cours' : 'Ajouter un cours'}
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
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {day}, {time} - {className}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="matiere" className="block text-sm font-medium text-gray-700">
                Matière
              </label>
              <select
                id="matiere"
                name="matiere"
                className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                value={formData.matiere?.id || ''}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner une matière</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.libelle} ({subject.code})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes (optionnel)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="3"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
                placeholder="Notes supplémentaires sur ce cours..."
                value={formData.notes}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
          
          <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#F26419] text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F26419] sm:ml-3 sm:w-auto sm:text-sm"
            >
              {schedule ? 'Enregistrer les modifications' : 'Ajouter'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B396A] sm:mt-0 sm:w-auto sm:text-sm"
            >
              Annuler
            </button>
            {schedule && (
              <button
                type="button"
                onClick={handleDelete}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Supprimer
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;