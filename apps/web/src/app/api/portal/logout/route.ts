import { NextResponse } from 'next/server';

import { clearPortalCookieOnResponse } from '@/lib/auth/cookie-options';

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearPortalCookieOnResponse(response);
  return response;
}
