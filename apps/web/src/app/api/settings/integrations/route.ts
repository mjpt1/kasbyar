import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { isApiError, requireApiSession } from '@/lib/api-auth';
import { AppError, ForbiddenError } from '@/lib/errors';
import { canManageSettings } from '@/lib/permissions';
import { orgIntegrationsUpdateSchema } from '@/lib/validators';
import {
  getOrgIntegrationsPublicView,
  updateOrgIntegrations,
} from '@/server/integrations/org-credentials.service';
import type { MembershipRole } from '@prisma/client';

export async function GET() {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  if (!canManageSettings(session.role as MembershipRole)) {
    return errorResponse(
      'فقط مالک یا مدیر می‌تواند تنظیمات یکپارچه‌سازی را ببیند',
      403,
      'FORBIDDEN',
    );
  }

  const view = await getOrgIntegrationsPublicView(session.organizationId);
  return jsonResponse(apiSuccess(view));
}

export async function PATCH(request: Request) {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const body = await request.json().catch(() => ({}));
  const parsed = orgIntegrationsUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? 'داده نامعتبر', 400);
  }

  try {
    const view = await updateOrgIntegrations(
      session.organizationId,
      session.role as MembershipRole,
      session.user.id,
      parsed.data,
    );
    return jsonResponse(apiSuccess(view));
  } catch (err) {
    if (err instanceof ForbiddenError || err instanceof AppError) {
      return errorResponse(err.message, err.status, err.code);
    }
    const message = err instanceof Error ? err.message : 'خطا در به‌روزرسانی';
    return errorResponse(message, 500);
  }
}
