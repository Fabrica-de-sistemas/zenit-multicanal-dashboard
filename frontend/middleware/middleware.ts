// frontend/middleware/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('zenitToken')?.value;
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null;

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register');

  const isSettingsPage = request.nextUrl.pathname.startsWith('/dashboard/settings');

  // Redireciona para login se não estiver autenticado
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redireciona para dashboard se estiver autenticado e tentar acessar páginas de auth
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protege a rota de settings para apenas administradores
  if (isSettingsPage && user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};