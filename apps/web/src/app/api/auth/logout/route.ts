import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { apiSuccess } from '@/lib/api-response';
import {
  SESSION_COOKIE,
  clearAuthCookiesOnResponse,
} from '@/lib/auth/cookie-options';
import { logoutUser } from '@/server/auth/auth.service';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await logoutUser(token);
  }

  const response = NextResponse.json(apiSuccess({ loggedOut: true }));
  clearAuthCookiesOnResponse(response);
  return response;
}
