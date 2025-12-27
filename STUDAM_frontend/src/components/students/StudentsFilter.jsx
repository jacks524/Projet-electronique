import React, { useState, useEffect } from 'react';

const StudentsFilter = ({ classes = [], departments = [], filters, onFilterChange }) => {
  const [search, setSearch] = useState(filters.search || '');
  const [classId, setClassId] = useState(filters.class || '');
  const [departmentId, setDepartmentId] = useState(filters.department || '');
  const [filteredClasses, setFilteredClasses] = useState([]);

  useEffect(() => {
    // Mettre à jour les états locaux si les filtres externes changent
    setSearch(filters.search || '');
    setClassId(filters.class || '');
    setDepartmentId(filters.department || '');
  }, [filters]);

  useEffect(() => {
    // Filtrer les courses par département si un département est sélectionné
    if (departmentId) {
      const filtered = classes.filter(c => c.departement && c.departement.id === parseInt(departmentId));
      setFilteredClasses(filtered);
      
      // Si la classe sélectionnée n'est pas dans le département, réinitialiser
      if (classId && !filtered.some(c => c.id === parseInt(classId))) {
        setClassId('');
        updateFilters({ search, class: '', department: departmentId });
      }
    } else {
      setFilteredClasses(classes);
    }
  }, [departmentId, classes]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    updateFilters({ search: value, class: classId, department: departmentId });
  };

  const handleClassChange = (e) => {
    const value = e.target.value;
    setClassId(value);
    updateFilters({ search, class: value, department: departmentId });
  };

  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    setDepartmentId(value);
    
    // Si on change de département, on réinitialise la classe
    // La mise à jour du filtre se fera dans l'effet qui surveille departmentId
    if (value !== departmentId) {
      setClassId('');
    }
    
    updateFilters({ search, class: '', department: value });
  };

  const updateFilters = (newFilters) => {
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 flex-1">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
              placeholder="Nom, matricule ou email"
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
            value={departmentId}
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
          <label htmlFor="class" className="block text-sm font-medium text-gray-700">
            Classe
          </label>
          <select
            id="class"
            name="class"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#F26419] focus:border-[#F26419] sm:text-sm rounded-md"
            value={classId}
            onChange={handleClassChange}
            disabled={filteredClasses.length === 0}
          >
            <option value="">Toutes les classes</option>
            {filteredClasses.map((classe) => (
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

export default StudentsFilter;