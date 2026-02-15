"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import departmentService from "../../../../services/departmentService";
import userService from "../../../../services/userService";
import classService from "../../../../services/classService";
import reportService from "../../../../services/reportService";
import attendanceService from "../../../../services/attendanceService";

const statusOptions = [
  { value: "all", label: "Tous les statuts" },
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Retard" },
];

const rowStatusBadge = {
  PRESENT: "bg-emerald-100 text-emerald-700",
  ABSENT: "bg-red-100 text-red-700",
  LATE: "bg-amber-100 text-amber-700",
  VALIDATED: "bg-violet-100 text-violet-700",
  PENDING: "bg-slate-100 text-slate-700",
};

const getDefaultDateRange = () => {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  return {
    startDate: weekAgo.toISOString().split("T")[0],
    endDate: today.toISOString().split("T")[0],
  };
};

const toNumber = (value, fallback = 0) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
};

const readPath = (obj, path) => {
  if (!obj || !path) return undefined;
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
};

const pickValue = (obj, paths) => {
  for (const path of paths) {
    const value = path.includes(".") ? readPath(obj, path) : obj?.[path];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return undefined;
};

const pickNumber = (obj, paths, fallback = 0) => {
  return toNumber(pickValue(obj, paths), fallback);
};

const normalizeStatus = (status) => {
  const raw = (status || "").toString().trim().toUpperCase();
  if (raw === "PRESENT" || raw === "ABSENT" || raw === "LATE" || raw === "VALIDATED" || raw === "PENDING") {
    return raw;
  }
  if (raw === "RETARD") return "LATE";
  return raw || "PENDING";
};

const getStatusLabel = (status) => {
  const normalized = normalizeStatus(status);
  if (normalized === "PRESENT") return "Present";
  if (normalized === "ABSENT") return "Absent";
  if (normalized === "LATE") return "Retard";
  if (normalized === "VALIDATED") return "Valide";
  if (normalized === "PENDING") return "En attente";
  return normalized;
};

const formatDate = (value) => {
  if (!value) return "-";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleDateString("fr-FR");
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleString("fr-FR");
};

const sanitizeSegment = (value) => {
  if (!value) return "presence";
  return value
    .toString()
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase() || "presence";
};

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.style.display = "none";
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
};

const getRowSessionId = (row) => {
  return row?.sessionId || row?.attendanceSessionId || row?.id || row?.reportId || row?.attendanceId || null;
};

const hasAttendanceStats = (row) => {
  return row.presentCount > 0 || row.absentCount > 0 || row.lateCount > 0 || row.totalStudents > 0;
};

