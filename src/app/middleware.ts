import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET!,
    secureCookie: process.env.NODE_ENV === 'production',
  });
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isStudentRoute = pathname.startsWith('/student');
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // 1. Redirect to login if trying to access protected routes without a token
  if ((isAdminRoute || isStudentRoute) && !token) {
    const url = new URL('/login', req.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // 2. Role-based protection
  if (token) {
    if (isAdminRoute && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/student/dashboard', req.url));
    }
    if (isStudentRoute && token.role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    if (isAuthPage) {
      return NextResponse.redirect(
        new URL(token.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard', req.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};