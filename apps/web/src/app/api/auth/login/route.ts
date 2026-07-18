import { NextResponse } from 'next/server';

import { apiSuccess, apiError } from '@/lib/api-response';
import { applyAuthCookies } from '@/lib/auth/cookie-options';
import { loginSchema } from '@/lib/validators';
import { loginUser } from '@/server/auth/auth.service';
import { listUserWorkspaces } from '@/server/workspace/workspace.service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        apiError(
          parsed.error.errors[0]?.message ?? 'داده نامعتبر',
          'VALIDATION_ERROR',
        ),
        { status: 400 },
      );
    }

    const { user, token, expiresAt } = await loginUser(
      parsed.data.email,
      parsed.data.password,
    );

    const workspaces = await listUserWorkspaces(user.id);
    if (workspaces.length === 0) {
      return NextResponse.json(
        apiError(
          'حساب شما به هیچ فضای کاری متصل نیست. دوباره ثبت‌نام کنید یا با پشتیبانی تماس بگیرید.',
          'NO_WORKSPACE',
        ),
        { status: 403 },
      );
    }

    const response = NextResponse.json(
      apiSuccess({
        id: user.id,
        name: user.name,
        email: user.email,
        organizationId: workspaces[0]!.organizationId,
      }),
    );

    applyAuthCookies(response, token, expiresAt, workspaces[0]!.organizationId);
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'خطای سرور';
    return NextResponse.json(apiError(message), { status: 401 });
  }
}