const normalizeAttendanceRow = (row) => {
  const presentCount = pickNumber(row, [
    "presentCount",
    "totalPresent",
    "present",
    "presentStudents",
    "attended",
    "presentTotal",
    "studentsPresent",
    "presentStudentsCount",
    "statistics.present",
    "stats.present",
    "attendanceStats.present",
  ]);
  const lateCount = pickNumber(row, [
    "lateCount",
    "totalLate",
    "late",
    "lateStudents",
    "studentsLate",
    "lateStudentsCount",
    "statistics.late",
    "stats.late",
    "attendanceStats.late",
  ]);
  const totalStudents = pickNumber(row, [
    "totalStudents",
    "total",
    "capacity",
    "studentsTotal",
    "registeredStudents",
    "statistics.total",
    "stats.total",
    "attendanceStats.total",
  ]);
  const absentCountRaw = pickValue(row, [
    "absentCount",
    "totalAbsent",
    "absent",
    "absentStudents",
    "studentsAbsent",
    "absentStudentsCount",
    "statistics.absent",
    "stats.absent",
    "attendanceStats.absent",
  ]);
  const absentCount =
    absentCountRaw == null ? Math.max(totalStudents - presentCount - lateCount, 0) : toNumber(absentCountRaw, 0);

  const className =
    pickValue(row, [
      "className",
      "clazzName",
      "classLabel",
      "classroomName",
      "class.name",
      "class.className",
      "classDTO.name",
      "classroom.name",
      "attendanceSession.class.name",
      "attendanceSession.className",
      "attendanceSession.classroomName",
      "attendanceSession.classDTO.name",
    ]) || "-";
  const classId =
    pickValue(row, [
      "classId",
      "clazzId",
      "classroomId",
      "class.classId",
      "class.id",
      "classDTO.classId",
      "classDTO.id",
      "attendanceSession.classId",
      "attendanceSession.class.classId",
      "attendanceSession.class.id",
      "attendanceSession.classDTO.classId",
      "attendanceSession.classDTO.id",
    ]) || null;

  return {
    id: row.id || row.reportId || row.attendanceSessionId || row.sessionId || row.attendanceId || row.session?.id || null,
    sessionId: getRowSessionId(row),
    teacherId:
      pickValue(row, ["teacherId", "teacher.id", "attendanceSession.teacherId", "attendanceSession.teacher.id"]) ||
      null,
    teacherName:
      pickValue(row, [
        "teacherName",
        "teacher.name",
        "teacher.fullName",
        "teacher.displayName",
        "attendanceSession.teacherName",
        "attendanceSession.teacher.name",
      ]) || "-",
    departmentName:
      pickValue(row, [
        "departmentName",
        "department.name",
        "departmentDTO.name",
        "attendanceSession.departmentName",
        "attendanceSession.department.name",
      ]) || "-",
    classId,
    className,
    date:
      pickValue(row, [
        "date",
        "sessionDate",
        "createdAt",
        "attendanceDate",
        "session.startTime",
        "session.date",
        "attendanceSession.date",
        "attendanceSession.sessionDate",
        "attendanceSession.createdAt",
      ]) || null,
    courseName:
      pickValue(row, [
        "courseName",
        "subjectName",
        "subject.name",
        "subjectDTO.name",
        "course.name",
        "attendanceSession.courseName",
        "attendanceSession.subjectName",
      ]) || "-",
    status: normalizeStatus(
      pickValue(row, [
        "status",
        "attendanceStatus",
        "reportStatus",
        "sessionStatus",
        "attendanceSession.status",
      ])
    ),
    presentCount,
    absentCount,
    lateCount,
    totalStudents,
    raw: row,
  };
};

const mapSessionAttendanceDetails = (attendanceList, fallbackDate) => {
  const rows = (Array.isArray(attendanceList) ? attendanceList : []).map((attendance, index) => {
    const student = attendance.student || attendance.studentDTO || attendance.studentResponse || {};
    return {
      id: attendance.attendanceId || attendance.id || `${student.matricule || student.name || "std"}-${index}`,
      matricule: student.matricule || attendance.studentMatricule || "-",
      name: student.name || attendance.studentName || "-",
      email: student.email || attendance.studentEmail || "",
      status: normalizeStatus(attendance.attendanceStatus || attendance.status),
      notes: attendance.notes || "",
      timestamp: attendance.presenceLoggedAt || attendance.loggedAt || attendance.createdAt || fallbackDate || "",
    };
  });

  const stats = {
    present: rows.filter((r) => r.status === "PRESENT").length,
    absent: rows.filter((r) => r.status === "ABSENT").length,
    late: rows.filter((r) => r.status === "LATE").length,
    total: rows.length,
  };

  return { rows, stats };
};

