import { NextResponse } from 'next/server';

import { handleVoipWebhook } from '@/server/messaging/calls.service';

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
    const secretHeader =
      request.headers.get('x-voip-secret') ??
      request.headers.get('x-webhook-secret') ??
      new URL(request.url).searchParams.get('secret');

    await handleVoipWebhook(orgSlug, body, { secretHeader });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
