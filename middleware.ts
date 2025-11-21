import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const publicPaths = ['/login', '/register', '/api/auth', '/demo', '/', '/home', '/dashboard'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Si es una ruta pública, permitir el acceso
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Verificar si hay un token de autenticación en las cookies
  const token = request.cookies.get('directus_token')?.value;
  
  // Si no hay token y no es una ruta pública, redirigir al login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si hay token, permitir el acceso
  return NextResponse.next();
}

// Configurar en qué rutas se aplica el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};