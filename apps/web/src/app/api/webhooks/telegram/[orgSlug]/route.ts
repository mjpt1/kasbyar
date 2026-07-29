import { NextResponse } from 'next/server';

import { handleTelegramInboundWebhook } from '@/server/messaging/inbox.service';

export async function POST(
  request: Request,
  context: { params: Promise<{ orgSlug: string }> },
) {
  try {
    const { orgSlug } = await context.params;
    const body = await request.json();
    await handleTelegramInboundWebhook(orgSlug, body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
