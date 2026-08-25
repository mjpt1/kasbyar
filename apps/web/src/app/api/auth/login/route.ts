import { NextResponse } from 'next/server';

import type { MembershipRole } from '@prisma/client';

import { apiSuccess, apiError } from '@/lib/api-response';
import { applyAuthCookies } from '@/lib/auth/cookie-options';
import {
  MOBILE_CLIENT_HEADER,
  MOBILE_CLIENT_VALUE,
  ORG_COOKIE,
} from '@/lib/auth/constants';
import { getDefaultHomePath } from '@/lib/permissions';
import { loginSchema } from '@/lib/validators';
import { loginUser } from '@/server/auth/auth.service';
import { needsOnboarding } from '@/server/onboarding/onboarding.service';
import { listUserWorkspaces } from '@/server/workspace/workspace.service';

export const dynamic = 'force-dynamic';

function isMobileClient(request: Request): boolean {
  return request.headers.get(MOBILE_CLIENT_HEADER) === MOBILE_CLIENT_VALUE;
}

function readRequestCookie(request: Request, name: string): string | null {
  const raw = request.headers.get('cookie');
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    if (trimmed.slice(0, eq) === name) {
      return decodeURIComponent(trimmed.slice(eq + 1));
    }
  }
  return null;
}

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
    const isSuperAdmin = user.platformRole === 'SUPER_ADMIN';

    if (workspaces.length === 0 && !isSuperAdmin) {
      return NextResponse.json(
        apiError(
          'حساب شما به هیچ فضای کاری متصل نیست. دوباره ثبت‌نام کنید یا با پشتیبانی تماس بگیرید.',
          'NO_WORKSPACE',
        ),
        { status: 403 },
      );
    }

    const preferredOrgId = readRequestCookie(request, ORG_COOKIE);
    const active =
      workspaces.find((w) => w.organizationId === preferredOrgId) ??
      workspaces[0] ??
      null;
    const activeOrgId = active?.organizationId ?? null;
    let redirectTo =
      workspaces.length === 0 && isSuperAdmin
        ? '/admin'
        : active
          ? getDefaultHomePath(
              active.role as MembershipRole,
              active.industryPack,
              active.industrySpecialty,
            )
          : '/dashboard';
    if (
      active &&
      needsOnboarding(active.role, active.industryPack, active.industrySpecialty)
    ) {
      redirectTo = '/onboarding';
    }

    const mobile = isMobileClient(request);

    const response = NextResponse.json(
      apiSuccess({
        id: user.id,
        name: user.name,
        email: user.email,
        organizationId: activeOrgId,
        isSuperAdmin,
        redirectTo,
        ...(mobile
          ? {
              token,
              expiresAt: expiresAt.toISOString(),
              workspaces,
            }
          : {}),
      }),
    );

    applyAuthCookies(response, token, expiresAt, activeOrgId);
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'خطای سرور';
    return NextResponse.json(apiError(message), { status: 401 });
  }
}
