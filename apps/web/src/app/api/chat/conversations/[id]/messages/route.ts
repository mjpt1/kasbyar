import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { parseBody } from '@/lib/validators/parse';
import { chatMessageSchema } from '@/lib/validators/chat-support';
import { listMessages, sendMessage } from '@/server/chat/chat.service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') ?? undefined;

    const data = await listMessages(session.organizationId, session.user.id, id, { cursor });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'chat.messages.GET');
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { id } = await params;
    const body = await request.json();
    const parsed = parseBody(chatMessageSchema, body);
    if (!parsed.ok) return parsed.response;

    const message = await sendMessage(
      session.organizationId,
      session.user.id,
      id,
      parsed.data.body,
    );

    return jsonResponse(apiSuccess(message), 201);
  } catch (error) {
    return handleApiError(error, 'chat.messages.POST');
  }
}
