import { apiSuccess, jsonResponse } from '@/lib/api-response';
import {
  handleApiError,
  isApiError,
  requireApiRole,
  requireApiSession,
} from '@/lib/api-auth';
import { automationRuleSchema } from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import {
  createAutomationRule,
  listAutomationRules,
} from '@/server/reports/reports.service';

export async function GET() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const data = await listAutomationRules(session.organizationId);
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'automation.GET');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const denied = requireApiRole(session, 'ADMIN');
    if (denied) return denied;

    const body = await request.json();
    const parsed = parseBody(automationRuleSchema, body);
    if (!parsed.ok) return parsed.response;

    const { assertFeature, assertQuota } = await import('@/server/billing/entitlement.service');
    await assertFeature(session.organizationId, 'automation');
    await assertQuota(session.organizationId, 'automationRules');

    const rule = await createAutomationRule(session.organizationId, parsed.data);
    return jsonResponse(apiSuccess(rule), 201);
  } catch (error) {
    return handleApiError(error, 'automation.POST');
  }
}
