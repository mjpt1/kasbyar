import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { isApiError, requireApiSession } from '@/lib/api-auth';
import { organizationSettingsSchema } from '@/lib/validators';
import {
  getOrganizationSettings,
  updateOrganizationSettings,
} from '@/server/settings/settings.service';
import type { MembershipRole } from '@prisma/client';

export async function GET() {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const org = await getOrganizationSettings(session.organizationId);
  if (!org) return errorResponse('سازمان یافت نشد', 404, 'NOT_FOUND');

  return jsonResponse(apiSuccess(org));
}

export async function PATCH(request: Request) {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const body = await request.json();
  const parsed = organizationSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? 'داده نامعتبر', 400);
  }

  try {
    const org = await updateOrganizationSettings(
      session.organizationId,
      session.role as MembershipRole,
      session.user.id,
      {
        ...parsed.data,
        email: parsed.data.email === '' ? null : parsed.data.email,
        phone: parsed.data.phone === '' ? null : parsed.data.phone,
      },
    );
    return jsonResponse(apiSuccess(org));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'خطا در به‌روزرسانی';
    return errorResponse(message, 403, 'FORBIDDEN');
  }
}
