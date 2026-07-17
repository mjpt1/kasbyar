import { cookies } from 'next/headers';

import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { SESSION_COOKIE } from '@/lib/auth/crypto';
import { setActiveOrganizationCookie } from '@/lib/auth/session';
import { shouldUseSecureCookies } from '@/lib/env';
import { loginSchema } from '@/lib/validators';
import { loginUser } from '@/server/auth/auth.service';
import { listUserWorkspaces } from '@/server/workspace/workspace.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        parsed.error.errors[0]?.message ?? 'داده نامعتبر',
        400,
        'VALIDATION_ERROR',
      );
    }

    const { user, token, expiresAt } = await loginUser(
      parsed.data.email,
      parsed.data.password,
    );

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: shouldUseSecureCookies(),
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });

    const workspaces = await listUserWorkspaces(user.id);
    if (workspaces[0]) {
      await setActiveOrganizationCookie(workspaces[0].organizationId);
    }

    return jsonResponse(
      apiSuccess({
        id: user.id,
        name: user.name,
        email: user.email,
      }),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'خطای سرور';
    return errorResponse(message, 401);
  }
}
