-- AlterTable
ALTER TABLE "MessageThread" ADD COLUMN IF NOT EXISTS "lastReadAt" TIMESTAMP(3);
