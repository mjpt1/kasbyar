import { NextResponse } from 'next/server';

import { apiSuccess, apiError } from '@/lib/api-response';
import { applyAuthCookies } from '@/lib/auth/cookie-options';
import { registerSchema } from '@/lib/validators';
import { loginUser, registerUser } from '@/server/auth/auth.service';
import { listUserWorkspaces } from '@/server/workspace/workspace.service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        apiError(
          parsed.error.errors[0]?.message ?? 'داده نامعتبر',
          'VALIDATION_ERROR',
        ),
        { status: 400 },
      );
    }

    await registerUser(parsed.data);
    const { user, token, expiresAt } = await loginUser(
      parsed.data.email,
      parsed.data.password,
    );

    const workspaces = await listUserWorkspaces(user.id);
    if (workspaces.length === 0) {
      return NextResponse.json(
        apiError(
          'ثبت‌نام انجام شد ولی فضای کاری ساخته نشد. دوباره تلاش کنید.',
          'NO_WORKSPACE',
        ),
        { status: 500 },
      );
    }

    const response = NextResponse.json(
      apiSuccess({
        registered: true,
        organizationId: workspaces[0]!.organizationId,
        redirectTo: '/onboarding',
      }),
      { status: 201 },
    );

    applyAuthCookies(response, token, expiresAt, workspaces[0]!.organizationId);
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'خطای سرور';
    return NextResponse.json(apiError(message), { status: 400 });
  }
}
