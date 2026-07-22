import { PrismaClient } from '@prisma/client';

import { DEMO_PASSWORD } from './constants';
import { seedGeneralBusiness } from './scenarios/general';
import { seedVerticalWorkspaces } from './scenarios/verticals';
import type { SeedSummary } from './types';
import { clearDemoData } from './utils';
import { seedUsers } from './users';

const EMPTY_SUMMARY: SeedSummary = {
  organizations: 0,
  users: 0,
  customers: 0,
  leads: 0,
  invoices: 0,
  payments: 0,
  tasks: 0,
  reminders: 0,
  activities: 0,
};

function isDemoSeedEnabled(): boolean {
  return process.env.SEED_DEMO === 'true' || process.env.SEED_DEMO === '1';
}

async function runDemoSeed(prisma: PrismaClient): Promise<SeedSummary> {
  console.log('🌱 KesbYar seed — پاک‌سازی داده‌های نمونه قبلی...');
  await clearDemoData(prisma);

  console.log('👤 ایجاد کاربران نمونه...');
  const users = await seedUsers(prisma);

  console.log('🏢 سناریوی اصلی: شرکت خدمات تدبیر (demo-general)...');
  const general = await seedGeneralBusiness(prisma, users);

  console.log('📦 سناریوهای عمودی و صنفی...');
  await seedVerticalWorkspaces(prisma, users);

  console.log('🎯 داشبوردهای تخصصی (100+ صنف)...');
  const { seedSpecialtyOrganizations } = await import('./scenarios/specialty-orgs');
  await seedSpecialtyOrganizations(prisma, users);

  const [
    customerCount,
    leadCount,
    invoiceCount,
    paymentCount,
    taskCount,
    reminderCount,
    activityCount,
    orgCount,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.lead.count(),
    prisma.invoice.count(),
    prisma.payment.count({ where: { status: 'COMPLETED' } }),
    prisma.task.count(),
    prisma.reminder.count(),
    prisma.activityLog.count(),
    prisma.organization.count({
      where: { slug: { startsWith: 'demo-' } },
    }),
  ]);

  const summary: SeedSummary = {
    organizations: orgCount,
    users: 4,
    customers: customerCount,
    leads: leadCount,
    invoices: invoiceCount,
    payments: paymentCount,
    tasks: taskCount,
    reminders: reminderCount,
    activities: activityCount,
  };

  console.log('');
  console.log('✅ Seed نمونه تکمیل شد.');
  console.log('────────────────────────────────────────');
  console.log(`  سازمان‌ها: ${summary.organizations}`);
  console.log(`  مشتریان:   ${summary.customers}`);
  console.log(`  لیدها:     ${summary.leads}`);
  console.log(`  فاکتورها:  ${summary.invoices}`);
  console.log(`  پرداخت‌ها: ${summary.payments}`);
  console.log(`  وظایف:     ${summary.tasks}`);
  console.log(`  یادآورها:  ${summary.reminders}`);
  console.log(`  فعالیت‌ها: ${summary.activities}`);
  console.log('────────────────────────────────────────');
  console.log('');
  console.log('⚠️  این seed فقط برای توسعه/فروش داخلی است — در production اجرا نکنید.');
  console.log('ورود (رمز: ' + DEMO_PASSWORD + '): demo@kesbyar.ir, manager@kesbyar.ir, ...');
  console.log('سازمان پیش‌فرض: ' + general.organization.name + ' (slug: demo-general)');

  return summary;
}

export async function runSeed(prisma: PrismaClient): Promise<SeedSummary> {
  if (!isDemoSeedEnabled()) {
    console.log('🌱 KesbYar seed — بدون دادهٔ نمونه (پیش‌فرض production-ready)');
    console.log('');
    console.log('  سازمان‌های جدید از ثبت‌نام/onboarding با دادهٔ واقعی شروع می‌شوند.');
    console.log('  برای seed داخلی (فقط dev/staging): SEED_DEMO=true npm run db:seed');
    console.log('');
    return EMPTY_SUMMARY;
  }

  return runDemoSeed(prisma);
}
