"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import subjectService from '@/services/subjectService';

export default function SubjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const subjectId = params.id;

    const [subject, setSubject] = useState(null);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [subjectId]);

    const normalizeSubject = (data) => {
        if (!data) return null;
        return {
            id: data.subjectId || data.id || subjectId,
            libelle: data.name || data.libelle || '--',
            code: data.code || '--',
            description: data.description || '',
            credits: data.credits || 0,
            heuresCoursParSemaine: data.heuresCoursParSemaine || 0,
            department: data.department || data.departement || null,
            teacher: data.teacher || null,
            createdAt: data.createdDate || data.createdAt || null,
            completedSessions: data.completedSessions || 0,
            totalSessions: data.totalSessions || 0,
        };
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const subjectData = await subjectService.getById(subjectId);
            setSubject(normalizeSubject(subjectData));
            setClasses([]);
        } catch (error) {
            toast.error(error.message || "Erreur lors du chargement des donnees");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Etes-vous sur de vouloir supprimer cette matiere ?")) return;
        try {
            await subjectService.remove(subjectId);
            toast.success("Matiere supprimee avec succes");
            router.push('/chief/subjects');
        } catch (error) {
            toast.error(error.message || "Erreur lors de la suppression");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7c3aed]"></div>
            </div>
        );
    }

    if (!subject) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600">Matiere non trouvee</p>
                    <Link href="/chief/subjects" className="mt-4 text-[#7c3aed] hover:underline">
                        Retour a la liste
                    </Link>
                </div>
            </div>
        );
    }

    const progressPercentage = subject.totalSessions > 0
        ? Math.round((subject.completedSessions / subject.totalSessions) * 100)
        : 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-[#312e81]">{subject.libelle}</h1>
                    <p className="text-gray-600 mt-1">Code: {subject.code}</p>
                </div>
                <div className="flex space-x-2">
                    <Link href={`/chief/subjects/${subjectId}/edit`}>
                        <Button>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                            </svg>
                            Modifier
                        </Button>
                    </Link>
                    <Button variant="secondary" onClick={handleDelete}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Supprimer
                    </Button>
                    <Link href="/chief/subjects">
                        <Button variant="secondary">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                            Retour
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="text-sm text-gray-500">Credits</div>
                    <div className="mt-2 text-2xl font-semibold text-gray-900">{subject.credits}</div>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="text-sm text-gray-500">Heures / semaine</div>
                    <div className="mt-2 text-2xl font-semibold text-gray-900">{subject.heuresCoursParSemaine}h</div>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="text-sm text-gray-500">Avancement</div>
                    <div className="mt-2 text-2xl font-semibold text-gray-900">{progressPercentage}%</div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-[#312e81] mb-4">Informations generales</h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Code</dt>
                        <dd className="text-sm text-gray-900 mt-1">{subject.code}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Departement</dt>
                        <dd className="text-sm text-gray-900 mt-1">{subject.department?.name || '--'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Enseignant</dt>
                        <dd className="text-sm text-gray-900 mt-1">{subject.teacher?.name || '--'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Email enseignant</dt>
                        <dd className="text-sm text-gray-900 mt-1">{subject.teacher?.email || '--'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Cree le</dt>
                        <dd className="text-sm text-gray-900 mt-1">
                            {subject.createdAt ? new Date(subject.createdAt).toLocaleDateString('fr-FR') : '--'}
                        </dd>
                    </div>
                </dl>

                {subject.description && (
                    <div className="mt-6">
                        <dt className="text-sm font-medium text-gray-500">Description</dt>
                        <dd className="text-sm text-gray-900 mt-2 leading-relaxed">{subject.description}</dd>
                    </div>
                )}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-[#312e81] mb-4">Classes concernees</h2>
                {classes.length === 0 ? (
                    <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-6 text-center">
                        Aucune classe associee pour le moment.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {classes.map((classe) => (
                            <div key={classe.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="font-semibold text-gray-900">{classe.name}</div>
                                <div className="text-sm text-gray-500">{classe.code}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
