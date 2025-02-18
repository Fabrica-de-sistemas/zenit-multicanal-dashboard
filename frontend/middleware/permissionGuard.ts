// middleware/permissionGuard.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const user = JSON.parse(atob(token.split('.')[1]));
  const path = request.nextUrl.pathname;

  // Protege as rotas baseado nas permissões
  if (path.startsWith('/dashboard/settings') && !user.permissions.includes('manage_users')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (path.startsWith('/dashboard/company-chat') && !user.permissions.includes('view_chat')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (path === '/dashboard' && !user.permissions.includes('view_tickets')) {
    // Se não tiver acesso ao dashboard, redireciona para a primeira rota que tem acesso
    if (user.permissions.includes('view_chat')) {
      return NextResponse.redirect(new URL('/dashboard/company-chat', request.url));
    }
    if (user.permissions.includes('manage_users')) {
      return NextResponse.redirect(new URL('/dashboard/settings', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};