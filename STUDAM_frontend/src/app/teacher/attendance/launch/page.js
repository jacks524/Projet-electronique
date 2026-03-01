"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../../../../context/authContext";
import attendanceService from "../../../../services/attendanceService";
import timetableService from "../../../../services/timetableService";
import toast from "react-hot-toast";

const dayKeys = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const dayLabels = {
    SUNDAY: "Dimanche",
    MONDAY: "Lundi",
    TUESDAY: "Mardi",
    WEDNESDAY: "Mercredi",
    THURSDAY: "Jeudi",
    FRIDAY: "Vendredi",
    SATURDAY: "Samedi",
};

const toTime = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value.slice(0, 5);
    if (typeof value === "object" && typeof value.hour === "number") {
        const hh = String(value.hour).padStart(2, "0");
        const mm = String(value.minute || 0).padStart(2, "0");
        return `${hh}:${mm}`;
    }
    return "";
};

export default function LaunchAttendanceCallPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuthContext();

    const [loading, setLoading] = useState(true);
    const [launching, setLaunching] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [selectedScheduleId, setSelectedScheduleId] = useState("");

    useEffect(() => {
        if (authLoading || !user?.id) return;
        loadSchedules();
    }, [authLoading, user]);

    const loadSchedules = async () => {
        try {
            setLoading(true);
            const timetableData = await timetableService.getByTeacher(user.id);
            const timetables = Array.isArray(timetableData) ? timetableData : [];
            const flattened = [];

            timetables.forEach((tt) => {
                const classInfo = tt?.class || tt?.classResponseDTO || tt?.classe || {};
                const list = Array.isArray(tt?.schedules) ? tt.schedules : [];

                list.forEach((schedule) => {
                    const scheduleId = schedule?.scheduleId || schedule?.id;
                    if (!scheduleId) return;
                    flattened.push({
                        id: String(scheduleId),
                        day: schedule?.day || "",
                        start: toTime(schedule?.startHour || schedule?.startTime),
                        end: toTime(schedule?.endHour || schedule?.endTime),
                        subjectName: schedule?.subject?.name || schedule?.subject?.label || "Cours",
                        subjectCode: schedule?.subject?.code || "",
                        className:
                            schedule?.classResponseDTO?.name ||
                            schedule?.class?.name ||
                            classInfo?.name ||
                            "Classe",
                    });
                });
            });

            setSchedules(flattened);
        } catch (error) {
            console.error(error);
            toast.error("Impossible de charger vos cours.");
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    const todayKey = dayKeys[new Date().getDay()];
    const todayDate = new Date().toISOString().split("T")[0];

    const sortedSchedules = useMemo(() => {
        return [...schedules].sort((a, b) => {
            const dayCmp = (a.day || "").localeCompare(b.day || "");
            if (dayCmp !== 0) return dayCmp;
            return (a.start || "").localeCompare(b.start || "");
        });
    }, [schedules]);

    const todaySchedules = useMemo(() => {
        return sortedSchedules.filter((schedule) => schedule.day === todayKey);
    }, [sortedSchedules, todayKey]);

    const handleLaunch = async () => {
        if (!selectedScheduleId) {
            toast.error("Selectionnez un cours avant de lancer l'appel.");
            return;
        }

        try {
            setLaunching(true);
            const payload = {
                scheduleId: Number.isNaN(Number(selectedScheduleId)) ? selectedScheduleId : Number(selectedScheduleId),
                date: todayDate,
                source: "WEB_APP",
            };

            const result = await attendanceService.launchWebAttendanceCall(payload);
            const createdSessionId = result?.attendanceSessionId || result?.sessionId || result?.id;
            toast.success("Appel lance depuis l'application web.");

            if (createdSessionId) {
                router.push(`/teacher/attendance/history/${createdSessionId}`);
                return;
            }
            router.push("/teacher/attendance/history");
        } catch (error) {
            toast.error(error.message || "Le lancement de l'appel a echoue.");
        } finally {
            setLaunching(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-14 h-14 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Chargement de la page de lancement...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lancer l&apos;appel web</h1>
                    <p className="text-gray-600 mt-1">Declenchement direct depuis l&apos;espace enseignant</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-3">
                    <Link href="/teacher/attendance" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        Retour au hub
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-4">
                    Aujourd&apos;hui: <span className="font-medium text-gray-900">{dayLabels[todayKey]} ({todayDate})</span>
                </p>

                {todaySchedules.length > 0 ? (
                    <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                        {todaySchedules.length} cours planifie(s) aujourd&apos;hui.
                    </div>
                ) : (
                    <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        Aucun cours planifie aujourd&apos;hui. Vous pouvez tout de meme lancer l&apos;appel sur un autre cours.
                    </div>
                )}

                <label htmlFor="scheduleSelect" className="block text-sm font-medium text-gray-700 mb-2">
                    Cours cible
                </label>
                <select
                    id="scheduleSelect"
                    value={selectedScheduleId}
                    onChange={(e) => setSelectedScheduleId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                    <option value="">Selectionnez un cours</option>
                    {sortedSchedules.map((s) => (
                        <option key={s.id} value={s.id}>
                            {dayLabels[s.day] || s.day} | {s.start}-{s.end} | {s.subjectName} {s.subjectCode ? `(${s.subjectCode})` : ""} | {s.className}
                        </option>
                    ))}
                </select>

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={handleLaunch}
                        disabled={launching || !selectedScheduleId}
                        className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 transition-colors"
                    >
                        {launching ? "Lancement..." : "Lancer l'appel web"}
                    </button>
                </div>
            </div>
        </div>
    );
}
