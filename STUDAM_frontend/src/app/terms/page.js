"use client";

import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Contenu */}
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        Conditions d&apos;utilisation
                    </h1>

                    <div className="prose prose-lg max-w-none">
                        <p className="text-gray-600 mb-6">
                            Dernière mise à jour : 2 juillet 2025
                        </p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                1. Acceptation des conditions
                            </h2>
                            <p className="text-gray-700 mb-4">
                                En accédant et en utilisant STUDAM (Système de gestion des présences académiques),
                                vous acceptez d&apos;être lié par ces conditions d&apos;utilisation. Si vous n&apos;acceptez pas
                                ces conditions, veuillez ne pas utiliser notre service.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                2. Description du service
                            </h2>
                            <p className="text-gray-700 mb-4">
                                STUDAM est une application de gestion des présences destinée aux établissements
                                d&apos;enseignement. Le service permet :
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 mb-4">
                                <li>L&apos;enregistrement des présences des étudiants</li>
                                <li>La gestion des emplois du temps</li>
                                <li>La génération de rapports de présence</li>
                                <li>La gestion des utilisateurs (enseignants, étudiants, administrateurs)</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                3. Comptes utilisateurs
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Vous êtes responsable de maintenir la confidentialité de votre compte et de votre
                                mot de passe. Vous acceptez de :
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 mb-4">
                                <li>Fournir des informations exactes lors de l&apos;inscription</li>
                                <li>Maintenir la sécurité de vos identifiants de connexion</li>
                                <li>Notifier immédiatement tout usage non autorisé de votre compte</li>
                                <li>Utiliser le service uniquement à des fins éducatives légitimes</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                4. Utilisation acceptable
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Vous vous engagez à ne pas :
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 mb-4">
                                <li>Utiliser le service à des fins illégales ou non autorisées</li>
                                <li>Tenter d&apos;accéder aux comptes d&apos;autres utilisateurs</li>
                                <li>Transmettre des virus ou du code malveillant</li>
                                <li>Perturber ou interférer avec le service</li>
                                <li>Copier, modifier ou distribuer le contenu sans autorisation</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                5. Protection des données
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Nous nous engageons à protéger vos données personnelles conformément à notre
                                <Link href="/privacy" className="text-[#F26419] hover:text-[#E55A17] font-medium">
                                    politique de confidentialité
                                </Link>.
                                Les données biométriques sont utilisées uniquement pour l&apos;authentification
                                et ne sont pas partagées avec des tiers.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                6. Limitation de responsabilité
                            </h2>
                            <p className="text-gray-700 mb-4">
                                STUDAM est fourni &quot;en l&apos;état&quot; sans garantie d&apos;aucune sorte. Nous ne sommes pas
                                responsables des dommages directs, indirects, accessoires ou consécutifs résultant
                                de l&apos;utilisation du service.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                7. Modifications du service
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Nous nous réservons le droit de modifier, suspendre ou interrompre le service
                                à tout moment, avec ou sans préavis. Nous pouvons également modifier ces conditions
                                d&apos;utilisation à tout moment.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                                8. Contact
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Pour toute question concernant ces conditions d&apos;utilisation, veuillez contacter :
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700">
                                    <strong>Équipe STUDAM - Bioclass Innovators</strong><br />
                                    Email : support@studam.edu<br />
                                    Téléphone : +237 6XX XX XX XX
                                </p>
                            </div>
                        </section>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-center">
                            <p className="text-sm text-gray-500 mb-4 sm:mb-0">
                                © 2025 STUDAM - Développé par Bioclass Innovators
                            </p>
                            <div className="flex space-x-4">
                                <Link
                                    href="/privacy"
                                    className="text-sm text-[#F26419] hover:text-[#E55A17] font-medium"
                                >
                                    Politique de confidentialité
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