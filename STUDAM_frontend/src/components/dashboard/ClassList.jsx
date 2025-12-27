import React from 'react';
import Link from 'next/link';

const ClassList = ({ classes }) => {
  if (!classes || classes.length === 0) {
    return (
      <div className="px-4 py-4 sm:px-6">
        <div className="text-sm text-gray-500">
          Aucune classe assignée pour le moment.
        </div>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {classes.map((classe) => (
        <li key={classe.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-[#F26419]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-[#1B396A]">
                  {classe.nom}
                </div>
                {classe.departement && (
                  <div className="text-sm text-gray-500">
                    Département: {classe.departement.nom}
                  </div>
                )}
              </div>
            </div>
            <div>
              <Link 
                href={`/src/app/teacher/courses/${classe.id}`}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#F26419] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F26419]"
              >
                Gérer la classe
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ClassList;