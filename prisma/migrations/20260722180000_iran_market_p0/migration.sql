-- Iran-market P0: financial profile fields, invoice kind, Moadian status, payment links

CREATE TYPE "InvoiceKind" AS ENUM ('PROFORMA', 'SALE');
CREATE TYPE "MoadianStatus" AS ENUM ('NONE', 'DRAFT', 'READY', 'SUBMITTED', 'ACCEPTED', 'REJECTED');

ALTER TABLE "Organization"
  ADD COLUMN IF NOT EXISTS "sheba" TEXT,
  ADD COLUMN IF NOT EXISTS "economicCode" TEXT,
  ADD COLUMN IF NOT EXISTS "companyNationalId" TEXT,
  ADD COLUMN IF NOT EXISTS "postalCode" TEXT,
  ADD COLUMN IF NOT EXISTS "province" TEXT,
  ADD COLUMN IF NOT EXISTS "city" TEXT,
  ADD COLUMN IF NOT EXISTS "taxMemoryId" TEXT,
  ADD COLUMN IF NOT EXISTS "defaultVatRate" DECIMAL(5,2) NOT NULL DEFAULT 9,
  ADD COLUMN IF NOT EXISTS "showTomanAlongside" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Customer"
  ADD COLUMN IF NOT EXISTS "sheba" TEXT,
  ADD COLUMN IF NOT EXISTS "economicCode" TEXT,
  ADD COLUMN IF NOT EXISTS "postalCode" TEXT,
  ADD COLUMN IF NOT EXISTS "province" TEXT;

ALTER TABLE "Invoice"
  ADD COLUMN IF NOT EXISTS "kind" "InvoiceKind" NOT NULL DEFAULT 'SALE',
  ADD COLUMN IF NOT EXISTS "sellerSnapshot" JSONB,
  ADD COLUMN IF NOT EXISTS "buyerSnapshot" JSONB,
  ADD COLUMN IF NOT EXISTS "moadianStatus" "MoadianStatus" NOT NULL DEFAULT 'NONE',
  ADD COLUMN IF NOT EXISTS "moadianTaxId" TEXT,
  ADD COLUMN IF NOT EXISTS "moadianUid" TEXT,
  ADD COLUMN IF NOT EXISTS "moadianPayload" JSONB,
  ADD COLUMN IF NOT EXISTS "moadianLastError" TEXT,
  ADD COLUMN IF NOT EXISTS "moadianSubmittedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Invoice_organizationId_moadianStatus_idx" ON "Invoice"("organizationId", "moadianStatus");

ALTER TABLE "Payment"
  ADD COLUMN IF NOT EXISTS "gatewayProvider" TEXT,
  ADD COLUMN IF NOT EXISTS "gatewayAuthority" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_gatewayProvider_gatewayAuthority_key"
  ON "Payment"("gatewayProvider", "gatewayAuthority");

CREATE TABLE IF NOT EXISTS "InvoicePaymentLink" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "paymentId" TEXT,
  "token" TEXT NOT NULL,
  "amount" DECIMAL(18,0) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InvoicePaymentLink_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "InvoicePaymentLink_token_key" ON "InvoicePaymentLink"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "InvoicePaymentLink_paymentId_key" ON "InvoicePaymentLink"("paymentId");
CREATE INDEX IF NOT EXISTS "InvoicePaymentLink_organizationId_idx" ON "InvoicePaymentLink"("organizationId");
CREATE INDEX IF NOT EXISTS "InvoicePaymentLink_invoiceId_idx" ON "InvoicePaymentLink"("invoiceId");

DO $$ BEGIN
  ALTER TABLE "InvoicePaymentLink"
    ADD CONSTRAINT "InvoicePaymentLink_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "InvoicePaymentLink"
    ADD CONSTRAINT "InvoicePaymentLink_invoiceId_fkey"
    FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "InvoicePaymentLink"
    ADD CONSTRAINT "InvoicePaymentLink_paymentId_fkey"
    FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
