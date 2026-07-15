import type { Prisma } from '@prisma/client';

import { AUDIT_ACTIONS, sanitizeLogRecord } from '@kesbyar/shared';

import { prisma } from '@/lib/prisma';

export function sanitizeAuditMetadata(
  metadata?: Record<string, unknown>,
): Prisma.InputJsonValue {
  return sanitizeLogRecord(metadata) as Prisma.InputJsonValue;
}

export async function logAudit(params: {
  organizationId?: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  await prisma.auditEvent.create({
    data: {
      organizationId: params.organizationId,
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: sanitizeAuditMetadata(params.metadata),
      ipAddress: params.ipAddress,
    },
  });
}

export async function logActivity(params: {
  organizationId: string;
  userId?: string;
  type: Prisma.ActivityLogCreateInput['type'];
  title: string;
  description?: string;
  customerId?: string;
  leadId?: string;
  invoiceId?: string;
  paymentId?: string;
  taskId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.activityLog.create({
    data: params,
  });
}

export async function listAuditEvents(
  organizationId: string,
  params: { page?: number; pageSize?: number; action?: string } = {},
) {
  const page = params.page ?? 1;
  const pageSize = Math.min(params.pageSize ?? 30, 100);
  const where: Prisma.AuditEventWhereInput = {
    organizationId,
    ...(params.action ? { action: params.action } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.auditEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.auditEvent.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

/** رویدادهای حساس پیش‌فرض برای نمایش در UI */
export const SENSITIVE_AUDIT_ACTIONS: string[] = [
  AUDIT_ACTIONS.CUSTOMER_ARCHIVE,
  AUDIT_ACTIONS.INVOICE_STATUS,
  AUDIT_ACTIONS.PAYMENT_CREATE,
  AUDIT_ACTIONS.SETTINGS_UPDATE,
  AUDIT_ACTIONS.DEMO_RESET,
  AUDIT_ACTIONS.SUBSCRIPTION_CHANGE,
];
