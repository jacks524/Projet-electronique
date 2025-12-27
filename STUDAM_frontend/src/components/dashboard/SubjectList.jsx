import React from 'react';
import Link from 'next/link';

const SubjectList = ({ subjects }) => {
  if (!subjects || subjects.length === 0) {
    return (
      <div className="px-4 py-4 sm:px-6">
        <div className="text-sm text-gray-500">
          Aucune matière assignée pour le moment.
        </div>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {subjects.map((subject) => (
        <li key={subject.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-[#F26419]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-[#1B396A]">
                  {subject.libelle}
                </div>
                <div className="text-sm text-gray-500">
                  Code: {subject.code}
                </div>
                {subject.departement && (
                  <div className="text-sm text-gray-500">
                    Département: {subject.departement.nom}
                  </div>
                )}
              </div>
            </div>
            <div>
              <Link 
                href={`/src/app/chief/subjects/${subject.id}/attendance`}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#F26419] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F26419]"
              >
                Voir les présences
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default SubjectList;