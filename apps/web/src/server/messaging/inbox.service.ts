import type { InboxMessageItem, InboxThreadSummary } from '@kesbyar/shared';
import type { MembershipRole, MessageChannel, Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { fromWhatsAppPhone, toWhatsAppPhone } from '@/lib/validators/iranian';
import { logActivity } from '@/server/audit/audit.service';
import {
  getOrgIntegrationsPublicView,
  resolveInstagramCredentials,
  resolveResendCredentials,
  resolveSmsCredentials,
  resolveTelegramCredentials,
  resolveWhatsAppCredentials,
} from '@/server/integrations/org-credentials.service';
import { analyzeInboundMessageSentiment } from '@/server/sentiment/sentiment.service';
import { runEventAutomation } from '@/server/automation/automation.service';
import { parseKavenegarInboundWebhook } from '@/server/messaging/providers/kavenegar-inbound';
import {
  parseInstagramWebhook,
  sendInstagramText,
} from '@/server/messaging/providers/instagram-dm';
import { parseResendInboundWebhook, sendResendEmail } from '@/server/messaging/providers/resend';
import {
  parseTelegramWebhook,
  sendTelegramText,
} from '@/server/messaging/providers/telegram-bot';
import {
  parseWhatsAppWebhook,
  sendWhatsAppText,
} from '@/server/messaging/providers/whatsapp-cloud';
import { requireMemberInOrg } from '@/server/tenant/tenant-scope';
import { createKavenegarAdapter } from '@/server/notifications/providers/kavenegar';

const ASSIGNABLE_ROLES: MembershipRole[] = ['STAFF', 'MANAGER', 'ADMIN', 'OWNER'];

function mapMessage(row: {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  content: string;
  sentAt: Date;
  externalId: string | null;
  metadata: Prisma.JsonValue;
  senderUser: { name: string } | null;
}): InboxMessageItem {
  const meta =
    row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, unknown>)
      : {};
  const status = (meta.status as InboxMessageItem['status']) ?? 'sent';

  return {
    id: row.id,
    direction: row.direction,
    content: row.content,
    sentAt: row.sentAt.toISOString(),
    senderName: row.senderUser?.name ?? null,
    externalId: row.externalId,
    status,
    recordingUrl: typeof meta.recordingUrl === 'string' ? meta.recordingUrl : null,
    durationSeconds:
      typeof meta.durationSeconds === 'number' ? meta.durationSeconds : null,
    agentExtension:
      typeof meta.agentExtension === 'string' ? meta.agentExtension : null,
  };
}

async function pickRoundRobinAssignee(
  organizationId: string,
  tx: Prisma.TransactionClient,
): Promise<string | null> {
  const members = await tx.membership.findMany({
    where: {
      organizationId,
      isActive: true,
      role: { in: ASSIGNABLE_ROLES },
    },
    orderBy: { joinedAt: 'asc' },
    select: { userId: true },
  });
  if (members.length === 0) return null;

  const org = await tx.organization.findUnique({
    where: { id: organizationId },
    select: { settings: true },
  });
  const settings =
    org?.settings && typeof org.settings === 'object' && !Array.isArray(org.settings)
      ? (org.settings as Record<string, unknown>)
      : {};
  const cursor =
    typeof settings.inboxAssigneeCursor === 'number' ? settings.inboxAssigneeCursor : 0;
  const assigneeId = members[cursor % members.length]!.userId;

  await tx.organization.update({
    where: { id: organizationId },
    data: {
      settings: { ...settings, inboxAssigneeCursor: cursor + 1 },
    },
  });

  return assigneeId;
}

/** Auto-assign thread when inbound arrives and no assignee yet. */
export async function maybeAutoAssignInboundThread(
  organizationId: string,
  threadId: string,
  tx?: Prisma.TransactionClient,
) {
  const run = async (client: Prisma.TransactionClient) => {
    const thread = await client.messageThread.findUnique({
      where: { id: threadId },
      select: { assigneeId: true },
    });
    if (thread?.assigneeId) return thread.assigneeId;

    const assigneeId = await pickRoundRobinAssignee(organizationId, client);
    if (!assigneeId) return null;

    await client.messageThread.update({
      where: { id: threadId },
      data: { assigneeId },
    });
    return assigneeId;
  };

  if (tx) return run(tx);
  return prisma.$transaction(run);
}

