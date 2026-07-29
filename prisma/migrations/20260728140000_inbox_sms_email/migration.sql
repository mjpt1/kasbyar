-- Phase 3: email threads in omnichannel inbox

ALTER TABLE "MessageThread" ADD COLUMN "externalEmail" TEXT;

CREATE UNIQUE INDEX "MessageThread_organizationId_channel_externalEmail_key"
  ON "MessageThread"("organizationId", "channel", "externalEmail");
