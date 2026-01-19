"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import departmentService from '../../../../services/departmentService';
import userService from '../../../../services/userService';
import reportService from '../../../../services/reportService';

export default function TeacherAttendanceReportPage() {
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [rows, setRows] = useState([]);

    const [filters, setFilters] = useState({
        departmentId: 'all',
        teacherId: 'all',
        status: 'all',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        const init = async () => {
            try {
                const deptData = await departmentService.getAll();
                setDepartments(Array.isArray(deptData) ? deptData : []);
            } catch (error) {
                toast.error(error.message || 'Impossible de charger les departements.');
            }
        };

        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        setFilters(prev => ({
            ...prev,
            startDate: weekAgo.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0]
        }));

        init();
    }, []);

    useEffect(() => {
        const loadTeachers = async () => {
            if (filters.departmentId === 'all') {
                setTeachers([]);
                return;
            }
            try {
                const data = await userService.getUsersByRoleAndDepartment('TEACHER', filters.departmentId);
                setTeachers(Array.isArray(data) ? data : []);
            } catch (error) {
                toast.error(error.message || 'Impossible de charger les enseignants.');
            }
        };
        loadTeachers();
    }, [filters.departmentId]);

    const statusOptions = useMemo(() => (
        [
            { value: 'all', label: 'Tous les statuts' },
            { value: 'present', label: 'Present' },
            { value: 'absent', label: 'Absent' },
            { value: 'late', label: 'Retard' },
        ]
    ), []);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleFetch = async () => {
        try {
            setLoading(true);
            const data = await reportService.getTeacherAttendanceList({
                departmentId: filters.departmentId === 'all' ? undefined : filters.departmentId,
                teacherId: filters.teacherId === 'all' ? undefined : filters.teacherId,
                status: filters.status === 'all' ? undefined : filters.status,
                startDate: filters.startDate || undefined,
                endDate: filters.endDate || undefined,
            });
            setRows(data);
        } catch (error) {
            toast.error(error.message || 'Impossible de charger les presences.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-2xl p-6 border border-slate-100">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Rapport des presences enseignants</h1>
                        <p className="text-sm text-slate-500 mt-1">Consultez et exportez les listes de presences par periode.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleFetch}
                            className="px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-sm font-medium hover:bg-violet-600"
                        >
                            Actualiser
                        </button>
                        <Link
                            href="/admin/reports"
                            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Retour rapports
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-2xl p-6 border border-slate-100">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-2">Departement</label>
                        <select
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                            value={filters.departmentId}
                            onChange={(e) => handleFilterChange('departmentId', e.target.value)}
                        >
                            <option value="all">Tous les departements</option>
                            {departments.map((dept) => (
                                <option key={dept.departmentId} value={dept.departmentId}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-2">Enseignant</label>
                        <select
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                            value={filters.teacherId}
                            onChange={(e) => handleFilterChange('teacherId', e.target.value)}
                            disabled={filters.departmentId === 'all'}
                        >
                            <option value="all">Tous les enseignants</option>
                            {teachers.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-2">Statut</label>
                        <select
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-2">Date debut</label>
                        <input
                            type="date"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-2">Date fin</label>
                        <input
                            type="date"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-2xl border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-800">Liste des presences</h2>
                    <span className="text-sm text-slate-500">{rows.length} ligne(s)</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Enseignant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Departement</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cours</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {rows.map((row) => (
                                <tr key={row.id || `${row.teacherId}-${row.date}-${row.course}`}>
                                    <td className="px-6 py-4 text-sm text-slate-900">{row.teacherName || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{row.departmentName || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{row.date || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{row.courseName || '-'}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                            {row.status || '-'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!loading && rows.length == 0 && (
                    <div className="px-6 py-10 text-center text-sm text-slate-500">
                        Aucune presence a afficher pour les filtres selectionnes.
                    </div>
                )}
                {loading && (
                    <div className="px-6 py-10 text-center text-sm text-slate-500">
                        Chargement des presences...
                    </div>
                )}
            </div>
        </div>
    );
}