async function findCustomerByPhone(organizationId: string, externalPhone: string) {
  const localPhone = fromWhatsAppPhone(externalPhone);
  return prisma.customer.findFirst({
    where: {
      organizationId,
      deletedAt: null,
      OR: [{ phone: localPhone }, { phone: externalPhone }, { contacts: { some: { phone: localPhone } } }],
    },
    select: { id: true, name: true },
  });
}

async function findCustomerByEmail(organizationId: string, email: string) {
  const normalized = email.trim().toLowerCase();
  return prisma.customer.findFirst({
    where: {
      organizationId,
      deletedAt: null,
      OR: [{ email: normalized }, { contacts: { some: { email: normalized } } }],
    },
    select: { id: true, name: true },
  });
}

async function persistInboundMessage(params: {
  threadId: string;
  organizationId: string;
  leadId?: string | null;
  content: string;
  externalId: string;
  sentAt: Date;
}) {
  const created = await prisma.$transaction(async (tx) => {
    const message = await tx.message.create({
      data: {
        threadId: params.threadId,
        direction: 'INBOUND',
        content: params.content,
        externalId: params.externalId,
        sentAt: params.sentAt,
        metadata: { status: 'received' },
      },
    });
    await tx.messageThread.update({
      where: { id: params.threadId },
      data: { lastMessageAt: params.sentAt },
    });
    await maybeAutoAssignInboundThread(params.organizationId, params.threadId, tx);
    if (params.leadId) {
      await tx.lead.update({
        where: { id: params.leadId },
        data: { lastContactAt: params.sentAt },
      });
    }
    return message;
  });

  void analyzeInboundMessageSentiment({
    organizationId: params.organizationId,
    threadId: params.threadId,
    messageId: created.id,
    content: params.content,
  }).catch(() => undefined);

  void prisma.messageThread
    .findUnique({
      where: { id: params.threadId },
      select: {
        customerId: true,
        leadId: true,
        customer: { select: { name: true } },
      },
    })
    .then((thread) => {
      if (!thread) return;
      return runEventAutomation(params.organizationId, 'INBOUND_MESSAGE', {
        title: `پاسخ به پیام ${thread.customer?.name ?? 'مشتری'}`,
        description: params.content.slice(0, 120),
        customerId: thread.customerId ?? undefined,
        leadId: thread.leadId ?? undefined,
      });
    })
    .catch(() => undefined);

  return created;
}

export async function findOrCreateSmsThread(
  organizationId: string,
  externalPhone: string,
  links?: { customerId?: string; leadId?: string },
) {
  const existing = await prisma.messageThread.findUnique({
    where: {
      organizationId_channel_externalPhone: {
        organizationId,
        channel: 'SMS',
        externalPhone,
      },
    },
  });

  if (existing) {
    if (links?.customerId || links?.leadId) {
      return prisma.messageThread.update({
        where: { id: existing.id },
        data: {
          customerId: links.customerId ?? existing.customerId,
          leadId: links.leadId ?? existing.leadId,
        },
      });
    }
    return existing;
  }

  const customer =
    links?.customerId != null
      ? await prisma.customer.findFirst({
          where: { id: links.customerId, organizationId },
          select: { id: true },
        })
      : await findCustomerByPhone(organizationId, externalPhone);

  return prisma.messageThread.create({
    data: {
      organizationId,
      channel: 'SMS',
      externalPhone,
      externalId: externalPhone,
      customerId: customer?.id ?? links?.customerId,
      leadId: links?.leadId,
      subject: `پیامک ${fromWhatsAppPhone(externalPhone)}`,
    },
  });
}

