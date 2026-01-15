/**
 * 🧪 Outil de test STUDAM avec debugging complet
 * Version améliorée pour diagnostiquer les problèmes backend
 * À utiliser en développement pour voir exactement ce qui se passe
 */

const BACKEND_URL = 'https://projet-electronique.onrender.com/api';

/**
 * 🔍 Teste la connectivité de base au backend avec debug complet
 */
export async function testBackendConnection() {
    console.log('🚀 [TEST-DEBUG] Début du test de connectivité au backend...');
    console.log('🌐 [TEST-DEBUG] URL Backend utilisée:', BACKEND_URL);

    try {
        const startTime = Date.now();
        console.log('⏰ [TEST-DEBUG] Timestamp début requête:', new Date().toISOString());

        // Test de l'endpoint health
        const healthUrl = `${BACKEND_URL}/health`;
        console.log('📡 [TEST-DEBUG] Tentative de connexion vers:', healthUrl);

        const response = await fetch(healthUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        console.log('📊 [TEST-DEBUG] Réponse reçue après', responseTime, 'ms');
        console.log('📡 [TEST-DEBUG] Status de la réponse:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            type: response.type,
            url: response.url,
            redirected: response.redirected
        });

        // Analyser les headers de réponse
        const headers = {};
        response.headers.forEach((value, key) => {
            headers[key] = value;
        });
        console.log('🏷️ [TEST-DEBUG] Headers de réponse:', headers);

        // Essayer de récupérer le body
        let responseBody = null;
        try {
            const textResponse = await response.text();
            console.log('📄 [TEST-DEBUG] Body de la réponse (texte):', textResponse);

            if (textResponse) {
                try {
                    responseBody = JSON.parse(textResponse);
                    console.log('📄 [TEST-DEBUG] Body de la réponse (JSON):', responseBody);
                } catch (jsonError) {
                    console.log('⚠️ [TEST-DEBUG] Body n\'est pas du JSON valide');
                }
            }
        } catch (bodyError) {
            console.log('❌ [TEST-DEBUG] Erreur lors de la lecture du body:', bodyError);
        }

        const result = {
            success: response.ok,
            status: response.status,
            statusText: response.statusText,
            responseTime: responseTime,
            headers: headers,
            body: responseBody,
            message: response.ok ? 'Backend accessible ✅' : 'Backend inaccessible ❌'
        };

        console.log('🎯 [TEST-DEBUG] Résultat final du test de connectivité:', result);
        return result;

    } catch (error) {
        console.error('💥 [TEST-DEBUG] Exception lors du test de connectivité:', error);
        console.error('💥 [TEST-DEBUG] Type d\'erreur:', error.constructor.name);
        console.error('💥 [TEST-DEBUG] Message d\'erreur:', error.message);
        console.error('💥 [TEST-DEBUG] Stack trace:', error.stack);

        const result = {
            success: false,
            error: error.message,
            errorType: error.constructor.name,
            message: 'Impossible de se connecter au backend ❌'
        };

        console.log('🎯 [TEST-DEBUG] Résultat final avec erreur:', result);
        return result;
    }
}

/**
 * 📝 Teste l'endpoint d'inscription avec debug complet
 * @param {Object} userData - Données utilisateur pour l'inscription
 */
