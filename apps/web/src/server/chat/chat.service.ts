import type { TeamConversationType } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { AppError, ForbiddenError, NotFoundError } from '@/lib/errors';

import { requireOrgModule } from '../modules/org-module.service';

async function requireActiveMember(organizationId: string, userId: string) {
  const membership = await prisma.membership.findFirst({
    where: { organizationId, userId, isActive: true },
    select: { id: true },
  });
  if (!membership) throw new ForbiddenError('عضو فعال این سازمان نیستید');
}

async function requireConversationMember(
  organizationId: string,
  conversationId: string,
  userId: string,
) {
  const member = await prisma.teamConversationMember.findFirst({
    where: { organizationId, conversationId, userId },
  });
  if (!member) throw new ForbiddenError('به این گفتگو دسترسی ندارید');
  return member;
}

export async function listConversations(organizationId: string, userId: string) {
  await requireOrgModule(organizationId, 'internal_chat');
  await requireActiveMember(organizationId, userId);

  const memberships = await prisma.teamConversationMember.findMany({
    where: { organizationId, userId },
    include: {
      conversation: {
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { user: { select: { id: true, name: true } } },
          },
          members: {
            include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          },
        },
      },
    },
    orderBy: { conversation: { updatedAt: 'desc' } },
  });

  return memberships.map((m) => {
    const last = m.conversation.messages[0];
    const unread =
      last && (!m.lastReadAt || last.createdAt > m.lastReadAt) && last.userId !== userId;
    return {
      id: m.conversation.id,
      type: m.conversation.type,
      name: m.conversation.name,
      members: m.conversation.members.map((mem) => mem.user),
      lastMessage: last
        ? {
            body: last.body,
            createdAt: last.createdAt,
            user: last.user,
          }
        : null,
      unread: Boolean(unread),
      updatedAt: m.conversation.updatedAt,
    };
  });
}

export async function createDirectConversation(
  organizationId: string,
  userId: string,
  peerUserId: string,
) {
  await requireOrgModule(organizationId, 'internal_chat');
  await requireActiveMember(organizationId, userId);
  if (peerUserId === userId) {
    throw new AppError('نمی‌توانید با خودتان گفتگو بسازید', 'INVALID_PEER', 400);
  }

  const peerMembership = await prisma.membership.findFirst({
    where: { organizationId, userId: peerUserId, isActive: true },
  });
  if (!peerMembership) {
    throw new NotFoundError('کاربر در این سازمان یافت نشد');
  }

  const existing = await prisma.teamConversation.findFirst({
    where: {
      organizationId,
      type: 'DIRECT',
      AND: [
        { members: { some: { userId } } },
        { members: { some: { userId: peerUserId } } },
      ],
    },
    include: {
      members: { include: { user: { select: { id: true, name: true } } } },
    },
  });
  if (existing) return existing;

  return prisma.teamConversation.create({
    data: {
      organizationId,
      type: 'DIRECT',
      createdById: userId,
      members: {
        create: [
          { organizationId, userId },
          { organizationId, userId: peerUserId },
        ],
      },
    },
    include: {
      members: { include: { user: { select: { id: true, name: true } } } },
    },
  });
}

export async function createChannelConversation(
  organizationId: string,
  userId: string,
  name: string,
) {
  await requireOrgModule(organizationId, 'internal_chat');
  await requireActiveMember(organizationId, userId);

  const activeMembers = await prisma.membership.findMany({
    where: { organizationId, isActive: true },
    select: { userId: true },
  });

  return prisma.teamConversation.create({
    data: {
      organizationId,
      type: 'CHANNEL' as TeamConversationType,
      name,
      createdById: userId,
      members: {
        create: activeMembers.map((m) => ({
          organizationId,
          userId: m.userId,
        })),
      },
    },
    include: {
      members: { include: { user: { select: { id: true, name: true } } } },
    },
  });
}

export async function listMessages(
  organizationId: string,
  userId: string,
  conversationId: string,
  options?: { cursor?: string; take?: number },
) {
  await requireOrgModule(organizationId, 'internal_chat');
  await requireConversationMember(organizationId, conversationId, userId);

  const take = Math.min(options?.take ?? 50, 100);
  const messages = await prisma.teamChatMessage.findMany({
    where: {
      organizationId,
      conversationId,
      ...(options?.cursor ? { createdAt: { lt: new Date(options.cursor) } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take,
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  await prisma.teamConversationMember.updateMany({
    where: { conversationId, userId, organizationId },
    data: { lastReadAt: new Date() },
  });

  return {
    items: messages.reverse(),
    hasMore: messages.length === take,
  };
}

export async function sendMessage(
  organizationId: string,
  userId: string,
  conversationId: string,
  body: string,
) {
  await requireOrgModule(organizationId, 'internal_chat');
  await requireConversationMember(organizationId, conversationId, userId);

  const trimmed = body.trim();
  if (!trimmed) throw new AppError('متن پیام خالی است', 'EMPTY_MESSAGE', 400);

  const [message] = await prisma.$transaction([
    prisma.teamChatMessage.create({
      data: {
        organizationId,
        conversationId,
        userId,
        body: trimmed,
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    }),
    prisma.teamConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
    prisma.teamConversationMember.updateMany({
      where: { conversationId, userId, organizationId },
      data: { lastReadAt: new Date() },
    }),
  ]);

  return message;
}

export async function listOrgMembersForChat(organizationId: string, userId: string) {
  await requireOrgModule(organizationId, 'internal_chat');
  await requireActiveMember(organizationId, userId);

  return prisma.membership.findMany({
    where: { organizationId, isActive: true, userId: { not: userId } },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    orderBy: { user: { name: 'asc' } },
  });
}
