"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import publicAttendanceService from '@/services/publicAttendanceService';

const statusConfig = {
    PRESENT: {
        label: 'Présent',
        badge: 'bg-white text-[#2b145a] border-[#2b145a]',
        dot: 'bg-emerald-500',
    },
    ABSENT: {
        label: 'Absent',
        badge: 'bg-black text-white border-black',
        dot: 'bg-rose-500',
    },
    LATE: {
        label: 'Retard',
        badge: 'bg-[#4b1f8f] text-white border-[#4b1f8f]',
        dot: 'bg-amber-500',
    },
    UNKNOWN: {
        label: 'Inconnu',
        badge: 'bg-white text-slate-700 border-slate-400',
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

function ConsultationPresencesPageContent() {
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
        <div className="min-h-screen bg-[#f3f0fa] pt-24 pb-12 text-slate-900">
            <section className="w-full px-0 sm:px-0 lg:px-0">
                <div className="overflow-hidden border-y border-[#2b145a] bg-white shadow-sm">
                    <div className="border-b border-[#2b145a] px-6 py-8 text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#4b1f8f]">Portail de consultation</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1f123d]">
                            Gestion des Presences Academiques
                        </h1>
                        <p className="mt-2 text-sm text-slate-600">
                            Consultation publique des presences par matricule etudiant
                        </p>
                    </div>

                    <div className="border-b border-[#2b145a] bg-[#24113f] px-4 py-0 text-sm text-white">
                        <div className="flex flex-wrap items-center gap-0">
                            <div className="border-r border-[#4b1f8f] px-4 py-3 font-medium text-white">CONSULTATION DES PRESENCES</div>
                            <div className="border-r border-[#4b1f8f] px-4 py-3 text-slate-300">Saisie du matricule</div>
                            <div className="px-4 py-3 text-slate-300">Resultats de presence</div>
                        </div>
                    </div>

                    <div className="px-6 py-10">
                        <form onSubmit={handleSubmit} className="mx-auto max-w-5xl">
                            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
                                <div>
                                    <label htmlFor="matricule" className="mb-2 block text-sm font-semibold text-[#1f123d]">
                                        Matricule de l&apos;etudiant
                                    </label>
                                    <input
                                        id="matricule"
                                        type="text"
                                        value={matricule}
                                        onChange={(event) => setMatricule(event.target.value.toUpperCase())}
                                        placeholder="Ex: 22P368"
                                        className="w-full rounded-sm border border-[#2b145a] bg-white px-4 py-3 text-sm uppercase tracking-wide text-[#1f123d] outline-none transition focus:border-[#4b1f8f] focus:ring-2 focus:ring-[#d9cff0]"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="self-end rounded-sm bg-[#4b1f8f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3b1771] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {loading ? 'Recherche...' : 'Valider'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="self-end rounded-sm bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1a1a1a]"
                                >
                                    Reinitialiser
                                </button>
                            </div>
                        </form>

                        <div className="mt-10 border-t border-[#d9cff0] pt-8">
                            {error && (
                                <div className="mb-6 rounded-sm border border-black bg-[#f5f2fb] px-4 py-3 text-sm text-black">
                                    {error}
                                </div>
                            )}

                            {!result && !error && !loading && (
                                <div className="rounded-sm border border-[#d9cff0] bg-[#faf8ff] px-6 py-8 text-center text-sm text-slate-600">
                                    Saisissez un matricule pour consulter les cours, les horaires et les statuts de presence.
                                </div>
                            )}

                            {result && (
                                <div className="space-y-8">
                                    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                                        <div className="rounded-sm border border-[#d9cff0] bg-[#faf8ff] p-5">
                                            <h2 className="text-xl font-semibold text-[#1f123d]">Informations etudiant</h2>
                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                <div>
                                                    <p className="text-xs uppercase tracking-wide text-slate-500">Nom</p>
                                                    <p className="mt-1 text-sm font-semibold text-[#1f123d]">{result.student?.name || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs uppercase tracking-wide text-slate-500">Matricule</p>
                                                    <p className="mt-1 text-sm font-semibold text-[#1f123d]">{result.student?.matricule || matricule}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs uppercase tracking-wide text-slate-500">Classe</p>
                                                    <p className="mt-1 text-sm font-semibold text-[#1f123d]">{result.student?.className || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs uppercase tracking-wide text-slate-500">Departement</p>
                                                    <p className="mt-1 text-sm font-semibold text-[#1f123d]">{result.student?.departmentName || '-'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="rounded-sm border border-[#2b145a] bg-white p-4">
                                                <p className="text-xs uppercase tracking-wide text-[#2b145a]">Presents</p>
                                                <p className="mt-2 text-3xl font-bold text-[#2b145a]">{stats.PRESENT}</p>
                                            </div>
                                            <div className="rounded-sm border border-black bg-white p-4">
                                                <p className="text-xs uppercase tracking-wide text-black">Absents</p>
                                                <p className="mt-2 text-3xl font-bold text-black">{stats.ABSENT}</p>
                                            </div>
                                            <div className="rounded-sm border border-[#4b1f8f] bg-white p-4">
                                                <p className="text-xs uppercase tracking-wide text-[#4b1f8f]">Retards</p>
                                                <p className="mt-2 text-3xl font-bold text-[#4b1f8f]">{stats.LATE}</p>
                                            </div>
                                            <div className="rounded-sm border border-[#d9cff0] bg-white p-4">
                                                <p className="text-xs uppercase tracking-wide text-slate-500">Cours recenses</p>
                                                <p className="mt-2 text-3xl font-bold text-[#1f123d]">{result.attendances.length}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="mb-4 flex items-center justify-between">
                                            <h2 className="text-2xl font-semibold text-[#1f123d]">Presences</h2>
                                            <p className="text-sm text-slate-500">{result.attendances.length} ligne(s) retournees</p>
                                        </div>

                                        <div className="overflow-x-auto border border-[#2b145a] bg-white">
                                            <table className="min-w-full border-collapse text-sm">
                                                <thead className="bg-[#24113f] text-white">
                                                    <tr>
                                                        <th className="border border-[#4b1f8f] px-4 py-3 text-left font-semibold">Unite d&apos;enseignement</th>
                                                        <th className="border border-[#4b1f8f] px-4 py-3 text-left font-semibold">Date</th>
                                                        <th className="border border-[#4b1f8f] px-4 py-3 text-left font-semibold">Jour</th>
                                                        <th className="border border-[#4b1f8f] px-4 py-3 text-left font-semibold">Horaire</th>
                                                        <th className="border border-[#4b1f8f] px-4 py-3 text-left font-semibold">Enseignant</th>
                                                        <th className="border border-[#4b1f8f] px-4 py-3 text-left font-semibold">Statut</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {result.attendances.length === 0 && (
                                                        <tr>
                                                            <td colSpan={6} className="border border-[#d9cff0] px-4 py-8 text-center text-slate-500">
                                                                Aucune presence n&apos;a ete retournee pour ce matricule.
                                                            </td>
                                                        </tr>
                                                    )}

                                                    {result.attendances.map((attendance, index) => {
                                                        const currentStatus = statusConfig[attendance.status] || statusConfig.UNKNOWN;
                                                        return (
                                                            <tr key={attendance.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#f8f4ff]'}>
                                                                <td className="border border-[#d9cff0] px-4 py-3 align-top">
                                                                    <div className="font-semibold text-[#1f123d]">
                                                                        {attendance.subjectCode ? `[${attendance.subjectCode}] ` : ''}
                                                                        {attendance.subjectName}
                                                                    </div>
                                                                    <div className="mt-1 text-xs text-slate-500">{attendance.className}</div>
                                                                </td>
                                                                <td className="border border-[#d9cff0] px-4 py-3 align-top text-slate-700">
                                                                    {formatDate(attendance.sessionDate)}
                                                                </td>
                                                                <td className="border border-[#d9cff0] px-4 py-3 align-top text-slate-700">
                                                                    {attendance.day || '--'}
                                                                </td>
                                                                <td className="border border-[#d9cff0] px-4 py-3 align-top text-slate-700">
                                                                    {normalizeHour(attendance.startHour)} - {normalizeHour(attendance.endHour)}
                                                                </td>
                                                                <td className="border border-[#d9cff0] px-4 py-3 align-top text-slate-700">
                                                                    {attendance.teacherName}
                                                                </td>
                                                                <td className="border border-[#d9cff0] px-4 py-3 align-top">
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

export default function ConsultationPresencesPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#f3f0fa] pt-24 pb-12 text-slate-900">
                    <section className="w-full px-0 sm:px-0 lg:px-0">
                        <div className="overflow-hidden border-y border-[#2b145a] bg-white shadow-sm">
                            <div className="border-b border-[#2b145a] px-6 py-6 text-center">
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#4b1f8f]">Portail de consultation</p>
                                <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1f123d]">
                                    Gestion des Presences Academiques
                                </h1>
                            </div>
                            <div className="px-6 py-16 text-center text-sm text-slate-500">
                                Chargement de la consultation des presences...
                            </div>
                        </div>
                    </section>
                </div>
            }
        >
            <ConsultationPresencesPageContent />
        </Suspense>
    );
}
