import { NextResponse } from 'next/server';

import { verifySubscriptionCheckout } from '@/server/billing/subscription-checkout.service';

function queryToRecord(url: URL): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  url.searchParams.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

async function handleCallback(request: Request, provider: string) {
  const url = new URL(request.url);
  const checkoutId = url.searchParams.get('checkoutId');
  const raw = queryToRecord(url);

  if (request.method === 'POST') {
    try {
      const body = (await request.json()) as Record<string, unknown>;
      for (const [k, v] of Object.entries(body)) {
        if (typeof v === 'string' || typeof v === 'number') {
          raw[k] = String(v);
        }
      }
    } catch {
      try {
        const form = await request.formData();
        form.forEach((value, key) => {
          if (typeof value === 'string') raw[key] = value;
        });
      } catch {
        /* ignore */
      }
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000';

  if (!checkoutId) {
    return NextResponse.redirect(
      `${appUrl}/pricing?error=${encodeURIComponent('شناسه پرداخت نامعتبر است')}`,
    );
  }

  try {
    const result = await verifySubscriptionCheckout({ checkoutId, provider, raw });
    if (result.ok) {
      return NextResponse.redirect(
        `${appUrl}/settings/billing?paid=1&msg=${encodeURIComponent(result.messageFa)}`,
      );
    }
    return NextResponse.redirect(
      `${appUrl}/pricing?error=${encodeURIComponent(result.messageFa)}`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطا در تأیید پرداخت';
    return NextResponse.redirect(`${appUrl}/pricing?error=${encodeURIComponent(message)}`);
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  return handleCallback(request, provider);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  return handleCallback(request, provider);
}
