import { apiSuccess, jsonResponse } from '@/lib/api-response';
import {
  handleApiError,
  isApiError,
  requireApiRole,
  requireApiSession,
} from '@/lib/api-auth';
import { parseBody } from '@/lib/validators/parse';
import { orgModuleToggleSchema } from '@/lib/validators/chat-support';
import {
  listOrgModulesForUi,
  setOrgModuleEnabled,
} from '@/server/modules/org-module.service';

export async function GET() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const modules = await listOrgModulesForUi(session.organizationId);
    return jsonResponse(apiSuccess(modules));
  } catch (error) {
    return handleApiError(error, 'org-modules.GET');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const denied = requireApiRole(session, 'ADMIN');
    if (denied) return denied;

    const body = await request.json();
    const parsed = parseBody(orgModuleToggleSchema, body);
    if (!parsed.ok) return parsed.response;

    await setOrgModuleEnabled(
      session.organizationId,
      parsed.data.moduleKey,
      parsed.data.enabled,
    );

    const modules = await listOrgModulesForUi(session.organizationId);
    return jsonResponse(apiSuccess(modules));
  } catch (error) {
    return handleApiError(error, 'org-modules.POST');
  }
}
