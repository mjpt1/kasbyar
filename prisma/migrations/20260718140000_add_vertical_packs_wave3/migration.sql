-- AlterEnum: add wave-3 IndustryPack values (Postgres ADD VALUE; commit before use in same txn on older PG)
ALTER TYPE IndustryPack ADD VALUE 'LAW_FIRM';
ALTER TYPE IndustryPack ADD VALUE 'ACCOUNTING_FIRM';
ALTER TYPE IndustryPack ADD VALUE 'INSURANCE_AGENCY';
ALTER TYPE IndustryPack ADD VALUE 'MARKETING_AGENCY';
ALTER TYPE IndustryPack ADD VALUE 'CONTRACTING';
ALTER TYPE IndustryPack ADD VALUE 'PHOTOGRAPHY';
ALTER TYPE IndustryPack ADD VALUE 'CLEANING';
ALTER TYPE IndustryPack ADD VALUE 'PRINTING';

-- CreateEnum
CREATE TYPE CaseStatus AS ENUM ('OPEN', 'ACTIVE', 'WAITING', 'CLOSED');

-- CreateEnum
CREATE TYPE PolicyStatus AS ENUM ('ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE ProjectJobStatus AS ENUM ('PLANNED', 'ACTIVE', 'ON_HOLD', 'DONE', 'CANCELLED');

-- CreateTable
CREATE TABLE LegalCase (
    id TEXT NOT NULL,
    organizationId TEXT NOT NULL,
    customerId TEXT NOT NULL,
    title TEXT NOT NULL,
    caseNumber TEXT,
    status CaseStatus NOT NULL DEFAULT 'OPEN',
    nextHearingAt TIMESTAMP(3),
    notes TEXT,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL,

    CONSTRAINT LegalCase_pkey PRIMARY KEY (id)
);

-- CreateTable
CREATE TABLE AccountingMatter (
    id TEXT NOT NULL,
    organizationId TEXT NOT NULL,
    customerId TEXT NOT NULL,
    title TEXT NOT NULL,
    status CaseStatus NOT NULL DEFAULT 'OPEN',
    dueDate TIMESTAMP(3),
    notes TEXT,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL,

    CONSTRAINT AccountingMatter_pkey PRIMARY KEY (id)
);

-- CreateTable
CREATE TABLE InsurancePolicy (
    id TEXT NOT NULL,
    organizationId TEXT NOT NULL,
    customerId TEXT NOT NULL,
    policyNumber TEXT NOT NULL,
    policyType TEXT NOT NULL,
    status PolicyStatus NOT NULL DEFAULT 'ACTIVE',
    premium DECIMAL(18,0),
    startsAt TIMESTAMP(3),
    expiresAt TIMESTAMP(3),
    notes TEXT,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL,

    CONSTRAINT InsurancePolicy_pkey PRIMARY KEY (id)
);

-- CreateTable
CREATE TABLE MarketingCampaign (
    id TEXT NOT NULL,
    organizationId TEXT NOT NULL,
    customerId TEXT NOT NULL,
    title TEXT NOT NULL,
    channel TEXT,
    status ProjectJobStatus NOT NULL DEFAULT 'PLANNED',
    budget DECIMAL(18,0),
    startDate TIMESTAMP(3),
    endDate TIMESTAMP(3),
    notes TEXT,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL,

    CONSTRAINT MarketingCampaign_pkey PRIMARY KEY (id)
);

-- CreateTable
CREATE TABLE ContractProject (
    id TEXT NOT NULL,
    organizationId TEXT NOT NULL,
    customerId TEXT NOT NULL,
    title TEXT NOT NULL,
    siteAddress TEXT,
    status ProjectJobStatus NOT NULL DEFAULT 'PLANNED',
    contractAmount DECIMAL(18,0),
    startDate TIMESTAMP(3),
    endDate TIMESTAMP(3),
    notes TEXT,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL,

    CONSTRAINT ContractProject_pkey PRIMARY KEY (id)
);

-- CreateTable
CREATE TABLE PhotoSession (
    id TEXT NOT NULL,
    organizationId TEXT NOT NULL,
    customerId TEXT NOT NULL,
    title TEXT NOT NULL,
    packageName TEXT,
    status ServiceBookingStatus NOT NULL DEFAULT 'SCHEDULED',
    scheduledAt TIMESTAMP(3) NOT NULL,
    price DECIMAL(18,0),
    notes TEXT,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL,

    CONSTRAINT PhotoSession_pkey PRIMARY KEY (id)
);

-- CreateTable
CREATE TABLE CleaningJob (
    id TEXT NOT NULL,
    organizationId TEXT NOT NULL,
    customerId TEXT NOT NULL,
    address TEXT NOT NULL,
    serviceType TEXT,
    status ServiceBookingStatus NOT NULL DEFAULT 'SCHEDULED',
    scheduledAt TIMESTAMP(3) NOT NULL,
    price DECIMAL(18,0),
    notes TEXT,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL,

    CONSTRAINT CleaningJob_pkey PRIMARY KEY (id)
);

-- CreateTable
CREATE TABLE PrintOrder (
    id TEXT NOT NULL,
    organizationId TEXT NOT NULL,
    customerId TEXT NOT NULL,
    title TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    status ProjectJobStatus NOT NULL DEFAULT 'PLANNED',
    dueAt TIMESTAMP(3),
    totalAmount DECIMAL(18,0),
    notes TEXT,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP(3) NOT NULL,

    CONSTRAINT PrintOrder_pkey PRIMARY KEY (id)
);

-- CreateIndex
CREATE INDEX LegalCase_organizationId_idx ON LegalCase(organizationId);

-- CreateIndex
CREATE INDEX LegalCase_organizationId_status_idx ON LegalCase(organizationId, status);

-- CreateIndex
CREATE INDEX LegalCase_customerId_idx ON LegalCase(customerId);

-- CreateIndex
CREATE INDEX AccountingMatter_organizationId_idx ON AccountingMatter(organizationId);

-- CreateIndex
CREATE INDEX AccountingMatter_organizationId_status_idx ON AccountingMatter(organizationId, status);

-- CreateIndex
CREATE INDEX AccountingMatter_customerId_idx ON AccountingMatter(customerId);

-- CreateIndex
CREATE INDEX InsurancePolicy_organizationId_idx ON InsurancePolicy(organizationId);

-- CreateIndex
CREATE INDEX InsurancePolicy_organizationId_status_idx ON InsurancePolicy(organizationId, status);

-- CreateIndex
CREATE INDEX InsurancePolicy_customerId_idx ON InsurancePolicy(customerId);

-- CreateIndex
CREATE INDEX MarketingCampaign_organizationId_idx ON MarketingCampaign(organizationId);

-- CreateIndex
CREATE INDEX MarketingCampaign_organizationId_status_idx ON MarketingCampaign(organizationId, status);

-- CreateIndex
CREATE INDEX MarketingCampaign_customerId_idx ON MarketingCampaign(customerId);

-- CreateIndex
CREATE INDEX ContractProject_organizationId_idx ON ContractProject(organizationId);

-- CreateIndex
CREATE INDEX ContractProject_organizationId_status_idx ON ContractProject(organizationId, status);

-- CreateIndex
CREATE INDEX ContractProject_customerId_idx ON ContractProject(customerId);

-- CreateIndex
CREATE INDEX PhotoSession_organizationId_idx ON PhotoSession(organizationId);

-- CreateIndex
CREATE INDEX PhotoSession_organizationId_scheduledAt_idx ON PhotoSession(organizationId, scheduledAt);

-- CreateIndex
CREATE INDEX PhotoSession_customerId_idx ON PhotoSession(customerId);

-- CreateIndex
CREATE INDEX CleaningJob_organizationId_idx ON CleaningJob(organizationId);

-- CreateIndex
CREATE INDEX CleaningJob_organizationId_scheduledAt_idx ON CleaningJob(organizationId, scheduledAt);

-- CreateIndex
CREATE INDEX CleaningJob_customerId_idx ON CleaningJob(customerId);

-- CreateIndex
CREATE INDEX PrintOrder_organizationId_idx ON PrintOrder(organizationId);

-- CreateIndex
CREATE INDEX PrintOrder_organizationId_status_idx ON PrintOrder(organizationId, status);

-- CreateIndex
CREATE INDEX PrintOrder_customerId_idx ON PrintOrder(customerId);

-- AddForeignKey
ALTER TABLE LegalCase ADD CONSTRAINT LegalCase_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE LegalCase ADD CONSTRAINT LegalCase_customerId_fkey FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE AccountingMatter ADD CONSTRAINT AccountingMatter_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE AccountingMatter ADD CONSTRAINT AccountingMatter_customerId_fkey FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE InsurancePolicy ADD CONSTRAINT InsurancePolicy_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE InsurancePolicy ADD CONSTRAINT InsurancePolicy_customerId_fkey FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE MarketingCampaign ADD CONSTRAINT MarketingCampaign_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE MarketingCampaign ADD CONSTRAINT MarketingCampaign_customerId_fkey FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE ContractProject ADD CONSTRAINT ContractProject_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE ContractProject ADD CONSTRAINT ContractProject_customerId_fkey FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE PhotoSession ADD CONSTRAINT PhotoSession_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE PhotoSession ADD CONSTRAINT PhotoSession_customerId_fkey FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE CleaningJob ADD CONSTRAINT CleaningJob_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE CleaningJob ADD CONSTRAINT CleaningJob_customerId_fkey FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE PrintOrder ADD CONSTRAINT PrintOrder_organizationId_fkey FOREIGN KEY (organizationId) REFERENCES Organization(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE PrintOrder ADD CONSTRAINT PrintOrder_customerId_fkey FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE CASCADE ON UPDATE CASCADE;