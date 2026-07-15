import type { Prisma } from '@prisma/client';

import { ACTIVE_RECORD_FILTER, AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@kesbyar/shared';

import { prisma } from '@/lib/prisma';
import { logActivity, logAudit } from '@/server/audit/audit.service';
import {
  requireCustomerInOrg,
  requirePipelineStageInOrg,
} from '@/server/tenant/tenant-scope';

export async function listLeads(
  organizationId: string,
  params: { search?: string; status?: string; page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.LeadWhereInput = {
    organizationId,
    ...ACTIVE_RECORD_FILTER,
    ...(params.status ? { status: params.status as Prisma.EnumLeadStatusFilter['equals'] } : {}),
    ...(params.search
      ? {
          OR: [
            { title: { contains: params.search, mode: 'insensitive' } },
            { contactName: { contains: params.search, mode: 'insensitive' } },
            { contactPhone: { contains: params.search } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { customer: true, stage: true },
    }),
    prisma.lead.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getLead(organizationId: string, id: string) {
  return prisma.lead.findFirst({
    where: { id, organizationId, ...ACTIVE_RECORD_FILTER },
    include: {
      customer: true,
      stage: true,
      followUps: { orderBy: { createdAt: 'desc' } },
      activities: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });
}

export async function createLead(
  organizationId: string,
  userId: string,
  data: Omit<Prisma.LeadCreateInput, 'organization'>,
) {
  if (data.customer?.connect?.id) {
    await requireCustomerInOrg(organizationId, data.customer.connect.id);
  }

  const lead = await prisma.lead.create({
    data: { ...data, organization: { connect: { id: organizationId } } },
  });

  await logActivity({
    organizationId,
    userId,
    type: 'STATUS_CHANGE',
    title: 'لید جدید ثبت شد',
    description: lead.title,
    leadId: lead.id,
  });

  return lead;
}

export async function updateLead(
  organizationId: string,
  id: string,
  userId: string,
  data: Prisma.LeadUpdateInput,
) {
  const existing = await prisma.lead.findFirst({
    where: { id, organizationId, ...ACTIVE_RECORD_FILTER },
  });
  if (!existing) return null;

  if (data.customer?.connect?.id) {
    await requireCustomerInOrg(organizationId, data.customer.connect.id as string);
  }
  if (data.stage?.connect?.id) {
    await requirePipelineStageInOrg(organizationId, data.stage.connect.id as string);
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...data,
      ...(data.status === 'WON' && !existing.wonAt ? { wonAt: new Date() } : {}),
      ...(data.status === 'LOST' && !existing.lostAt ? { lostAt: new Date() } : {}),
    },
    include: { customer: true, stage: true },
  });

  if (data.status && data.status !== existing.status) {
    await logActivity({
      organizationId,
      userId,
      type: 'STATUS_CHANGE',
      title: 'وضعیت لید تغییر کرد',
      description: `${existing.title}: ${String(data.status)}`,
      leadId: id,
    });
  }

  return lead;
}

export async function listPipelineStages(organizationId: string) {
  return prisma.pipelineStage.findMany({
    where: { organizationId },
    orderBy: { order: 'asc' },
  });
}

export async function addFollowUp(
  organizationId: string,
  userId: string,
  leadId: string,
  data: { note: string; channel?: string; nextFollowUpAt?: Date },
) {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, organizationId },
  });
  if (!lead) return null;

  const followUp = await prisma.$transaction(async (tx) => {
    const created = await tx.followUpLog.create({
      data: {
        leadId,
        note: data.note,
        channel: data.channel,
      },
    });

    await tx.lead.update({
      where: { id: leadId },
      data: {
        lastContactAt: new Date(),
        ...(data.nextFollowUpAt ? { nextFollowUpAt: data.nextFollowUpAt } : {}),
      },
    });

    return created;
  });

  await logActivity({
    organizationId,
    userId,
    type: 'NOTE',
    title: 'پیگیری لید ثبت شد',
    description: data.note.slice(0, 120),
    leadId,
  });

  return followUp;
}

export async function getStaleLeads(organizationId: string, days = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return prisma.lead.findMany({
    where: {
      organizationId,
      status: { notIn: ['WON', 'LOST'] },
      OR: [{ lastContactAt: null }, { lastContactAt: { lt: cutoff } }],
    },
    orderBy: { nextFollowUpAt: 'asc' },
    take: 10,
  });
}
