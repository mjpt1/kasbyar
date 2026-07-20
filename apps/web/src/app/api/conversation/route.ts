import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { conversationSchema } from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import { askBusinessAssistant } from '@/server/intelligence/intelligence.service';
import { listDepartmentAgents } from '@/server/intelligence/agents/department-agents';

export async function GET() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    return jsonResponse(apiSuccess({ agents: listDepartmentAgents() }));
  } catch (error) {
    return handleApiError(error, 'conversation.GET');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const body = await request.json();
    const parsed = parseBody(conversationSchema, body);
    if (!parsed.ok) return parsed.response;

    const { assertFeature } = await import('@/server/billing/entitlement.service');
    await assertFeature(session.organizationId, 'aiAssistant');

    const answer = await askBusinessAssistant(
      session.organizationId,
      parsed.data.question,
      {
        userId: session.user.id,
        sessionId: parsed.data.sessionId,
        agentType: parsed.data.agentType,
      },
    );

    return jsonResponse(apiSuccess(answer));
  } catch (error) {
    return handleApiError(error, 'conversation.POST');
  }
}
