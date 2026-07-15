import type { UsageSnapshot } from '@kesbyar/shared';

import { prisma } from '@/lib/prisma';

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getOrganizationUsage(organizationId: string): Promise<UsageSnapshot> {
  const monthStart = startOfMonth();

  const [members, customers, leads, invoicesThisMonth, automationRules, fileAttachments] =
    await Promise.all([
      prisma.membership.count({
        where: { organizationId, isActive: true },
      }),
      prisma.customer.count({ where: { organizationId } }),
      prisma.lead.count({ where: { organizationId } }),
      prisma.invoice.count({
        where: { organizationId, createdAt: { gte: monthStart } },
      }),
      prisma.automationRule.count({ where: { organizationId } }),
      prisma.fileAttachment.count({ where: { organizationId } }),
    ]);

  return {
    members,
    customers,
    leads,
    invoicesThisMonth,
    automationRules,
    fileAttachments,
  };
}
