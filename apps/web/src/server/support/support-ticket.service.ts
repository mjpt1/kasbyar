import type { SupportTicketPriority, SupportTicketStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { AppError, ForbiddenError, NotFoundError } from '@/lib/errors';
import { notifySuperAdmins } from '@/server/notifications/notification.service';

import { requireOrgModule } from '../modules/org-module.service';

async function requireActiveMember(organizationId: string, userId: string) {
  const membership = await prisma.membership.findFirst({
    where: { organizationId, userId, isActive: true },
    select: { id: true },
  });
  if (!membership) throw new ForbiddenError('عضو فعال این سازمان نیستید');
}

export async function createTicket(
  organizationId: string,
  userId: string,
  input: { subject: string; body: string; priority?: SupportTicketPriority },
) {
  await requireOrgModule(organizationId, 'support_tickets');
  await requireActiveMember(organizationId, userId);

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { name: true },
  });

  const ticket = await prisma.supportTicket.create({
    data: {
      organizationId,
      userId,
      subject: input.subject.trim(),
      body: input.body.trim(),
      priority: input.priority ?? 'MEDIUM',
      messages: {
        create: {
          organizationId,
          userId,
          body: input.body.trim(),
          isPlatformReply: false,
        },
      },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      organization: { select: { id: true, name: true } },
    },
  });

  await notifySuperAdmins({
    title: 'تیکت پشتیبانی جدید',
    body: `${org?.name ?? 'سازمان'}: ${ticket.subject}`,
    href: `/admin/tickets?id=${ticket.id}`,
    category: 'SYSTEM',
    dedupeKey: `ticket-${ticket.id}`,
  });

  return ticket;
}

export async function listOrgTickets(organizationId: string, userId: string) {
  await requireOrgModule(organizationId, 'support_tickets');
  await requireActiveMember(organizationId, userId);

  return prisma.supportTicket.findMany({
    where: { organizationId, userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function getOrgTicket(organizationId: string, userId: string, ticketId: string) {
  await requireOrgModule(organizationId, 'support_tickets');
  await requireActiveMember(organizationId, userId);

  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, organizationId, userId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, name: true } } },
      },
      organization: { select: { name: true } },
    },
  });
  if (!ticket) throw new NotFoundError('تیکت یافت نشد');
  return ticket;
}

export async function addOrgTicketMessage(
  organizationId: string,
  userId: string,
  ticketId: string,
  body: string,
) {
  await requireOrgModule(organizationId, 'support_tickets');
  await requireActiveMember(organizationId, userId);

  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, organizationId, userId },
  });
  if (!ticket) throw new NotFoundError('تیکت یافت نشد');
  if (ticket.status === 'CLOSED') {
    throw new AppError('تیکت بسته شده است', 'TICKET_CLOSED', 400);
  }

  const trimmed = body.trim();
  if (!trimmed) throw new AppError('متن پیام خالی است', 'EMPTY_MESSAGE', 400);

  const [message] = await prisma.$transaction([
    prisma.ticketMessage.create({
      data: {
        ticketId,
        organizationId,
        userId,
        body: trimmed,
        isPlatformReply: false,
      },
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date(), status: ticket.status === 'RESOLVED' ? 'OPEN' : ticket.status },
    }),
  ]);

  await notifySuperAdmins({
    title: 'پاسخ جدید روی تیکت',
    body: ticket.subject,
    href: `/admin/tickets?id=${ticketId}`,
    category: 'SYSTEM',
  });

  return message;
}

export async function listAllTicketsForAdmin(options?: {
  status?: SupportTicketStatus;
  page?: number;
}) {
  const page = options?.page ?? 1;
  const take = 30;
  const skip = (page - 1) * take;

  const where = options?.status ? { status: options.status } : {};

  const [items, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        user: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    }),
    prisma.supportTicket.count({ where }),
  ]);

  return { items, total, page, totalPages: Math.ceil(total / take) || 1 };
}

export async function getTicketForAdmin(ticketId: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      organization: { select: { id: true, name: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });
  if (!ticket) throw new NotFoundError('تیکت یافت نشد');
  return ticket;
}

export async function adminReplyToTicket(
  adminUserId: string,
  ticketId: string,
  body: string,
  status?: SupportTicketStatus,
) {
  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new NotFoundError('تیکت یافت نشد');

  const trimmed = body.trim();
  if (!trimmed) throw new AppError('متن پاسخ خالی است', 'EMPTY_MESSAGE', 400);

  const nextStatus = status ?? (ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status);

  const [message] = await prisma.$transaction([
    prisma.ticketMessage.create({
      data: {
        ticketId,
        organizationId: ticket.organizationId,
        userId: adminUserId,
        body: trimmed,
        isPlatformReply: true,
      },
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: nextStatus, updatedAt: new Date() },
    }),
  ]);

  const { createNotification } = await import('@/server/notifications/notification.service');
  await createNotification({
    organizationId: ticket.organizationId,
    userId: ticket.userId,
    title: 'پاسخ پشتیبانی کسب‌یار',
    body: ticket.subject,
    href: `/support?id=${ticketId}`,
    category: 'SYSTEM',
  });

  return message;
}

export async function adminUpdateTicketStatus(ticketId: string, status: SupportTicketStatus) {
  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new NotFoundError('تیکت یافت نشد');

  const updated = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status, updatedAt: new Date() },
  });

  if (status === 'RESOLVED' || status === 'CLOSED') {
    const { createNotification } = await import('@/server/notifications/notification.service');
    await createNotification({
      organizationId: ticket.organizationId,
      userId: ticket.userId,
      title: status === 'RESOLVED' ? 'تیکت شما حل شد' : 'تیکت بسته شد',
      body: ticket.subject,
      href: `/support?id=${ticketId}`,
      category: 'SYSTEM',
    });
  }

  return updated;
}
