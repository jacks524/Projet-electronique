"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '../../../../context/authContext';
import departmentService from '../../../../services/departmentService';
import classService from '../../../../services/classService';
import reportService from '../../../../services/reportService';
import Button from '../../../../components/ui/Button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

export default function AttendanceReportPage() {
    const { user } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [departmentName, setDepartmentName] = useState('---');

    const resolveDepartment = (departmentsList) => {
        if (user?.departmentIdIfChief) return departmentsList.find((d) => d.departmentId === user.departmentIdIfChief);
        if (Array.isArray(user?.departmentsIds) && user.departmentsIds.length > 0) return departmentsList.find((d) => d.departmentId === user.departmentsIds[0]);
        if (Array.isArray(user?.departmentNames) && user.departmentNames.length > 0) return departmentsList.find((d) => d.name === user.departmentNames[0]);
        return null;
    };

    const toNumber = (value, fallback = 0) => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const parsed = Number.parseInt(value, 10);
            if (!Number.isNaN(parsed)) return parsed;
        }
        return fallback;
    };

    useEffect(() => {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        setEndDate(today.toISOString().split('T')[0]);
        setStartDate(weekAgo.toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        if (!startDate || !endDate) return;
        loadAttendanceData();
    }, [user, startDate, endDate]);

    const loadAttendanceData = async () => {
        try {
            setLoading(true);
            const allDepartments = await departmentService.getAll();
            const targetDepartment = resolveDepartment(Array.isArray(allDepartments) ? allDepartments : []);
            if (!targetDepartment) throw new Error('Departement non trouve');

            const depId = targetDepartment.departmentId;
            setDepartmentName(targetDepartment.name || '---');

            const [classesData, rows] = await Promise.all([
                classService.getByDepartment(depId),
                reportService.getTeacherAttendanceList({ departmentId: depId, startDate, endDate, status: 'all' }),
            ]);

            const classList = Array.isArray(classesData) ? classesData : [];
            const rowsList = Array.isArray(rows) ? rows : [];
            const classMetaMap = new Map();
            classList.forEach((c) => {
                const id = c.classId || c.id;
                if (!id) return;
                classMetaMap.set(String(id), {
                    classId: id,
                    className: c.name || c.className || `Classe ${id}`,
                    totalStudents: toNumber(c.studentNumber ?? c.studentCount, 0),
                });
            });

            const aggregate = new Map();
            rowsList.forEach((row) => {
                const rowClassId = row.classId || row.class?.id || row.class?.classId || row.classroomId || row.classeId;
                const rowClassName = row.className || row.class?.name || row.classroomName || row.classeName;
                const key = String(rowClassId || rowClassName || 'UNKNOWN');

                if (!aggregate.has(key)) {
                    const base = classMetaMap.get(String(rowClassId)) || {};
                    aggregate.set(key, {
                        classId: rowClassId || base.classId || key,
                        className: rowClassName || base.className || `Classe ${key}`,
                        totalStudents: base.totalStudents || 0,
                        presentCount: 0,
                        absentCount: 0,
                        lateCount: 0,
                        sessionsCount: 0,
                    });
                }

                const target = aggregate.get(key);
                const present = toNumber(row.presentCount ?? row.totalPresent ?? row.present, 0);
                const late = toNumber(row.lateCount ?? row.totalLate ?? row.late, 0);
                const total = toNumber(row.totalStudents ?? row.total, present + late);
                const absent = Math.max(total - present - late, 0);

                target.presentCount += present;
                target.lateCount += late;
                target.absentCount += absent;
                target.sessionsCount += 1;

                if (!target.totalStudents) {
                    target.totalStudents = total;
                }
            });

            const merged = [];
            classMetaMap.forEach((meta, key) => {
                if (aggregate.has(key)) {
                    merged.push(aggregate.get(key));
                } else {
                    merged.push({ ...meta, presentCount: 0, absentCount: 0, lateCount: 0, sessionsCount: 0 });
                }
            });
            aggregate.forEach((value) => {
                if (!merged.some((m) => String(m.classId) === String(value.classId) || m.className === value.className)) {
                    merged.push(value);
                }
            });

            const finalRows = merged.map((entry) => {
                const totalEvents = entry.presentCount + entry.absentCount + entry.lateCount;
                const attendanceRate = totalEvents > 0 ? Math.round(((entry.presentCount + entry.lateCount) / totalEvents) * 100) : 0;
                return { ...entry, attendanceRate };
            });

            setAttendanceData(finalRows);
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors du chargement des donnees');
            setAttendanceData([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePeriodChange = (period) => {
        setSelectedPeriod(period);
        const today = new Date();
        const start = new Date(today);

        if (period === 'today') {
            // same day
        } else if (period === 'week') {
            start.setDate(today.getDate() - 7);
        } else if (period === 'month') {
            start.setMonth(today.getMonth() - 1);
        } else if (period === 'semester') {
            start.setMonth(today.getMonth() - 6);
        }

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
    };

    const totalPresent = attendanceData.reduce((sum, d) => sum + d.presentCount, 0);
    const totalAbsent = attendanceData.reduce((sum, d) => sum + d.absentCount, 0);
    const totalLate = attendanceData.reduce((sum, d) => sum + d.lateCount, 0);
    const totalStudents = attendanceData.reduce((sum, d) => sum + d.totalStudents, 0);
    const totalEvents = totalPresent + totalAbsent + totalLate;
    const overallRate = totalEvents > 0 ? Math.round(((totalPresent + totalLate) / totalEvents) * 100) : 0;

    const handleExportCsv = () => {
        const header = ['Classe', 'Effectif', 'Sessions', 'Presents', 'Absents', 'Retards', 'Taux'];
        const rows = attendanceData.map((d) => [
            d.className,
            String(d.totalStudents || 0),
            String(d.sessionsCount || 0),
            String(d.presentCount || 0),
            String(d.absentCount || 0),
            String(d.lateCount || 0),
            `${d.attendanceRate || 0}%`,
        ]);

        const csv = [header, ...rows]
            .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `rapport-presences-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        toast.success('Export CSV termine.');
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text(`Rapport de presences - ${departmentName}`, 14, 16);
        doc.setFontSize(10);
        doc.text(`Periode: ${startDate} au ${endDate}`, 14, 22);

        autoTable(doc, {
            startY: 28,
            head: [['Classe', 'Effectif', 'Sessions', 'Presents', 'Absents', 'Retards', 'Taux']],
            body: attendanceData.map((d) => [
                d.className,
                String(d.totalStudents || 0),
                String(d.sessionsCount || 0),
                String(d.presentCount || 0),
                String(d.absentCount || 0),
                String(d.lateCount || 0),
                `${d.attendanceRate || 0}%`,
            ]),
            headStyles: { fillColor: [124, 58, 237] },
        });

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 6,
            head: [['Synthese', 'Valeur']],
            body: [
                ['Taux global', `${overallRate}%`],
                ['Presents', String(totalPresent)],
                ['Absents', String(totalAbsent)],
                ['Retards', String(totalLate)],
                ['Total etudiants (effectifs)', String(totalStudents)],
            ],
            headStyles: { fillColor: [49, 46, 129] },
        });

        doc.save(`rapport-presences-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('Rapport PDF genere.');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-[#312e81]">Rapport de presences</h1>
                        <p className="text-gray-600 mt-2">Statistiques du {new Date(startDate).toLocaleDateString('fr-FR')} au {new Date(endDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button onClick={handleExportCsv} variant="secondary">Exporter CSV</Button>
                        <Button onClick={handleExportPDF} variant="secondary">Exporter PDF</Button>
                        <Link href="/chief/reports"><Button variant="secondary">Retour</Button></Link>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#312e81] mb-4">Periode</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                    {[
                        { value: 'today', label: "Aujourd'hui" },
                        { value: 'week', label: 'Cette semaine' },
                        { value: 'month', label: 'Ce mois' },
                        { value: 'semester', label: 'Ce semestre' },
                        { value: 'custom', label: 'Personnalise' },
                    ].map((period) => (
                        <button
                            key={period.value}
                            onClick={() => handlePeriodChange(period.value)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedPeriod === period.value ? 'bg-[#7c3aed] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>

                {selectedPeriod === 'custom' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date de debut</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6"><p className="text-sm text-gray-600">Taux global</p><p className="text-3xl font-bold text-[#312e81] mt-2">{overallRate}%</p></div>
                <div className="bg-white shadow rounded-lg p-6"><p className="text-sm text-gray-600">Presents</p><p className="text-3xl font-bold text-green-600 mt-2">{totalPresent}</p></div>
                <div className="bg-white shadow rounded-lg p-6"><p className="text-sm text-gray-600">Absents</p><p className="text-3xl font-bold text-red-600 mt-2">{totalAbsent}</p></div>
                <div className="bg-white shadow rounded-lg p-6"><p className="text-sm text-gray-600">Retards</p><p className="text-3xl font-bold text-yellow-600 mt-2">{totalLate}</p></div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200"><h3 className="text-lg font-semibold text-[#312e81]">Details par classe</h3></div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classe</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Effectif</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Presents</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Absents</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Retards</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Taux</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {attendanceData.map((data) => (
                            <tr key={String(data.classId)} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{data.className}</td>
                                <td className="px-6 py-4 text-center text-sm text-gray-900">{data.totalStudents}</td>
                                <td className="px-6 py-4 text-center text-sm text-gray-900">{data.sessionsCount}</td>
                                <td className="px-6 py-4 text-center text-sm text-green-700">{data.presentCount}</td>
                                <td className="px-6 py-4 text-center text-sm text-red-700">{data.absentCount}</td>
                                <td className="px-6 py-4 text-center text-sm text-yellow-700">{data.lateCount}</td>
                                <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">{data.attendanceRate}%</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
