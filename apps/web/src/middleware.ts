import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import {
  SESSION_COOKIE,
  clearAuthCookiesOnResponse,
} from '@/lib/auth/cookie-options';

const publicPaths = ['/', '/login', '/register', '/offline', '/pay'];
const workspacePaths = ['/workspace/select'];
const authPaths = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  const isPublic =
    pathname === '/' || publicPaths.some((p) => p !== '/' && pathname.startsWith(p));
  const isAuthPage = authPaths.some((p) => p === pathname);
  const expired = request.nextUrl.searchParams.get('expired') === '1';

  // Always serve the marketing landing at "/".
  // Do not redirect based on cookie *presence* alone — stale cookies caused
  // "/" → /dashboard → /login?expired=1 loops and hid the landing page.
  if (pathname === '/' || pathname === '/offline') {
    return NextResponse.next();
  }

  if (isAuthPage) {
    const response = NextResponse.next();
    if (expired) clearAuthCookiesOnResponse(response);
    return response;
  }

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && workspacePaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|landing|icons|brand|sw\\.js|manifest\\.webmanifest).*)',
  ],
};
