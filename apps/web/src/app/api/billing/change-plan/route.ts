import type { PlanCode } from '@kesbyar/shared';
import { z } from 'zod';

import { apiSuccess, jsonResponse } from '@/lib/api-response';
import { handleApiError, isApiError, requireApiSession } from '@/lib/api-auth';
import { ForbiddenError } from '@/lib/errors';
import { canManageBilling } from '@/lib/permissions';
import type { MembershipRole } from '@prisma/client';
import { parseBody } from '@/lib/validators/parse';
import { changePlan } from '@/server/billing/subscription.service';

const changePlanSchema = z.object({
  planCode: z.enum(['FREE', 'STARTER', 'BUSINESS', 'ENTERPRISE']),
  billingPeriod: z.enum(['MONTHLY', 'YEARLY']).optional(),
  startTrial: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;

    if (!canManageBilling(session.role as MembershipRole)) {
      throw new ForbiddenError('تغییر طرح فقط برای مدیران و بالاتر مجاز است');
    }

    const body = await request.json();
    const parsed = parseBody(changePlanSchema, body);
    if (!parsed.ok) return parsed.response;

    const summary = await changePlan(
      session.organizationId,
      parsed.data.planCode as PlanCode,
      session.user.id,
      {
        billingPeriod: parsed.data.billingPeriod,
        startTrial: parsed.data.startTrial,
      },
    );

    return jsonResponse(apiSuccess(summary));
  } catch (error) {
    return handleApiError(error, 'billing.changePlan.POST');
  }
}
