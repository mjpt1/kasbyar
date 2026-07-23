import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { parseBody } from '@/lib/validators/parse';
import { chatCreateSchema } from '@/lib/validators/chat-support';
import {
  createChannelConversation,
  createDirectConversation,
  listConversations,
  listOrgMembersForChat,
} from '@/server/chat/chat.service';

export async function GET() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const [conversations, members] = await Promise.all([
      listConversations(session.organizationId, session.user.id),
      listOrgMembersForChat(session.organizationId, session.user.id),
    ]);

    return jsonResponse(
      apiSuccess({
        conversations,
        members,
        currentUserId: session.user.id,
      }),
    );
  } catch (error) {
    return handleApiError(error, 'chat.conversations.GET');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const body = await request.json();
    const parsed = parseBody(chatCreateSchema, body);
    if (!parsed.ok) return parsed.response;

    const conversation =
      parsed.data.type === 'direct'
        ? await createDirectConversation(
            session.organizationId,
            session.user.id,
            parsed.data.peerUserId,
          )
        : await createChannelConversation(
            session.organizationId,
            session.user.id,
            parsed.data.name,
          );

    return jsonResponse(apiSuccess(conversation), 201);
  } catch (error) {
    return handleApiError(error, 'chat.conversations.POST');
  }
}
