import { DEMO_SCENARIO_LIST } from '@kesbyar/shared';

/** رمز عبور مشترک همه کاربران دمو — فقط محیط توسعه */
export const DEMO_PASSWORD = 'demo1234';

export const DEMO_USER_EMAILS = [
  'super@kesbyar.ir',
  'demo@kesbyar.ir',
  'manager@kesbyar.ir',
  'staff@kesbyar.ir',
] as const;

export const DEMO_ORG_SLUGS = DEMO_SCENARIO_LIST.map((scenario) => scenario.orgSlug);

/** سازمان‌های قدیمی seed — هنگام reseed پاک می‌شوند */
export const LEGACY_ORG_SLUGS = ['demo-shop'] as const;

export const PIPELINE_STAGES_DEFAULT = [
  { name: 'ورودی جدید', order: 0, color: '#6366f1' },
  { name: 'تماس اولیه', order: 1, color: '#8b5cf6' },
  { name: 'پیشنهاد قیمت', order: 2, color: '#f59e0b' },
  { name: 'مذاکره', order: 3, color: '#10b981' },
  { name: 'بسته شد', order: 4, color: '#22c55e' },
] as const;

export const IRANIAN_CITIES = [
  'تهران',
  'مشهد',
  'اصفهان',
  'شیراز',
  'تبریز',
  'کرج',
  'اهواز',
] as const;
