import { NextResponse } from 'next/server';

import { handleWhatsAppWebhook } from '@/server/messaging/inbox.service';

function verifyToken(): string {
  return process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim() ?? '';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token && token === verifyToken() && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await handleWhatsAppWebhook(body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
