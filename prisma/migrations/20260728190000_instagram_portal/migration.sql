-- AlterEnum
ALTER TYPE "MessageChannel" ADD VALUE 'INSTAGRAM';

-- CreateTable
CREATE TABLE "CustomerPortalToken" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerPortalToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPortalToken_token_key" ON "CustomerPortalToken"("token");

-- CreateIndex
CREATE INDEX "CustomerPortalToken_organizationId_idx" ON "CustomerPortalToken"("organizationId");

-- CreateIndex
CREATE INDEX "CustomerPortalToken_customerId_idx" ON "CustomerPortalToken"("customerId");

-- AddForeignKey
ALTER TABLE "CustomerPortalToken" ADD CONSTRAINT "CustomerPortalToken_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPortalToken" ADD CONSTRAINT "CustomerPortalToken_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
