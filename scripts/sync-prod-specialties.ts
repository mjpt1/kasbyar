/**
 * Upsert lean demo orgs for every industry specialty on production.
 * Usage: DATABASE_URL=... npx tsx scripts/sync-prod-specialties.ts
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { listSpecialties } from '@kesbyar/shared';

import { PIPELINE_STAGES_DEFAULT } from '../prisma/seed/constants';
import {
  createInvoiceWithItems,
  daysAgo,
  daysFromNow,
  invoiceNumber,
} from '../prisma/seed/utils';

if (!process.env.DATABASE_URL) {
  config({ path: resolve(process.cwd(), '.env.vercel.production') });
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const YEAR = new Date().getFullYear();

async function main() {
  const prisma = new PrismaClient();
  let created = 0;
  let updated = 0;
  let skipped = 0;

  try {
    const owner = await prisma.user.findUnique({ where: { email: 'demo@kesbyar.ir' } });
    const superAdmin = await prisma.user.findUnique({ where: { email: 'super@kesbyar.ir' } });

    if (!owner || !superAdmin) {
      console.error('Demo users not found — run base seed first');
      process.exit(1);
    }

    let invoiceSeq = 99000;

    for (const specialty of listSpecialties()) {
      const slug = `demo-spec-${specialty.id}`;
      const existing = await prisma.organization.findUnique({ where: { slug } });

      if (existing) {
        if (
          existing.industryPack !== specialty.basePack ||
          existing.industrySpecialty !== specialty.id
        ) {
          await prisma.organization.update({
            where: { id: existing.id },
            data: {
              industryPack: specialty.basePack,
              industrySpecialty: specialty.id,
              isDemo: true,
            },
          });
          updated += 1;
        } else {
          skipped += 1;
        }
        continue;
      }

      let organization;
      try {
        organization = await prisma.organization.create({
          data: {
            name: `دمو — ${specialty.label}`,
            slug,
            industryPack: specialty.basePack,
            industrySpecialty: specialty.id,
            isDemo: true,
            phone: '02100000000',
            email: `demo+${specialty.id}@kesbyar.ir`,
            address: 'تهران — محیط نمایش تخصصی',
            workspaces: {
              create: { name: 'شعبه اصلی', slug: 'main', isDefault: true },
            },
            memberships: {
              create: [
                { userId: owner.id, role: 'OWNER' },
                { userId: superAdmin.id, role: 'OWNER' },
              ],
            },
            pipelineStages: {
              create: PIPELINE_STAGES_DEFAULT.map((s) => ({ ...s })),
            },
          },
        });
      } catch (err) {
        // Pooler/replica lag can miss an existing slug on findUnique, then lose the race on create.
        const isUnique =
          typeof err === 'object' &&
          err !== null &&
          'code' in err &&
          (err as { code?: string }).code === 'P2002';
        if (!isUnique) throw err;
        const raced = await prisma.organization.findUnique({ where: { slug } });
        if (!raced) throw err;
        if (
          raced.industryPack !== specialty.basePack ||
          raced.industrySpecialty !== specialty.id
        ) {
          await prisma.organization.update({
            where: { id: raced.id },
            data: {
              industryPack: specialty.basePack,
              industrySpecialty: specialty.id,
              isDemo: true,
            },
          });
          updated += 1;
        } else {
          skipped += 1;
        }
        continue;
      }

      const customers = await Promise.all([
        prisma.customer.create({
          data: {
            organizationId: organization.id,
            name: `${specialty.labels.customer} نمونه ۱`,
            phone: '09121111111',
            city: 'تهران',
            createdAt: daysAgo(30),
          },
        }),
        prisma.customer.create({
          data: {
            organizationId: organization.id,
            name: `${specialty.labels.customer} نمونه ۲`,
            phone: '09122222222',
            city: 'تهران',
            createdAt: daysAgo(10),
          },
        }),
      ]);

      await createInvoiceWithItems(prisma, {
        organizationId: organization.id,
        customerId: customers[0]!.id,
        number: invoiceNumber(YEAR, invoiceSeq++),
        status: 'SENT',
        issueDate: daysAgo(5),
        dueDate: daysFromNow(10),
        paidAmount: 0,
        items: [
          {
            description: `خدمات ${specialty.label}`,
            quantity: 1,
            unitPrice: 4500000,
          },
        ],
      });

      created += 1;
    }

    console.log('---');
    console.log(`Specialties total: ${listSpecialties().length}`);
    console.log(`Created: ${created}`);
    console.log(`Updated: ${updated}`);
    console.log(`Already synced: ${skipped}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
