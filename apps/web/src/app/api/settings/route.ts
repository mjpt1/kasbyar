import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { isApiError, requireApiSession } from '@/lib/api-auth';
import { AppError } from '@/lib/errors';
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
        name: parsed.data.name,
        address: parsed.data.address,
        taxId: parsed.data.taxId,
        email: parsed.data.email === '' ? null : parsed.data.email,
        phone: parsed.data.phone === '' ? null : parsed.data.phone,
        sheba: parsed.data.sheba === '' || parsed.data.sheba === undefined ? null : parsed.data.sheba,
        economicCode:
          parsed.data.economicCode === '' || parsed.data.economicCode === undefined
            ? null
            : parsed.data.economicCode,
        companyNationalId:
          parsed.data.companyNationalId === '' || parsed.data.companyNationalId === undefined
            ? null
            : parsed.data.companyNationalId,
        postalCode:
          parsed.data.postalCode === '' || parsed.data.postalCode === undefined
            ? null
            : parsed.data.postalCode,
        province: parsed.data.province === '' ? null : parsed.data.province,
        city: parsed.data.city === '' ? null : parsed.data.city,
        taxMemoryId: parsed.data.taxMemoryId === '' ? null : parsed.data.taxMemoryId,
        defaultVatRate: parsed.data.defaultVatRate,
        showTomanAlongside: parsed.data.showTomanAlongside,
        industrySpecialty: parsed.data.industrySpecialty,
      },
    );
    return jsonResponse(apiSuccess(org));
  } catch (err) {
    if (err instanceof AppError) {
      return errorResponse(err.message, err.status, err.code);
    }
    const message = err instanceof Error ? err.message : 'خطا در به‌روزرسانی';
    return errorResponse(message, 403, 'FORBIDDEN');
  }
}
