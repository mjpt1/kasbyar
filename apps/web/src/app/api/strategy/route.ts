import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiRole, requireApiSession } from '@/lib/api-auth';
import { strategySchema } from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import { generateStrategyPlan, listStrategyPlans } from '@/server/strategy/strategy.service';

export async function GET() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const denied = requireApiRole(session, 'STAFF');
    if (denied) return denied;
    return jsonResponse(apiSuccess(await listStrategyPlans(session.organizationId)));
  } catch (error) {
    return handleApiError(error, 'strategy.GET');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    const denied = requireApiRole(session, 'STAFF');
    if (denied) return denied;
    const body = await request.json();
    const parsed = parseBody(strategySchema, body);
    if (!parsed.ok) return parsed.response;
    const plan = await generateStrategyPlan(session.organizationId, parsed.data.goal);
    return jsonResponse(apiSuccess(plan));
  } catch (error) {
    return handleApiError(error, 'strategy.POST');
  }
}
