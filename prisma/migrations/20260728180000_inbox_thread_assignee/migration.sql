-- AlterTable
ALTER TABLE "MessageThread" ADD COLUMN "assigneeId" TEXT;

-- CreateIndex
CREATE INDEX "MessageThread_assigneeId_idx" ON "MessageThread"("assigneeId");

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
