"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '../../../context/authContext';
import departmentService from '../../../services/departmentService';
import userService from '../../../services/userService';
import classService from '../../../services/classService';
import reportService from '../../../services/reportService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

export default function ReportsPage() {
    const { user } = useAuthContext();
    const [stats, setStats] = useState({ teachers: 0, students: 0, classes: 0, attendanceRate: 0 });
    const [departmentName, setDepartmentName] = useState('---');
    const [loading, setLoading] = useState(true);

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

    const getDefaultRange = () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        return {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
        };
    };

    useEffect(() => {
        loadStats();
    }, [user]);

    const loadStats = async () => {
        try {
            setLoading(true);
            const allDepartments = await departmentService.getAll();
            const targetDepartment = resolveDepartment(Array.isArray(allDepartments) ? allDepartments : []);
            if (!targetDepartment) throw new Error('Aucun departement assigne');

            const departmentId = targetDepartment.departmentId;
            setDepartmentName(targetDepartment.name || '---');
            const range = getDefaultRange();

            const [teachers, classes, rows] = await Promise.all([
                userService.getUsersByRoleAndDepartment('TEACHER', departmentId),
                classService.getByDepartment(departmentId),
                reportService.getTeacherAttendanceList({
                    departmentId,
                    startDate: range.startDate,
                    endDate: range.endDate,
                    status: 'all',
                }),
            ]);

            let present = 0;
            let late = 0;
            let total = 0;
            (Array.isArray(rows) ? rows : []).forEach((row) => {
                const p = toNumber(row.presentCount ?? row.totalPresent ?? row.present, 0);
                const l = toNumber(row.lateCount ?? row.totalLate ?? row.late, 0);
                const t = toNumber(row.totalStudents ?? row.total, p + l);
                present += p;
                late += l;
                total += t;
            });

            const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
            const classList = Array.isArray(classes) ? classes : [];
            const teacherList = Array.isArray(teachers) ? teachers : [];
            const totalStudents = classList.reduce((sum, c) => sum + (toNumber(c.studentNumber ?? c.studentCount, 0)), 0);

            setStats({
                teachers: teacherList.length,
                students: totalStudents,
                classes: classList.length,
                attendanceRate,
            });
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors du chargement des statistiques');
        } finally {
            setLoading(false);
        }
    };

    const exportCsv = () => {
        const data = [
            ['Departement', departmentName],
            ['Enseignants', String(stats.teachers || 0)],
            ['Etudiants', String(stats.students || 0)],
            ['Classes', String(stats.classes || 0)],
            ['Taux de presence', `${stats.attendanceRate || 0}%`],
        ];
        const csv = [['Indicateur', 'Valeur'], ...data]
            .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `rapports-chef-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        toast.success('Export CSV termine.');
    };

    const exportPdf = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Rapports du departement', 14, 16);
        doc.setFontSize(10);
        doc.text(`Genere le ${new Date().toLocaleString('fr-FR')}`, 14, 22);

        autoTable(doc, {
            startY: 28,
            head: [['Indicateur', 'Valeur']],
            body: [
                ['Departement', departmentName],
                ['Enseignants', String(stats.teachers || 0)],
                ['Etudiants', String(stats.students || 0)],
                ['Classes', String(stats.classes || 0)],
                ['Taux de presence', `${stats.attendanceRate || 0}%`],
            ],
            headStyles: { fillColor: [124, 58, 237] },
        });

        doc.save(`rapports-chef-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('Rapport PDF genere.');
    };

    const reportTypes = [
        {
            title: 'Rapport de presences',
            description: 'Consultez les statistiques de presence par classe, matiere et periode',
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            href: '/chief/reports/attendance',
            color: 'blue',
            stats: `${stats.attendanceRate}%`,
        },
        {
            title: 'Rapport des enseignants',
            description: 'Vue d ensemble des enseignants, leurs classes et leurs statistiques',
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            href: '/chief/reports/teachers',
            color: 'green',
            stats: `${stats.teachers}`,
        },
        {
            title: 'Rapport des classes',
            description: 'Statistiques par classe, effectifs et taux de presence',
            icon: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            href: '/chief/reports/classes',
            color: 'purple',
            stats: `${stats.classes}`,
        },
    ];

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
                <h1 className="text-2xl font-bold text-[#312e81]">Rapports et Statistiques</h1>
                <p className="text-gray-600 mt-2">Accedez aux differents rapports de votre departement</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6"><p className="text-sm text-gray-500">Enseignants</p><p className="text-2xl font-semibold text-gray-900">{stats.teachers}</p></div>
                <div className="bg-white shadow rounded-lg p-6"><p className="text-sm text-gray-500">Etudiants</p><p className="text-2xl font-semibold text-gray-900">{stats.students}</p></div>
                <div className="bg-white shadow rounded-lg p-6"><p className="text-sm text-gray-500">Classes</p><p className="text-2xl font-semibold text-gray-900">{stats.classes}</p></div>
                <div className="bg-white shadow rounded-lg p-6"><p className="text-sm text-gray-500">Taux de presence</p><p className="text-2xl font-semibold text-gray-900">{stats.attendanceRate}%</p></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reportTypes.map((report, index) => (
                    <Link key={index} href={report.href}>
                        <div className="bg-white shadow rounded-lg p-6 hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-violet-300 cursor-pointer group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">{report.icon}</div>
                                <span className="text-2xl font-bold text-violet-600">{report.stats}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-[#312e81] mb-2 group-hover:text-[#7c3aed] transition-colors">{report.title}</h3>
                            <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                            <div className="flex items-center text-sm text-[#7c3aed] font-medium">Consulter le rapport</div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-[#312e81] mb-4">Actions rapides</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={exportCsv} className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Exporter tous les rapports</button>
                    <button onClick={exportPdf} className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Imprimer les statistiques</button>
                    <Link href="/chief/reports/attendance" className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Analyser les presences</Link>
                </div>
            </div>
        </div>
    );
}