export async function findOrCreateEmailThread(
  organizationId: string,
  externalEmail: string,
  links?: { customerId?: string; leadId?: string; subject?: string },
) {
  const email = externalEmail.trim().toLowerCase();
  const existing = await prisma.messageThread.findUnique({
    where: {
      organizationId_channel_externalEmail: {
        organizationId,
        channel: 'EMAIL',
        externalEmail: email,
      },
    },
  });

  if (existing) {
    if (links?.customerId || links?.leadId || links?.subject) {
      return prisma.messageThread.update({
        where: { id: existing.id },
        data: {
          customerId: links.customerId ?? existing.customerId,
          leadId: links.leadId ?? existing.leadId,
          subject: links.subject ?? existing.subject,
        },
      });
    }
    return existing;
  }

  const customer =
    links?.customerId != null
      ? await prisma.customer.findFirst({
          where: { id: links.customerId, organizationId },
          select: { id: true },
        })
      : await findCustomerByEmail(organizationId, email);

  return prisma.messageThread.create({
    data: {
      organizationId,
      channel: 'EMAIL',
      externalEmail: email,
      externalId: email,
      customerId: customer?.id ?? links?.customerId,
      leadId: links?.leadId,
      subject: links?.subject ?? `ایمیل ${email}`,
    },
  });
}

export async function findOrCreatePhoneThread(
  organizationId: string,
  externalPhone: string,
  links?: { customerId?: string; leadId?: string },
) {
  const existing = await prisma.messageThread.findUnique({
    where: {
      organizationId_channel_externalPhone: {
        organizationId,
        channel: 'PHONE',
        externalPhone,
      },
    },
  });

  if (existing) {
    if (links?.customerId || links?.leadId) {
      return prisma.messageThread.update({
        where: { id: existing.id },
        data: {
          customerId: links.customerId ?? existing.customerId,
          leadId: links.leadId ?? existing.leadId,
        },
      });
    }
    return existing;
  }

  const customer =
    links?.customerId != null
      ? await prisma.customer.findFirst({
          where: { id: links.customerId, organizationId },
          select: { id: true },
        })
      : await findCustomerByPhone(organizationId, externalPhone);

  return prisma.messageThread.create({
    data: {
      organizationId,
      channel: 'PHONE',
      externalPhone,
      externalId: externalPhone,
      customerId: customer?.id ?? links?.customerId,
      leadId: links?.leadId,
      subject: `تماس ${fromWhatsAppPhone(externalPhone)}`,
    },
  });
}

export async function findOrCreateWhatsAppThread(
  organizationId: string,
  externalPhone: string,
  links?: { customerId?: string; leadId?: string },
) {
  const existing = await prisma.messageThread.findUnique({
    where: {
      organizationId_channel_externalPhone: {
        organizationId,
        channel: 'WHATSAPP',
        externalPhone,
      },
    },
  });

  if (existing) {
    if (links?.customerId || links?.leadId) {
      return prisma.messageThread.update({
        where: { id: existing.id },
        data: {
          customerId: links.customerId ?? existing.customerId,
          leadId: links.leadId ?? existing.leadId,
        },
      });
    }
    return existing;
  }

  const customer =
    links?.customerId != null
      ? await prisma.customer.findFirst({
          where: { id: links.customerId, organizationId },
          select: { id: true },
        })
      : await findCustomerByPhone(organizationId, externalPhone);

  return prisma.messageThread.create({
    data: {
      organizationId,
      channel: 'WHATSAPP',
      externalPhone,
      externalId: externalPhone,
      customerId: customer?.id ?? links?.customerId,
      leadId: links?.leadId,
      subject: `واتساپ ${fromWhatsAppPhone(externalPhone)}`,
    },
  });
}

