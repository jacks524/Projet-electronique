/**
 * Données d'utilisateurs de test pour STUDAM
 * À utiliser pour tester les différents rôles et fonctionnalités
 */

// Générateur d'identifiants uniques
const generateUniqueId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

/**
 * Utilisateurs de test par rôle
 */
export const TEST_USERS = {

    // 👑 ADMINISTRATEUR SYSTÈME
    admin: {
        nom: 'Admin Principal STUDAM',
        email: `admin.principal.${generateUniqueId()}@studam.test`,
        password: 'AdminSTUDAM2025!',
        password_confirmation: 'AdminSTUDAM2025!',
        role: 'admin',
        description: '🔑 Accès complet : gestion utilisateurs, départements, système',
        permissions: [
            'Créer/modifier/supprimer tous les utilisateurs',
            'Gérer tous les départements et courses',
            'Accès aux rapports système complets',
            'Configuration générale de l\'application',
            'Gestion des rôles et permissions'
        ]
    },

    // 👨‍💼 CHEF DE DÉPARTEMENT
    chef_departement: {
        nom: 'Dr. Cheikh Anta Diop',
        email: `chef.informatique.${generateUniqueId()}@studam.test`,
        password: 'ChefDept2025!',
        password_confirmation: 'ChefDept2025!',
        role: 'chef_departement',
        departement: 'Informatique',
        description: '🏢 Gestion du département : enseignants, emplois du temps, matières',
        permissions: [
            'Gérer les enseignants de son département',
            'Créer et modifier les emplois du temps',
            'Ajouter/modifier les matières du département',
            'Voir les rapports de présence du département',
            'Gérer les courses du département'
        ]
    },

    // 👩‍🏫 ENSEIGNANT PRINCIPAL
    enseignant_principal: {
        nom: 'Prof. Aminata Sow Fall',
        email: `enseignant.principal.${generateUniqueId()}@studam.test`,
        password: 'Teacher2025!',
        password_confirmation: 'Teacher2025!',
        role: 'teacher',
        specialite: 'Programmation Web & Base de données',
        description: '📚 Enseignement et gestion des présences de ses cours',
        permissions: [
            'Prendre les présences pour ses cours',
            'Voir les listes d\'étudiants de ses courses',
            'Générer des rapports de présence pour ses matières',
            'Consulter les emplois du temps',
            'Modifier les informations de ses cours'
        ]
    },

    // 👨‍🏫 ENSEIGNANT JUNIOR
    enseignant_junior: {
        nom: 'Dr. Ousmane Sembène',
        email: `enseignant.junior.${generateUniqueId()}@studam.test`,
        password: 'NewTeacher2025!',
        password_confirmation: 'NewTeacher2025!',
        role: 'teacher',
        specialite: 'Réseaux & Systèmes',
        description: '🔰 Nouvel enseignant avec accès de base',
        permissions: [
            'Prendre les présences pour ses cours assignés',
            'Consulter les listes d\'étudiants',
            'Voir les emplois du temps',
            'Rapports basiques de présence'
        ]
    }
};

/**
 * Scénarios de test structurés
 */
export const TEST_SCENARIOS = {

    // Scénario 1: Inscription et connexion admin
    scenario_admin: {
        name: '👑 Test Administrateur Complet',
        steps: [
            {
                action: 'register',
                data: TEST_USERS.admin,
                expected: 'Inscription réussie avec auto-connexion ou redirection'
            },
            {
                action: 'login',
                data: {
                    email: TEST_USERS.admin.email,
                    password: TEST_USERS.admin.password
                },
                expected: 'Connexion réussie avec redirection vers /admin/dashboard'
            },
            {
                action: 'access_admin_pages',
                pages: ['/admin/teachers', '/admin/students', '/admin/departments'],
                expected: 'Accès autorisé à toutes les pages admin'
            }
        ]
    },

    // Scénario 2: Chef de département
    scenario_chef: {
        name: '🏢 Test Chef de Département',
        steps: [
            {
                action: 'register',
                data: TEST_USERS.chef_departement,
                expected: 'Inscription réussie'
            },
            {
                action: 'login',
                data: {
                    email: TEST_USERS.chef_departement.email,
                    password: TEST_USERS.chef_departement.password
                },
                expected: 'Connexion réussie avec redirection vers /chef-departement/dashboard'
            },
            {
                action: 'access_dept_pages',
                pages: ['/timetables', '/admin/teachers', '/subjects'],
                expected: 'Accès autorisé aux pages de gestion départementale'
            }
        ]
    },

    // Scénario 3: Enseignant
    scenario_teacher: {
        name: '👩‍🏫 Test Enseignant',
        steps: [
            {
                action: 'register',
                data: TEST_USERS.enseignant_principal,
                expected: 'Inscription réussie'
            },
            {
                action: 'login',
                data: {
                    email: TEST_USERS.enseignant_principal.email,
                    password: TEST_USERS.enseignant_principal.password
                },
                expected: 'Connexion réussie avec redirection vers /teacher/dashboard ou /dashboard'
            },
            {
                action: 'access_teacher_pages',
                pages: ['/attendance', '/subjects', '/courses'],
                expected: 'Accès autorisé aux pages d\'enseignement'
            }
        ]
    }
};

