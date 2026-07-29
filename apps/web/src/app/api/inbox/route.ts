import type { InboxChannel } from '@kesbyar/shared';
import type { MessageChannel } from '@prisma/client';
import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { listInboxThreads } from '@/server/messaging/inbox.service';

const INBOX_CHANNELS: InboxChannel[] = [
  'WHATSAPP',
  'SMS',
  'EMAIL',
  'PHONE',
  'TELEGRAM',
  'INSTAGRAM',
];

export async function GET(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') ?? 1);
    const channelParam = searchParams.get('channel');
    const channel =
      channelParam && INBOX_CHANNELS.includes(channelParam as InboxChannel)
        ? (channelParam as MessageChannel)
        : undefined;

    const data = await listInboxThreads(session.organizationId, {
      page,
      channel,
    });
    return jsonResponse(apiSuccess(data));
  } catch (error) {
    return handleApiError(error, 'inbox.GET');
  }
}
