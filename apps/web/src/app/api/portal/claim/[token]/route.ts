import { NextResponse } from 'next/server';

import { applyPortalCookie } from '@/lib/auth/cookie-options';
import { claimPortalSession } from '@/server/portal/customer-portal.service';

export const dynamic = 'force-dynamic';

/** Claim portal token into httpOnly session cookie, then redirect to /portal */
export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const claimed = await claimPortalSession(token);
  if (!claimed) {
    return NextResponse.redirect(new URL('/portal/login?error=expired', _request.url));
  }

  const response = NextResponse.redirect(new URL('/portal', _request.url));
  applyPortalCookie(response, claimed.token, claimed.expiresAt);
  return response;
}
