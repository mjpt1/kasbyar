import type { DemoScenarioId, DemoWalkthroughStep } from './types';

export const SALES_WALKTHROUGH_INTRO: DemoWalkthroughStep[] = [
  {
    id: 'intro-1',
    title: 'از داشبورد شروع کنید',
    description: 'فروش امروز، مطالبات و لیدهای معطل — تصویر یکپارچه از عملیات',
    href: '/dashboard',
    tip: 'کارت «سیگنال‌های عمودی» را در workspace تخصصی نشان دهید',
  },
  {
    id: 'intro-2',
    title: 'جریان مالی را نشان دهید',
    description: 'از مشتری تا فاکتور و پرداخت — بدون پرش بین ابزارها',
    href: '/invoices',
  },
  {
    id: 'intro-3',
    title: 'دستیار عملیاتی',
    description: 'سؤال واقعی از داده workspace — نه پاسخ ساختگی',
    href: '/conversation',
    tip: 'مثال: «مهم‌ترین کار امروز چیست؟»',
  },
];

export const INVESTOR_WALKTHROUGH_INTRO: DemoWalkthroughStep[] = [
  {
    id: 'inv-1',
    title: 'پلتفرم افقی',
    description: 'هسته مشترک CRM + مالی برای هر کسب‌وکار ایرانی',
    href: '/dashboard',
  },
  {
    id: 'inv-2',
    title: 'عمق عمودی',
    description: 'کلینیک، مسافرتی، خرده‌فروشی — بدون فورک محصول',
    href: '/demo',
  },
  {
    id: 'inv-3',
    title: 'monetization',
    description: 'طرح‌ها، سقف استفاده و بسته عمودی — آماده اتصال درگاه',
    href: '/pricing',
  },
];

const SCENARIO_STEPS: Record<DemoScenarioId, DemoWalkthroughStep[]> = {
  general: [
    {
      id: 'gen-1',
      title: 'داشبورد عملیاتی',
      description: 'مطالبات معوق و لیدهای کهنه',
      href: '/dashboard',
    },
    {
      id: 'gen-2',
      title: 'گزارش‌های مدیریتی',
      description: 'نمای مالی ماه — نیاز به طرح حرفه‌ای',
      href: '/reports',
    },
    {
      id: 'gen-3',
      title: 'اتوماسیون',
      description: 'قوانین پیگیری خودکار',
      href: '/automation',
    },
  ],
  clinic: [
    {
      id: 'cli-1',
      title: 'صفحه کلینیک',
      description: 'نوبت امروز و پیگیری درمان',
      href: '/clinic',
    },
    {
      id: 'cli-2',
      title: 'نوبت‌دهی',
      description: 'برنامه روز و ثبت نوبت جدید',
      href: '/clinic/appointments',
    },
  ],
  travel: [
    {
      id: 'trv-1',
      title: 'اعزام‌های پیشِ رو',
      description: 'رزرو و وضعیت سفر',
      href: '/travel',
    },
    {
      id: 'trv-2',
      title: 'داستان monetization',
      description: 'طرح رایگان — قفل بسته مسافرتی',
      href: '/settings/billing',
      tip: 'سپس /pricing را برای ارتقا نشان دهید',
    },
  ],
  retail: [
    {
      id: 'ret-1',
      title: 'ویترین عملیات',
      description: 'کم‌موجودی و گردش هفته',
      href: '/retail',
    },
    {
      id: 'ret-2',
      title: 'موجودی',
      description: 'ثبت ورود/خروج',
      href: '/retail/inventory',
    },
  ],
};

export function getWalkthroughForScenario(scenarioId: DemoScenarioId): DemoWalkthroughStep[] {
  return SCENARIO_STEPS[scenarioId] ?? [];
}
