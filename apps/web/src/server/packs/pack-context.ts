import type { IndustryPack } from '@prisma/client';
import type { PackDefinition } from '@kesbyar/shared';
import { getPackDefinition, isVerticalPack } from '@kesbyar/shared';

import { ForbiddenError } from '@/lib/errors';
import { assertPackEntitlement } from '@/server/billing/entitlement.service';
import { prisma } from '@/lib/prisma';

export interface PackContext {
  organizationId: string;
  industryPack: IndustryPack;
  pack: PackDefinition;
  isVertical: boolean;
}

export async function getPackContext(organizationId: string): Promise<PackContext> {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { industryPack: true },
  });

  const industryPack = org?.industryPack ?? 'GENERAL';

  return {
    organizationId,
    industryPack,
    pack: getPackDefinition(industryPack),
    isVertical: isVerticalPack(industryPack),
  };
}

export function requirePack(
  context: PackContext,
  expected: IndustryPack,
): void {
  if (context.industryPack !== expected) {
    throw new ForbiddenError('این ماژول برای نوع کسب‌وکار فعال شما در دسترس نیست');
  }
}

export async function requirePackWithEntitlement(
  organizationId: string,
  expected: IndustryPack,
): Promise<PackContext> {
  const ctx = await getPackContext(organizationId);
  requirePack(ctx, expected);
  await assertPackEntitlement(organizationId);
  return ctx;
}