export async function testRegisterEndpoint(userData) {
    console.log('🚀 [REGISTER-DEBUG] Début du test d\'inscription...');
    console.log('👤 [REGISTER-DEBUG] Données utilisateur envoyées:', {
        ...userData,
        password: '***masqué***',
        password_confirmation: '***masqué***'
    });

    try {
        const startTime = Date.now();
        console.log('⏰ [REGISTER-DEBUG] Timestamp début:', new Date().toISOString());

        const registerUrl = `${BACKEND_URL}/user/register`;
        console.log('📡 [REGISTER-DEBUG] URL d\'inscription:', registerUrl);

        // Préparer le body de la requête
        const requestBody = JSON.stringify(userData);
        console.log('📤 [REGISTER-DEBUG] Body de la requête (JSON):', requestBody);

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        console.log('🏷️ [REGISTER-DEBUG] Headers de la requête:', headers);

        const response = await fetch(registerUrl, {
            method: 'POST',
            headers: headers,
            body: requestBody,
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        console.log('📊 [REGISTER-DEBUG] Réponse reçue après', responseTime, 'ms');
        console.log('📡 [REGISTER-DEBUG] Status de la réponse:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            type: response.type
        });

        // Analyser les headers de réponse
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
        });
        console.log('🏷️ [REGISTER-DEBUG] Headers de réponse:', responseHeaders);

        // Récupérer et analyser la réponse
        let data = {};
        const textResponse = await response.text();
        console.log('📄 [REGISTER-DEBUG] Réponse brute (texte):', textResponse);

        if (textResponse) {
            try {
                data = JSON.parse(textResponse);
                console.log('📄 [REGISTER-DEBUG] Réponse parsée (JSON):', data);
            } catch (jsonError) {
                console.error('⚠️ [REGISTER-DEBUG] Impossible de parser le JSON:', jsonError);
                console.log('⚠️ [REGISTER-DEBUG] Contenu reçu:', textResponse);
            }
        }

        // Analyser le contenu de la réponse
        console.log('🔍 [REGISTER-DEBUG] Analyse de la réponse:');
        console.log('  - A un token:', !!data.token);
        console.log('  - A un utilisateur:', !!data.user);
        console.log('  - Type de token:', data.token ? typeof data.token : 'N/A');
        console.log('  - Rôle utilisateur:', data.user?.role || 'N/A');
        console.log('  - ID utilisateur:', data.user?.id || 'N/A');
        console.log('  - Email utilisateur:', data.user?.email || 'N/A');

        if (data.errors) {
            console.log('⚠️ [REGISTER-DEBUG] Erreurs de validation:', data.errors);
        }

        if (data.message) {
            console.log('💬 [REGISTER-DEBUG] Message du serveur:', data.message);
        }

        const result = {
            success: response.ok,
            status: response.status,
            statusText: response.statusText,
            responseTime: responseTime,
            data: data,
            hasToken: !!data.token,
            hasUser: !!data.user,
            userRole: data.user?.role,
            userData: userData, // Garder pour les tests de login
            message: response.ok ? 'Inscription réussie ✅' : 'Erreur d\'inscription ❌'
        };

        console.log('🎯 [REGISTER-DEBUG] Résultat final de l\'inscription:', result);
        return result;

    } catch (error) {
        console.error('💥 [REGISTER-DEBUG] Exception lors de l\'inscription:', error);
        console.error('💥 [REGISTER-DEBUG] Type d\'erreur:', error.constructor.name);
        console.error('💥 [REGISTER-DEBUG] Message d\'erreur:', error.message);
        console.error('💥 [REGISTER-DEBUG] Stack trace:', error.stack);

        const result = {
            success: false,
            error: error.message,
            errorType: error.constructor.name,
            userData: userData,
            message: 'Erreur lors du test d\'inscription ❌'
        };

        console.log('🎯 [REGISTER-DEBUG] Résultat final avec erreur:', result);
        return result;
    }
}

/**
 * 🔑 Teste l'endpoint de connexion avec debug complet
 * @param {Object} credentials - Identifiants de connexion
 */
