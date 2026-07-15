import type { DemoPersona } from './types';

/** حساب‌های دمو — رمز: demo1234 (فقط محیط نمایش) */
export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'owner',
    email: 'demo@kesbyar.ir',
    name: 'سارا موسوی',
    title: 'مالک / مدیر عامل',
    description: 'دسترسی کامل به همه سناریوها — مناسب دمو فروش و سرمایه‌گذار',
    recommendedScenarios: ['general', 'clinic', 'travel', 'retail'],
  },
  {
    id: 'manager',
    email: 'manager@kesbyar.ir',
    name: 'امیر حسینی',
    title: 'مدیر فروش',
    description: 'تمرکز بر لید، فاکتور و گزارش — فقط demo-general',
    recommendedScenarios: ['general'],
  },
  {
    id: 'staff',
    email: 'staff@kesbyar.ir',
    name: 'مریم کاظمی',
    title: 'کارمند عملیات',
    description: 'وظایف روزانه و مشتریان — محدودیت نقش STAFF',
    recommendedScenarios: ['general'],
  },
];

export const DEMO_PASSWORD_HINT = 'demo1234';