/**
 * Utilitaires pour les tests
 */
export const TEST_UTILS = {

    // Générer des données d'utilisateur aléatoires
    generateRandomUser: (role = 'teacher') => {
        const id = generateUniqueId();
        const roles = {
            admin: 'Administrateur',
            chef_departement: 'Chef Département',
            teacher: 'Enseignant'
        };

        return {
            nom: `${roles[role]} Test ${id}`,
            email: `test.${role}.${id}@studam.test`,
            password: 'TestPassword123!',
            password_confirmation: 'TestPassword123!',
            role: role
        };
    },

    // Valider les données d'utilisateur
    validateUserData: (userData) => {
        const errors = [];

        if (!userData.nom || userData.nom.length < 2) {
            errors.push('Nom requis (min 2 caractères)');
        }

        if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
            errors.push('Email valide requis');
        }

        if (!userData.password || userData.password.length < 6) {
            errors.push('Mot de passe requis (min 6 caractères)');
        }

        if (userData.password !== userData.password_confirmation) {
            errors.push('Mots de passe non identiques');
        }

        if (!['admin', 'chef_departement', 'teacher'].includes(userData.role)) {
            errors.push('Rôle invalide');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    // Créer des identifiants de connexion
    getLoginCredentials: (userType) => {
        const user = TEST_USERS[userType];
        if (!user) {
            throw new Error(`Type d'utilisateur invalide: ${userType}`);
        }

        return {
            email: user.email,
            password: user.password
        };
    }
};

/**
 * Instructions d'utilisation
 */
export const USAGE_INSTRUCTIONS = `
🧪 GUIDE D'UTILISATION DES DONNÉES DE TEST

1. 📋 PRÉPARATION:
   - Ouvrir la console du navigateur (F12)
   - Importer ce fichier dans votre composant de test

2. 🔍 TESTS AUTOMATIQUES:
   import { runFullBackendTest } from '@/utils/testBackend';
   await runFullBackendTest();

3. 👤 INSCRIPTION MANUELLE:
   
   a) ADMIN:
   - Nom: ${TEST_USERS.admin.nom}
   - Email: admin.principal.XXX@studam.test (généré automatiquement)
   - Mot de passe: AdminSTUDAM2025!
   - Rôle: admin
   
   b) CHEF DE DÉPARTEMENT:
   - Nom: ${TEST_USERS.chef_departement.nom}
   - Email: chef.informatique.XXX@studam.test
   - Mot de passe: ChefDept2025!
   - Rôle: chef_departement
   
   c) ENSEIGNANT:
   - Nom: ${TEST_USERS.enseignant_principal.nom}
   - Email: enseignant.principal.XXX@studam.test
   - Mot de passe: Teacher2025!
   - Rôle: teacher

4. ✅ VÉRIFICATIONS:
   - Inscription réussie ✓
   - Auto-connexion ou redirection ✓
   - Accès aux pages selon le rôle ✓
   - Déconnexion fonctionnelle ✓

5. 🐛 EN CAS DE PROBLÈME:
   - Vérifier la console pour les erreurs
   - Tester la connectivité: await testConnection()
   - Vérifier le format des données envoyées
   - Contrôler les CORS du backend
`;

// Exposer les utilitaires dans la console pour debug
if (typeof window !== 'undefined') {
    window.STUDAM_TEST_USERS = TEST_USERS;
    window.STUDAM_TEST_SCENARIOS = TEST_SCENARIOS;
    window.STUDAM_TEST_UTILS = TEST_UTILS;

    console.log('🧪 Données de test STUDAM chargées!');
    console.log('📖 Tapez: console.log(STUDAM_TEST_USERS) pour voir les utilisateurs de test');
    console.log('🔧 Tapez: await testSTUDAMBackend() pour tester le backend');
}