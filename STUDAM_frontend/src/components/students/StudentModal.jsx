import React, { useEffect, useMemo, useState } from 'react';

const buildEmptyCatchUp = () => ({
  localId: `catchup-${Math.random().toString(36).slice(2, 10)}`,
  classId: '',
  subjectIds: [],
});

const normalizeDateInput = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().split('T')[0];
};

const StudentModal = ({
  show,
  student = null,
  classes = [],
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    id: null,
    matricule: '',
    nom: '',
    email: '',
    phone: '',
    classeId: '',
    dateNaissance: '',
    lieuNaissance: '',
    catchUpAssignments: [],
  });
  const [errors, setErrors] = useState({});

  const classesById = useMemo(() => {
    const entries = classes.map((classe) => [String(classe.id), classe]);
    return Object.fromEntries(entries);
  }, [classes]);

  useEffect(() => {
    if (!student) {
      setFormData({
        id: null,
        matricule: '',
        nom: '',
        email: '',
        phone: '',
        classeId: '',
        dateNaissance: '',
        lieuNaissance: '',
        catchUpAssignments: [],
      });
      setErrors({});
      return;
    }

    setFormData({
      id: student.id ?? null,
      matricule: student.matricule ?? '',
      nom: student.nom ?? '',
      email: student.email ?? '',
      phone: student.phone ?? '',
      classeId: student.classe?.id ? String(student.classe.id) : '',
      dateNaissance: normalizeDateInput(student.dateNaissance),
      lieuNaissance: student.lieuNaissance ?? '',
      catchUpAssignments: Array.isArray(student.catchUpAssignments)
        ? student.catchUpAssignments.map((assignment) => ({
            localId: `catchup-${assignment.classId}-${(assignment.subjectIds || []).join('-')}`,
            classId: assignment.classId ? String(assignment.classId) : '',
            subjectIds: Array.isArray(assignment.subjectIds)
              ? assignment.subjectIds.map((id) => String(id))
              : [],
          }))
        : [],
    });
    setErrors({});
  }, [student]);

  const selectedPrimaryClass = formData.classeId ? classesById[formData.classeId] : null;
  const primaryDepartmentId = selectedPrimaryClass?.departement?.id ?? selectedPrimaryClass?.department?.id ?? null;

  const availableCatchUpClasses = useMemo(
    () =>
      classes.filter((classe) => {
        if (!primaryDepartmentId) return false;
        const departmentId = classe?.departement?.id ?? classe?.department?.id ?? null;
        return String(departmentId) === String(primaryDepartmentId) && String(classe.id) !== String(formData.classeId);
      }),
    [classes, formData.classeId, primaryDepartmentId]
  );

  const getSubjectsForClass = (classId) => {
    const selectedClass = classesById[String(classId)];
    if (!selectedClass || !Array.isArray(selectedClass.subjects)) return [];
    return selectedClass.subjects;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      if (name === 'classeId') {
        return {
          ...prev,
          classeId: value,
          catchUpAssignments: prev.catchUpAssignments.map((assignment) => ({
            ...assignment,
            classId: assignment.classId === value ? '' : assignment.classId,
          })).filter((assignment) => assignment.classId !== ''),
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleCatchUpClassChange = (localId, classId) => {
    setFormData((prev) => ({
      ...prev,
      catchUpAssignments: prev.catchUpAssignments.map((assignment) =>
        assignment.localId === localId
          ? { ...assignment, classId, subjectIds: [] }
          : assignment
      ),
    }));
  };

  const handleCatchUpSubjectToggle = (localId, subjectId) => {
    setFormData((prev) => ({
      ...prev,
      catchUpAssignments: prev.catchUpAssignments.map((assignment) => {
        if (assignment.localId !== localId) return assignment;
        const exists = assignment.subjectIds.includes(subjectId);
        return {
          ...assignment,
          subjectIds: exists
            ? assignment.subjectIds.filter((id) => id !== subjectId)
            : [...assignment.subjectIds, subjectId],
        };
      }),
    }));
  };

  const addCatchUpAssignment = () => {
    setFormData((prev) => ({
      ...prev,
      catchUpAssignments: [...prev.catchUpAssignments, buildEmptyCatchUp()],
    }));
  };

  const removeCatchUpAssignment = (localId) => {
    setFormData((prev) => ({
      ...prev,
      catchUpAssignments: prev.catchUpAssignments.filter((assignment) => assignment.localId !== localId),
    }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.matricule.trim()) nextErrors.matricule = 'Le matricule est requis';
    if (!formData.nom.trim()) nextErrors.nom = 'Le nom est requis';
    if (!formData.email.trim()) nextErrors.email = "L'email est requis";
    if (!formData.classeId) nextErrors.classeId = 'La classe principale est requise';
    if (!formData.dateNaissance) nextErrors.dateNaissance = 'La date de naissance est requise';

    formData.catchUpAssignments.forEach((assignment, index) => {
      if (!assignment.classId) {
        nextErrors[`catchup-class-${assignment.localId}`] = `Choisis une classe de rattrapage pour la ligne ${index + 1}`;
      }
      if (!assignment.subjectIds.length) {
        nextErrors[`catchup-subjects-${assignment.localId}`] = `Choisis au moins une matière pour la ligne ${index + 1}`;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    onSave({
      id: formData.id,
      matricule: formData.matricule.trim().toUpperCase(),
      nom: formData.nom.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      classeId: Number(formData.classeId),
      dateNaissance: formData.dateNaissance,
      lieuNaissance: formData.lieuNaissance.trim(),
      catchUpAssignments: formData.catchUpAssignments.map((assignment) => ({
        classId: Number(assignment.classId),
        subjectIds: assignment.subjectIds.map((id) => Number(id)),
      })),
    });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-gray-200 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-[#312e81]">
                {student ? "Modifier l'étudiant" : 'Ajouter un étudiant'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Classe principale + éventuels rattrapages sur classes inférieures du même département.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <span className="sr-only">Fermer</span>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 px-6 py-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="matricule" className="block text-sm font-medium text-gray-700">
                Matricule <span className="text-red-500">*</span>
              </label>
              <input
                id="matricule"
                name="matricule"
                type="text"
                value={formData.matricule}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 ${
                  errors.matricule ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.matricule && <p className="mt-1 text-sm text-red-500">{errors.matricule}</p>}
            </div>

            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                value={formData.nom}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 ${
                  errors.nom ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
              />
            </div>

            <div>
              <label htmlFor="classeId" className="block text-sm font-medium text-gray-700">
                Classe principale <span className="text-red-500">*</span>
              </label>
              <select
                id="classeId"
                name="classeId"
                value={formData.classeId}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 ${
                  errors.classeId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner une classe</option>
                {classes.map((classe) => (
                  <option key={classe.id} value={classe.id}>
                    {classe.nom} - {classe.departement?.nom}
                  </option>
                ))}
              </select>
              {errors.classeId && <p className="mt-1 text-sm text-red-500">{errors.classeId}</p>}
            </div>

            <div>
              <label htmlFor="dateNaissance" className="block text-sm font-medium text-gray-700">
                Date de naissance <span className="text-red-500">*</span>
              </label>
              <input
                id="dateNaissance"
                name="dateNaissance"
                type="date"
                value={formData.dateNaissance}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 ${
                  errors.dateNaissance ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dateNaissance && <p className="mt-1 text-sm text-red-500">{errors.dateNaissance}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="lieuNaissance" className="block text-sm font-medium text-gray-700">
                Lieu de naissance
              </label>
              <input
                id="lieuNaissance"
                name="lieuNaissance"
                type="text"
                value={formData.lieuNaissance}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
              />
            </div>
          </div>

          <section className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-semibold text-gray-900">Rattrapages</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Assigne l’étudiant à des matières ciblées dans d’autres classes du même département.
                </p>
              </div>
              <button
                type="button"
                onClick={addCatchUpAssignment}
                disabled={!formData.classeId}
                className="inline-flex items-center rounded-lg bg-[#312e81] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Ajouter un rattrapage
              </button>
            </div>

            {!formData.classeId && (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                Choisis d’abord la classe principale pour filtrer les classes de rattrapage du même département.
              </p>
            )}

            <div className="mt-4 space-y-4">
              {formData.catchUpAssignments.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-6 text-sm text-gray-500">
                  Aucun rattrapage configuré.
                </div>
              )}

              {formData.catchUpAssignments.map((assignment, index) => {
                const classError = errors[`catchup-class-${assignment.localId}`];
                const subjectsError = errors[`catchup-subjects-${assignment.localId}`];
                const subjects = getSubjectsForClass(assignment.classId);

                return (
                  <div key={assignment.localId} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Rattrapage #{index + 1}</p>
                        <p className="text-xs text-gray-500">Une classe inférieure, puis les matières à suivre dedans.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCatchUpAssignment(assignment.localId)}
                        className="rounded-lg px-2 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Supprimer
                      </button>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">Classe de rattrapage</label>
                      <select
                        value={assignment.classId}
                        onChange={(event) => handleCatchUpClassChange(assignment.localId, event.target.value)}
                        className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2 shadow-sm focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 ${
                          classError ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Sélectionner une classe</option>
                        {availableCatchUpClasses.map((classe) => (
                          <option key={classe.id} value={classe.id}>
                            {classe.nom}
                          </option>
                        ))}
                      </select>
                      {classError && <p className="mt-1 text-sm text-red-500">{classError}</p>}
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">Matières à rattraper</label>
                      {assignment.classId && subjects.length === 0 ? (
                        <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                          Aucune matière n’est remontée pour cette classe.
                        </p>
                      ) : null}
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {subjects.map((subject) => {
                          const subjectId = String(subject.subjectId ?? subject.id);
                          const checked = assignment.subjectIds.includes(subjectId);
                          return (
                            <label
                              key={subjectId}
                              className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                                checked ? 'border-[#7c3aed] bg-violet-50' : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="mt-1 rounded border-gray-300 text-[#7c3aed] focus:ring-[#7c3aed]"
                                checked={checked}
                                onChange={() => handleCatchUpSubjectToggle(assignment.localId, subjectId)}
                              />
                              <span>
                                <span className="block font-medium text-gray-900">{subject.name}</span>
                                <span className="block text-xs text-gray-500">
                                  {subject.code || 'Sans code'} {subject.semester ? `• ${subject.semester}` : ''}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      {subjectsError && <p className="mt-1 text-sm text-red-500">{subjectsError}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#6d28d9]"
            >
              {student ? 'Enregistrer les modifications' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