export async function findOrCreateTelegramThread(
  organizationId: string,
  chatId: string,
  links?: { customerId?: string; leadId?: string; subject?: string },
) {
  const existing = await prisma.messageThread.findUnique({
    where: {
      organizationId_channel_externalPhone: {
        organizationId,
        channel: 'TELEGRAM',
        externalPhone: chatId,
      },
    },
  });

  if (existing) {
    if (links?.customerId || links?.leadId || links?.subject) {
      return prisma.messageThread.update({
        where: { id: existing.id },
        data: {
          customerId: links.customerId ?? existing.customerId,
          leadId: links.leadId ?? existing.leadId,
          subject: links.subject ?? existing.subject,
        },
      });
    }
    return existing;
  }

  return prisma.messageThread.create({
    data: {
      organizationId,
      channel: 'TELEGRAM',
      externalPhone: chatId,
      externalId: chatId,
      customerId: links?.customerId,
      leadId: links?.leadId,
      subject: links?.subject ?? `تلگرام ${chatId}`,
    },
  });
}

export async function findOrCreateInstagramThread(
  organizationId: string,
  senderId: string,
  links?: { customerId?: string; leadId?: string; subject?: string },
) {
  const existing = await prisma.messageThread.findUnique({
    where: {
      organizationId_channel_externalPhone: {
        organizationId,
        channel: 'INSTAGRAM',
        externalPhone: senderId,
      },
    },
  });

  if (existing) {
    if (links?.customerId || links?.leadId || links?.subject) {
      return prisma.messageThread.update({
        where: { id: existing.id },
        data: {
          customerId: links.customerId ?? existing.customerId,
          leadId: links.leadId ?? existing.leadId,
          subject: links.subject ?? existing.subject,
        },
      });
    }
    return existing;
  }

  return prisma.messageThread.create({
    data: {
      organizationId,
      channel: 'INSTAGRAM',
      externalPhone: senderId,
      externalId: senderId,
      customerId: links?.customerId,
      leadId: links?.leadId,
      subject: links?.subject ?? `دایرکت اینستاگرام ${senderId.slice(-6)}`,
    },
  });
}

export async function assignThread(
  organizationId: string,
  threadId: string,
  assigneeId: string | null,
) {
  const thread = await prisma.messageThread.findFirst({
    where: { id: threadId, organizationId },
    select: { id: true },
  });
  if (!thread) return null;

  if (assigneeId) {
    await requireMemberInOrg(organizationId, assigneeId);
  }

  return prisma.messageThread.update({
    where: { id: threadId },
    data: { assigneeId },
    include: {
      assignee: { select: { id: true, name: true } },
    },
  });
}

export async function listInboxThreads(
  organizationId: string,
  params: { channel?: MessageChannel; page?: number; pageSize?: number } = {},
): Promise<{ items: InboxThreadSummary[]; total: number }> {
  const page = params.page ?? 1;
  const pageSize = Math.min(params.pageSize ?? 30, 100);
  const where: Prisma.MessageThreadWhereInput = {
    organizationId,
    channel: params.channel ?? { in: ['WHATSAPP', 'SMS', 'EMAIL', 'PHONE', 'TELEGRAM', 'INSTAGRAM'] },
  };

  const [rows, total] = await Promise.all([
    prisma.messageThread.findMany({
      where,
      orderBy: [{ lastMessageAt: 'desc' }, { updatedAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        customer: { select: { id: true, name: true } },
        lead: { select: { id: true, title: true } },
        assignee: { select: { id: true, name: true } },
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
          select: { content: true, sentAt: true, direction: true },
        },
      },
    }),
    prisma.messageThread.count({ where }),
  ]);

  const items: InboxThreadSummary[] = rows.map((row) => {
    const last = row.messages[0];
    return {
      id: row.id,
      channel: row.channel as InboxThreadSummary['channel'],
      externalPhone: row.externalPhone,
      externalEmail: row.externalEmail,
      customerId: row.customer?.id ?? null,
      customerName: row.customer?.name ?? null,
      leadId: row.lead?.id ?? null,
      leadTitle: row.lead?.title ?? null,
      assigneeId: row.assignee?.id ?? null,
      assigneeName: row.assignee?.name ?? null,
      lastMessageAt: (row.lastMessageAt ?? last?.sentAt)?.toISOString() ?? null,
      lastMessagePreview: last?.content?.slice(0, 120) ?? null,
      unreadCount: last?.direction === 'INBOUND' ? 1 : 0,
    };
  });

  return { items, total };
}