export default function TeacherAttendanceReportPage() {
  const searchParams = useSearchParams();
  const hasAppliedDepartmentFilter = useRef(false);
  const hasAutoFetchedDepartmentFilter = useRef(false);

  const [viewMode, setViewMode] = useState("teacher");
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [rows, setRows] = useState([]);

  const defaultDateRange = useMemo(() => getDefaultDateRange(), []);
  const [filters, setFilters] = useState({
    departmentId: "all",
    teacherId: "all",
    classId: "all",
    status: "all",
    startDate: defaultDateRange.startDate,
    endDate: defaultDateRange.endDate,
  });

  const [sessionDetailsOpen, setSessionDetailsOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const deptData = await departmentService.getAll();
        setDepartments(Array.isArray(deptData) ? deptData : []);
      } catch (error) {
        toast.error(error.message || "Impossible de charger les departements.");
      }
    };

    loadDepartments();
  }, []);

  useEffect(() => {
    if (filters.departmentId === "all") {
      setTeachers([]);
      setClasses([]);
      return;
    }

    const loadDepartmentRelatedData = async () => {
      try {
        const [teachersData, classesData] = await Promise.all([
          userService.getUsersByRoleAndDepartment("TEACHER", filters.departmentId),
          classService.getByDepartment(Number(filters.departmentId)),
        ]);

        setTeachers(Array.isArray(teachersData) ? teachersData : []);
        setClasses(Array.isArray(classesData) ? classesData : []);
      } catch (error) {
        toast.error(error.message || "Impossible de charger les classes ou enseignants.");
      }
    };

    loadDepartmentRelatedData();
  }, [filters.departmentId]);

  const fetchRows = useCallback(async (activeFilters, activeViewMode) => {
    try {
      setLoading(true);

      const data = await reportService.getTeacherAttendanceList({
        departmentId: activeFilters.departmentId === "all" ? undefined : activeFilters.departmentId,
        teacherId:
          activeViewMode === "teacher" && activeFilters.teacherId !== "all" ? activeFilters.teacherId : undefined,
        classId: activeViewMode === "class" && activeFilters.classId !== "all" ? activeFilters.classId : undefined,
        status: activeFilters.status === "all" ? undefined : activeFilters.status,
        startDate: activeFilters.startDate || undefined,
        endDate: activeFilters.endDate || undefined,
      });

      let normalizedRows = (Array.isArray(data) ? data : []).map((row) => normalizeAttendanceRow(row));

      const classNameById = new Map(
        classes.map((classe) => [String(classe.classId || classe.id), classe.name || classe.className || "-"])
      );
      normalizedRows = normalizedRows.map((row) => {
        if (row.className && row.className !== "-") return row;
        if (row.classId == null) return row;
        const fallbackClassName = classNameById.get(String(row.classId));
        return fallbackClassName ? { ...row, className: fallbackClassName } : row;
      });

      if (activeViewMode === "class" && activeFilters.classId !== "all") {
        const selectedClass = classes.find((c) => String(c.classId || c.id) === String(activeFilters.classId));
        const selectedClassName = selectedClass?.name?.toLowerCase?.();

        normalizedRows = normalizedRows.filter((row) => {
          const sameClassId = row.classId != null && String(row.classId) === String(activeFilters.classId);
          const sameClassName = selectedClassName && row.className?.toLowerCase?.() === selectedClassName;
          return sameClassId || sameClassName;
        });
      }

      setRows(normalizedRows);

      const rowsWithoutStats = normalizedRows
        .filter((row) => !hasAttendanceStats(row) && getRowSessionId(row))
        .slice(0, 25);

      if (rowsWithoutStats.length > 0) {
        Promise.allSettled(
          rowsWithoutStats.map(async (row) => {
            const sessionId = getRowSessionId(row);
            const attendanceList = await attendanceService.getSessionDetails(sessionId);
            const { stats } = mapSessionAttendanceDetails(attendanceList, row.date);
            return {
              sessionId: String(sessionId),
              stats,
            };
          })
        ).then((results) => {
          const statsBySessionId = new Map();

          results.forEach((result) => {
            if (result.status === "fulfilled" && result.value?.sessionId) {
              statsBySessionId.set(result.value.sessionId, result.value.stats);
            }
          });

          if (statsBySessionId.size === 0) return;

          setRows((prev) =>
            prev.map((row) => {
              const sessionId = getRowSessionId(row);
              if (!sessionId) return row;
              const stats = statsBySessionId.get(String(sessionId));
              if (!stats) return row;

              return {
                ...row,
                presentCount: stats.present,
                absentCount: stats.absent,
                lateCount: stats.late,
                totalStudents: stats.total,
              };
            })
          );
        });
      }
    } catch (error) {
      toast.error(error.message || "Impossible de charger les présences.");
    } finally {
      setLoading(false);
    }
  }, [classes]);

  useEffect(() => {
    if (hasAppliedDepartmentFilter.current || departments.length === 0) return;

    const departmentFromQuery = searchParams.get("departmentId") || searchParams.get("dept");
    if (!departmentFromQuery) return;

    const normalizedDepartmentId = String(departmentFromQuery);
    const departmentExists = departments.some((dept) => String(dept.departmentId) === normalizedDepartmentId);

    if (!departmentExists) return;

    hasAppliedDepartmentFilter.current = true;
    hasAutoFetchedDepartmentFilter.current = false;

    setFilters((prev) => ({
      ...prev,
      departmentId: normalizedDepartmentId,
      teacherId: "all",
      classId: "all",
    }));
  }, [departments, searchParams]);

  useEffect(() => {
    if (!hasAppliedDepartmentFilter.current) return;
    if (hasAutoFetchedDepartmentFilter.current) return;
    if (filters.departmentId === "all") return;

    hasAutoFetchedDepartmentFilter.current = true;
    fetchRows(filters, viewMode);
  }, [filters, viewMode, fetchRows]);

  const handleDepartmentChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      departmentId: value,
      teacherId: "all",
      classId: "all",
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSwitchViewMode = (mode) => {
    setViewMode(mode);
    setFilters((prev) => ({
      ...prev,
      teacherId: "all",
      classId: "all",
    }));
  };

  const handleExportRowsCsv = () => {
    if (rows.length === 0) {
      toast.error("Aucune ligne a exporter.");
      return;
    }

    const header = [
      "Enseignant",
      "Classe",
      "Departement",
      "Cours",
      "Date",
      "Statut",
      "Presents",
      "Absents",
      "Retards",
      "Total",
    ];
    const csvRows = rows.map((row) => [
      row.teacherName,
      row.className,
      row.departmentName,
      row.courseName,
      formatDate(row.date),
      getStatusLabel(row.status),
      String(row.presentCount),
      String(row.absentCount),
      String(row.lateCount),
      String(row.totalStudents),
    ]);

    const csvContent = [header, ...csvRows]
      .map((cols) => cols.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(";"))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const filename = `liste-presences-${viewMode === "teacher" ? "enseignants" : "classes"}-${new Date()
      .toISOString()
      .split("T")[0]}.csv`;
    downloadBlob(blob, filename);
    toast.success("Liste exportée en CSV.");
  };

  const handleExportRowsPdf = () => {
    if (rows.length === 0) {
      toast.error("Aucune ligne a exporter.");
      return;
    }

    const doc = new jsPDF("l", "mm", "a4");
    const generatedAt = new Date().toLocaleString("fr-FR");

    const totals = rows.reduce(
      (acc, row) => ({
        present: acc.present + toNumber(row.presentCount, 0),
        absent: acc.absent + toNumber(row.absentCount, 0),
        late: acc.late + toNumber(row.lateCount, 0),
        total: acc.total + toNumber(row.totalStudents, 0),
      }),
      { present: 0, absent: 0, late: 0, total: 0 }
    );

    doc.setFontSize(16);
    doc.text("Rapport global des presences", 14, 16);
    doc.setFontSize(10);
    doc.setTextColor(90);
    doc.text(`Genere le ${generatedAt}`, 14, 23);
    doc.text(`Mode: ${viewMode === "teacher" ? "Par enseignant" : "Par classe"}`, 14, 29);
    doc.text(
      `Total lignes: ${rows.length} | Presents: ${totals.present} | Absents: ${totals.absent} | Retards: ${totals.late}`,
      14,
      35
    );

    autoTable(doc, {
      startY: 40,
      head: [["Enseignant", "Classe", "Departement", "Cours", "Date", "Statut", "Presents", "Absents", "Retards", "Total"]],
      body: rows.map((row) => [
        row.teacherName || "-",
        row.className || "-",
        row.departmentName || "-",
        row.courseName || "-",
        formatDate(row.date),
        getStatusLabel(row.status),
        String(row.presentCount ?? 0),
        String(row.absentCount ?? 0),
        String(row.lateCount ?? 0),
        String(row.totalStudents ?? 0),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [124, 58, 237] },
      margin: { left: 10, right: 10 },
      theme: "striped",
    });

    const filename = `rapport-presences-global-${viewMode === "teacher" ? "enseignants" : "classes"}-${new Date()
      .toISOString()
      .split("T")[0]}.pdf`;
    doc.save(filename);
    toast.success("Rapport PDF global exporte.");
  };

  const handleOpenSessionDetails = async (row) => {
    const sessionId = getRowSessionId(row);
    if (!sessionId) {
      toast.error("Session non disponible pour cette ligne.");
      return;
    }

    setSessionDetailsOpen(true);
    setDetailsLoading(true);
    setSelectedSession({
      ...row,
      sessionId,
      students: [],
      stats: { present: 0, absent: 0, late: 0, total: 0 },
    });

    try {
      const detailList = await attendanceService.getSessionDetails(sessionId);
      const mapped = mapSessionAttendanceDetails(detailList, row.date);

      setSelectedSession((prev) => ({
        ...prev,
        sessionId,
        students: mapped.rows,
        stats: mapped.stats,
      }));
    } catch (error) {
      toast.error(error.message || "Impossible de consulter la liste de présence.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleExportSessionCsv = async (rowOrSession) => {
    const sessionId = getRowSessionId(rowOrSession);
    if (!sessionId) {
      toast.error("Export impossible: session introuvable.");
      return;
    }

    try {
      setIsExporting(true);
      const blob = await attendanceService.downloadSessionCsv(sessionId);

      const filename = `presence-${sanitizeSegment(rowOrSession.className || "classe")}-${sanitizeSegment(
        rowOrSession.courseName || "cours"
      )}-${new Date().toISOString().split("T")[0]}.csv`;
      downloadBlob(blob, filename);
      toast.success("Fichier CSV télechargé.");
    } catch (error) {
      toast.error(error.message || "Le telechargement CSV a échoué.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSessionPdf = () => {
    if (!selectedSession?.students || selectedSession.students.length === 0) {
      toast.error("Aucune donnée detaillée a exporter.");
      return;
    }

    const doc = new jsPDF();
    const generatedAt = new Date().toLocaleString("fr-FR");

    doc.setFontSize(16);
    doc.text("Liste de présence - session", 14, 16);
    doc.setFontSize(10);
    doc.setTextColor(90);
    doc.text(`Genere le ${generatedAt}`, 14, 23);

    autoTable(doc, {
      startY: 28,
      head: [["Champ", "Valeur"]],
      body: [
        ["Departement", selectedSession.departmentName || "-"],
        ["Classe", selectedSession.className || "-"],
        ["Enseignant", selectedSession.teacherName || "-"],
        ["Cours", selectedSession.courseName || "-"],
        ["Date", formatDate(selectedSession.date)],
        ["Presents", String(selectedSession.stats?.present || 0)],
        ["Absents", String(selectedSession.stats?.absent || 0)],
        ["Retards", String(selectedSession.stats?.late || 0)],
        ["Total etudiants", String(selectedSession.stats?.total || 0)],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [124, 58, 237] },
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [["Matricule", "Etudiant", "Statut", "Horodatage", "Notes"]],
      body: selectedSession.students.map((student) => [
        student.matricule || "-",
        student.name || "-",
        getStatusLabel(student.status),
        formatDateTime(student.timestamp),
        student.notes || "-",
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [49, 46, 129] },
    });

    const fileName = `presence-${sanitizeSegment(selectedSession.className || "classe")}-${new Date()
      .toISOString()
      .split("T")[0]}.pdf`;
    doc.save(fileName);
    toast.success("Export PDF termine.");
  };

  const classOptions = classes.map((classe) => ({
    value: String(classe.classId || classe.id),
    label: classe.name || classe.className || `Classe ${classe.classId || classe.id}`,
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-2xl p-6 border border-slate-100">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Rapports de présence</h1>
            <p className="text-sm text-slate-500 mt-1">
              Consultez les présences par enseignant ou par classe, puis ouvrez la liste détaillée.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchRows(filters, viewMode)}
              className="px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-sm font-medium hover:bg-violet-600"
            >
              Actualiser
            </button>
            <button
              onClick={handleExportRowsCsv}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Export CSV
            </button>
            <button
              onClick={handleExportRowsPdf}
              className="px-4 py-2 rounded-xl border border-violet-200 text-sm font-medium text-violet-700 hover:bg-violet-50"
            >
              Export PDF global
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-2xl p-6 border border-slate-100 space-y-5">
        <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50">
          <button
            onClick={() => handleSwitchViewMode("teacher")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "teacher" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Par enseignant
          </button>
          <button
            onClick={() => handleSwitchViewMode("class")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "class" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Par classe
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Département</label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
              value={filters.departmentId}
              onChange={(e) => handleDepartmentChange(e.target.value)}
            >
              <option value="all">Tous les departements</option>
              {departments.map((dept) => (
                <option key={dept.departmentId} value={dept.departmentId}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {viewMode === "teacher" ? (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">Enseignant</label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                value={filters.teacherId}
                onChange={(e) => handleFilterChange("teacherId", e.target.value)}
                disabled={filters.departmentId === "all"}
              >
                <option value="all">Tous les enseignants</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">Classe</label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                value={filters.classId}
                onChange={(e) => handleFilterChange("classId", e.target.value)}
                disabled={filters.departmentId === "all"}
              >
                <option value="all">Toutes les classes</option>
                {classOptions.map((classe) => (
                  <option key={classe.value} value={classe.value}>
                    {classe.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Statut</label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Date début</label>
            <input
              type="date"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Date fin</label>
            <input
              type="date"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Liste des sessions</h2>
          <span className="text-sm text-slate-500">{rows.length} ligne(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Enseignant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Classe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Departement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Cours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Presents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Absents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Retards
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {rows.map((row, index) => (
                <tr key={row.sessionId || `${row.teacherName}-${row.className}-${row.date}-${index}`}>
                  <td className="px-6 py-4 text-sm text-slate-900">{row.teacherName || "-"}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{row.className || "-"}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{row.departmentName || "-"}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{row.courseName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{formatDate(row.date)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rowStatusBadge[normalizeStatus(row.status)] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {getStatusLabel(row.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-emerald-700 font-semibold">{row.presentCount ?? 0}</td>
                  <td className="px-6 py-4 text-sm text-red-700 font-semibold">{row.absentCount ?? 0}</td>
                  <td className="px-6 py-4 text-sm text-amber-700 font-semibold">{row.lateCount ?? 0}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenSessionDetails(row)}
                        className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-medium hover:bg-violet-700"
                      >
                        Consulter
                      </button>
                      <button
                        onClick={() => handleExportSessionCsv(row)}
                        disabled={isExporting}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 disabled:opacity-60"
                      >
                        CSV
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && rows.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            Aucune session à afficher pour les filtres sélectionnés.
          </div>
        )}

        {loading && (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            Chargement des présences...
          </div>
        )}
      </div>

      {sessionDetailsOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Liste détaillée de présence</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedSession?.className || "-"} - {selectedSession?.courseName || "-"} - {formatDate(selectedSession?.date)}
                </p>
              </div>
              <button
                onClick={() => {
                  setSessionDetailsOpen(false);
                  setSelectedSession(null);
                }}
                className="text-slate-500 hover:text-slate-700"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {detailsLoading ? (
                <div className="py-10 text-center text-sm text-slate-500">Chargement de la liste de présence...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                      <p className="text-xs text-slate-500">Total</p>
                      <p className="text-2xl font-bold text-slate-800">{selectedSession?.stats?.total || 0}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 p-4 bg-emerald-50">
                      <p className="text-xs text-emerald-700">Presents</p>
                      <p className="text-2xl font-bold text-emerald-700">{selectedSession?.stats?.present || 0}</p>
                    </div>
                    <div className="rounded-xl border border-red-200 p-4 bg-red-50">
                      <p className="text-xs text-red-700">Absents</p>
                      <p className="text-2xl font-bold text-red-700">{selectedSession?.stats?.absent || 0}</p>
                    </div>
                    <div className="rounded-xl border border-amber-200 p-4 bg-amber-50">
                      <p className="text-xs text-amber-700">Retards</p>
                      <p className="text-2xl font-bold text-amber-700">{selectedSession?.stats?.late || 0}</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Matricule</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Etudiant</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Statut</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Horodatage</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(selectedSession?.students || []).map((student) => (
                          <tr key={student.id}>
                            <td className="px-4 py-3 text-sm text-slate-700">{student.matricule}</td>
                            <td className="px-4 py-3 text-sm text-slate-900">
                              <div className="font-medium">{student.name}</div>
                              {student.email && <div className="text-xs text-slate-500">{student.email}</div>}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  rowStatusBadge[student.status] || "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {getStatusLabel(student.status)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">{formatDateTime(student.timestamp)}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{student.notes || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
              <button
                onClick={() => handleExportSessionCsv(selectedSession || {})}
                disabled={detailsLoading || isExporting}
                className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Export CSV
              </button>
              <button
                onClick={handleExportSessionPdf}
                disabled={detailsLoading}
                className="px-4 py-2 rounded-xl border border-violet-200 text-sm font-medium text-violet-700 hover:bg-violet-50 disabled:opacity-60"
              >
                Export PDF
              </button>
              <button
                onClick={() => {
                  setSessionDetailsOpen(false);
                  setSelectedSession(null);
                }}
                className="px-4 py-2 rounded-xl bg-violet-600 text-sm font-medium text-white hover:bg-violet-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
