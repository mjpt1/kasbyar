import type { InboxChannel } from '@kesbyar/shared';
import type { MessageChannel } from '@prisma/client';
import { isApiError, requireApiSession } from '@/lib/api-auth';
import { listInboxThreads } from '@/server/messaging/inbox.service';

export const dynamic = 'force-dynamic';

const INBOX_CHANNELS: InboxChannel[] = [
  'WHATSAPP',
  'SMS',
  'EMAIL',
  'PHONE',
  'TELEGRAM',
  'INSTAGRAM',
];

/**
 * Lightweight SSE stream — polls inbox every 15s and pushes updates.
 * Client fallback: InboxThreadList also polls /api/inbox directly.
 */
export async function GET(request: Request) {
  const session = await requireApiSession();
  if (isApiError(session)) return session;

  const { searchParams } = new URL(request.url);
  const channelParam = searchParams.get('channel');
  const channel =
    channelParam && INBOX_CHANNELS.includes(channelParam as InboxChannel)
      ? (channelParam as MessageChannel)
      : undefined;

  const orgId = session.organizationId;
  const encoder = new TextEncoder();
  let lastFingerprint = '';

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      const poll = async () => {
        try {
          const data = await listInboxThreads(orgId, { pageSize: 50, channel });
          const fingerprint = data.items
            .map((t) => `${t.id}:${t.lastMessageAt}:${t.unreadCount}`)
            .join('|');
          if (fingerprint !== lastFingerprint) {
            lastFingerprint = fingerprint;
            send({ type: 'threads', data });
          } else {
            send({ type: 'heartbeat', at: new Date().toISOString() });
          }
        } catch {
          send({ type: 'error', message: 'poll_failed' });
        }
      };

      await poll();
      const interval = setInterval(() => void poll(), 15_000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
