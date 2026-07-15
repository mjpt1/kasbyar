import { apiSuccess, errorResponse, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { setActiveOrganizationCookie } from '@/lib/auth/session';
import { APP_LOG_EVENTS, logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import { workspaceSelectSchema } from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import { ForbiddenError } from '@/lib/errors';
import { resolveMembership } from '@/server/workspace/workspace.service';

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const limit = checkRateLimit(`workspace-select:${session.user.id}`, 20, 60_000);
    if (!limit.allowed) {
      return errorResponse('تعداد درخواست بیش از حد مجاز است', 429, 'RATE_LIMIT');
    }

    const body = await request.json();
    const parsed = parseBody(workspaceSelectSchema, body);
    if (!parsed.ok) return parsed.response;

    const membership = await resolveMembership(
      session.user.id,
      parsed.data.organizationId,
    );
    if (!membership) {
      throw new ForbiddenError('دسترسی به این فضای کاری مجاز نیست');
    }

    await setActiveOrganizationCookie(parsed.data.organizationId);

    logger.info(APP_LOG_EVENTS.WORKSPACE_SELECTED, {
      userId: session.user.id,
      organizationId: parsed.data.organizationId,
    });

    return jsonResponse(
      apiSuccess({
        organizationId: membership.organizationId,
        organizationName: membership.organization.name,
      }),
    );
  } catch (error) {
    return handleApiError(error, 'workspace.POST');
  }
}

export async function GET() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { listUserWorkspaces } = await import('@/server/workspace/workspace.service');
    const workspaces = await listUserWorkspaces(session.user.id);

    return jsonResponse(apiSuccess(workspaces));
  } catch (error) {
    return handleApiError(error, 'workspace.GET');
  }
}
