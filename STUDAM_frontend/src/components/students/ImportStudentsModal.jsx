import React, { useState } from 'react';

const ImportStudentsModal = ({
  show,
  classes = [],
  onClose,
  onImport
}) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);

    // Effacer l'erreur si elle existe
    if (errors.class) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.class;
        return newErrors;
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.name.toLowerCase().endsWith('.csv')) {
      setSelectedFile(null);
      setErrors(prev => ({
        ...prev,
        file: "Seuls les fichiers CSV sont pris en charge pour cet import.",
      }));
      return;
    }
    setSelectedFile(file);

    // Effacer l'erreur si elle existe
    if (errors.file) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.file;
        return newErrors;
      });
    }
  };

  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!selectedClass) newErrors.class = "Veuillez sélectionner une classe";
    if (!selectedFile) newErrors.file = "Veuillez sélectionner un fichier";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsUploading(true);
    setResult(null);
    setErrors({});

    try {
      const response = await onImport(selectedFile, selectedClass);
      setResult(response);
      if (response.failedImports && response.failedImports.length === 0) {
        setTimeout(() => {
          onClose();
          // Reset state for next time
          setSelectedFile(null);
          setSelectedClass('');
          setResult(null);
        }, 2000);
      }
    } catch (error) {
      setErrors({ submit: error.message || "Une erreur est survenue lors de l'importation." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV content with headers and example row
    const headers = ['Matricule', 'Nom', 'Email', 'Téléphone', 'Date de naissance', 'Lieu de naissance'];
    const exampleRow = ['STU2024001', 'Dupont Jean', 'jean.dupont@example.com', '+237600000000', '2000-01-15', 'Yaoundé'];

  const emptyRow = Array(headers.length).fill('').join(',');

const csvContent = [
  headers.join(','),
  exampleRow.join(','),
  emptyRow,
  emptyRow,
  emptyRow
].join('\n');


    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'modele_import_etudiants.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-[#312e81]">
              Importer des Étudiants
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              disabled={isUploading}
            >
              <span className="sr-only">Fermer</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="import-class" className="block text-sm font-medium text-gray-700">
                Classe <span className="text-red-500">*</span>
              </label>
              <select
                id="import-class"
                name="import-class"
                className={`mt-1 block w-full bg-white border ${errors.class ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#7c3aed] focus:border-[#7c3aed] sm:text-sm`}
                value={selectedClass}
                onChange={handleClassChange}
                disabled={isUploading}
                required
              >
                <option value="">Sélectionner une classe</option>
                {classes.map((classe) => (
                  <option key={classe.id} value={classe.id}>
                    {classe.nom} - {classe.departement?.nom}
                  </option>
                ))}
              </select>
              {errors.class && <p className="mt-1 text-sm text-red-500">{errors.class}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fichier CSV <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#7c3aed] hover:text-[#6d28d9] focus-within:outline-none">
                      <span>Télécharger un fichier</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".csv"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                    </label>
                    <p className="pl-1">ou glisser-déposer</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    CSV (.csv) jusqu'a 10MB
                  </p>
                  {selectedFile && (
                    <p className="text-sm text-green-600">
                      {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                    </p>
                  )}
                </div>
              </div>
              {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file}</p>}
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 text-sm text-blue-700">
                  <h3 className="font-medium">Format du fichier</h3>
                  <p>Le fichier doit contenir les colonnes suivantes : Matricule, Nom, Email, Telephone, Date de naissance, Lieu de naissance.</p>
                  <p className="mt-1">
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="font-medium underline hover:text-blue-800 cursor-pointer"
                    >
                      Télécharger un modèle
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 text-sm">
            {result && (
              <div className={`p-4 rounded-md ${result.successCount > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {result.successCount > 0 ? (
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${result.successCount > 0 ? 'text-green-800' : 'text-red-800'}`}>
                      Importation terminée
                    </h3>
                    <div className={`mt-2 text-sm ${result.successCount > 0 ? 'text-green-700' : 'text-red-700'}`}>
                      <p>{result.successCount} étudiant(s) importé(s) avec succès.</p>
                      {result.failedImports && result.failedImports.length > 0 && (
                        <div className="mt-2 text-red-700">
                          <p className="font-medium">{result.failedImports.length} échec(s) :</p>
                          <ul className="list-disc pl-5 mt-1 max-h-32 overflow-y-auto text-xs">
                            {result.failedImports.map((fail, idx) => (
                              <li key={idx}>Ligne {fail.lineNumber}: {fail.reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {errors.submit && (
              <div className="p-4 rounded-md bg-red-50 text-red-700">
                {errors.submit}
              </div>
            )}
          </div>

          <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#7c3aed] text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7c3aed] sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importation...
                </>
              ) : (
                'Importer'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#312e81] sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50"
              disabled={isUploading}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportStudentsModal;
