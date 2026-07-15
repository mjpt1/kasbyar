import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { isApiError, requireApiSession } from '@/lib/api-auth';
import { automationToggleSchema } from '@/lib/validators';
import { toggleAutomationRule } from '@/server/reports/reports.service';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const { id } = await params;
  const body = await request.json();
  const parsed = automationToggleSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.errors[0]?.message ?? 'داده نامعتبر', 400);
  }

  const rule = await toggleAutomationRule(
    session.organizationId,
    id,
    parsed.data.isActive,
  );

  if (!rule) return errorResponse('قانون یافت نشد', 404, 'NOT_FOUND');
  return jsonResponse(apiSuccess(rule));
}
