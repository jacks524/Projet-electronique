"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../../../context/authContext";
import systemSettingsService from "../../../services/systemSettingsService";

const SETTINGS_STORAGE_KEY = "studam_admin_settings_v2";
const SETTINGS_UPDATED_AT_KEY = "studam_admin_settings_v2_updated_at";

const defaultSettings = {
  siteName: "STUDAM",
  siteDescription: "Système de gestion des présences",
  timezone: "Africa/Douala",
  language: "fr",
  dateFormat: "DD/MM/YYYY",

  lateThresholdMinutes: 15,
  checkinWindowStartMinutes: 15,
  checkinWindowEndMinutes: 20,
  absenceJustificationRequired: true,
  minAttendanceRateAlert: 75,

  sessionTimeout: 480,
  maxLoginAttempts: 5,
  autoLogout: true,
  enableTwoFactor: false,
  minPasswordLength: 8,

  enableNotifications: true,
  emailNotifications: true,
  pushNotifications: true,
  digestFrequency: "daily",

  maintenanceMode: false,
  maintenanceMessage: "Plateforme temporairement indisponible pour maintenance.",
};

const parseStoredSettings = (raw) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
};

export default function SystemSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState(defaultSettings);
  const [lastUpdated, setLastUpdated] = useState("");

  const canAccess = useMemo(() => {
    const role = String(user?.role || "").toUpperCase();
    return role === "ADMIN" || role === "SUPER_ADMIN";
  }, [user?.role]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (!canAccess) {
      router.push("/dashboard");
      return;
    }

    const loadSettings = async () => {
      try {
        const apiSettings = await systemSettingsService.getAdminSettings();
        const merged = { ...defaultSettings, ...(apiSettings || {}) };
        setSettings(merged);
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
      } catch {
        const stored = parseStoredSettings(localStorage.getItem(SETTINGS_STORAGE_KEY));
        if (stored) {
          setSettings((prev) => ({ ...prev, ...stored }));
        }
      } finally {
        const updatedAt = localStorage.getItem(SETTINGS_UPDATED_AT_KEY);
        if (updatedAt) setLastUpdated(updatedAt);
      }
    };

    loadSettings();
  }, [authLoading, isAuthenticated, canAccess, router]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await systemSettingsService.updateAdminSettings(settings);
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      const now = new Date().toISOString();
      localStorage.setItem(SETTINGS_UPDATED_AT_KEY, now);
      setLastUpdated(now);
      setSuccessMessage("Paramètres enregistrés avec succès.");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (error) {
      setErrorMessage(error.message || "Impossible d'enregistrer les paramètres.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const tabs = [
    { id: "general", label: "Général" },
    { id: "attendance", label: "Présence" },
    { id: "security", label: "Sécurité" },
    { id: "notifications", label: "Notifications" },
    { id: "maintenance", label: "Maintenance" },
  ];

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500">
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-2xl p-6 border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800">Paramètres système</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configurez les règles globales de la plateforme et la politique de gestion des présences.
        </p>
        {lastUpdated && (
          <p className="text-xs text-slate-400 mt-3">
            Dernière sauvegarde: {new Date(lastUpdated).toLocaleString("fr-FR")}
          </p>
        )}
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="bg-white shadow rounded-2xl border border-slate-100 overflow-hidden">
        <div className="border-b border-slate-200 px-6">
          <nav className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? "border-violet-600 text-violet-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {activeTab === "general" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom du site</label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Fuseau horaire</label>
                <select
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="Africa/Douala">Africa/Douala</option>
                  <option value="Africa/Dakar">Africa/Dakar</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <input
                  type="text"
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Langue</label>
                <select
                  name="language"
                  value={settings.language}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="fr">Francais</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Format de date</label>
                <select
                  name="dateFormat"
                  value={settings.dateFormat}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Seuil retard (minutes)</label>
                <input
                  type="number"
                  min="0"
                  name="lateThresholdMinutes"
                  value={settings.lateThresholdMinutes}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Alerte assiduite min (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  name="minAttendanceRateAlert"
                  value={settings.minAttendanceRateAlert}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Fenêtre avant début (minutes)</label>
                <input
                  type="number"
                  min="0"
                  name="checkinWindowStartMinutes"
                  value={settings.checkinWindowStartMinutes}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Fenêtre après début (minutes)</label>
                <input
                  type="number"
                  min="0"
                  name="checkinWindowEndMinutes"
                  value={settings.checkinWindowEndMinutes}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="absenceJustificationRequired"
                    checked={settings.absenceJustificationRequired}
                    onChange={handleChange}
                    className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  Justification obligatoire pour absence
                </label>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Timeout session (minutes)</label>
                <input
                  type="number"
                  min="5"
                  name="sessionTimeout"
                  value={settings.sessionTimeout}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tentatives max de connexion</label>
                <input
                  type="number"
                  min="1"
                  name="maxLoginAttempts"
                  value={settings.maxLoginAttempts}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Longueur minimale mot de passe</label>
                <input
                  type="number"
                  min="6"
                  name="minPasswordLength"
                  value={settings.minPasswordLength}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="space-y-3 pt-2">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="autoLogout"
                    checked={settings.autoLogout}
                    onChange={handleChange}
                    className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  Deconnexion automatique
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="enableTwoFactor"
                    checked={settings.enableTwoFactor}
                    onChange={handleChange}
                    className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  Authentification a deux facteurs
                </label>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="enableNotifications"
                  checked={settings.enableNotifications}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                Activer les notifications
              </label>

              {settings.enableNotifications && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={settings.emailNotifications}
                      onChange={handleChange}
                      className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    Notifications email
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      name="pushNotifications"
                      checked={settings.pushNotifications}
                      onChange={handleChange}
                      className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    Notifications push
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Frequence digest</label>
                    <select
                      name="digestFrequency"
                      value={settings.digestFrequency}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="instant">Instantane</option>
                      <option value="daily">Quotidien</option>
                      <option value="weekly">Hebdomadaire</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "maintenance" && (
            <div className="space-y-4">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                Activer le mode maintenance
              </label>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message affiche aux utilisateurs</label>
                <textarea
                  name="maintenanceMessage"
                  rows={3}
                  value={settings.maintenanceMessage}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
            >
              Reinitialiser
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-60"
            >
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
