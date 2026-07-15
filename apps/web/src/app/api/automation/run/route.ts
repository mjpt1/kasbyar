import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { isApiError, requireApiSession } from '@/lib/api-auth';
import { hasMinRole } from '@/lib/permissions';
import type { MembershipRole } from '@prisma/client';
import { runAutomationForOrganization } from '@/server/automation/automation.service';

export async function POST() {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  if (!hasMinRole(session.role as MembershipRole, 'MANAGER')) {
    return errorResponse('دسترسی کافی برای اجرای اتوماسیون ندارید', 403, 'FORBIDDEN');
  }

  const results = await runAutomationForOrganization(
    session.organizationId,
    session.user.id,
  );

  return jsonResponse(
    apiSuccess({
      executedRules: results.length,
      results,
    }),
  );
}
