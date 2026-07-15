import { cookies } from 'next/headers';

import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { SESSION_COOKIE } from '@/lib/auth/crypto';
import { logoutUser } from '@/server/auth/auth.service';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await logoutUser(token);
  }
  cookieStore.delete(SESSION_COOKIE);
  return jsonResponse(apiSuccess({ loggedOut: true }));
}
