"use client";

import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Contenu */}
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        Politique de confidentialité
                    </h1>

                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-600 mb-6">
                            Dernière mise à jour : 2 juillet 2025
                        </p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                1. Introduction
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Cette politique de confidentialité explique comment STUDAM (Système de gestion
                                des présences académiques) collecte, utilise et protège vos informations personnelles.
                                Nous nous engageons à respecter votre vie privée et à protéger vos données personnelles.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                2. Données collectées
                            </h2>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                2.1 Informations personnelles
                            </h3>
                            <p className="text-gray-700 mb-4">
                                Nous collectons les informations suivantes :
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 mb-4">
                                <li>Nom complet</li>
                                <li>Adresse email</li>
                                <li>Rôle dans l&apos;établissement (enseignant, étudiant, administrateur)</li>
                                <li>Département d&apos;affiliation</li>
                                <li>Numéro d&apos;identification (matricule)</li>
                                <li>Numéro de téléphone (optionnel)</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                2.2 Données biométriques
                            </h3>
                            <p className="text-gray-700 mb-4">
                                Pour l&apos;authentification et l&apos;enregistrement des présences, nous collectons :
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 mb-4">
                                <li>Empreintes digitales (sous forme cryptée)</li>
                                <li>Templates biométriques (données converties et anonymisées)</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                2.3 Données d&apos;utilisation
                            </h3>
                            <ul className="list-disc pl-6 text-gray-700 mb-4">
                                <li>Horodatage des connexions</li>
                                <li>Historique des présences</li>
                                <li>Adresses IP (pour la sécurité)</li>
                                <li>Logs d&apos;activité système</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                3. Utilisation des données
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Vos données sont utilisées exclusivement pour :
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 mb-4">
                                <li>Authentification et contrôle d&apos;accès</li>
                                <li>Enregistrement et suivi des présences</li>
                                <li>Génération de rapports académiques</li>
                                <li>Gestion des emplois du temps</li>
                                <li>Communication liée au service</li>
                                <li>Amélioration de la sécurité du système</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                4. Protection des données biométriques
                            </h2>
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                                <p className="text-blue-800 font-medium">
                                    🔒 Sécurité renforcée pour les données biométriques
                                </p>
                            </div>
                            <ul className="list-disc pl-6 text-gray-700 mb-4">
                                <li>Les empreintes digitales sont immédiatement cryptées et converties en templates</li>
                                <li>Aucune image d&apos;empreinte n&apos;est stockée</li>
                                <li>Les templates biométriques sont irréversibles</li>
                                <li>Stockage sécurisé avec chiffrement AES-256</li>
                                <li>Accès restreint aux administrateurs autorisés uniquement</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                5. Partage des données
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Nous ne partageons vos données personnelles avec des tiers que dans les cas suivants :
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 mb-4">
                                <li>Avec votre consentement explicite</li>
                                <li>Pour se conformer à des obligations légales</li>
                                <li>Pour protéger nos droits et notre sécurité</li>
                                <li>Avec les autorités académiques de votre établissement (données de présence uniquement)</li>
                            </ul>
                            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                <p className="text-green-800 font-medium">
                                    ✅ Nous ne vendons jamais vos données personnelles à des tiers commerciaux.
                                </p>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                6. Vos droits
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Conformément aux réglementations sur la protection des données, vous avez le droit de :
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 mb-4">
                                <li><strong>Accès</strong> : Consulter vos données personnelles</li>
                                <li><strong>Rectification</strong> : Corriger des informations inexactes</li>
                                <li><strong>Suppression</strong> : Demander la suppression de vos données</li>
                                <li><strong>Portabilité</strong> : Obtenir une copie de vos données</li>
                                <li><strong>Opposition</strong> : Vous opposer au traitement de vos données</li>
                                <li><strong>Limitation</strong> : Demander la limitation du traitement</li>
                            </ul>
                            <p className="text-gray-700 mb-4">
                                Pour exercer ces droits, contactez notre équipe à :
                                <a href="mailto:privacy@studam.edu" className="text-[#F26419] hover:text-[#E55A17] font-medium">
                                    privacy@studam.edu
                                </a>
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                7. Sécurité des données
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Nous mettons en place des mesures techniques et organisationnelles appropriées :
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 mb-4">
                                <li>Chiffrement des données sensibles (AES-256)</li>
                                <li>Connexions sécurisées (HTTPS/TLS)</li>
                                <li>Accès contrôlé et authentification forte</li>
                                <li>Surveillance et détection d&apos;intrusions</li>
                                <li>Sauvegardes régulières et sécurisées</li>
                                <li>Formation du personnel sur la sécurité</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                8. Conservation des données
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Nous conservons vos données pendant les durées suivantes :
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 mb-4">
                                <li><strong>Données de présence</strong> : 5 ans après la fin de l&apos;année académique</li>
                                <li><strong>Données biométriques</strong> : Supprimées à la fin de votre affiliation</li>
                                <li><strong>Comptes utilisateurs</strong> : 3 ans après la dernière connexion</li>
                                <li><strong>Logs de sécurité</strong> : 1 an maximum</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                9. Cookies et technologies similaires
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Nous utilisons des cookies essentiels pour :
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 mb-4">
                                <li>Maintenir votre session de connexion</li>
                                <li>Assurer la sécurité de l&apos;application</li>
                                <li>Améliorer les performances</li>
                            </ul>
                            <p className="text-gray-700 mb-4">
                                Aucun cookie de suivi ou publicitaire n&apos;est utilisé.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                10. Contact et réclamations
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Pour toute question concernant cette politique de confidentialité ou pour exercer
                                vos droits, contactez-nous :
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700">
                                    <strong>Délégué à la Protection des Données - STUDAM</strong><br />
                                    Email : <a href="mailto:privacy@studam.edu" className="text-[#F26419] hover:text-[#E55A17]">privacy@studam.edu</a><br />
                                    Adresse : Yaoundé, Cameroun<br />
                                    Téléphone : +237 6XX XX XX XX
                                </p>
                            </div>
                            <p className="text-gray-700 mt-4">
                                Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une plainte
                                auprès de l&apos;autorité de protection des données compétente.
                            </p>
                        </section>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-center">
                            <p className="text-sm text-gray-500 mb-4 sm:mb-0">
                                © 2025 STUDAM - Développé par Bioclass Innovators
                            </p>
                            <div className="flex space-x-4">
                                <Link
                                    href="/terms"
                                    className="text-sm text-[#F26419] hover:text-[#E55A17] font-medium"
                                >
                                    Conditions d&apos;utilisation
                                </Link>
                                <Link
                                    href="/auth/login"
                                    className="text-sm text-[#1B396A] hover:text-[#2447B8] font-medium"
                                >
                                    Se connecter
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}