export async function testLoginEndpoint(credentials) {
    console.log('🚀 [LOGIN-DEBUG] Début du test de connexion...');
    console.log('🔐 [LOGIN-DEBUG] Identifiants utilisés:', {
        email: credentials.email,
        password: '***masqué***'
    });

    try {
        const startTime = Date.now();
        console.log('⏰ [LOGIN-DEBUG] Timestamp début:', new Date().toISOString());

        const loginUrl = `${BACKEND_URL}/user/signin`;
        console.log('📡 [LOGIN-DEBUG] URL de connexion:', loginUrl);

        const requestBody = JSON.stringify(credentials);
        console.log('📤 [LOGIN-DEBUG] Body de la requête (JSON):', requestBody);

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        console.log('🏷️ [LOGIN-DEBUG] Headers de la requête:', headers);

        const response = await fetch(loginUrl, {
            method: 'POST',
            headers: headers,
            body: requestBody,
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        console.log('📊 [LOGIN-DEBUG] Réponse reçue après', responseTime, 'ms');
        console.log('📡 [LOGIN-DEBUG] Status de la réponse:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            type: response.type
        });

        // Analyser les headers de réponse
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
        });
        console.log('🏷️ [LOGIN-DEBUG] Headers de réponse:', responseHeaders);

        // Récupérer et analyser la réponse
        let data = {};
        const textResponse = await response.text();
        console.log('📄 [LOGIN-DEBUG] Réponse brute (texte):', textResponse);

        if (textResponse) {
            try {
                data = JSON.parse(textResponse);
                console.log('📄 [LOGIN-DEBUG] Réponse parsée (JSON):', data);
            } catch (jsonError) {
                console.error('⚠️ [LOGIN-DEBUG] Impossible de parser le JSON:', jsonError);
                console.log('⚠️ [LOGIN-DEBUG] Contenu reçu:', textResponse);
            }
        }

        // Analyser le contenu de la réponse
        console.log('🔍 [LOGIN-DEBUG] Analyse de la réponse:');
        console.log('  - A un token:', !!data.token);
        console.log('  - A un utilisateur:', !!data.user);
        console.log('  - Type de token:', data.token ? typeof data.token : 'N/A');
        console.log('  - Rôle utilisateur:', data.user?.role || 'N/A');
        console.log('  - ID utilisateur:', data.user?.id || 'N/A');
        console.log('  - Email utilisateur:', data.user?.email || 'N/A');

        if (data.errors) {
            console.log('⚠️ [LOGIN-DEBUG] Erreurs de validation:', data.errors);
        }

        if (data.message) {
            console.log('💬 [LOGIN-DEBUG] Message du serveur:', data.message);
        }

        const result = {
            success: response.ok,
            status: response.status,
            statusText: response.statusText,
            responseTime: responseTime,
            data: data,
            hasToken: !!data.token,
            hasUser: !!data.user,
            userRole: data.user?.role,
            message: response.ok ? 'Connexion réussie ✅' : 'Erreur de connexion ❌'
        };

        console.log('🎯 [LOGIN-DEBUG] Résultat final de la connexion:', result);
        return result;

    } catch (error) {
        console.error('💥 [LOGIN-DEBUG] Exception lors de la connexion:', error);
        console.error('💥 [LOGIN-DEBUG] Type d\'erreur:', error.constructor.name);
        console.error('💥 [LOGIN-DEBUG] Message d\'erreur:', error.message);
        console.error('💥 [LOGIN-DEBUG] Stack trace:', error.stack);

        const result = {
            success: false,
            error: error.message,
            errorType: error.constructor.name,
            message: 'Erreur lors du test de connexion ❌'
        };

        console.log('🎯 [LOGIN-DEBUG] Résultat final avec erreur:', result);
        return result;
    }
}

/**
 * 🏃‍♂️ Exécute une batterie complète de tests avec debug détaillé
 */
