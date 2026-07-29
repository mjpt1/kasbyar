import { apiSuccess, apiError, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { conversationSchema } from '@/lib/validators';
import { parseBody } from '@/lib/validators/parse';
import { askBusinessAssistant } from '@/server/intelligence/intelligence.service';
import { listDepartmentAgents } from '@/server/intelligence/agents/department-agents';
import {
  getConversationSessionMessages,
  listConversationSessions,
} from '@/server/intelligence/agent-orchestrator';

export async function GET(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      const history = await getConversationSessionMessages(
        session.organizationId,
        session.user.id,
        sessionId,
      );
      if (!history) {
        return jsonResponse(apiError('گفتگو یافت نشد', 'NOT_FOUND'), 404);
      }
      return jsonResponse(apiSuccess(history));
    }

    const sessions = await listConversationSessions(session.organizationId, session.user.id);
    return jsonResponse(
      apiSuccess({
        agents: listDepartmentAgents(),
        sessions: sessions.map((s) => ({
          id: s.id,
          title: s.title ?? 'گفتگو',
          updatedAt: s.updatedAt.toISOString(),
          messageCount: s._count.messages,
        })),
      }),
    );
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
