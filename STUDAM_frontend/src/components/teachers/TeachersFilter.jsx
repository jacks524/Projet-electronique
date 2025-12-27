import React, { useState, useEffect } from 'react';

const TeachersFilter = ({ departments = [], subjects = [], filters, onFilterChange }) => {
  const [search, setSearch] = useState(filters.search || '');
  const [department, setDepartment] = useState(filters.department || '');
  const [subject, setSubject] = useState(filters.subject || '');

  useEffect(() => {
    // Mettre à jour les états locaux si les filtres externes changent
    setSearch(filters.search || '');
    setDepartment(filters.department || '');
    setSubject(filters.subject || '');
  }, [filters]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    onFilterChange({
      ...filters,
      search: e.target.value
    });
  };

  const handleDepartmentChange = (e) => {
    setDepartment(e.target.value);
    
    // Si on change de département, réinitialiser le filtre de matière
    // car les matières sont liées au département
    onFilterChange({
      ...filters,
      department: e.target.value,
      subject: ''
    });
    
    setSubject('');
  };

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
    onFilterChange({
      ...filters,
      subject: e.target.value
    });
  };

  // Filtrer les matières par département sélectionné
  const filteredSubjects = department 
    ? subjects.filter(s => s.departement && s.departement.id === parseInt(department))
    : subjects;

  return (
    <div className="bg-white shadow rounded-lg p-4 flex-1">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Rechercher
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="focus:ring-[#F26419] focus:border-[#F26419] block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Nom ou email"
              value={search}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">
            Département
          </label>
          <select
            id="department"
            name="department"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm rounded-md"
            value={department}
            onChange={handleDepartmentChange}
          >
            <option value="">Tous les départements</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.nom}
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
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm rounded-md"
            value={subject}
            onChange={handleSubjectChange}
            disabled={!department}
          >
            <option value="">Toutes les matières</option>
            {filteredSubjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.libelle} ({sub.code})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TeachersFilter;