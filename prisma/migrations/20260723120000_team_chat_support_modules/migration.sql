-- Org modules, internal team chat, support tickets

CREATE TYPE "TeamConversationType" AS ENUM ('DIRECT', 'CHANNEL');
CREATE TYPE "SupportTicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE "SupportTicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

CREATE TABLE "OrgModuleToggle" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgModuleToggle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeamConversation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "TeamConversationType" NOT NULL DEFAULT 'DIRECT',
    "name" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeamConversationMember" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" TIMESTAMP(3),
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamConversationMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeamChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "SupportTicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TicketMessage" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isPlatformReply" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketMessage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrgModuleToggle_organizationId_moduleKey_key" ON "OrgModuleToggle"("organizationId", "moduleKey");
CREATE INDEX "OrgModuleToggle_organizationId_idx" ON "OrgModuleToggle"("organizationId");

CREATE INDEX "TeamConversation_organizationId_idx" ON "TeamConversation"("organizationId");
CREATE INDEX "TeamConversation_organizationId_updatedAt_idx" ON "TeamConversation"("organizationId", "updatedAt");

CREATE UNIQUE INDEX "TeamConversationMember_conversationId_userId_key" ON "TeamConversationMember"("conversationId", "userId");
CREATE INDEX "TeamConversationMember_organizationId_userId_idx" ON "TeamConversationMember"("organizationId", "userId");
CREATE INDEX "TeamConversationMember_userId_idx" ON "TeamConversationMember"("userId");

CREATE INDEX "TeamChatMessage_conversationId_createdAt_idx" ON "TeamChatMessage"("conversationId", "createdAt");
CREATE INDEX "TeamChatMessage_organizationId_idx" ON "TeamChatMessage"("organizationId");

CREATE INDEX "SupportTicket_organizationId_idx" ON "SupportTicket"("organizationId");
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");
CREATE INDEX "SupportTicket_organizationId_status_idx" ON "SupportTicket"("organizationId", "status");
CREATE INDEX "SupportTicket_createdAt_idx" ON "SupportTicket"("createdAt");

CREATE INDEX "TicketMessage_ticketId_createdAt_idx" ON "TicketMessage"("ticketId", "createdAt");

ALTER TABLE "OrgModuleToggle" ADD CONSTRAINT "OrgModuleToggle_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamConversation" ADD CONSTRAINT "TeamConversation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamConversationMember" ADD CONSTRAINT "TeamConversationMember_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "TeamConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamConversationMember" ADD CONSTRAINT "TeamConversationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamConversationMember" ADD CONSTRAINT "TeamConversationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamChatMessage" ADD CONSTRAINT "TeamChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "TeamConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamChatMessage" ADD CONSTRAINT "TeamChatMessage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamChatMessage" ADD CONSTRAINT "TeamChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