export async function listThreadMessages(
  organizationId: string,
  threadId: string,
  params: { page?: number; pageSize?: number } = {},
) {
  const thread = await prisma.messageThread.findFirst({
    where: { id: threadId, organizationId },
    include: { assignee: { select: { id: true, name: true } } },
  });
  if (!thread) return null;

  const page = params.page ?? 1;
  const pageSize = Math.min(params.pageSize ?? 50, 100);

  const [items, total] = await Promise.all([
    prisma.message.findMany({
      where: { threadId },
      orderBy: { sentAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { senderUser: { select: { name: true } } },
    }),
    prisma.message.count({ where: { threadId } }),
  ]);

  return {
    thread,
    items: items.map(mapMessage),
    total,
    page,
    pageSize,
  };
}

export async function getCustomerWhatsAppThread(organizationId: string, customerId: string) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, organizationId, deletedAt: null },
    select: { id: true, phone: true, name: true },
  });
  if (!customer?.phone) return null;

  const waPhone = toWhatsAppPhone(customer.phone);
  if (!waPhone) return null;

  const thread = await findOrCreateWhatsAppThread(organizationId, waPhone, { customerId });
  return listThreadMessages(organizationId, thread.id, { pageSize: 100 });
}

export async function getLeadWhatsAppThread(organizationId: string, leadId: string) {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, organizationId },
    select: { id: true, contactPhone: true, customerId: true, title: true },
  });
  if (!lead?.contactPhone) return null;

  const waPhone = toWhatsAppPhone(lead.contactPhone);
  if (!waPhone) return null;

  const thread = await findOrCreateWhatsAppThread(organizationId, waPhone, {
    leadId,
    customerId: lead.customerId ?? undefined,
  });
  return listThreadMessages(organizationId, thread.id, { pageSize: 100 });
}

export async function getCustomerSmsThread(organizationId: string, customerId: string) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, organizationId, deletedAt: null },
    select: { id: true, phone: true },
  });
  if (!customer?.phone) return null;

  const phone = toWhatsAppPhone(customer.phone);
  if (!phone) return null;

  const thread = await findOrCreateSmsThread(organizationId, phone, { customerId });
  return listThreadMessages(organizationId, thread.id, { pageSize: 100 });
}

export async function getCustomerEmailThread(organizationId: string, customerId: string) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, organizationId, deletedAt: null },
    select: { id: true, email: true, name: true },
  });
  if (!customer?.email) return null;

  const thread = await findOrCreateEmailThread(organizationId, customer.email, {
    customerId,
    subject: `ایمیل ${customer.name}`,
  });
  return listThreadMessages(organizationId, thread.id, { pageSize: 100 });
}

export async function getLeadSmsThread(organizationId: string, leadId: string) {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, organizationId },
    select: { id: true, contactPhone: true, customerId: true },
  });
  if (!lead?.contactPhone) return null;

  const phone = toWhatsAppPhone(lead.contactPhone);
  if (!phone) return null;

  const thread = await findOrCreateSmsThread(organizationId, phone, {
    leadId,
    customerId: lead.customerId ?? undefined,
  });
  return listThreadMessages(organizationId, thread.id, { pageSize: 100 });
}

export async function getLeadEmailThread(organizationId: string, leadId: string) {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, organizationId },
    select: { id: true, contactEmail: true, customerId: true, title: true },
  });
  if (!lead?.contactEmail) return null;

  const thread = await findOrCreateEmailThread(organizationId, lead.contactEmail, {
    leadId,
    customerId: lead.customerId ?? undefined,
    subject: lead.title,
  });
  return listThreadMessages(organizationId, thread.id, { pageSize: 100 });
}

export async function sendThreadMessage(
  organizationId: string,
  userId: string,
  threadId: string,
  content: string,
  options?: { subject?: string },
) {
  const thread = await prisma.messageThread.findFirst({
    where: { id: threadId, organizationId },
  });
  if (!thread || (!thread.externalPhone && !thread.externalEmail)) {
    return { error: 'THREAD_NOT_FOUND' as const };
  }

  let externalId: string | null = null;
  let status: 'sent' | 'failed' = 'sent';
  let errorMessage: string | undefined;

  if (thread.channel === 'WHATSAPP' && thread.externalPhone) {
    const creds = await resolveWhatsAppCredentials(organizationId);
    if (!creds.phoneNumberId || !creds.accessToken) {
      status = 'failed';
      errorMessage = 'واتساپ پیکربندی نشده است';
    } else {
      const result = await sendWhatsAppText(
        { phoneNumberId: creds.phoneNumberId, accessToken: creds.accessToken },
        thread.externalPhone,
        content,
      );
      if (result.status === 'sent') {
        externalId = result.externalId;
      } else {
        status = 'failed';
        errorMessage = result.error;
      }
    }
  } else if (thread.channel === 'SMS' && thread.externalPhone) {
    const creds = await resolveSmsCredentials(organizationId);
    if (!creds.apiKey) {
      status = 'failed';
      errorMessage = 'پیامک (کاوه‌نگار) پیکربندی نشده است';
    } else {
      const adapter = createKavenegarAdapter(creds.apiKey, creds.sender ?? undefined);
      const recipient = fromWhatsAppPhone(thread.externalPhone);
      const result = await adapter.send({
        organizationId,
        channel: 'sms',
        recipient,
        body: content,
      });
      if (result.status === 'sent' || result.status === 'queued') {
        externalId = result.providerRef ?? null;
      } else {
        status = 'failed';
        errorMessage = result.failure?.message ?? 'ارسال پیامک ناموفق بود';
      }
    }
  } else if (thread.channel === 'EMAIL' && thread.externalEmail) {
    const creds = await resolveResendCredentials(organizationId);
    if (!creds.apiKey || !creds.fromEmail) {
      status = 'failed';
      errorMessage = 'ایمیل (Resend) پیکربندی نشده است';
    } else {
      const result = await sendResendEmail(
        { apiKey: creds.apiKey, fromEmail: creds.fromEmail },
        {
          to: thread.externalEmail,
          subject: options?.subject ?? thread.subject ?? 'پیام از کسب‌یار',
          body: content,
        },
      );
      if (result.status === 'sent') {
        externalId = result.externalId;
      } else {
        status = 'failed';
        errorMessage = result.error;
      }
    }
  } else if (thread.channel === 'TELEGRAM' && thread.externalPhone) {
    const creds = await resolveTelegramCredentials(organizationId);
    if (!creds.botToken) {
      status = 'failed';
      errorMessage = 'ربات تلگرام پیکربندی نشده است';
    } else {
      const result = await sendTelegramText(
        { botToken: creds.botToken },
        thread.externalPhone,
        content,
      );
      if (result.status === 'sent') {
        externalId = result.externalId;
      } else {
        status = 'failed';
        errorMessage = result.error;
      }
    }
  } else if (thread.channel === 'INSTAGRAM' && thread.externalPhone) {
    const creds = await resolveInstagramCredentials(organizationId);
    if (!creds.pageId || !creds.accessToken) {
      status = 'failed';
      errorMessage = 'دایرکت اینستاگرام پیکربندی نشده است';
    } else {
      const result = await sendInstagramText(
        { pageId: creds.pageId, accessToken: creds.accessToken },
        thread.externalPhone,
        content,
      );
      if (result.status === 'sent') {
        externalId = result.externalId;
      } else {
        status = 'failed';
        errorMessage = result.error;
      }
    }
  }

  const sentAt = new Date();
  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.message.create({
      data: {
        threadId,
        direction: 'OUTBOUND',
        content,
        externalId: externalId ?? undefined,
        senderUserId: userId,
        sentAt,
        metadata: { status, ...(errorMessage ? { error: errorMessage } : {}) },
      },
      include: { senderUser: { select: { name: true } } },
    });

    await tx.messageThread.update({
      where: { id: threadId },
      data: {
        lastMessageAt: sentAt,
        ...(thread.assigneeId ? {} : { assigneeId: userId }),
      },
    });

    if (thread.leadId) {
      await tx.lead.update({
        where: { id: thread.leadId },
        data: { lastContactAt: sentAt },
      });
    }

    return created;
  });

  const activityTitle =
    thread.channel === 'SMS'
      ? 'پیامک ارسال شد'
      : thread.channel === 'EMAIL'
        ? 'ایمیل ارسال شد'
        : thread.channel === 'TELEGRAM'
          ? 'پیام تلگرام ارسال شد'
          : thread.channel === 'INSTAGRAM'
            ? 'پیام اینستاگرام ارسال شد'
            : 'پیام واتساپ ارسال شد';

  await logActivity({
    organizationId,
    userId,
    type: thread.channel === 'EMAIL' ? 'EMAIL' : 'MESSAGE',
    title: activityTitle,
    description: content.slice(0, 120),
    customerId: thread.customerId ?? undefined,
    leadId: thread.leadId ?? undefined,
  });

  return {
    message: mapMessage(message),
    deliveryStatus: status,
    errorMessage,
  };
}

export async function handleWhatsAppWebhook(body: unknown) {
  const inbound = parseWhatsAppWebhook(body);
  const processed: string[] = [];

  for (const item of inbound) {
    const orgId = await findOrganizationByPhoneNumberId(item.phoneNumberId);
    if (!orgId) continue;

    const existing = await prisma.message.findUnique({
      where: { externalId: item.externalId },
      select: { id: true },
    });
    if (existing) continue;

    const thread = await findOrCreateWhatsAppThread(orgId, item.fromPhone);
    await persistInboundMessage({
      threadId: thread.id,
      organizationId: orgId,
      leadId: thread.leadId,
      content: item.content,
      externalId: item.externalId,
      sentAt: item.sentAt,
    });

    await logActivity({
      organizationId: orgId,
      type: 'MESSAGE',
      title: 'پیام واتساپ دریافت شد',
      description: item.content.slice(0, 120),
      customerId: thread.customerId ?? undefined,
      leadId: thread.leadId ?? undefined,
    });

    processed.push(item.externalId);
  }

  return processed;
}

export async function handleKavenegarInboundWebhook(orgSlug: string, body: unknown) {
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  });
  if (!org) return [];

  const inbound = parseKavenegarInboundWebhook(body);
  const processed: string[] = [];

  for (const item of inbound) {
    const existing = await prisma.message.findFirst({
      where: { externalId: item.externalId },
      select: { id: true },
    });
    if (existing) continue;

    const thread = await findOrCreateSmsThread(org.id, item.fromPhone);
    await persistInboundMessage({
      threadId: thread.id,
      organizationId: org.id,
      leadId: thread.leadId,
      content: item.content,
      externalId: item.externalId,
      sentAt: item.sentAt,
    });

    await logActivity({
      organizationId: org.id,
      type: 'MESSAGE',
      title: 'پیامک دریافت شد',
      description: item.content.slice(0, 120),
      customerId: thread.customerId ?? undefined,
      leadId: thread.leadId ?? undefined,
    });

    processed.push(item.externalId);
  }

  return processed;
}

export async function handleResendInboundWebhook(orgSlug: string, body: unknown) {
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  });
  if (!org) return [];

  const inbound = parseResendInboundWebhook(body);
  const processed: string[] = [];

  for (const item of inbound) {
    const existing = await prisma.message.findFirst({
      where: { externalId: item.externalId },
      select: { id: true },
    });
    if (existing) continue;

    const thread = await findOrCreateEmailThread(org.id, item.fromEmail, {
      subject: item.subject,
    });
    const content = `[${item.subject}]\n${item.content}`;
    await persistInboundMessage({
      threadId: thread.id,
      organizationId: org.id,
      leadId: thread.leadId,
      content,
      externalId: item.externalId,
      sentAt: item.sentAt,
    });

    await logActivity({
      organizationId: org.id,
      type: 'EMAIL',
      title: 'ایمیل دریافت شد',
      description: item.subject,
      customerId: thread.customerId ?? undefined,
      leadId: thread.leadId ?? undefined,
    });

    processed.push(item.externalId);
  }

  return processed;
}

