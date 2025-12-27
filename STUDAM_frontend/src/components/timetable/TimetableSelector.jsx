import React from 'react';

const TimetableSelector = ({ classes = [], selectedClassId, onClassChange }) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Sélectionner une classe
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Choisissez une classe pour consulter ou modifier son emploi du temps
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:w-64">
          <select
            id="class-selector"
            name="class-selector"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm rounded-md"
            value={selectedClassId}
            onChange={(e) => onClassChange(e.target.value)}
          >
            <option value="">Sélectionner une classe</option>
            {classes.map((classe) => (
              <option key={classe.id} value={classe.id}>
                {classe.nom}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TimetableSelector;