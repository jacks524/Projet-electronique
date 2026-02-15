"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '../../../../context/authContext';
import departmentService from '../../../../services/departmentService';
import userService from '../../../../services/userService';
import classService from '../../../../services/classService';
import timetableService from '../../../../services/timetableService';
import reportService from '../../../../services/reportService';
import Button from '../../../../components/ui/Button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

export default function TeachersReportPage() {
    const { user } = useAuthContext();
    const [loading, setLoading] = useState(true);
    const [teachers, setTeachers] = useState([]);
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
        loadTeachers();
    }, [user]);

    const loadTeachers = async () => {
        try {
            setLoading(true);
            const allDepartments = await departmentService.getAll();
            const targetDepartment = resolveDepartment(Array.isArray(allDepartments) ? allDepartments : []);
            if (!targetDepartment) throw new Error('Departement non trouve');

            const teachersData = await userService.getUsersByRoleAndDepartment('TEACHER', targetDepartment.departmentId);
            const teacherList = Array.isArray(teachersData) ? teachersData : [];

            const enrichedTeachers = await Promise.all(teacherList.map(async (teacher) => {
                const teacherId = teacher.id;

                let classesData = [];
                try {
                    classesData = await classService.getByTeacher(teacherId);
                } catch {
                    classesData = [];
                }
                const classList = Array.isArray(classesData) ? classesData : [];
                const totalClasses = classList.length;
                const totalStudents = classList.reduce((sum, c) => sum + toNumber(c.studentNumber ?? c.studentCount, 0), 0);

                let hoursPerWeek = 0;
                try {
                    const timetables = await timetableService.getByTeacher(teacherId);
                    const list = Array.isArray(timetables) ? timetables : [];
                    list.forEach((tt) => {
                        const schedules = Array.isArray(tt?.schedules) ? tt.schedules : [];
                        schedules.forEach((s) => {
                            hoursPerWeek += computeDuration(s.startHour, s.endHour);
                        });
                    });
                } catch {
                    hoursPerWeek = 0;
                }

                let present = 0;
                let late = 0;
                let total = 0;
                try {
                    const rows = await reportService.getTeacherAttendanceList({ departmentId: targetDepartment.departmentId, teacherId, status: 'all' });
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
                const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

                const activeValue = typeof teacher.active === 'boolean' ? teacher.active : true;

                return {
                    ...teacher,
                    totalClasses,
                    totalStudents,
                    hoursPerWeek,
                    attendanceRate,
                    status: activeValue ? 'active' : 'inactive',
                };
            }));

            setTeachers(enrichedTeachers);
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors du chargement des enseignants');
        } finally {
            setLoading(false);
        }
    };

    const filteredTeachers = teachers.filter((teacher) =>
        (teacher.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedTeachers = [...filteredTeachers].sort((a, b) => {
        let aValue;
        let bValue;

        if (sortBy === 'name') {
            aValue = (a.name || '').toLowerCase();
            bValue = (b.name || '').toLowerCase();
        } else if (sortBy === 'classes') {
            aValue = a.totalClasses;
            bValue = b.totalClasses;
        } else if (sortBy === 'students') {
            aValue = a.totalStudents;
            bValue = b.totalStudents;
        } else if (sortBy === 'hours') {
            aValue = a.hoursPerWeek;
            bValue = b.hoursPerWeek;
        } else {
            aValue = a.attendanceRate;
            bValue = b.attendanceRate;
        }

        if (sortOrder === 'asc') return aValue > bValue ? 1 : -1;
        return aValue < bValue ? 1 : -1;
    });

    const totalHours = teachers.reduce((sum, t) => sum + t.hoursPerWeek, 0);
    const avgStudents = teachers.length > 0 ? Math.round(teachers.reduce((sum, t) => sum + t.totalStudents, 0) / teachers.length) : 0;
    const avgRate = teachers.length > 0 ? Math.round(teachers.reduce((sum, t) => sum + t.attendanceRate, 0) / teachers.length) : 0;

    const handleExportCSV = () => {
        const header = ['Enseignant', 'Email', 'Classes', 'Etudiants', 'Heures/Semaine', 'Taux Presence', 'Statut'];
        const rows = sortedTeachers.map((t) => [
            t.name || '---',
            t.email || '---',
            String(t.totalClasses || 0),
            String(t.totalStudents || 0),
            String(t.hoursPerWeek || 0),
            `${t.attendanceRate || 0}%`,
            t.status === 'active' ? 'Actif' : 'Inactif',
        ]);
        const csv = [header, ...rows].map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `rapport-enseignants-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        toast.success('Export CSV termine.');
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text('Rapport des enseignants', 14, 16);
        doc.setFontSize(10);
        doc.text(`Genere le ${new Date().toLocaleString('fr-FR')}`, 14, 22);

        autoTable(doc, {
            startY: 28,
            head: [['Enseignant', 'Classes', 'Etudiants', 'Heures/sem', 'Taux', 'Statut']],
            body: sortedTeachers.map((t) => [
                t.name || '---',
                String(t.totalClasses || 0),
                String(t.totalStudents || 0),
                String(t.hoursPerWeek || 0),
                `${t.attendanceRate || 0}%`,
                t.status === 'active' ? 'Actif' : 'Inactif',
            ]),
            headStyles: { fillColor: [124, 58, 237] },
        });

        doc.save(`rapport-enseignants-${new Date().toISOString().split('T')[0]}.pdf`);
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
                        <h1 className="text-2xl font-bold text-[#312e81]">Rapport des enseignants</h1>
                        <p className="text-gray-600 mt-2">Vue d&apos;ensemble de {teachers.length} enseignant(s)</p>
                    </div>
                    <div className="flex space-x-2">
                        <Button onClick={handleExportCSV} variant="secondary">Exporter CSV</Button>
                        <Button onClick={handleExportPDF} variant="secondary">Exporter PDF</Button>
                        <Link href="/chief/reports"><Button variant="secondary">Retour</Button></Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6"><p className="text-sm text-gray-600">Total enseignants</p><p className="text-3xl font-bold text-[#312e81] mt-2">{teachers.length}</p></div>
                <div className="bg-white shadow rounded-lg p-6"><p className="text-sm text-gray-600">Total heures/sem.</p><p className="text-3xl font-bold text-green-600 mt-2">{totalHours}h</p></div>
                <div className="bg-white shadow rounded-lg p-6"><p className="text-sm text-gray-600">Moy. etudiants</p><p className="text-3xl font-bold text-purple-600 mt-2">{avgStudents}</p></div>
                <div className="bg-white shadow rounded-lg p-6"><p className="text-sm text-gray-600">Taux moyen presence</p><p className="text-3xl font-bold text-violet-600 mt-2">{avgRate}%</p></div>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <input type="text" placeholder="Rechercher un enseignant..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full md:max-w-md px-3 py-2 border border-gray-300 rounded-md sm:text-sm" />
                    <div className="flex space-x-2">
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md sm:text-sm">
                            <option value="name">Nom</option>
                            <option value="classes">Nombre de classes</option>
                            <option value="students">Nombre d&apos;etudiants</option>
                            <option value="hours">Heures/semaine</option>
                            <option value="rate">Taux de presence</option>
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enseignant</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Classes</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Etudiants</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Heures/sem.</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Taux</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {sortedTeachers.map((teacher) => (
                            <tr key={teacher.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{teacher.name}</div><div className="text-sm text-gray-500">{teacher.email}</div></td>
                                <td className="px-6 py-4 text-center text-sm">{teacher.totalClasses}</td>
                                <td className="px-6 py-4 text-center text-sm">{teacher.totalStudents}</td>
                                <td className="px-6 py-4 text-center text-sm">{teacher.hoursPerWeek}h</td>
                                <td className="px-6 py-4 text-center text-sm font-medium">{teacher.attendanceRate}%</td>
                                <td className="px-6 py-4 text-center text-sm">{teacher.status === 'active' ? 'Actif' : 'Inactif'}</td>
                                <td className="px-6 py-4 text-center text-sm font-medium"><Link href={`/chief/teachers/${teacher.id}`} className="text-[#7c3aed] hover:text-[#6d28d9]">Details</Link></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
