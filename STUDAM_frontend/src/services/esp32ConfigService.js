import apiClient from '../lib/apiClient';

const normalizeDepartmentCode = (value) => {
    const source = String(value || '').trim();
    if (!source) return '';

    const explicitCodeMatch = source.match(/\(([^)]+)\)/);
    if (explicitCodeMatch?.[1]) {
        return explicitCodeMatch[1].trim().toUpperCase();
    }

    const words = source
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(/[\s,-]+/)
        .filter(Boolean);

    if (words.length === 0) return '';
    if (words.length === 1) return words[0].slice(0, 3).toUpperCase();

    return words.map((word) => word[0]).join('').toUpperCase();
};

const buildTxtDepartmentField = (departmentNames = [], levels = [], semesters = []) => {
    const normalizedLevels = [...new Set((Array.isArray(levels) ? levels : []).map((level) => String(level).trim()).filter(Boolean))];
    const normalizedSemesters = [...new Set((Array.isArray(semesters) ? semesters : []).map((semester) => String(semester).trim()).filter(Boolean))];
    const semesterSpec = normalizedSemesters.length > 0 ? normalizedSemesters.join('|') : 'S1';
    const levelSpec = normalizedLevels.length > 0
        ? normalizedLevels.map((level) => `${level}(${semesterSpec})`).join(',')
        : `3(${semesterSpec})`;

    const departments = [...new Set((Array.isArray(departmentNames) ? departmentNames : [])
        .map(normalizeDepartmentCode)
        .filter(Boolean))];

    const selectedDepartments = departments.length > 0 ? departments : ['GEN'];
    return selectedDepartments.map((departmentCode) => `${departmentCode}(${levelSpec})`).join('|');
};

const buildTxtAffectField = (departmentNames = [], levels = [], semesters = [], subjects = []) => {
    const departments = [...new Set((Array.isArray(departmentNames) ? departmentNames : [])
        .map(normalizeDepartmentCode)
        .filter(Boolean))];
    const selectedDepartments = departments.length > 0 ? departments : ['GEN'];
    const selectedLevels = [...new Set((Array.isArray(levels) ? levels : []).map((level) => String(level).trim()).filter(Boolean))];
    const selectedSemesters = [...new Set((Array.isArray(semesters) ? semesters : []).map((semester) => String(semester).trim()).filter(Boolean))];
    const selectedSubjects = [...new Set((Array.isArray(subjects) ? subjects : []).map((subject) => String(subject).trim()).filter(Boolean))];

    const levelsToUse = selectedLevels.length > 0 ? selectedLevels : ['3'];
    const semestersToUse = selectedSemesters.length > 0 ? selectedSemesters : ['S1'];
    const subjectsToUse = selectedSubjects.length > 0 ? selectedSubjects : ['Matiere'];

    const affectations = [];
    selectedDepartments.forEach((departmentCode) => {
        levelsToUse.forEach((level) => {
            semestersToUse.forEach((semester) => {
                subjectsToUse.forEach((subject) => {
                    affectations.push(`${departmentCode}:${level}:${semester}:${subject}`);
                });
            });
        });
    });

    return affectations.join('|');
};

const buildTeacherConfigCsv = (rows = []) => {
    const headers = [
        "Matricule de l'enseignant",
        "Nom de l'enseignant",
        "Departement de l'enseignant",
        "Semestre",
        "Niveaux dans lesquels il enseigne",
        "Matiere enseignee",
    ];

    const toCsvValue = (value) => `"${`${value ?? ''}`.replace(/"/g, '""')}"`;

    const csvRows = rows.map((row) => ([
        row.matricule,
        row.nom,
        row.departement,
        Array.isArray(row.semestres) ? row.semestres.join(' | ') : '',
        Array.isArray(row.niveaux) ? row.niveaux.join(' | ') : '',
        Array.isArray(row.matieres) ? row.matieres.join(' | ') : '',
    ]));

    return [headers, ...csvRows]
        .map((line) => line.map(toCsvValue).join(','))
        .join('\n');
};

const buildTeacherConfigTxt = (rows = []) => rows
    .map((row) => {
        const departmentNames = String(row.departement || '')
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean);

        const deptField = buildTxtDepartmentField(departmentNames, row.niveaux, row.semestres);
        const affectField = buildTxtAffectField(departmentNames, row.niveaux, row.semestres, row.matieres);

        return [
            String(row.matricule || '').trim(),
            String(row.nom || '').trim(),
            deptField,
            affectField,
        ].join(';');
    })
    .filter((line) => !line.startsWith(';'))
    .join('\n');

const publishTeacherConfig = async (rows = []) => {
    const payload = buildTeacherConfigTxt(rows);
    try {
        const { data } = await apiClient.post('/fingerprint/config/publish', payload, {
            headers: {
                'Content-Type': 'text/plain',
                Accept: 'application/json, text/plain, */*',
            },
        });
        return data;
    } catch (error) {
        const backendMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            (typeof error?.response?.data === 'string' ? error.response.data : null) ||
            error?.message;
        throw new Error(backendMessage || "La publication du TXT de configuration ESP32 a echoue.");
    }
};

const downloadTeacherConfig = (rows = []) => {
    const csvContent = buildTeacherConfigCsv(rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `config-enseignants-esp32-${new Date().toISOString().split('T')[0]}.csv`;
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
};

const esp32ConfigService = {
    buildTeacherConfigCsv,
    buildTeacherConfigTxt,
    publishTeacherConfig,
    downloadTeacherConfig,
};

export default esp32ConfigService;
