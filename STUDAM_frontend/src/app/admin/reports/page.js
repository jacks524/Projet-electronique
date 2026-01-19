"use client";

import Link from 'next/link';

export default function AdminReportsPage() {
    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-2xl p-6 border border-slate-100">
                <h1 className="text-2xl font-bold text-slate-800">Rapports</h1>
                <p className="text-sm text-slate-500 mt-1">Accedez aux rapports administratifs disponibles.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                    href="/admin/reports/attendance"
                    className="group bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-800 group-hover:text-violet-600">Presences enseignants</h2>
                            <p className="text-sm text-slate-500 mt-1">Liste des presences par periode et departement.</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
