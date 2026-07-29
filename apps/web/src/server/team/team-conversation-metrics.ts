import { prisma } from '@/lib/prisma';

export type ConversationMemberMetrics = {
  messagesSent: number;
  threadsHandled: number;
  avgResponseMinutes: number | null;
  negativeSentimentCustomers: number;
};

const MAX_RESPONSE_MINUTES = 24 * 60;

export async function getConversationMetricsByMember(
  organizationId: string,
  memberIds: string[],
  since: Date,
): Promise<Map<string, ConversationMemberMetrics>> {
  const empty = (): ConversationMemberMetrics => ({
    messagesSent: 0,
    threadsHandled: 0,
    avgResponseMinutes: null,
    negativeSentimentCustomers: 0,
  });

  const result = new Map<string, ConversationMemberMetrics>();
  for (const id of memberIds) {
    result.set(id, empty());
  }
  if (memberIds.length === 0) return result;

  const outboundMessages = await prisma.message.findMany({
    where: {
      direction: 'OUTBOUND',
      senderUserId: { in: memberIds },
      sentAt: { gte: since },
      thread: { organizationId },
    },
    select: {
      senderUserId: true,
      threadId: true,
    },
  });

  const assignedThreads = await prisma.messageThread.findMany({
    where: {
      organizationId,
      assigneeId: { in: memberIds },
      OR: [{ lastMessageAt: { gte: since } }, { updatedAt: { gte: since } }],
    },
    select: {
      id: true,
      assigneeId: true,
      customerId: true,
    },
  });

  const messagesSentMap = new Map<string, number>();
  const threadsByMember = new Map<string, Set<string>>();

  for (const row of outboundMessages) {
    const userId = row.senderUserId;
    if (!userId) continue;
    messagesSentMap.set(userId, (messagesSentMap.get(userId) ?? 0) + 1);
  }

  for (const row of assignedThreads) {
    const userId = row.assigneeId;
    if (!userId) continue;
    if (!threadsByMember.has(userId)) threadsByMember.set(userId, new Set());
    threadsByMember.get(userId)!.add(row.id);
  }

  const responseTimes = await computeResponseTimesByMember(organizationId, memberIds, since);

  const assignedCustomerIds = [
    ...new Set(
      assignedThreads
        .map((t) => t.customerId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const negativeByCustomer = new Map<string, boolean>();
  if (assignedCustomerIds.length > 0) {
    const negativeSentiments = await prisma.customerSentiment.findMany({
      where: {
        organizationId,
        customerId: { in: assignedCustomerIds },
        createdAt: { gte: since },
        label: { in: ['NEGATIVE', 'VERY_NEGATIVE'] },
      },
      select: { customerId: true },
      distinct: ['customerId'],
    });
    for (const row of negativeSentiments) {
      negativeByCustomer.set(row.customerId, true);
    }
  }

  const negativeByAssignee = new Map<string, number>();
  for (const thread of assignedThreads) {
    if (!thread.assigneeId || !thread.customerId) continue;
    if (!negativeByCustomer.has(thread.customerId)) continue;
    negativeByAssignee.set(
      thread.assigneeId,
      (negativeByAssignee.get(thread.assigneeId) ?? 0) + 1,
    );
  }

  for (const userId of memberIds) {
    result.set(userId, {
      messagesSent: messagesSentMap.get(userId) ?? 0,
      threadsHandled: threadsByMember.get(userId)?.size ?? 0,
      avgResponseMinutes: responseTimes.get(userId) ?? null,
      negativeSentimentCustomers: negativeByAssignee.get(userId) ?? 0,
    });
  }

  return result;
}

async function computeResponseTimesByMember(
  organizationId: string,
  memberIds: string[],
  since: Date,
): Promise<Map<string, number>> {
  const memberSet = new Set(memberIds);
  const sums = new Map<string, { total: number; count: number }>();

  const threads = await prisma.messageThread.findMany({
    where: {
      organizationId,
      OR: [{ lastMessageAt: { gte: since } }, { updatedAt: { gte: since } }],
    },
    select: {
      messages: {
        where: { sentAt: { gte: since } },
        orderBy: { sentAt: 'asc' },
        select: { direction: true, sentAt: true, senderUserId: true },
      },
    },
    take: 500,
  });

  for (const thread of threads) {
    let lastInboundAt: Date | null = null;

    for (const message of thread.messages) {
      if (message.direction === 'INBOUND') {
        lastInboundAt = message.sentAt;
        continue;
      }

      if (
        message.direction === 'OUTBOUND' &&
        lastInboundAt &&
        message.senderUserId &&
        memberSet.has(message.senderUserId)
      ) {
        const minutes = (message.sentAt.getTime() - lastInboundAt.getTime()) / 60_000;
        if (minutes > 0 && minutes <= MAX_RESPONSE_MINUTES) {
          const bucket = sums.get(message.senderUserId) ?? { total: 0, count: 0 };
          bucket.total += minutes;
          bucket.count += 1;
          sums.set(message.senderUserId, bucket);
        }
        lastInboundAt = null;
      }
    }
  }

  const averages = new Map<string, number>();
  for (const [userId, { total, count }] of sums) {
    if (count > 0) averages.set(userId, Math.round(total / count));
  }
  return averages;
}

export async function getOrganizationConversationSummary(
  organizationId: string,
  since: Date,
): Promise<{ totalMessagesSent: number; negativeSentimentCustomers: number }> {
  const [totalMessagesSent, negativeSentimentCustomers] = await Promise.all([
    prisma.message.count({
      where: {
        direction: 'OUTBOUND',
        sentAt: { gte: since },
        thread: { organizationId },
        senderUserId: { not: null },
      },
    }),
    prisma.customerSentiment.findMany({
      where: {
        organizationId,
        createdAt: { gte: since },
        label: { in: ['NEGATIVE', 'VERY_NEGATIVE'] },
      },
      select: { customerId: true },
      distinct: ['customerId'],
    }),
  ]);

  return {
    totalMessagesSent,
    negativeSentimentCustomers: negativeSentimentCustomers.length,
  };
}
