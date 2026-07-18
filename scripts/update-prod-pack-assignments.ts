/**
 * One-off: assign industryPack on demo orgs and seed pack tables if empty.
 * Usage: DATABASE_URL=... npx tsx scripts/update-prod-pack-assignments.ts
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { PrismaClient, type IndustryPack } from '@prisma/client';
import {
  seedBeautyPackData,
  seedEducationPackData,
  seedFitnessPackData,
  seedFoodPackData,
  seedRealEstatePackData,
  seedWorkshopPackData,
} from '../prisma/seed/scenarios/pack-extensions';

// Load prod URL only if not already set (never log the value).
if (!process.env.DATABASE_URL) {
  config({ path: resolve(process.cwd(), '.env.vercel.production') });
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const SLUG_TO_PACK: Record<string, IndustryPack> = {
  'demo-beauty-salon': 'BEAUTY_SALON',
  'demo-education-center': 'EDUCATION',
  'demo-daycare-center': 'EDUCATION',
  'demo-restaurant': 'FOOD_SERVICE',
  'demo-cafe': 'FOOD_SERVICE',
  'demo-bakery': 'FOOD_SERVICE',
  'demo-gym': 'FITNESS',
  'demo-real-estate': 'REAL_ESTATE',
  'demo-auto-repair': 'WORKSHOP',
  'demo-appliance-repair': 'WORKSHOP',
  'demo-computer-service': 'WORKSHOP',
  'demo-tailor-shop': 'WORKSHOP',
};

type SeedFn = (
  prisma: PrismaClient,
  organizationId: string,
  customerIds: string[],
) => Promise<void>;

const PACK_SEED: Record<
  IndustryPack,
  { seed: SeedFn; isEmpty: (prisma: PrismaClient, orgId: string) => Promise<boolean> } | undefined
> = {
  GENERAL: undefined,
  CLINIC: undefined,
  TRAVEL_AGENCY: undefined,
  RETAIL: undefined,
  BEAUTY_SALON: {
    seed: seedBeautyPackData,
    isEmpty: async (prisma, orgId) =>
      (await prisma.beautyAppointment.count({ where: { organizationId: orgId } })) === 0,
  },
  FOOD_SERVICE: {
    seed: seedFoodPackData,
    isEmpty: async (prisma, orgId) =>
      (await prisma.menuItem.count({ where: { organizationId: orgId } })) === 0,
  },
  EDUCATION: {
    seed: seedEducationPackData,
    isEmpty: async (prisma, orgId) =>
      (await prisma.course.count({ where: { organizationId: orgId } })) === 0,
  },
  FITNESS: {
    seed: seedFitnessPackData,
    isEmpty: async (prisma, orgId) =>
      (await prisma.gymMembership.count({ where: { organizationId: orgId } })) === 0,
  },
  REAL_ESTATE: {
    seed: seedRealEstatePackData,
    isEmpty: async (prisma, orgId) =>
      (await prisma.propertyListing.count({ where: { organizationId: orgId } })) === 0,
  },
  WORKSHOP: {
    seed: seedWorkshopPackData,
    isEmpty: async (prisma, orgId) =>
      (await prisma.repairJob.count({ where: { organizationId: orgId } })) === 0,
  },
};

async function main() {
  const prisma = new PrismaClient();
  const seedsRan: string[] = [];
  let orgsUpdated = 0;
  let orgsSkippedPack = 0;
  let seedsSkipped = 0;

  try {
    const slugs = Object.keys(SLUG_TO_PACK);
    const orgs = await prisma.organization.findMany({
      where: { slug: { in: slugs } },
      select: { id: true, slug: true, name: true, industryPack: true },
    });

    console.log(`Found ${orgs.length} matching orgs (of ${slugs.length} target slugs)`);

    for (const org of orgs) {
      const targetPack = SLUG_TO_PACK[org.slug];
      if (!targetPack) continue;

      if (org.industryPack !== targetPack) {
        await prisma.organization.update({
          where: { id: org.id },
          data: { industryPack: targetPack },
        });
        orgsUpdated += 1;
        console.log(`Updated ${org.slug}: ${org.industryPack} -> ${targetPack}`);
      } else {
        orgsSkippedPack += 1;
        console.log(`Pack already set for ${org.slug}: ${targetPack}`);
      }

      const packHandler = PACK_SEED[targetPack];
      if (!packHandler) continue;

      const empty = await packHandler.isEmpty(prisma, org.id);
      if (!empty) {
        seedsSkipped += 1;
        console.log(`Seed skipped (pack data exists): ${org.slug}`);
        continue;
      }

      const customers = await prisma.customer.findMany({
        where: { organizationId: org.id },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
        take: 3,
      });
      const customerIds = customers.map((c) => c.id);

      if (customerIds.length < 2) {
        console.log(`Seed skipped (need >=2 customers, have ${customerIds.length}): ${org.slug}`);
        continue;
      }

      await packHandler.seed(prisma, org.id, customerIds);
      seedsRan.push(`${org.slug} -> ${targetPack}`);
      console.log(`Seeded pack data: ${org.slug} (${targetPack}) with ${customerIds.length} customers`);
    }

    const missing = slugs.filter((s) => !orgs.some((o) => o.slug === s));
    if (missing.length) {
      console.log(`Slugs not found in DB: ${missing.join(', ')}`);
    }

    console.log('---');
    console.log(`Orgs updated (industryPack): ${orgsUpdated}`);
    console.log(`Orgs already correct: ${orgsSkippedPack}`);
    console.log(`Seeds ran: ${seedsRan.length}`);
    if (seedsRan.length) {
      for (const s of seedsRan) console.log(`  - ${s}`);
    }
    console.log(`Seeds skipped (data present): ${seedsSkipped}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
