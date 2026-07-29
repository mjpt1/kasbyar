import { NextResponse } from 'next/server';

import { handleKavenegarInboundWebhook } from '@/server/messaging/inbox.service';

export async function POST(
  request: Request,
  context: { params: Promise<{ orgSlug: string }> },
) {
  try {
    const { orgSlug } = await context.params;
    const contentType = request.headers.get('content-type') ?? '';
    const body =
      contentType.includes('application/json')
        ? await request.json()
        : await request.text();
    await handleKavenegarInboundWebhook(orgSlug, body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
