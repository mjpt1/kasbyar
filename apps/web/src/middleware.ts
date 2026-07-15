import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { SESSION_COOKIE } from '@/lib/auth/constants';

const publicPaths = ['/login', '/register'];
const workspacePaths = ['/workspace/select'];
const authPaths = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  const isAuthPage = authPaths.some((p) => pathname === p);

  if (!token && !isPublic && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (token && workspacePaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(token ? '/dashboard' : '/login', request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
