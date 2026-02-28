import apiClient from '../lib/apiClient';

const REQUIRED_IMPORT_HEADERS = [
    'matricule',
    'nom',
    'email',
    'telephone',
    'date de naissance',
    'lieu de naissance',
];

const normalizeHeader = (value) =>
    String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

const parseCsvLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        const next = line[i + 1];

        if (char === '"') {
            if (inQuotes && next === '"') {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
            continue;
        }

        current += char;
    }

    values.push(current.trim());
    return values.map((value) => value.replace(/^"(.*)"$/, '$1').trim());
};

const parseCsvFile = async (file) => {
    const rawText = await file.text();
    const text = rawText.replace(/^\uFEFF/, '');
    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    if (lines.length < 2) {
        throw new Error("Le fichier CSV doit contenir un en-tete et au moins une ligne d'etudiant.");
    }

    const headers = parseCsvLine(lines[0]).map(normalizeHeader);
    const missingHeaders = REQUIRED_IMPORT_HEADERS.filter((header) => !headers.includes(header));

    if (missingHeaders.length > 0) {
        throw new Error(`Colonnes CSV manquantes: ${missingHeaders.join(', ')}`);
    }

    const rows = lines.slice(1).map((line, index) => {
        const values = parseCsvLine(line);
        const row = {};

        headers.forEach((header, columnIndex) => {
            row[header] = values[columnIndex] || '';
        });

        return {
            lineNumber: index + 2,
            ...row,
        };
    });

    return rows;
};

const importStudentsFromCsv = async (file, classId) => {
    if (!classId) {
        throw new Error("La classe de destination est requise pour importer un CSV.");
    }

    const rows = await parseCsvFile(file);
    const failedImports = [];
    let successCount = 0;

    for (const row of rows) {
        if (!row.matricule || !row.nom || !row.email || !row['date de naissance']) {
            failedImports.push({
                lineNumber: row.lineNumber,
                reason: 'Matricule, nom, email et date de naissance sont obligatoires.',
            });
            continue;
        }

        try {
            await create({
                matricule: row.matricule,
                name: row.nom,
                email: row.email,
                phoneNumber: row.telephone || null,
                birthDate: row['date de naissance'],
                birthPlace: row['lieu de naissance'] || '',
                classId: parseInt(classId, 10),
            });
            successCount += 1;
        } catch (error) {
            failedImports.push({
                lineNumber: row.lineNumber,
                reason: error.message || "La creation de l'etudiant a echoue.",
            });
        }
    }

    return { successCount, failedImports };
};

const getAll = async () => {
    try {
        const { data } = await apiClient.get('/student');
        return Array.isArray(data) ? data : [];
    } catch (error) {
        if (error.response?.status === 404) return [];
        console.error("Erreur API [getAllStudents]:", error);
        throw new Error("Impossible de charger la liste des etudiants.");
    }
};

const getByClass = async (classId, { page = 0, size = 2000 } = {}) => {
    try {
        const { data } = await apiClient.get(`/student/class/${classId}`, {
            params: { page, size },
        });
        if (Array.isArray(data)) {
            return data;
        }
        if (data && Array.isArray(data.content)) {
            return data.content;
        }
        return [];
    } catch (error) {
        if (error.response?.status === 404) return [];
        throw new Error("Impossible de charger les etudiants de la classe.");
    }
};


const create = async (payload) => {
    try {
        const { data } = await apiClient.post('/student', payload);
        return data;
    } catch (error) {
        console.error('Erreur API [createStudent]:', error);
        throw new Error(error.response?.data?.message || "La creation de l'etudiant a echoue.");
    }
};

const update = async (studentId, payload) => {
    try {
        const { data } = await apiClient.put(`/student/${studentId}`, payload);
        return data;
    } catch (error) {
        console.error('Erreur API [updateStudent]:', error);
        throw new Error(error.response?.data?.message || "La mise a jour de l'etudiant a echoue.");
    }
};


const getById = async (studentId) => {
    try {
        const { data } = await apiClient.get(`/student/${studentId}`);
        return data;
    } catch (error) {
        if (error.response?.status === 404) return null;
        console.error('Erreur API [getStudentById]:', error);
        throw new Error("Impossible de charger les details de l'etudiant.");
    }
};

const remove = async (studentId) => {
    try {
        await apiClient.delete(`/student/${studentId}`);
    } catch (error) {
        console.error('Erreur API [deleteStudent]:', error);
        throw new Error(error.response?.data?.message || "La suppression de l'etudiant a echoue.");
    }
};

const importStudents = async (file, classId) => {
    try {
        const extension = file?.name?.split('.').pop()?.toLowerCase();

        if (extension === 'csv') {
            return await importStudentsFromCsv(file, classId);
        }

        const formData = new FormData();
        formData.append('file', file);
        if (classId) {
            formData.append('classId', classId);
        }

        const { data } = await apiClient.post('/student/import', formData);
        return data;
    } catch (error) {
        console.error('Erreur API [importStudents]:', error);
        throw new Error(error.response?.data?.message || "L'importation des etudiants a echoue.");
    }
};

const studentService = {
    getAll,
    getByClass,
    create,
    update,
    getById,
    remove,
    importStudents,
};

export default studentService;
