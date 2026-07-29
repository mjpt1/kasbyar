import { NextResponse } from 'next/server';

import { APP_LOG_EVENTS, logger } from '@/lib/logger';
import { resolveInstagramAppSecret } from '@/server/integrations/org-credentials.service';
import { handleInstagramInboundWebhook } from '@/server/messaging/inbox.service';
import { verifyMetaWebhookSignature } from '@/server/messaging/providers/instagram-dm';

/**
 * Instagram DM webhook — Meta Graph API.
 * Production requires Meta App Review for instagram_manage_messages permission.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ orgSlug: string }> },
) {
  const { orgSlug } = await context.params;
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  const expected = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN?.trim();

  if (mode === 'subscribe' && token && expected && token === expected && challenge) {
    logger.info(APP_LOG_EVENTS.INTEGRATION_PROVIDER_FAILED, {
      provider: 'instagram_dm',
      orgSlug,
      message: 'webhook verified',
    });
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ success: false }, { status: 403 });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ orgSlug: string }> },
) {
  const { orgSlug } = await context.params;
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const appSecret = await resolveInstagramAppSecret(orgSlug);

    if (!verifyMetaWebhookSignature(rawBody, signature, appSecret)) {
      logger.warn(APP_LOG_EVENTS.INTEGRATION_PROVIDER_FAILED, {
        provider: 'instagram_dm',
        orgSlug,
        message: 'invalid webhook signature',
      });
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const body = JSON.parse(rawBody) as unknown;
    const processed = await handleInstagramInboundWebhook(orgSlug, body);
    return NextResponse.json({ success: true, processed: processed.length });
  } catch (error) {
    logger.warn(APP_LOG_EVENTS.INTEGRATION_PROVIDER_FAILED, {
      provider: 'instagram_dm',
      orgSlug,
      message: error instanceof Error ? error.message : 'webhook error',
    });
    return NextResponse.json({ success: true });
  }
}
