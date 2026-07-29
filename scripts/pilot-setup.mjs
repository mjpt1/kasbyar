#!/usr/bin/env node
/**
 * Pilot workspace setup — creates org + owner + subscription.
 *
 * Usage:
 *   node scripts/pilot-setup.mjs --name "کلینیک نمونه" --slug clinic-demo \
 *     --admin-email admin@clinic.ir --admin-password 'Temp123!' \
 *     --plan BUSINESS --pack GENERAL --specialty general-freelancer
 */
import { parseArgs } from 'node:util';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const { values } = parseArgs({
  options: {
    name: { type: 'string' },
    slug: { type: 'string' },
    'admin-email': { type: 'string' },
    'admin-password': { type: 'string' },
    plan: { type: 'string', default: 'BUSINESS' },
    pack: { type: 'string', default: 'GENERAL' },
    specialty: { type: 'string', default: 'general-freelancer' },
    help: { type: 'boolean', short: 'h' },
  },
});

if (values.help) {
  console.log(`
Pilot setup — ایجاد workspace پایلوت

الزامی: --name --slug --admin-email --admin-password
اختیاری: --plan (FREE|STARTER|BUSINESS|ENTERPRISE) --pack --specialty
`);
  process.exit(0);
}

const name = values.name?.trim();
const slug = values.slug?.trim().toLowerCase();
const email = values['admin-email']?.trim().toLowerCase();
const password = values['admin-password'];
const planCode = (values.plan ?? 'BUSINESS').toUpperCase();
const industryPack = (values.pack ?? 'GENERAL').toUpperCase();
const specialty = values.specialty ?? 'general-freelancer';

if (!name || !slug || !email || !password) {
  console.error('خطا: --name --slug --admin-email --admin-password الزامی است');
  process.exit(1);
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000';

async function main() {
  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (existing) {
    console.error(`slug "${slug}" قبلاً وجود دارد — organizationId: ${existing.id}`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    create: { name: `مدیر ${name}`, email, passwordHash },
    update: { passwordHash },
  });

  const org = await prisma.organization.create({
    data: {
      name,
      slug,
      industryPack,
      industrySpecialty: specialty,
      settings: { onboardingCompleted: false, pilot: true },
    },
  });

  await prisma.membership.create({
    data: {
      organizationId: org.id,
      userId: user.id,
      role: 'OWNER',
      isActive: true,
    },
  });

  await prisma.subscription.upsert({
    where: { organizationId: org.id },
    create: {
      organizationId: org.id,
      planCode,
      status: planCode === 'FREE' ? 'ACTIVE' : 'TRIALING',
      billingPeriod: 'MONTHLY',
      trialEndsAt: planCode !== 'FREE' ? new Date(Date.now() + 14 * 86400000) : null,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
      provider: 'manual',
    },
    update: { planCode, status: planCode === 'FREE' ? 'ACTIVE' : 'TRIALING' },
  });

  console.log(JSON.stringify({
    ok: true,
    organizationId: org.id,
    slug: org.slug,
    plan: planCode,
    adminEmail: email,
    loginUrl: `${appUrl}/login`,
    onboardingUrl: `${appUrl}/onboarding`,
  }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
