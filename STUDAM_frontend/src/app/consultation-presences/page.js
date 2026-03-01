"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import publicAttendanceService from '@/services/publicAttendanceService';

const statusConfig = {
    PRESENT: {
        label: 'Présent',
        badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
    },
    ABSENT: {
        label: 'Absent',
        badge: 'bg-rose-100 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
    },
    LATE: {
        label: 'Retard',
        badge: 'bg-amber-100 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
    },
    UNKNOWN: {
        label: 'Inconnu',
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
    },
};

const normalizeHour = (value) => {
    if (!value) return '--';
    if (typeof value === 'string') return value.slice(0, 5);
    if (typeof value === 'object' && value.hour !== undefined) {
        const hh = `${value.hour}`.padStart(2, '0');
        const mm = `${value.minute || 0}`.padStart(2, '0');
        return `${hh}:${mm}`;
    }
    return `${value}`;
};

const formatDate = (value) => {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return `${value}`;
    return date.toLocaleDateString('fr-FR');
};

export default function ConsultationPresencesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialMatricule = searchParams.get('matricule') || '';

    const [matricule, setMatricule] = useState(initialMatricule);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const loadAttendance = async (value) => {
        const normalizedMatricule = `${value || ''}`.trim().toUpperCase();
        if (!normalizedMatricule) {
            setError('Entrez un matricule etudiant valide.');
            setResult(null);
            return;
        }

        try {
            setLoading(true);
            setError('');
            const data = await publicAttendanceService.lookupStudentAttendance(normalizedMatricule);
            setResult(data);
        } catch (serviceError) {
            setResult(null);
            setError(serviceError.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialMatricule) {
            loadAttendance(initialMatricule);
        }
    }, [initialMatricule]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const normalizedMatricule = `${matricule || ''}`.trim().toUpperCase();
        if (!normalizedMatricule) {
            setError('Entrez un matricule etudiant valide.');
            setResult(null);
            return;
        }
        setMatricule(normalizedMatricule);
        router.replace(`/consultation-presences?matricule=${encodeURIComponent(normalizedMatricule)}`);
        if (normalizedMatricule === initialMatricule) {
            await loadAttendance(normalizedMatricule);
        }
    };

    const handleReset = () => {
        setMatricule('');
        setError('');
        setResult(null);
        router.replace('/consultation-presences');
    };

    const stats = useMemo(() => {
        const attendances = Array.isArray(result?.attendances) ? result.attendances : [];
        return attendances.reduce((accumulator, row) => {
            const key = row.status in statusConfig ? row.status : 'UNKNOWN';
            accumulator[key] += 1;
            return accumulator;
        }, { PRESENT: 0, ABSENT: 0, LATE: 0, UNKNOWN: 0 });
    }, [result]);

    return (
        <div className="min-h-screen bg-[#f4f4f4] pt-24 pb-12 text-slate-900">
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-sm border border-slate-300 bg-white shadow-sm">
                    <div className="border-b border-slate-300 px-6 py-6 text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">Portail de consultation</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-800">
                            Gestion des Presences Academiques
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Consultation publique des presences par matricule etudiant
                        </p>
                    </div>

                    <div className="border-b border-slate-300 bg-[#25303a] px-4 py-0 text-sm text-white">
                        <div className="flex flex-wrap items-center gap-0">
                            <div className="border-r border-slate-500 px-4 py-3 font-medium text-sky-100">CONSULTATION DES PRESENCES</div>
                            <div className="border-r border-slate-500 px-4 py-3 text-slate-300">Saisie du matricule</div>
                            <div className="px-4 py-3 text-slate-300">Resultats de presence</div>
                        </div>
                    </div>

                    <div className="px-4 py-8 sm:px-8">
                        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
                            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
                                <div>
                                    <label htmlFor="matricule" className="mb-2 block text-sm font-semibold text-slate-700">
                                        Matricule de l&apos;etudiant
                                    </label>
                                    <input
                                        id="matricule"
                                        type="text"
                                        value={matricule}
                                        onChange={(event) => setMatricule(event.target.value.toUpperCase())}
                                        placeholder="Ex: 22P368"
                                        className="w-full rounded-sm border border-slate-300 bg-white px-4 py-3 text-sm uppercase tracking-wide text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="self-end rounded-sm bg-[#58c7cf] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#44b5bd] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {loading ? 'Recherche...' : 'Valider'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="self-end rounded-sm bg-[#f0a32b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#dd921e]"
                                >
                                    Reinitialiser
                                </button>
                            </div>
                        </form>

                        <div className="mt-10 border-t border-slate-200 pt-8">
                            {error && (
                                <div className="mb-6 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                    {error}
                                </div>
                            )}

                            {!result && !error && !loading && (
                                <div className="rounded-sm border border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-500">
                                    Saisissez un matricule pour consulter les cours, les horaires et les statuts de presence.
                                </div>
                            )}

                            {result && (
                                <div className="space-y-8">
                                    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                                        <div className="rounded-sm border border-slate-200 bg-slate-50 p-5">
                                            <h2 className="text-xl font-semibold text-slate-800">Informations etudiant</h2>
                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                <div>
                                                    <p className="text-xs uppercase tracking-wide text-slate-500">Nom</p>
                                                    <p className="mt-1 text-sm font-semibold text-slate-800">{result.student?.name || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs uppercase tracking-wide text-slate-500">Matricule</p>
                                                    <p className="mt-1 text-sm font-semibold text-slate-800">{result.student?.matricule || matricule}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs uppercase tracking-wide text-slate-500">Classe</p>
                                                    <p className="mt-1 text-sm font-semibold text-slate-800">{result.student?.className || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs uppercase tracking-wide text-slate-500">Departement</p>
                                                    <p className="mt-1 text-sm font-semibold text-slate-800">{result.student?.departmentName || '-'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="rounded-sm border border-emerald-200 bg-emerald-50 p-4">
                                                <p className="text-xs uppercase tracking-wide text-emerald-700">Presents</p>
                                                <p className="mt-2 text-3xl font-bold text-emerald-700">{stats.PRESENT}</p>
                                            </div>
                                            <div className="rounded-sm border border-rose-200 bg-rose-50 p-4">
                                                <p className="text-xs uppercase tracking-wide text-rose-700">Absents</p>
                                                <p className="mt-2 text-3xl font-bold text-rose-700">{stats.ABSENT}</p>
                                            </div>
                                            <div className="rounded-sm border border-amber-200 bg-amber-50 p-4">
                                                <p className="text-xs uppercase tracking-wide text-amber-700">Retards</p>
                                                <p className="mt-2 text-3xl font-bold text-amber-700">{stats.LATE}</p>
                                            </div>
                                            <div className="rounded-sm border border-slate-200 bg-white p-4">
                                                <p className="text-xs uppercase tracking-wide text-slate-500">Cours recenses</p>
                                                <p className="mt-2 text-3xl font-bold text-slate-800">{result.attendances.length}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="mb-4 flex items-center justify-between">
                                            <h2 className="text-2xl font-semibold text-slate-800">Presences</h2>
                                            <p className="text-sm text-slate-500">{result.attendances.length} ligne(s) retournees</p>
                                        </div>

                                        <div className="overflow-x-auto border border-slate-300 bg-white">
                                            <table className="min-w-full border-collapse text-sm">
                                                <thead className="bg-slate-100 text-slate-700">
                                                    <tr>
                                                        <th className="border border-slate-300 px-4 py-3 text-left font-semibold">Unite d&apos;enseignement</th>
                                                        <th className="border border-slate-300 px-4 py-3 text-left font-semibold">Date</th>
                                                        <th className="border border-slate-300 px-4 py-3 text-left font-semibold">Jour</th>
                                                        <th className="border border-slate-300 px-4 py-3 text-left font-semibold">Horaire</th>
                                                        <th className="border border-slate-300 px-4 py-3 text-left font-semibold">Enseignant</th>
                                                        <th className="border border-slate-300 px-4 py-3 text-left font-semibold">Statut</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {result.attendances.length === 0 && (
                                                        <tr>
                                                            <td colSpan={6} className="border border-slate-300 px-4 py-8 text-center text-slate-500">
                                                                Aucune presence n&apos;a ete retournee pour ce matricule.
                                                            </td>
                                                        </tr>
                                                    )}

                                                    {result.attendances.map((attendance, index) => {
                                                        const currentStatus = statusConfig[attendance.status] || statusConfig.UNKNOWN;
                                                        return (
                                                            <tr key={attendance.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                                                <td className="border border-slate-300 px-4 py-3 align-top">
                                                                    <div className="font-semibold text-slate-800">
                                                                        {attendance.subjectCode ? `[${attendance.subjectCode}] ` : ''}
                                                                        {attendance.subjectName}
                                                                    </div>
                                                                    <div className="mt-1 text-xs text-slate-500">{attendance.className}</div>
                                                                </td>
                                                                <td className="border border-slate-300 px-4 py-3 align-top text-slate-700">
                                                                    {formatDate(attendance.sessionDate)}
                                                                </td>
                                                                <td className="border border-slate-300 px-4 py-3 align-top text-slate-700">
                                                                    {attendance.day || '--'}
                                                                </td>
                                                                <td className="border border-slate-300 px-4 py-3 align-top text-slate-700">
                                                                    {normalizeHour(attendance.startHour)} - {normalizeHour(attendance.endHour)}
                                                                </td>
                                                                <td className="border border-slate-300 px-4 py-3 align-top text-slate-700">
                                                                    {attendance.teacherName}
                                                                </td>
                                                                <td className="border border-slate-300 px-4 py-3 align-top">
                                                                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${currentStatus.badge}`}>
                                                                        <span className={`h-2.5 w-2.5 rounded-full ${currentStatus.dot}`}></span>
                                                                        {currentStatus.label}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
