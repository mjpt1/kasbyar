import type { DemoScenario, DemoScenarioId } from './types';

export const DEMO_SCENARIOS: Record<DemoScenarioId, DemoScenario> = {
  general: {
    id: 'general',
    orgSlug: 'demo-general',
    title: 'خدمات B2B — هسته مشترک',
    subtitle: 'شرکت خدمات تدبیر کسب‌وکار',
    industryPack: 'GENERAL',
    planCode: 'BUSINESS',
    planLabel: 'حرفه‌ای',
    personaTitle: 'مدیر عامل خدمات سازمانی',
    valueProposition:
      'مدیریت یکپارچه مشتری، لید، فاکتور و پیگیری — بدون پراکندگی ابزار',
    highlights: [
      'مطالبات سررسید گذشته در یک نگاه',
      'لیدهای نیازمند پیگیری',
      'دستیار عملیاتی برای اولویت‌های امروز',
    ],
    salesWalkthroughOrder: 1,
    investorWalkthroughOrder: 1,
    firstStopHref: '/dashboard',
    showcaseLinks: [
      { label: 'داشبورد', href: '/dashboard', description: 'سیگنال‌های عملیاتی روز' },
      { label: 'مشتریان', href: '/customers' },
      { label: 'فاکتورها', href: '/invoices' },
      { label: 'گزارش‌ها', href: '/reports' },
      { label: 'دستیار', href: '/conversation' },
    ],
  },
  clinic: {
    id: 'clinic',
    orgSlug: 'demo-clinic',
    title: 'کلینیک دندانپزشکی',
    subtitle: 'کلینیک دندانپزشکی سپهر',
    industryPack: 'CLINIC',
    planCode: 'BUSINESS',
    planLabel: 'حرفه‌ای (آزمایشی)',
    personaTitle: 'پزشک / مدیر کلینیک',
    valueProposition: 'نوبت‌دهی، بیماران و پیگیری درمان روی همان هسته مالی',
    highlights: [
      'نوبت‌های امروز و از دست رفته',
      'پرونده بیمار متصل به مشتری',
      'یادآوری پیگیری درمان',
    ],
    salesWalkthroughOrder: 2,
    investorWalkthroughOrder: 3,
    firstStopHref: '/clinic',
    showcaseLinks: [
      { label: 'کلینیک', href: '/clinic' },
      { label: 'نوبت‌ها', href: '/clinic/appointments' },
      { label: 'بیماران', href: '/clinic/patients' },
      { label: 'فاکتورها', href: '/invoices' },
    ],
  },
  travel: {
    id: 'travel',
    orgSlug: 'demo-travel',
    title: 'آژانس مسافرتی',
    subtitle: 'آژانس مسافرتی آسمان آبی',
    industryPack: 'TRAVEL_AGENCY',
    planCode: 'FREE',
    planLabel: 'رایگان — نمایش ارتقا',
    personaTitle: 'مشاور مسافرتی',
    valueProposition: 'رزرو، اعزام و مانده حساب در یک جریان کاری',
    highlights: [
      'درخواست‌های باز و اعزام پیشِ رو',
      'نمونه قفل بسته عمودی در طرح رایگان',
      'مسیر ارتقا به استارتر/حرفه‌ای',
    ],
    salesWalkthroughOrder: 3,
    investorWalkthroughOrder: 4,
    firstStopHref: '/travel',
    showcaseLinks: [
      { label: 'مسافرتی', href: '/travel' },
      { label: 'رزروها', href: '/travel/bookings' },
      { label: 'طرح‌ها', href: '/pricing' },
      { label: 'اشتراک', href: '/settings/billing' },
    ],
  },
  retail: {
    id: 'retail',
    orgSlug: 'demo-retail',
    title: 'خرده‌فروشی پوشاک',
    subtitle: 'فروشگاه پوشاک آرتین',
    industryPack: 'RETAIL',
    planCode: 'STARTER',
    planLabel: 'استارتر',
    personaTitle: 'مدیر عملیات فروشگاه',
    valueProposition: 'موجودی، کمبود کالا و فروش در یک پنل',
    highlights: [
      'هشدار کم‌موجودی',
      'گردش انبار',
      'فاکتور و مطالبات متصل',
    ],
    salesWalkthroughOrder: 4,
    investorWalkthroughOrder: 2,
    firstStopHref: '/retail',
    showcaseLinks: [
      { label: 'فروشگاه', href: '/retail' },
      { label: 'محصولات', href: '/retail/products' },
      { label: 'موجودی', href: '/retail/inventory' },
      { label: 'داشبورد', href: '/dashboard' },
    ],
  },
};

export const DEMO_SCENARIO_LIST = Object.values(DEMO_SCENARIOS).sort(
  (a, b) => a.salesWalkthroughOrder - b.salesWalkthroughOrder,
);

export const DEMO_INVESTOR_ORDER = Object.values(DEMO_SCENARIOS).sort(
  (a, b) => a.investorWalkthroughOrder - b.investorWalkthroughOrder,
);

export function getScenarioById(id: string): DemoScenario | undefined {
  return DEMO_SCENARIOS[id as DemoScenarioId];
}

export function getScenarioByOrgSlug(slug: string): DemoScenario | undefined {
  return DEMO_SCENARIO_LIST.find((s) => s.orgSlug === slug);
}

export function getScenarioIdByOrgSlug(slug: string): DemoScenarioId | null {
  const s = getScenarioByOrgSlug(slug);
  return s?.id ?? null;
}
