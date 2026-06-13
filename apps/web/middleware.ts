import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Logic OIDC/Keycloak akan diintegrasikan di sini
  // Untuk saat ini, mengamankan rute /dashboard
  const session = request.cookies.get('next-auth.session-token'); 
  
  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/api/auth/signin', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
