import React from 'react';

const TimetableGrid = ({ daysOfWeek, timeSlots, schedules, onCellClick }) => {
  // Fonction pour trouver un cours à un jour et un créneau horaire donnés
  const findSchedule = (day, time) => {
    return schedules.find(
      schedule => schedule.jour === day && schedule.horaire === time
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="w-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Horaire
            </th>
            {daysOfWeek.map((day) => (
              <th key={day} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {timeSlots.map((time) => (
            <tr key={time}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                {time}
              </td>
              {daysOfWeek.map((day) => {
                const schedule = findSchedule(day, time);
                return (
                  <td 
                    key={`${day}-${time}`} 
                    className={`px-1 py-1 text-sm ${schedule ? 'cursor-pointer hover:bg-orange-50' : 'cursor-pointer hover:bg-gray-50'}`}
                    onClick={() => onCellClick(day, time, schedule)}
                  >
                    {schedule ? (
                      <div className="p-2 rounded-md bg-orange-100 border border-orange-200 h-full min-h-[80px] overflow-hidden">
                        <div className="font-medium text-[#1B396A]">{schedule.matiere?.libelle}</div>
                        <div className="text-xs text-gray-500">Code: {schedule.matiere?.code}</div>
                        <div className="text-xs text-gray-500">Prof: {schedule.matiere?.enseignant?.nom}</div>
                      </div>
                    ) : (
                      <div className="p-2 rounded-md bg-gray-50 border border-gray-100 h-full min-h-[80px] flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Cliquez pour ajouter</span>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimetableGrid;