import { prisma } from '@/lib/prisma';
import { fromWhatsAppPhone, toWhatsAppPhone } from '@/lib/validators/iranian';
import { logActivity } from '@/server/audit/audit.service';
import { resolveVoipWebhookSecret } from '@/server/integrations/org-credentials.service';
import {
  formatCallSummary,
  parseVoipWebhook,
  type VoipCallEvent,
} from '@/server/messaging/providers/voip-webhook';
import {
  findOrCreatePhoneThread,
  listThreadMessages,
  maybeAutoAssignInboundThread,
} from '@/server/messaging/inbox.service';
import { runEventAutomation } from '@/server/automation/automation.service';

export async function handleVoipWebhook(
  orgSlug: string,
  body: unknown,
  options?: { secretHeader?: string | null },
) {
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  });
  if (!org) return [];

  const expectedSecret = await resolveVoipWebhookSecret(org.id);
  if (expectedSecret && options?.secretHeader !== expectedSecret) {
    return [];
  }

  const events = parseVoipWebhook(body);
  const processed: string[] = [];

  for (const event of events) {
    const externalId = `call-${event.externalId}`;
    const existing = await prisma.message.findFirst({
      where: { externalId },
      select: { id: true },
    });
    if (existing) continue;

    const counterpartyPhone =
      event.direction === 'inbound' ? event.fromPhone : event.toPhone || event.fromPhone;
    const thread = await findOrCreatePhoneThread(org.id, counterpartyPhone);
    const summary = formatCallSummary(event);

    await prisma.$transaction(async (tx) => {
      await tx.message.create({
        data: {
          threadId: thread.id,
          direction: event.direction === 'inbound' ? 'INBOUND' : 'OUTBOUND',
          content: summary,
          externalId,
          sentAt: event.sentAt,
          metadata: {
            status: event.status,
            durationSeconds: event.durationSeconds,
            recordingUrl: event.recordingUrl,
            agentExtension: event.agentExtension,
          },
        },
      });
      await tx.messageThread.update({
        where: { id: thread.id },
        data: { lastMessageAt: event.sentAt },
      });
      await maybeAutoAssignInboundThread(org.id, thread.id, tx);
      if (thread.leadId && isContactStatus(event)) {
        await tx.lead.update({
          where: { id: thread.leadId },
          data: { lastContactAt: event.sentAt },
        });
      }
    });

    await logActivity({
      organizationId: org.id,
      type: 'CALL',
      title: event.direction === 'inbound' ? 'تماس تلفنی ورودی' : 'تماس تلفنی خروجی',
      description: summary,
      customerId: thread.customerId ?? undefined,
      leadId: thread.leadId ?? undefined,
      metadata: buildCallMetadata(event),
    });

    if (isMissedCall(event)) {
      void runEventAutomation(org.id, 'MISSED_CALL', {
        title:
          event.direction === 'inbound' ? 'تماس ورودی از دست‌رفته' : 'تماس خروجی بدون پاسخ',
        description: summary,
        customerId: thread.customerId ?? undefined,
        leadId: thread.leadId ?? undefined,
      }).catch(() => undefined);
    }

    processed.push(event.externalId);
  }

  return processed;
}

export async function getCustomerPhoneThread(organizationId: string, customerId: string) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, organizationId, deletedAt: null },
    select: { id: true, phone: true },
  });
  if (!customer?.phone) return null;

  const phone = toWhatsAppPhone(customer.phone);
  if (!phone) return null;

  const thread = await findOrCreatePhoneThread(organizationId, phone, { customerId });
  return listThreadMessages(organizationId, thread.id, { pageSize: 100 });
}

export async function getLeadPhoneThread(organizationId: string, leadId: string) {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, organizationId },
    select: { id: true, contactPhone: true, customerId: true },
  });
  if (!lead?.contactPhone) return null;

  const phone = toWhatsAppPhone(lead.contactPhone);
  if (!phone) return null;

  const thread = await findOrCreatePhoneThread(organizationId, phone, {
    leadId,
    customerId: lead.customerId ?? undefined,
  });
  return listThreadMessages(organizationId, thread.id, { pageSize: 100 });
}

function isContactStatus(event: VoipCallEvent): boolean {
  return ['completed', 'answered'].includes(event.status);
}

function isMissedCall(event: VoipCallEvent): boolean {
  return ['missed', 'no_answer', 'busy'].includes(event.status);
}

function buildCallMetadata(event: VoipCallEvent) {
  return {
    externalCallId: event.externalId,
    direction: event.direction,
    status: event.status,
    durationSeconds: event.durationSeconds,
    durationMinutes: event.durationSeconds > 0 ? Math.round(event.durationSeconds / 60) : 0,
    fromPhone: fromWhatsAppPhone(event.fromPhone),
    toPhone: fromWhatsAppPhone(event.toPhone),
    agentExtension: event.agentExtension,
    recordingUrl: event.recordingUrl,
    provider: 'voip_webhook',
    outcome:
      event.status === 'completed' || event.status === 'answered'
        ? 'answered'
        : event.status === 'missed' || event.status === 'no_answer'
          ? 'missed'
          : event.status,
  };
}
