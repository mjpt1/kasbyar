import { PrismaClient } from '@prisma/client';

import { DEMO_PASSWORD } from './constants';
import { seedGeneralBusiness } from './scenarios/general';
import { seedVerticalWorkspaces } from './scenarios/verticals';
import type { SeedSummary } from './types';
import { clearDemoData } from './utils';
import { seedUsers } from './users';

export async function runSeed(prisma: PrismaClient): Promise<SeedSummary> {
  console.log('🌱 KesbYar seed — پاک‌سازی داده‌های دمو قبلی...');
  await clearDemoData(prisma);

  console.log('👤 ایجاد کاربران دمو...');
  const users = await seedUsers(prisma);

  console.log('🏢 سناریوی اصلی: شرکت خدمات تدبیر (demo-general)...');
  const general = await seedGeneralBusiness(prisma, users);

  console.log('📦 سناریوهای عمودی و صنفی: پزشکی، فروشگاهی، پیمانکاری و ...');
  await seedVerticalWorkspaces(prisma, users);

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
  console.log('✅ Seed تکمیل شد.');
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
  console.log('ورود به سیستم (رمز همه: ' + DEMO_PASSWORD + '):');
  console.log('  • super@kesbyar.ir     — سوپرادمین پلتفرم');
  console.log('  • demo@kesbyar.ir      — مالک (دسترسی به همه سازمان‌ها)');
  console.log('  • manager@kesbyar.ir   — مدیر (فقط demo-general)');
  console.log('  • staff@kesbyar.ir     — کارمند (فقط demo-general)');
  console.log('');
  console.log('سازمان پیش‌فرض: ' + general.organization.name);
  console.log('  slug: demo-general');
  console.log('');
  console.log('سازمان‌های دمو: هسته عمومی + طیف گسترده‌ای از کسب‌وکارهای درمانی، فروشگاهی و خدماتی');
  console.log('نمونه‌ها: کلینیک، داروخانه، سوپرمارکت، رستوران، املاک، دفتر حقوقی، خدمات نظافتی، آتلیه و ...');
  console.log('طرح‌های دمو: general=BUSINESS | retail=STARTER | clinic=TRIAL | travel=FREE');

  return summary;
}
