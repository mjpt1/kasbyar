import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { ORG_COOKIE, SESSION_COOKIE } from '@/lib/auth/constants';

const publicPaths = ['/login', '/register'];
const workspacePaths = ['/workspace/select'];
const authPaths = ['/login', '/register'];

function clearAuthCookies(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  response.cookies.set(ORG_COOKIE, '', { path: '/', maxAge: 0 });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  const isAuthPage = authPaths.some((p) => pathname === p);
  const expired = request.nextUrl.searchParams.get('expired') === '1';

  // Landing is public for guests; signed-in users go to dashboard.
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Never bounce /login → /dashboard based only on cookie presence.
  // Invalid cookies previously caused ERR_TOO_MANY_REDIRECTS.
  if (isAuthPage) {
    const response = NextResponse.next();
    if (expired) clearAuthCookies(response);
    return response;
  }

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && workspacePaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|landing).*)'],
};
