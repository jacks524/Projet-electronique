"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '../../../../context/authContext';
import departmentService from '../../../../services/departmentService';
import classService from '../../../../services/classService';
import timetableService from '../../../../services/timetableService';
import reportService from '../../../../services/reportService';
import Button from '../../../../components/ui/Button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

export default function ClassesReportPage() {
    const { user } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

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

    const computeDuration = (startHour, endHour) => {
        if (!startHour || !endHour) return 0;
        const start = (toNumber(startHour.hour, 0) * 60) + toNumber(startHour.minute, 0);
        const end = (toNumber(endHour.hour, 0) * 60) + toNumber(endHour.minute, 0);
        return Math.max(Math.round((end - start) / 60), 0);
    };

    useEffect(() => {
        loadClasses();
    }, [user]);

    const loadClasses = async () => {
        try {
            setLoading(true);
            const allDepartments = await departmentService.getAll();
            const targetDepartment = resolveDepartment(Array.isArray(allDepartments) ? allDepartments : []);
            if (!targetDepartment) throw new Error('Aucun departement assigne');

            const classesData = await classService.getByDepartment(targetDepartment.departmentId);
            const classList = Array.isArray(classesData) ? classesData : [];

            const enrichedClasses = await Promise.all(classList.map(async (classe) => {
                const classId = classe.classId || classe.id;
                const totalStudents = toNumber(classe.studentNumber ?? classe.studentCount, 0);

                let schedules = [];
                try {
                    const timetable = await timetableService.getByClass(classId);
                    schedules = Array.isArray(timetable?.schedules) ? timetable.schedules : [];
                } catch {
                    schedules = [];
                }

                const subjectIds = new Set();
                const teacherIds = new Set();
                let hoursPerWeek = 0;

                schedules.forEach((s) => {
                    const sid = s.subject?.subjectId || s.subject?.id;
                    const tid = s.teacher?.id || s.teacherId;
                    if (sid) subjectIds.add(String(sid));
                    if (tid) teacherIds.add(String(tid));
                    hoursPerWeek += computeDuration(s.startHour, s.endHour);
                });

                let present = 0;
                let late = 0;
                let total = 0;
                try {
                    const rows = await reportService.getTeacherAttendanceList({ departmentId: targetDepartment.departmentId, classId, status: 'all' });
                    (Array.isArray(rows) ? rows : []).forEach((row) => {
                        const p = toNumber(row.presentCount ?? row.totalPresent ?? row.present, 0);
                        const l = toNumber(row.lateCount ?? row.totalLate ?? row.late, 0);
                        const t = toNumber(row.totalStudents ?? row.total, p + l);
                        present += p;
                        late += l;
                        total += t;
                    });
                } catch {
                    // continue
                }

                const presentRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

                return {
                    ...classe,
                    classId,
                    totalStudents,
                    totalSubjects: subjectIds.size,
                    teachersCount: teacherIds.size,
                    hoursPerWeek,
                    presentRate,
                };
            }));

            setClasses(enrichedClasses);
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors du chargement des classes');
        } finally {
            setLoading(false);
        }
    };

    const filteredClasses = classes.filter((classe) =>
        (classe.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (classe.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedClasses = [...filteredClasses].sort((a, b) => {
        let aValue;
        let bValue;
        if (sortBy === 'name') {
            aValue = (a.name || '').toLowerCase();
            bValue = (b.name || '').toLowerCase();
        } else if (sortBy === 'students') {
            aValue = a.totalStudents;
            bValue = b.totalStudents;
        } else if (sortBy === 'rate') {
            aValue = a.presentRate;
            bValue = b.presentRate;
        } else {
            aValue = a.totalSubjects;
            bValue = b.totalSubjects;
        }

        if (sortOrder === 'asc') return aValue > bValue ? 1 : -1;
        return aValue < bValue ? 1 : -1;
    });

    const totalStudents = classes.reduce((sum, c) => sum + c.totalStudents, 0);
    const avgRate = classes.length > 0 ? Math.round(classes.reduce((sum, c) => sum + c.presentRate, 0) / classes.length) : 0;
    const avgStudentsPerClass = classes.length > 0 ? Math.round(totalStudents / classes.length) : 0;

    const handleExportCSV = () => {
        const header = ['Classe', 'Code', 'Etudiants', 'Matieres', 'Enseignants', 'Heures/Semaine', 'Taux Presence'];
        const rows = sortedClasses.map((classe) => [
            classe.name || '---',
            classe.code || '---',
            String(classe.totalStudents || 0),
            String(classe.totalSubjects || 0),
            String(classe.teachersCount || 0),
            String(classe.hoursPerWeek || 0),
            `${classe.presentRate || 0}%`,
        ]);

        const csv = [header, ...rows]
            .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `rapport-classes-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        toast.success('Export CSV termine.');
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text('Rapport des classes', 14, 16);
        doc.setFontSize(10);
        doc.text(`Genere le ${new Date().toLocaleString('fr-FR')}`, 14, 22);

        autoTable(doc, {
            startY: 28,
            head: [['Classe', 'Code', 'Etudiants', 'Matieres', 'Enseignants', 'Heures/sem', 'Taux']],
            body: sortedClasses.map((classe) => [
                classe.name || '---',
                classe.code || '---',
                String(classe.totalStudents || 0),
                String(classe.totalSubjects || 0),
                String(classe.teachersCount || 0),
                String(classe.hoursPerWeek || 0),
                `${classe.presentRate || 0}%`,
            ]),
            headStyles: { fillColor: [124, 58, 237] },
        });

        doc.save(`rapport-classes-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('Rapport PDF genere.');
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed]"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-[#312e81]">Rapport des classes</h1>
                        <p className="text-gray-600 mt-2">Vue d&apos;ensemble de {classes.length} classe(s)</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button onClick={handleExportCSV} variant="secondary">Exporter CSV</Button>
                        <Button onClick={handleExportPDF} variant="secondary">Exporter PDF</Button>
                        <Link href="/chief/reports"><Button variant="secondary">Retour</Button></Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6"><p className="text-sm text-gray-600">Total classes</p><p className="text-3xl font-bold text-[#312e81] mt-2">{classes.length}</p></div>
                <div className="bg-white shadow rounded-lg p-6"><p className="text-sm text-gray-600">Total etudiants</p><p className="text-3xl font-bold text-green-600 mt-2">{totalStudents}</p></div>
                <div className="bg-white shadow rounded-lg p-6"><p className="text-sm text-gray-600">Moy./classe</p><p className="text-3xl font-bold text-purple-600 mt-2">{avgStudentsPerClass}</p></div>
                <div className="bg-white shadow rounded-lg p-6"><p className="text-sm text-gray-600">Taux moyen presence</p><p className="text-3xl font-bold text-violet-600 mt-2">{avgRate}%</p></div>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <input type="text" placeholder="Rechercher une classe..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full md:max-w-md px-3 py-2 border border-gray-300 rounded-md sm:text-sm" />
                    <div className="flex space-x-2">
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md sm:text-sm">
                            <option value="name">Nom</option>
                            <option value="students">Nombre d&apos;etudiants</option>
                            <option value="rate">Taux de presence</option>
                            <option value="subjects">Nombre de matieres</option>
                        </select>
                        <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">{sortOrder === 'asc' ? '↑' : '↓'}</button>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classe</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Effectif</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Matieres</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Enseignants</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Heures/sem.</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Taux presence</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {sortedClasses.map((classe) => (
                            <tr key={classe.classId} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{classe.name}</div><div className="text-sm text-gray-500">Code: {classe.code}</div></td>
                                <td className="px-6 py-4 text-center text-sm">{classe.totalStudents}</td>
                                <td className="px-6 py-4 text-center text-sm">{classe.totalSubjects}</td>
                                <td className="px-6 py-4 text-center text-sm">{classe.teachersCount}</td>
                                <td className="px-6 py-4 text-center text-sm">{classe.hoursPerWeek}</td>
                                <td className="px-6 py-4 text-center text-sm font-medium">{classe.presentRate}%</td>
                                <td className="px-6 py-4 text-center text-sm font-medium">
                                    <Link href={`/chief/classes/${classe.classId}`} className="text-[#7c3aed] hover:text-[#6d28d9] mr-3">Details</Link>
                                    <Link href={`/chief/timetables/classes/${classe.classId}`} className="text-blue-600 hover:text-blue-800">EDT</Link>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
