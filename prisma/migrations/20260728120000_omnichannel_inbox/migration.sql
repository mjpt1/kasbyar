-- Omnichannel inbox (WhatsApp phase 2)

ALTER TABLE "MessageThread" ADD COLUMN "leadId" TEXT;
ALTER TABLE "MessageThread" ADD COLUMN "externalPhone" TEXT;
ALTER TABLE "MessageThread" ADD COLUMN "lastMessageAt" TIMESTAMP(3);

ALTER TABLE "Message" ADD COLUMN "externalId" TEXT;
ALTER TABLE "Message" ADD COLUMN "senderUserId" TEXT;

CREATE UNIQUE INDEX "Message_externalId_key" ON "Message"("externalId");
CREATE INDEX "MessageThread_leadId_idx" ON "MessageThread"("leadId");
CREATE INDEX "MessageThread_organizationId_lastMessageAt_idx" ON "MessageThread"("organizationId", "lastMessageAt");
CREATE INDEX "Message_senderUserId_idx" ON "Message"("senderUserId");

CREATE UNIQUE INDEX "MessageThread_organizationId_channel_externalPhone_key"
  ON "MessageThread"("organizationId", "channel", "externalPhone");

ALTER TABLE "MessageThread"
  ADD CONSTRAINT "MessageThread_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Message"
  ADD CONSTRAINT "Message_senderUserId_fkey"
  FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
