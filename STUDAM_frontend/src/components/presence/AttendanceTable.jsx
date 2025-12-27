import React, { useState } from 'react';
import Button from '@/components/ui/Button';

const AttendanceTable = ({ students = [], attendance = [], onAttendanceChange }) => {
  const [notes, setNotes] = useState({});
  const [studentWithOpenNotes, setStudentWithOpenNotes] = useState(null);

  const getAttendanceStatus = (studentId) => {
    const record = attendance.find(a => a.studentId === studentId);
    return record ? record.status : null;
  };

  const getAttendanceNotes = (studentId) => {
    const record = attendance.find(a => a.studentId === studentId);
    return record ? record.notes : "";
  };

  const handleStatusChange = (studentId, status) => {
    onAttendanceChange(studentId, status, getAttendanceNotes(studentId));
  };

  const handleOpenNotes = (studentId) => {
    setStudentWithOpenNotes(studentId);
    setNotes({
      ...notes,
      [studentId]: getAttendanceNotes(studentId)
    });
  };

  const handleNotesChange = (studentId, value) => {
    setNotes({
      ...notes,
      [studentId]: value
    });
  };

  const handleSaveNotes = (studentId) => {
    onAttendanceChange(
      studentId, 
      getAttendanceStatus(studentId), 
      notes[studentId] || ""
    );
    setStudentWithOpenNotes(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Matricule
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nom de l'étudiant
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Présence
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notes
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.length === 0 && (
            <tr>
              <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                Aucun étudiant trouvé pour cette classe
              </td>
            </tr>
          )}
          
          {students.map((student) => (
            <tr key={student.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {student.matricule}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {student.nom}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex justify-center space-x-2">
                  <Button
                    type="Button"
                    onClick={() => handleStatusChange(student.id, 'present')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      getAttendanceStatus(student.id) === 'present'
                        ? 'bg-green-100 text-green-800 ring-2 ring-green-500'
                        : 'bg-gray-100 text-gray-800 hover:bg-green-50'
                    }`}
                  >
                    Présent
                  </Button>
                  <Button
                    type="Button"
                    onClick={() => handleStatusChange(student.id, 'absent')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      getAttendanceStatus(student.id) === 'absent'
                        ? 'bg-red-100 text-red-800 ring-2 ring-red-500'
                        : 'bg-gray-100 text-gray-800 hover:bg-red-50'
                    }`}
                  >
                    Absent
                  </Button>
                  <Button
                    type="Button"
                    onClick={() => handleStatusChange(student.id, 'late')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      getAttendanceStatus(student.id) === 'late'
                        ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-500'
                        : 'bg-gray-100 text-gray-800 hover:bg-yellow-50'
                    }`}
                  >
                    Retard
                  </Button>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                {studentWithOpenNotes === student.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      className="border border-gray-300 rounded-md p-1 text-sm w-full"
                      value={notes[student.id] || ""}
                      onChange={(e) => handleNotesChange(student.id, e.target.value)}
                      placeholder="Ajouter une note..."
                    />
                    <Button
                      type="Button"
                      onClick={() => handleSaveNotes(student.id)}
                      className="p-1 rounded-md text-green-600 hover:bg-green-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="Button"
                    onClick={() => handleOpenNotes(student.id)}
                    className="text-[#1B396A] hover:text-[#F26419] flex items-center justify-center w-full"
                  >
                    {getAttendanceNotes(student.id) ? (
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Modifier
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Ajouter
                      </span>
                    )}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;