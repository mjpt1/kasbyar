import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@kesbyar/shared';

import { canResetDemoData } from '@/lib/demo';
import { AppError, ForbiddenError } from '@/lib/errors';
import { APP_LOG_EVENTS, logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/server/audit/audit.service';

export async function resetDemoEnvironment(
  actorUserId: string,
  organizationId?: string,
): Promise<{ ok: true }> {
  if (!canResetDemoData()) {
    throw new ForbiddenError(
      'بازنشانی دمو فقط در محیط نمایش با DEMO_MODE و ALLOW_SEED فعال مجاز است',
    );
  }

  logger.info(APP_LOG_EVENTS.DEMO_RESET_ATTEMPT, {
    userId: actorUserId,
    organizationId,
  });

  try {
    const { runSeed } = await import('../../../../../prisma/seed/index');
    await runSeed(prisma);

    await logAudit({
      organizationId,
      userId: actorUserId,
      action: AUDIT_ACTIONS.DEMO_RESET,
      entityType: AUDIT_ENTITY_TYPES.DEMO,
      metadata: { timestamp: new Date().toISOString() },
    });

    return { ok: true };
  } catch (error) {
    logger.error(APP_LOG_EVENTS.DEMO_RESET_FAILED, {
      userId: actorUserId,
      organizationId,
      message: error instanceof Error ? error.message : String(error),
    });
    throw new AppError(
      'بازنشانی دمو ناموفق بود. داده قبلی دست‌نخورده است — لاگ سرور را بررسی کنید.',
      'DEMO_RESET_FAILED',
      500,
    );
  }
}
