import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Routes publiques qui ne nécessitent pas d'authentification
    const publicRoutes = [
        '/',
        '/auth/login',
        '/auth/register',
        '/auth/forgot-password',
        '/about',
        '/contact',
        '/features',
        '/terms',
        '/privacy'
    ];

    const adminRoutes = ['/admin'];
    const chiefRoutes = ['/chief'];
    const teacherRoutes = ['/teacher'];
    const studentRoutes = ['/student'];

    // Vérifier si la route est publique
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // Si c'est une route publique, laisser passer
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Pour les autres routes, vérifier l'authentification
    const token = request.cookies.get('authToken')?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '');

    // Si pas de token, rediriger vers la page de connexion
    if (!token) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ✅ CORRECTION: Gestion spécifique du dashboard générique
    if (pathname === '/dashboard') {
        // Rediriger vers /dashboard qui gérera la redirection selon le rôle
        return NextResponse.next();
    }

    // AMÉLIORATION: Vérification des permissions par route
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    const isChiefRoute = chiefRoutes.some(route => pathname.startsWith(route));
    const isTeacherRoute = teacherRoutes.some(route => pathname.startsWith(route));
    const isStudentRoute = studentRoutes.some(route => pathname.startsWith(route));

    // TODO: Ici on pourrait décoder le token pour vérifier les rôles
    // Pour l'instant, on laisse passer et la vérification se fait côté composant
    if (isAdminRoute || isChiefRoute || isTeacherRoute || isStudentRoute) {
        // La vérification des rôles se fera dans les composants
        // TODO: Implémenter la vérification JWT si nécessaire
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};