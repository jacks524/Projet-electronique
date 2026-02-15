"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '../../../context/authContext';
import reportService from '../../../services/reportService';
import departmentService from '../../../services/departmentService';
import userService from '../../../services/userService';
import classService from '../../../services/classService';
import attendanceService from '../../../services/attendanceService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

export default function ChiefDashboard() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuthContext();

    const [loading, setLoading] = useState(true);
    const [departmentInfo, setDepartmentInfo] = useState({
        id: null,
        name: '',
        stats: { teachers: 0, students: 0, classes: 0, attendanceRate: 0 },
        recentTeachers: [],
        topClasses: []
    });
    const [recentActivity, setRecentActivity] = useState([]);

    const getDefaultDateRange = () => {
        const today = new Date();
        const monthAgo = new Date();
        monthAgo.setDate(today.getDate() - 30);
        return {
            startDate: monthAgo.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
        };
    };

    const getSessionId = (row) => row?.attendanceSessionId || row?.sessionId || row?.id || null;

    const toSafeNumber = (value, fallback = 0) => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const parsed = Number.parseInt(value, 10);
            if (!Number.isNaN(parsed)) return parsed;
        }
        return fallback;
    };

    const calculateAttendanceRate = async (departmentId) => {
        try {
            const range = getDefaultDateRange();
            const rows = await reportService.getTeacherAttendanceList({
                departmentId,
                startDate: range.startDate,
                endDate: range.endDate,
                status: 'all',
            });

            const sessions = Array.isArray(rows) ? rows : [];
            if (sessions.length === 0) return 0;

            let present = 0;
            let late = 0;
            let total = 0;

            await Promise.all(
                sessions.slice(0, 120).map(async (row) => {
                    const sessionId = getSessionId(row);
                    if (!sessionId) return;
                    try {
                        const details = await attendanceService.getSessionDetails(sessionId);
                        const list = Array.isArray(details) ? details : [];
                        const p = list.filter((d) => (d.attendanceStatus || d.status || '').toUpperCase() === 'PRESENT').length;
                        const l = list.filter((d) => (d.attendanceStatus || d.status || '').toUpperCase() === 'LATE').length;
                        present += p;
                        late += l;
                        total += list.length;
                    } catch {
                        const p = toSafeNumber(row.presentCount ?? row.totalPresent ?? row.present, 0);
                        const l = toSafeNumber(row.lateCount ?? row.totalLate ?? row.late, 0);
                        const t = toSafeNumber(row.totalStudents ?? row.total, p + l);
                        present += p;
                        late += l;
                        total += t;
                    }
                })
            );

            if (total === 0) return 0;
            return Math.round(((present + late) / total) * 100);
        } catch {
            return 0;
        }
    };

    useEffect(() => {
        if (authLoading) return;
        const userRole = user?.role?.toUpperCase();
        if (!isAuthenticated || (userRole !== 'DEPARTMENT_MANAGER' && userRole !== 'ADMIN')) {
            router.push('/auth/login');
            return;
        }
        loadDashboardData();
    }, [user, isAuthenticated, authLoading, router]);

    const resolveDepartment = (departmentsList) => {
        if (user?.departmentIdIfChief) {
            return departmentsList.find((dept) => dept.departmentId === user.departmentIdIfChief);
        }
        if (Array.isArray(user?.departmentsIds) && user.departmentsIds.length > 0) {
            return departmentsList.find((dept) => dept.departmentId === user.departmentsIds[0]);
        }
        if (Array.isArray(user?.departmentNames) && user.departmentNames.length > 0) {
            return departmentsList.find((dept) => dept.name === user.departmentNames[0]);
        }
        return null;
    };

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const departments = await departmentService.getAll();
            const targetDepartment = resolveDepartment(Array.isArray(departments) ? departments : []);

            if (!targetDepartment) {
                throw new Error("Aucun departement n'est assigne a votre compte.");
            }

            const [teachers, classes, recent, attendanceRate] = await Promise.all([
                userService.getUsersByRoleAndDepartment('TEACHER', targetDepartment.departmentId),
                classService.getByDepartment(targetDepartment.departmentId),
                reportService.getRecentActivity(5, targetDepartment.departmentId),
                calculateAttendanceRate(targetDepartment.departmentId),
            ]);

            const classesList = Array.isArray(classes) ? classes : [];
            const totalStudents = classesList.reduce((sum, cls) => sum + (cls.studentNumber || 0), 0);
            const teachersList = Array.isArray(teachers) ? teachers : [];

            const recentTeachers = [...teachersList]
                .sort((a, b) => new Date(b.createdDate || 0) - new Date(a.createdDate || 0))
                .slice(0, 3)
                .map((teacher) => ({
                    id: teacher.id,
                    nom: teacher.name,
                    email: teacher.email,
                    dateAjout: teacher.createdDate
                }));

            const topClasses = [...classesList]
                .sort((a, b) => (b.studentNumber || 0) - (a.studentNumber || 0))
                .slice(0, 3)
                .map((classe) => ({
                    id: classe.classId,
                    nom: classe.name,
                    etudiantsCount: classe.studentNumber || 0
                }));

            setDepartmentInfo({
                id: targetDepartment.departmentId,
                name: targetDepartment.name,
                stats: {
                    teachers: teachersList.length,
                    students: totalStudents,
                    classes: classesList.length,
                    attendanceRate
                },
                recentTeachers,
                topClasses
            });
            setRecentActivity(Array.isArray(recent) ? recent : []);

        } catch (error) {
            toast.error(error.message || "Erreur de chargement du dashboard.");
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon, color, href, trend }) => {
        const Card = (
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                    <div className={`w-full h-full rounded-full bg-gradient-to-br ${color} transform translate-x-8 -translate-y-8`}></div>
                </div>

                <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}>
                            {icon}
                        </div>
                        {trend && (
                            <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                                {trend}%
                            </div>
                        )}
                    </div>
                    <div className="text-3xl font-bold text-slate-800 mb-1">
                        {Number.isFinite(value) ? value.toLocaleString() : 0}
                    </div>
                    <div className="text-sm text-slate-500 font-medium">{title}</div>
                </div>
            </div>
        );

        if (href) {
            return (
                <Link href={href} className="group">
                    {Card}
                </Link>
            );
        }

        return Card;
    };

    const QuickActionCard = ({ title, description, icon, color, href }) => (
        <Link href={href}>
            <div className={`bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 border-l-4 ${color} group cursor-pointer`}>
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${color.replace("border-", "from-").replace("-500", "-100")} ${color.replace("border-", "to-").replace("-500", "-200")}`}>
                        {icon}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-violet-600 transition-colors">{title}</h3>
                        <p className="text-xs text-slate-500">{description}</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </Link>
    );

    const getActivityMeta = (activity) => {
        const type = (activity?.type || activity?.action || activity?.category || activity?.description || "").toString().toLowerCase();

        if (type.includes("attendance") || type.includes("presence") || type.includes("session")) {
            return { bg: "bg-violet-100 text-violet-600", icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                </svg>
            ) };
        }

        if (type.includes("classe") || type.includes("class")) {
            return { bg: "bg-blue-100 text-blue-600", icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M4 21V4a1 1 0 011-1h14a1 1 0 011 1v17" />
                </svg>
            ) };
        }

        if (type.includes("teacher") || type.includes("enseignant") || type.includes("user")) {
            return { bg: "bg-emerald-100 text-emerald-600", icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ) };
        }

        return { bg: "bg-slate-100 text-slate-600", icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5h10M11 9h7M11 13h10M11 17h7M6 7h.01M6 11h.01M6 15h.01M6 19h.01" />
            </svg>
        ) };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Chargement des données...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
                    <p className="text-sm text-slate-500 mt-1">Département {departmentInfo.name}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            const header = ['Indicateur', 'Valeur'];
                            const rows = [
                                ['Departement', departmentInfo.name || '---'],
                                ['Enseignants', String(departmentInfo.stats.teachers || 0)],
                                ['Etudiants', String(departmentInfo.stats.students || 0)],
                                ['Classes', String(departmentInfo.stats.classes || 0)],
                                ['Taux de presence', `${departmentInfo.stats.attendanceRate || 0}%`],
                            ];
                            const csv = [header, ...rows]
                                .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
                                .join('\n');
                            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(blob);
                            link.download = `dashboard-chef-${new Date().toISOString().split('T')[0]}.csv`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(link.href);
                            toast.success('Export CSV termine.');
                        }}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Exporter
                        </span>
                    </button>
                    <button
                        onClick={() => {
                            const doc = new jsPDF();
                            doc.setFontSize(16);
                            doc.text('Rapport du departement', 14, 16);
                            doc.setFontSize(10);
                            doc.text(`Genere le ${new Date().toLocaleString('fr-FR')}`, 14, 22);
                            autoTable(doc, {
                                startY: 28,
                                head: [['Indicateur', 'Valeur']],
                                body: [
                                    ['Département', departmentInfo.name || '---'],
                                    ['Enseignants', String(departmentInfo.stats.teachers || 0)],
                                    ['Etudiants', String(departmentInfo.stats.students || 0)],
                                    ['Classes', String(departmentInfo.stats.classes || 0)],
                                    ['Taux de presence', `${departmentInfo.stats.attendanceRate || 0}%`],
                                ],
                                headStyles: { fillColor: [124, 58, 237] },
                            });
                            autoTable(doc, {
                                startY: doc.lastAutoTable.finalY + 8,
                                head: [['Activite recente', 'Date']],
                                body: (recentActivity || []).map((item) => [
                                    item.description || 'Activite',
                                    item.timestamp || '-',
                                ]),
                                headStyles: { fillColor: [49, 46, 129] },
                            });
                            doc.save(`rapport-chef-${new Date().toISOString().split('T')[0]}.pdf`);
                            toast.success('Rapport PDF généré.');
                        }}
                        className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors"
                    >
                        Générer rapport
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Etudiants"
                    value={departmentInfo.stats.students}
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.083 12.083 0 0112 21a12.083 12.083 0 01-6.16-10.422L12 14z" />
                        </svg>
                    }
                    color="from-violet-500 to-purple-600"
                    href="/chief/students"
                    trend={12}
                />
                <StatCard
                    title="Enseignants"
                    value={departmentInfo.stats.teachers}
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    }
                    color="from-blue-500 to-indigo-600"
                    href="/chief/teachers"
                    trend={8}
                />
                <StatCard
                    title="Classes"
                    value={departmentInfo.stats.classes}
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M4 21V4a1 1 0 011-1h14a1 1 0 011 1v17" />
                        </svg>
                    }
                    color="from-amber-500 to-violet-600"
                    href="/chief/classes"
                    trend={5}
                />
                <StatCard
                    title="Taux de présence"
                    value={departmentInfo.stats.attendanceRate}
                    icon={
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    color="from-green-500 to-emerald-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <QuickActionCard
                    title="Ajouter un enseignant"
                    description="Creer un enseignant dans le departement"
                    icon={
                        <svg className="w-5 h-5 text-violet-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                    }
                    color="border-violet-500"
                    href="/chief/teachers/create"
                />
                <QuickActionCard
                    title="Creer une classe"
                    description="Ajouter une nouvelle classe"
                    icon={
                        <svg className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M4 21V4a1 1 0 011-1h14a1 1 0 011 1v17" />
                        </svg>
                    }
                    color="border-amber-500"
                    href="/chief/classes/create"
                />
                <QuickActionCard
                    title="Emploi du temps"
                    description="Gerer les horaires du departement"
                    icon={
                        <svg className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    }
                    color="border-emerald-500"
                    href="/chief/timetables"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Derniers enseignants ajoutés</h2>
                        <Link href="/chief/teachers" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                            Voir tout
                        </Link>
                    </div>
                    {departmentInfo.recentTeachers.length === 0 ? (
                        <div className="text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-6 text-center">
                            Aucun enseignant récemment ajouté.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {departmentInfo.recentTeachers.map((teacher) => (
                                <div key={teacher.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-violet-100 text-violet-600">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-800 font-medium">{teacher.nom}</p>
                                        <p className="text-xs text-slate-500 mt-1">{teacher.email}</p>
                                    </div>
                                    <Link href={`/chief/teachers/${teacher.id}`} className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                                        Voir détails
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Classes les plus peuplees</h2>
                        <Link href="/chief/classes" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                            Voir tout
                        </Link>
                    </div>
                    {departmentInfo.topClasses.length === 0 ? (
                        <div className="text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-6 text-center">
                            Aucune classe disponible.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {departmentInfo.topClasses.map((classe) => (
                                <div key={classe.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M4 21V4a1 1 0 011-1h14a1 1 0 011 1v17" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-800 font-medium">{classe.nom}</p>
                                        <p className="text-xs text-slate-500 mt-1">{classe.etudiantsCount} étudiants</p>
                                    </div>
                                    <Link href={`/chief/classes/${classe.id}`} className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                                        Gérer
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Activité récente</h2>
                    <Link href="/chief/reports" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                        Voir tout
                    </Link>
                </div>
                {recentActivity.length === 0 ? (
                    <div className="text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-6 text-center">
                        Aucune activité récente disponible.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentActivity.map((activity) => {
                            const meta = getActivityMeta(activity);
                            return (
                                <div key={activity.id || `${activity.description}-${activity.timestamp}`} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${meta.bg} flex-shrink-0`}>
                                        {meta.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-800 font-medium">{activity.description || "Activite recente"}</p>
                                        <p className="text-xs text-slate-500 mt-1">{activity.timestamp || ""}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
