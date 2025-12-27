"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';

export default function TimetableTeachersListPage() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // TODO: Appeler l'endpoint

            const mockTeachers = [
                {
                    id: 1,
                    name: 'Dr. Mamadou Diallo',
                    email: 'mamadou@email.com',
                    courseCount: 12,
                    hoursPerWeek: 18,
                    department: { name: 'Informatique' }
                },
                {
                    id: 2,
                    name: 'Prof. Aissatou Fall',
                    email: 'aissatou@email.com',
                    courseCount: 10,
                    hoursPerWeek: 15,
                    department: { name: 'Informatique' }
                }
            ];

            setTeachers(mockTeachers);
        } catch (error) {
            toast.error("Erreur lors du chargement");
        } finally {
            setLoading(false);
        }
    };

    const filteredTeachers = teachers.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F26419]"></div>
        </div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-[#1B396A]">Emplois du temps des enseignants</h1>
                <Link href="/chief/timetables">
                    <Button variant="secondary">Retour</Button>
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
                <input
                    type="text"
                    placeholder="Rechercher un enseignant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeachers.map((teacher) => (
                    <Link key={teacher.id} href={`/chief/timetables/teachers/${teacher.id}`}>
                        <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-2 border-transparent hover:border-[#F26419]">
                            <h3 className="text-lg font-bold text-[#1B396A]">{teacher.name}</h3>
                            <p className="text-sm text-gray-600">{teacher.email}</p>
                            <div className="mt-4 space-y-2">
                                <p className="text-sm text-gray-600">{teacher.courseCount} cours</p>
                                <p className="text-sm text-gray-600">{teacher.hoursPerWeek}h/semaine</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}