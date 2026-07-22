import { NextResponse } from 'next/server';

import { verifyOnlinePayment } from '@/server/payments/invoice-payment.service';

function queryToRecord(url: URL): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  url.searchParams.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

async function handleCallback(
  request: Request,
  provider: string,
) {
  const url = new URL(request.url);
  const paymentId = url.searchParams.get('paymentId');
  const token = url.searchParams.get('token');
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
      // form-urlencoded fallback
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

  if (!paymentId) {
    return NextResponse.redirect(
      `${appUrl}/pay/${token || 'unknown'}?error=${encodeURIComponent('شناسه پرداخت نامعتبر است')}`,
    );
  }

  try {
    const result = await verifyOnlinePayment({
      provider,
      paymentId,
      raw,
    });
    const target = token ? `${appUrl}/pay/${token}` : `${appUrl}/payments`;
    if (result.ok) {
      return NextResponse.redirect(
        `${target}?paid=1&msg=${encodeURIComponent(result.messageFa)}`,
      );
    }
    return NextResponse.redirect(
      `${target}?error=${encodeURIComponent(result.messageFa)}`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطا در تأیید پرداخت';
    return NextResponse.redirect(
      `${appUrl}/pay/${token || 'unknown'}?error=${encodeURIComponent(message)}`,
    );
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
