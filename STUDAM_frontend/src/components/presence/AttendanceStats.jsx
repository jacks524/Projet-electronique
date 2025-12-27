import React from 'react';
import Button from '@/components/ui/Button';


const AttendanceStats = ({ attendance = [], selectedClass, selectedSubject }) => {
  // Calculer les statistiques
  const total = attendance.length;
  const present = attendance.filter(a => a.status === 'present').length;
  const absent = attendance.filter(a => a.status === 'absent').length;
  const late = attendance.filter(a => a.status === 'late').length;
  
  const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0;
  const absentPercentage = total > 0 ? Math.round((absent / total) * 100) : 0;
  const latePercentage = total > 0 ? Math.round((late / total) * 100) : 0;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-[#1B396A]">
          Statistiques de présence
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {selectedClass && `Classe: ${selectedClass.nom}`}
          {selectedSubject && ` - Matière: ${selectedSubject.libelle}`}
        </p>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-green-50 px-4 py-5 sm:p-6 rounded-lg overflow-hidden">
            <dt className="text-sm font-medium text-green-800 truncate">
              Présents
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-green-800">
              {present} / {total}
            </dd>
            <dd className="mt-2">
              <div className="flex items-center">
                <div className="w-full bg-green-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${presentPercentage}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm text-green-800">{presentPercentage}%</span>
              </div>
            </dd>
          </div>
          
          <div className="bg-red-50 px-4 py-5 sm:p-6 rounded-lg overflow-hidden">
            <dt className="text-sm font-medium text-red-800 truncate">
              Absents
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-red-800">
              {absent} / {total}
            </dd>
            <dd className="mt-2">
              <div className="flex items-center">
                <div className="w-full bg-red-200 rounded-full h-2.5">
                  <div 
                    className="bg-red-600 h-2.5 rounded-full" 
                    style={{ width: `${absentPercentage}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm text-red-800">{absentPercentage}%</span>
              </div>
            </dd>
          </div>
          
          <div className="bg-yellow-50 px-4 py-5 sm:p-6 rounded-lg overflow-hidden">
            <dt className="text-sm font-medium text-yellow-800 truncate">
              Retards
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-yellow-800">
              {late} / {total}
            </dd>
            <dd className="mt-2">
              <div className="flex items-center">
                <div className="w-full bg-yellow-200 rounded-full h-2.5">
                  <div 
                    className="bg-yellow-600 h-2.5 rounded-full" 
                    style={{ width: `${latePercentage}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm text-yellow-800">{latePercentage}%</span>
              </div>
            </dd>
          </div>
        </dl>
        
        {/* Remarques et tendances */}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h4 className="text-base font-medium text-gray-900">Remarques</h4>
          <ul className="mt-2 space-y-2 text-sm text-gray-500">
            {presentPercentage < 70 && (
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="ml-2">
                  <span className="font-medium text-gray-900">Attention :</span> Le taux de présence est inférieur à 70%, un suivi est recommandé.
                </span>
              </li>
            )}
            {latePercentage > 20 && (
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-yellow-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="ml-2">
                  <span className="font-medium text-gray-900">Remarque :</span> Taux élevé de retards, il pourrait être utile de rappeler l'importance de la ponctualité.
                </span>
              </li>
            )}
            {presentPercentage >= 90 && (
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="ml-2">
                  <span className="font-medium text-gray-900">Félicitations :</span> Le taux de présence est excellent, maintenez ce bon résultat !
                </span>
              </li>
            )}
            <li className="flex items-start">
              <span className="flex-shrink-0 h-5 w-5 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="ml-2">
                <span className="font-medium text-gray-900">Info :</span> Ces statistiques sont basées sur les données de la date sélectionnée uniquement.
              </span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="px-4 py-3 sm:px-6 bg-gray-50 text-right">
        <Button
          type="Button"
          onClick={() => window.print()}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B396A]"
        >
          <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimer
        </Button>
      </div>
    </div>
  );
};

export default AttendanceStats;