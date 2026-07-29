import { NextResponse } from 'next/server';
import { z } from 'zod';

import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { ForbiddenError } from '@/lib/errors';
import { canManageBilling } from '@/lib/permissions';
import type { MembershipRole } from '@prisma/client';
import type { PlanCode } from '@kesbyar/shared';
import { parseBody } from '@/lib/validators/parse';
import {
  getSubscriptionBillingAvailability,
  startSubscriptionCheckout,
} from '@/server/billing/subscription-checkout.service';

const checkoutSchema = z.object({
  planCode: z.enum(['FREE', 'STARTER', 'BUSINESS', 'ENTERPRISE']),
  billingPeriod: z.enum(['MONTHLY', 'YEARLY']).optional(),
});

export async function GET() {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    return jsonResponse(apiSuccess(getSubscriptionBillingAvailability()));
  } catch (error) {
    return handleApiError(error, 'billing.checkout.GET');
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    if (!canManageBilling(session.role as MembershipRole)) {
      throw new ForbiddenError('خرید طرح فقط برای مدیران و بالاتر مجاز است');
    }

    const body = await request.json();
    const parsed = parseBody(checkoutSchema, body);
    if (!parsed.ok) return parsed.response;

    const availability = getSubscriptionBillingAvailability();
    if (!availability.configured) {
      return jsonResponse(
        {
          success: false,
          error: {
            code: 'BILLING_NOT_CONFIGURED',
            message:
              availability.setupHintFa ||
              'درگاه پرداخت آنلاین پیکربندی نشده — از تغییر دستی طرح استفاده کنید',
          },
        },
        503,
      );
    }

    const result = await startSubscriptionCheckout(
      session.organizationId,
      session.user.id,
      parsed.data.planCode as PlanCode,
      parsed.data.billingPeriod ?? 'MONTHLY',
    );

    return jsonResponse(apiSuccess(result));
  } catch (error) {
    return handleApiError(error, 'billing.checkout.POST');
  }
}