async function findOrganizationByPhoneNumberId(phoneNumberId: string): Promise<string | null> {
  const rows = await prisma.integrationConfig.findMany({
    where: { provider: 'whatsapp', isActive: true },
    select: { organizationId: true, config: true },
  });

  for (const row of rows) {
    const cfg =
      row.config && typeof row.config === 'object' && !Array.isArray(row.config)
        ? (row.config as Record<string, unknown>)
        : {};
    if (cfg.phoneNumberId === phoneNumberId) {
      return row.organizationId;
    }
  }

  const envPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const envOrgId = process.env.WHATSAPP_DEFAULT_ORG_ID?.trim();
  if (envPhoneNumberId && envOrgId && envPhoneNumberId === phoneNumberId) {
    return envOrgId;
  }

  return null;
}

export async function handleTelegramInboundWebhook(orgSlug: string, body: unknown) {
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  });
  if (!org) return [];

  const inbound = parseTelegramWebhook(body);
  const processed: string[] = [];

  for (const item of inbound) {
    const existing = await prisma.message.findFirst({
      where: { externalId: item.externalId },
      select: { id: true },
    });
    if (existing) continue;

    const thread = await findOrCreateTelegramThread(org.id, item.chatId);
    await persistInboundMessage({
      threadId: thread.id,
      organizationId: org.id,
      leadId: thread.leadId,
      content: item.content,
      externalId: item.externalId,
      sentAt: item.sentAt,
    });

    await logActivity({
      organizationId: org.id,
      type: 'MESSAGE',
      title: 'پیام تلگرام دریافت شد',
      description: item.content.slice(0, 120),
      customerId: thread.customerId ?? undefined,
      leadId: thread.leadId ?? undefined,
    });

    processed.push(item.externalId);
  }

  return processed;
}

export async function handleInstagramInboundWebhook(orgSlug: string, body: unknown) {
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  });
  if (!org) return [];

  const inbound = parseInstagramWebhook(body);
  const processed: string[] = [];

  for (const item of inbound) {
    const existing = await prisma.message.findFirst({
      where: { externalId: item.externalId },
      select: { id: true },
    });
    if (existing) continue;

    const thread = await findOrCreateInstagramThread(org.id, item.senderId);
    await persistInboundMessage({
      threadId: thread.id,
      organizationId: org.id,
      leadId: thread.leadId,
      content: item.content,
      externalId: item.externalId,
      sentAt: item.sentAt,
    });

    await logActivity({
      organizationId: org.id,
      type: 'MESSAGE',
      title: 'پیام اینستاگرام دریافت شد',
      description: item.content.slice(0, 120),
      customerId: thread.customerId ?? undefined,
      leadId: thread.leadId ?? undefined,
    });

    processed.push(item.externalId);
  }

  return processed;
}

export async function linkThreadToCustomer(
  organizationId: string,
  threadId: string,
  customerId: string,
) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, organizationId },
    select: { id: true },
  });
  if (!customer) return null;

  return prisma.messageThread.updateMany({
    where: { id: threadId, organizationId },
    data: { customerId },
  });
}

export async function getInboxChannelHealth(organizationId: string) {
  const view = await getOrgIntegrationsPublicView(organizationId);
  return {
    channels: [
      { channel: 'WHATSAPP' as const, ...view.whatsapp },
      { channel: 'SMS' as const, ...view.sms },
      { channel: 'EMAIL' as const, ...view.email },
      { channel: 'PHONE' as const, ...view.voip },
      { channel: 'TELEGRAM' as const, ...view.telegram },
      { channel: 'INSTAGRAM' as const, ...view.instagram },
    ],
  };
}
