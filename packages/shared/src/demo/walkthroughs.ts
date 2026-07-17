import { getScenarioById } from './scenarios';
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

const DEFAULT_STEPS_BY_PACK = {
  GENERAL: [
    {
      id: 'gen-default-1',
      title: 'داشبورد عملیاتی',
      description: 'نمای یکپارچه مشتری، مطالبات و کارهای مهم امروز',
      href: '/dashboard',
    },
    {
      id: 'gen-default-2',
      title: 'جریان مالی',
      description: 'فاکتور، پرداخت و پیگیری وصول',
      href: '/invoices',
    },
  ],
  CLINIC: [
    {
      id: 'clinic-default-1',
      title: 'نمای درمانی',
      description: 'نوبت‌ها، بیماران و پیگیری مراجعات',
      href: '/clinic',
    },
    {
      id: 'clinic-default-2',
      title: 'زمان‌بندی نوبت‌ها',
      description: 'ثبت، مشاهده و پیگیری برنامه روز',
      href: '/clinic/appointments',
    },
  ],
  RETAIL: [
    {
      id: 'retail-default-1',
      title: 'نمای فروشگاه',
      description: 'وضعیت فروش، موجودی و اقلام کم‌موجودی',
      href: '/retail',
    },
    {
      id: 'retail-default-2',
      title: 'انبار و موجودی',
      description: 'ثبت ورود و خروج کالا و کنترل موجودی',
      href: '/retail/inventory',
    },
  ],
  TRAVEL_AGENCY: [
    {
      id: 'travel-default-1',
      title: 'نمای رزروها',
      description: 'درخواست‌ها، اعزام‌ها و مانده حساب مشتریان',
      href: '/travel',
    },
    {
      id: 'travel-default-2',
      title: 'جزئیات رزرو',
      description: 'رزروهای باز و مسیر ارتقای پلن',
      href: '/travel/bookings',
    },
  ],
} as const;

const SCENARIO_STEPS: Partial<Record<DemoScenarioId, DemoWalkthroughStep[]>> = {
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
  'medical-office': [
    {
      id: 'med-1',
      title: 'مطب در یک نگاه',
      description: 'نوبت‌های امروز و بیماران در انتظار',
      href: '/clinic',
    },
    {
      id: 'med-2',
      title: 'پیگیری مراجعات',
      description: 'ثبت نوبت جدید و پیگیری دوره‌ای',
      href: '/clinic/appointments',
    },
  ],
  hospital: [
    {
      id: 'hos-1',
      title: 'داشبورد درمانی',
      description: 'نمای عملیاتی مراجعان و خدمات',
      href: '/clinic',
    },
    {
      id: 'hos-2',
      title: 'گزارش مدیریتی',
      description: 'خروجی عملکرد و درآمد خدمات',
      href: '/reports',
    },
  ],
  'treatment-center': [
    {
      id: 'trc-1',
      title: 'نمای شیفت',
      description: 'مراجعان امروز و برنامه نوبت‌ها',
      href: '/clinic/appointments',
    },
    {
      id: 'trc-2',
      title: 'پیگیری مراجعان',
      description: 'تبدیل مراجعات به پرونده منظم',
      href: '/clinic/patients',
    },
  ],
  supermarket: [
    {
      id: 'sup-1',
      title: 'وضعیت فروشگاه',
      description: 'اقلام کم‌موجودی و روند فروش روز',
      href: '/retail',
    },
    {
      id: 'sup-2',
      title: 'انبار و سفارش',
      description: 'ثبت ورود/خروج و تصمیم سفارش‌گذاری',
      href: '/retail/inventory',
    },
  ],
  pharmacy: [
    {
      id: 'pha-1',
      title: 'کنترل موجودی دارو',
      description: 'نمای اقلام پرمصرف و نزدیک به اتمام',
      href: '/retail/inventory',
    },
    {
      id: 'pha-2',
      title: 'فروش و مشتریان',
      description: 'فاکتورهای روزانه و پیگیری مطالبات',
      href: '/invoices',
    },
  ],
  contracting: [
    {
      id: 'con-1',
      title: 'داشبورد پروژه‌ها',
      description: 'وضعیت مشتریان و کارهای اولویت‌دار',
      href: '/dashboard',
    },
    {
      id: 'con-2',
      title: 'صورت‌وضعیت مالی',
      description: 'فاکتور مرحله‌ای و وصول مطالبات',
      href: '/invoices',
    },
  ],
  'education-center': [
    {
      id: 'edu-1',
      title: 'هنرجویان و تماس‌ها',
      description: 'مدیریت سرنخ ثبت‌نام و مشتریان فعال',
      href: '/customers',
    },
    {
      id: 'edu-2',
      title: 'شهریه و وصول',
      description: 'فاکتور و مطالبات معوق',
      href: '/invoices',
    },
  ],
  'beauty-salon': [
    {
      id: 'sal-1',
      title: 'داشبورد مشتریان وفادار',
      description: 'نمای خدمات پرتکرار و مراجعات',
      href: '/dashboard',
    },
    {
      id: 'sal-2',
      title: 'پیگیری مراجعه بعدی',
      description: 'وظایف تیم و ارتباط با مشتری',
      href: '/tasks',
    },
  ],
};

export function getWalkthroughForScenario(scenarioId: DemoScenarioId): DemoWalkthroughStep[] {
  const custom = SCENARIO_STEPS[scenarioId];
  if (custom) return custom;

  const scenario = getScenarioById(scenarioId);
  if (!scenario) return [];

  return DEFAULT_STEPS_BY_PACK[scenario.industryPack] ?? [];
}
