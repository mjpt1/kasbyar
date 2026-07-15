import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { requireMemberInOrg } from '@/server/tenant/tenant-scope';

export async function listTasks(
  organizationId: string,
  params: { status?: string; assigneeId?: string; page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.TaskWhereInput = {
    organizationId,
    ...(params.status
      ? { status: params.status as Prisma.EnumTaskStatusFilter['equals'] }
      : {}),
    ...(params.assigneeId ? { assigneeId: params.assigneeId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { assignee: true },
    }),
    prisma.task.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createTask(
  organizationId: string,
  createdById: string,
  data: {
    title: string;
    description?: string;
    assigneeId?: string;
    priority?: Prisma.TaskCreateInput['priority'];
    dueDate?: Date;
  },
) {
  if (data.assigneeId) {
    await requireMemberInOrg(organizationId, data.assigneeId);
  }

  return prisma.task.create({
    data: {
      organizationId,
      createdById,
      title: data.title,
      description: data.description,
      assigneeId: data.assigneeId,
      priority: data.priority ?? 'MEDIUM',
      dueDate: data.dueDate,
    },
    include: { assignee: true },
  });
}

export async function updateTask(
  organizationId: string,
  id: string,
  data: Prisma.TaskUpdateInput,
) {
  return prisma.task.updateMany({
    where: { id, organizationId },
    data,
  });
}

export async function listReminders(organizationId: string, upcoming = true) {
  const now = new Date();
  return prisma.reminder.findMany({
    where: {
      organizationId,
      ...(upcoming ? { remindAt: { gte: now }, isSent: false } : {}),
    },
    orderBy: { remindAt: 'asc' },
    take: 20,
    include: { task: true, user: true },
  });
}

export async function createReminder(
  organizationId: string,
  data: {
    title: string;
    message?: string;
    remindAt: Date;
    userId?: string;
    taskId?: string;
  },
) {
  return prisma.reminder.create({
    data: { organizationId, ...data },
  });
}