export async function runFullBackendTest() {
    console.log('🚀🚀🚀 [FULL-TEST-DEBUG] Démarrage des tests backend complets...');
    console.log('⏰ [FULL-TEST-DEBUG] Début des tests:', new Date().toISOString());
    console.log('🌐 [FULL-TEST-DEBUG] Environment:', {
        userAgent: navigator.userAgent,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
    });

    const results = {
        connectivity: null,
        register: null,
        login: null,
        overall: false,
        startTime: Date.now(),
        endTime: null
    };

    console.log('📋 [FULL-TEST-DEBUG] Plan des tests:');
    console.log('  1. Test de connectivité backend');
    console.log('  2. Test d\'inscription avec utilisateur temporaire');
    console.log('  3. Test de connexion avec le même utilisateur');

    // Test 1: Connectivité
    console.log('\n🔍 [FULL-TEST-DEBUG] === PHASE 1: CONNECTIVITÉ ===');
    results.connectivity = await testBackendConnection();

    if (!results.connectivity.success) {
        console.log('❌ [FULL-TEST-DEBUG] Tests arrêtés - Backend inaccessible');
        console.log('🛑 [FULL-TEST-DEBUG] Raison:', results.connectivity.message);
        results.endTime = Date.now();
        console.log('⏱️ [FULL-TEST-DEBUG] Durée totale:', results.endTime - results.startTime, 'ms');
        return results;
    }

    console.log('✅ [FULL-TEST-DEBUG] Connectivité OK, passage à l\'inscription');

    // Test 2: Inscription avec données uniques
    console.log('\n📝 [FULL-TEST-DEBUG] === PHASE 2: INSCRIPTION ===');
    const timestamp = Date.now();
    const testUserData = {
        nom: `Test User Debug ${timestamp}`,
        email: `test.debug.${timestamp}@studam.test`,
        password: 'TestPassword123!',
        password_confirmation: 'TestPassword123!',
        role: 'teacher'
    };

    console.log('👤 [FULL-TEST-DEBUG] Utilisateur de test créé:', {
        ...testUserData,
        password: '***masqué***',
        password_confirmation: '***masqué***'
    });

    results.register = await testRegisterEndpoint(testUserData);

    if (results.register.success) {
        console.log('✅ [FULL-TEST-DEBUG] Inscription réussie, passage à la connexion');

        // Test 3: Connexion avec les mêmes données
        console.log('\n🔑 [FULL-TEST-DEBUG] === PHASE 3: CONNEXION ===');
        results.login = await testLoginEndpoint({
            email: testUserData.email,
            password: testUserData.password
        });
    } else {
        console.log('❌ [FULL-TEST-DEBUG] Inscription échouée, pas de test de connexion');
        console.log('❌ [FULL-TEST-DEBUG] Détails:', results.register);
    }

    // Évaluation globale
    results.overall = results.connectivity.success &&
        results.register.success &&
        (results.login?.success ?? false);

    results.endTime = Date.now();
    const totalTime = results.endTime - results.startTime;

    console.log('\n🏁 [FULL-TEST-DEBUG] === RÉSULTATS FINAUX ===');
    console.log('⏱️ [FULL-TEST-DEBUG] Durée totale des tests:', totalTime, 'ms');
    console.log('📊 [FULL-TEST-DEBUG] Résumé:');
    console.log('  - Connectivité:', results.connectivity.success ? '✅' : '❌');
    console.log('  - Inscription:', results.register.success ? '✅' : '❌');
    console.log('  - Connexion:', results.login?.success ? '✅' : '❌');
    console.log('  - Global:', results.overall ? '✅ TOUS LES TESTS PASSÉS' : '❌ ÉCHECS DÉTECTÉS');

    if (!results.overall) {
        console.log('\n🔧 [FULL-TEST-DEBUG] SUGGESTIONS DE DEBUGGING:');
        if (!results.connectivity.success) {
            console.log('  - Vérifiez que le backend est démarré');
            console.log('  - Vérifiez l\'URL:', BACKEND_URL);
            console.log('  - Vérifiez les CORS du backend');
        }
        if (!results.register.success) {
            console.log('  - Vérifiez les champs requis pour l\'inscription');
            console.log('  - Vérifiez les règles de validation côté backend');
            console.log('  - Status reçu:', results.register.status);
        }
        if (!results.login?.success) {
            console.log('  - Vérifiez que l\'inscription a bien créé l\'utilisateur');
            console.log('  - Vérifiez le hash du mot de passe côté backend');
            console.log('  - Status reçu:', results.login?.status);
        }
    }

    console.log('\n🎯 [FULL-TEST-DEBUG] Tests terminés!');
    return results;
}

/**
 * 🛠️ Fonction d'aide pour débugger un endpoint spécifique
 * @param {string} endpoint - L'endpoint à tester (ex: '/health', '/user/register')
 * @param {string} method - La méthode HTTP (GET, POST, etc.)
 * @param {Object} data - Les données à envoyer (optionnel)
 */
export async function debugEndpoint(endpoint, method = 'GET', data = null) {
    console.log(`🔧 [DEBUG-ENDPOINT] Test de l'endpoint: ${method} ${endpoint}`);

    const url = `${BACKEND_URL}${endpoint}`;
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
        console.log('📤 [DEBUG-ENDPOINT] Données envoyées:', data);
    }

    try {
        const response = await fetch(url, options);
        const text = await response.text();

        console.log('📡 [DEBUG-ENDPOINT] Réponse:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: text
        });

        return { success: response.ok, status: response.status, body: text };
    } catch (error) {
        console.error('💥 [DEBUG-ENDPOINT] Erreur:', error);
        return { success: false, error: error.message };
    }
}

// Exposer toutes les fonctions pour usage dans la console
if (typeof window !== 'undefined') {
    window.STUDAM_DEBUG = {
        testBackendConnection,
        testRegisterEndpoint,
        testLoginEndpoint,
        runFullBackendTest,
        debugEndpoint,
        BACKEND_URL
    };

    console.log('🧪 [STUDAM] Fonctions de debug chargées!');
    console.log('🔧 [STUDAM] Utilisez: STUDAM_DEBUG.runFullBackendTest() pour tester tout');
    console.log('🔧 [STUDAM] Ou: STUDAM_DEBUG.debugEndpoint("/health") pour tester un endpoint');
}
