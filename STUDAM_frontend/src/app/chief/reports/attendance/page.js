"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '../../../../context/authContext';
import departmentService from '../../../../services/departmentService';
import classService from '../../../../services/classService';
import Button from '../../../../components/ui/Button';
import toast from 'react-hot-toast';

export default function AttendanceReportPage() {
    const { user } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);

    useEffect(() => {
        loadClasses();
        setDefaultDates();
    }, [user]);

    const setDefaultDates = () => {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);

        setEndDate(today.toISOString().split('T')[0]);
        setStartDate(weekAgo.toISOString().split('T')[0]);
    };

    const loadClasses = async () => {
        try {
            setLoading(true);

            if (!user?.departmentNames || user.departmentNames.length === 0) {
                toast.error("Aucun département assigné");
                return;
            }

            const allDepartments = await departmentService.getAll();
            const targetDepartment = allDepartments.find(
                d => d.name === user.departmentNames[0]
            );

            if (!targetDepartment) {
                throw new Error("Département non trouvé");
            }

            const classesData = await classService.getByDepartment({
                departmentId: targetDepartment.departmentId,
                name: "temp",
                code: "temp",
                description: "temp"
            });

            setClasses(classesData);

            // Simuler des données de présence (à remplacer par un vrai appel API)
            const mockAttendanceData = classesData.map(classe => ({
                classId: classe.classId,
                className: classe.name,
                totalStudents: classe.studentNumber || 0,
                presentCount: Math.floor((classe.studentNumber || 0) * 0.85),
                absentCount: Math.floor((classe.studentNumber || 0) * 0.10),
                lateCount: Math.floor((classe.studentNumber || 0) * 0.05),
                attendanceRate: 85
            }));

            setAttendanceData(mockAttendanceData);

        } catch (error) {
            toast.error("Erreur lors du chargement des données");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePeriodChange = (period) => {
        setSelectedPeriod(period);
        const today = new Date();
        let startDate = new Date(today);

        switch (period) {
            case 'today':
                startDate = today;
                break;
            case 'week':
                startDate.setDate(today.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(today.getMonth() - 1);
                break;
            case 'semester':
                startDate.setMonth(today.getMonth() - 6);
                break;
        }

        setStartDate(startDate.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
    };

    const handleExportExcel = () => {
        toast.success("Export Excel en cours...");
        // TODO: Implémenter l'export Excel
    };

    const handleExportPDF = () => {
        window.print();
    };

    const totalPresent = attendanceData.reduce((sum, d) => sum + d.presentCount, 0);
    const totalAbsent = attendanceData.reduce((sum, d) => sum + d.absentCount, 0);
    const totalLate = attendanceData.reduce((sum, d) => sum + d.lateCount, 0);
    const totalStudents = attendanceData.reduce((sum, d) => sum + d.totalStudents, 0);
    const overallRate = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26419]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-[#1B396A]">
                            Rapport de présences
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Statistiques de présence du {new Date(startDate).toLocaleDateString('fr-FR')} au {new Date(endDate).toLocaleDateString('fr-FR')}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button onClick={handleExportExcel} variant="secondary">
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Exporter Excel
                        </Button>
                        <Button onClick={handleExportPDF} variant="secondary">
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Imprimer PDF
                        </Button>
                        <Link href="/chief/reports">
                            <Button variant="secondary">Retour</Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Period Filter */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#1B396A] mb-4">Période</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                    {[
                        { value: 'today', label: "Aujourd'hui" },
                        { value: 'week', label: 'Cette semaine' },
                        { value: 'month', label: 'Ce mois' },
                        { value: 'semester', label: 'Ce semestre' },
                        { value: 'custom', label: 'Personnalisé' }
                    ].map((period) => (
                        <button
                            key={period.value}
                            onClick={() => handlePeriodChange(period.value)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                selectedPeriod === period.value
                                    ? 'bg-[#F26419] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>

                {selectedPeriod === 'custom' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date de début
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date de fin
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F26419]"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Overall Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Taux global</p>
                            <p className="text-3xl font-bold text-[#1B396A] mt-2">{overallRate}%</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Présents</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{totalPresent}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Absents</p>
                            <p className="text-3xl font-bold text-red-600 mt-2">{totalAbsent}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Retards</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-2">{totalLate}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance by Class */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-[#1B396A]">
                        Détails par classe
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Classe
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Effectif
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Présents
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Absents
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Retards
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Taux
                            </th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tendance
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {attendanceData.map((data) => (
                            <tr key={data.classId} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {data.className}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="text-sm text-gray-900">{data.totalStudents}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {data.presentCount}
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            {data.absentCount}
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            {data.lateCount}
                                        </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center">
                                        <div className="w-16">
                                            <div className="text-sm font-medium text-gray-900">{data.attendanceRate}%</div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                                <div
                                                    className={`h-1.5 rounded-full ${
                                                        data.attendanceRate >= 90 ? 'bg-green-500' :
                                                            data.attendanceRate >= 75 ? 'bg-yellow-500' :
                                                                'bg-red-500'
                                                    }`}
                                                    style={{ width: `${data.attendanceRate}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {data.attendanceRate >= 85 ? (
                                        <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    ) : data.attendanceRate >= 70 ? (
                                        <svg className="w-5 h-5 text-yellow-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                        </svg>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Visual Chart Placeholder */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#1B396A] mb-4">
                    Évolution de la présence
                </h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        <p className="text-gray-500">Graphique d'évolution</p>
                        <p className="text-sm text-gray-400 mt-1">À implémenter avec une bibliothèque de graphiques</p>
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#1B396A] mb-4">
                    Recommandations
                </h3>
                <ul className="space-y-3">
                    {overallRate < 75 && (
                        <li className="flex items-start p-3 bg-red-50 rounded-lg">
                            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <p className="font-medium text-red-900">Taux de présence critique</p>
                                <p className="text-sm text-red-700 mt-1">
                                    Le taux de présence global est inférieur à 75%. Une intervention est recommandée.
                                </p>
                            </div>
                        </li>
                    )}
                    {totalAbsent > totalStudents * 0.15 && (
                        <li className="flex items-start p-3 bg-yellow-50 rounded-lg">
                            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="font-medium text-yellow-900">Taux d'absentéisme élevé</p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Le nombre d'absents représente plus de 15% de l'effectif. Considérez un suivi personnalisé.
                                </p>
                            </div>
                        </li>
                    )}
                    {overallRate >= 90 && (
                        <li className="flex items-start p-3 bg-green-50 rounded-lg">
                            <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="font-medium text-green-900">Excellent taux de présence</p>
                                <p className="text-sm text-green-700 mt-1">
                                    Félicitations ! Le taux de présence est excellent. Maintenez cette dynamique.
                                </p>
                            </div>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}