-- Wave 4 IndustryPack values + shared PackWorkItem table
ALTER TYPE "IndustryPack" ADD VALUE 'LOGISTICS';
ALTER TYPE "IndustryPack" ADD VALUE 'AUTOMOTIVE';
ALTER TYPE "IndustryPack" ADD VALUE 'HOSPITALITY';
ALTER TYPE "IndustryPack" ADD VALUE 'WHOLESALE';
ALTER TYPE "IndustryPack" ADD VALUE 'EVENTS';
ALTER TYPE "IndustryPack" ADD VALUE 'AGRICULTURE';
ALTER TYPE "IndustryPack" ADD VALUE 'HOME_SERVICES';
ALTER TYPE "IndustryPack" ADD VALUE 'DISTRIBUTION';

CREATE TABLE "PackWorkItem" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "pack" "IndustryPack" NOT NULL,
    "title" TEXT NOT NULL,
    "status" "ProjectJobStatus" NOT NULL DEFAULT 'PLANNED',
    "scheduledAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "amount" DECIMAL(18,0),
    "location" TEXT,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackWorkItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PackWorkItem_organizationId_idx" ON "PackWorkItem"("organizationId");
CREATE INDEX "PackWorkItem_organizationId_pack_idx" ON "PackWorkItem"("organizationId", "pack");
CREATE INDEX "PackWorkItem_organizationId_pack_status_idx" ON "PackWorkItem"("organizationId", "pack", "status");
CREATE INDEX "PackWorkItem_customerId_idx" ON "PackWorkItem"("customerId");

ALTER TABLE "PackWorkItem" ADD CONSTRAINT "PackWorkItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PackWorkItem" ADD CONSTRAINT "PackWorkItem_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
