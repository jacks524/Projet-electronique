import React, { useState, useEffect } from 'react';

const AttendanceFilter = ({ 
  classes = [], 
  subjects = [], 
  selectedClassId, 
  selectedSubjectId, 
  selectedDate, 
  onFilterChange 
}) => {
  const [classId, setClassId] = useState(selectedClassId || '');
  const [subjectId, setSubjectId] = useState(selectedSubjectId || '');
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (selectedClassId !== classId) setClassId(selectedClassId);
    if (selectedSubjectId !== subjectId) setSubjectId(selectedSubjectId);
    if (selectedDate !== date) setDate(selectedDate);
  }, [selectedClassId, selectedSubjectId, selectedDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange({ classId, subjectId, date });
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="class" className="block text-sm font-medium text-gray-700">
              Classe
            </label>
            <select
              id="class"
              name="class"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
              required
            >
              <option value="">Sélectionner une classe</option>
              {classes.map((classe) => (
                <option key={classe.id} value={classe.id}>
                  {classe.nom}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Matière
            </label>
            <select
              id="subject"
              name="subject"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
            >
              <option value="">Toutes les matières</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.libelle}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm"
              required
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1B396A] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B396A]"
          >
            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtrer
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceFilter;