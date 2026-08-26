import type { IndustryPackId } from './types';

export type PackChartKind = 'bar' | 'pie';

export interface PackChartPoint {
  label: string;
  value: number;
}

export interface PackDashboardChartDef {
  key: string;
  titleFa: string;
  subtitleFa?: string;
  kind: PackChartKind;
  valueLabel?: string;
  format?: 'number' | 'currency';
}

const BASE_PACK_CHARTS: Partial<Record<IndustryPackId, PackDashboardChartDef[]>> = {
  CLINIC: [
    {
      key: 'appointments-trend',
      titleFa: 'روند نوبت‌ها',
      subtitleFa: 'تعداد نوبت در هفت روز گذشته',
      kind: 'bar',
      valueLabel: 'نوبت',
    },
    {
      key: 'visit-status',
      titleFa: 'وضعیت مراجعات',
      subtitleFa: 'توزیع وضعیت نوبت‌های اخیر',
      kind: 'pie',
      valueLabel: 'مورد',
    },
  ],
  BEAUTY_SALON: [
    {
      key: 'bookings-trend',
      titleFa: 'روند رزرو',
      subtitleFa: 'نوبت‌های ثبت‌شده در هفت روز',
      kind: 'bar',
      valueLabel: 'رزرو',
    },
    {
      key: 'services-mix',
      titleFa: 'رزرو بر اساس خدمت',
      subtitleFa: 'پرطرفدارترین خدمات سالن',
      kind: 'bar',
      valueLabel: 'نوبت',
    },
  ],
  RETAIL: [
    {
      key: 'sales-trend',
      titleFa: 'فروش هفتگی',
      subtitleFa: 'مجموع پرداخت‌های ثبت‌شده',
      kind: 'bar',
      valueLabel: 'فروش',
      format: 'currency',
    },
    {
      key: 'top-products',
      titleFa: 'پرفروش‌ترین محصولات',
      subtitleFa: 'بر اساس گردش خروج انبار',
      kind: 'bar',
      valueLabel: 'فروش',
    },
  ],
  FOOD_SERVICE: [
    {
      key: 'orders-by-hour',
      titleFa: 'سفارش در ساعات امروز',
      subtitleFa: 'توزیع سفارش‌های ثبت‌شده',
      kind: 'bar',
      valueLabel: 'سفارش',
    },
    {
      key: 'service-type',
      titleFa: 'سالن در برابر بیرون‌بر',
      subtitleFa: 'نوع سفارش‌های امروز',
      kind: 'pie',
      valueLabel: 'سفارش',
    },
  ],
  MARKETING_AGENCY: [
    {
      key: 'leads-trend',
      titleFa: 'روند سرنخ‌ها',
      subtitleFa: 'سرنخ‌های جدید در هفت روز',
      kind: 'bar',
      valueLabel: 'سرنخ',
    },
    {
      key: 'campaign-status',
      titleFa: 'وضعیت کمپین‌ها',
      subtitleFa: 'توزیع پروژه‌های باز',
      kind: 'pie',
      valueLabel: 'کمپین',
    },
  ],
  TRAVEL_AGENCY: [
    {
      key: 'bookings-trend',
      titleFa: 'روند رزرو سفر',
      subtitleFa: 'درخواست‌های جدید در هفت روز',
      kind: 'bar',
      valueLabel: 'رزرو',
    },
    {
      key: 'booking-status',
      titleFa: 'وضعیت رزروها',
      subtitleFa: 'توزیع وضعیت درخواست‌ها',
      kind: 'pie',
      valueLabel: 'رزرو',
    },
  ],
  EDUCATION: [
    {
      key: 'enrollments-trend',
      titleFa: 'روند ثبت‌نام',
      subtitleFa: 'ثبت‌نام‌های هفت روز گذشته',
      kind: 'bar',
      valueLabel: 'ثبت‌نام',
    },
    {
      key: 'enrollment-status',
      titleFa: 'وضعیت هنرجویان',
      subtitleFa: 'توزیع وضعیت ثبت‌نام',
      kind: 'pie',
      valueLabel: 'هنرجو',
    },
  ],
  FITNESS: [
    {
      key: 'memberships-trend',
      titleFa: 'عضویت‌های جدید',
      subtitleFa: 'ثبت عضویت در هفت روز',
      kind: 'bar',
      valueLabel: 'عضویت',
    },
    {
      key: 'membership-status',
      titleFa: 'وضعیت عضویت‌ها',
      subtitleFa: 'فعال، منقضی و متوقف',
      kind: 'pie',
      valueLabel: 'عضو',
    },
  ],
  REAL_ESTATE: [
    {
      key: 'showings-trend',
      titleFa: 'روند بازدید ملک',
      subtitleFa: 'بازدیدهای هفت روز گذشته',
      kind: 'bar',
      valueLabel: 'بازدید',
    },
    {
      key: 'listing-status',
      titleFa: 'وضعیت فایل‌ها',
      subtitleFa: 'توزیع وضعیت آگهی‌ها',
      kind: 'pie',
      valueLabel: 'فایل',
    },
  ],
  WORKSHOP: [
    {
      key: 'jobs-trend',
      titleFa: 'پذیرش تعمیر',
      subtitleFa: 'دستگاه‌های پذیرش‌شده در هفت روز',
      kind: 'bar',
      valueLabel: 'پذیرش',
    },
    {
      key: 'job-status',
      titleFa: 'وضعیت تعمیرات',
      subtitleFa: 'توزیع وضعیت پذیرش‌ها',
      kind: 'pie',
      valueLabel: 'کار',
    },
  ],
  LAW_FIRM: [
    {
      key: 'cases-trend',
      titleFa: 'پرونده‌های جدید',
      subtitleFa: 'ثبت پرونده در هفت روز',
      kind: 'bar',
      valueLabel: 'پرونده',
    },
    {
      key: 'case-status',
      titleFa: 'وضعیت پرونده‌ها',
      subtitleFa: 'توزیع وضعیت پرونده‌های حقوقی',
      kind: 'pie',
      valueLabel: 'پرونده',
    },
  ],
  ACCOUNTING_FIRM: [
    {
      key: 'matters-trend',
      titleFa: 'پرونده‌های جدید',
      subtitleFa: 'ثبت کار حسابداری در هفت روز',
      kind: 'bar',
      valueLabel: 'پرونده',
    },
    {
      key: 'matter-status',
      titleFa: 'وضعیت پرونده‌ها',
      subtitleFa: 'توزیع وضعیت کارهای باز',
      kind: 'pie',
      valueLabel: 'پرونده',
    },
  ],
  INSURANCE_AGENCY: [
    {
      key: 'policies-trend',
      titleFa: 'صدور بیمه‌نامه',
      subtitleFa: 'بیمه‌نامه‌های جدید در هفت روز',
      kind: 'bar',
      valueLabel: 'بیمه‌نامه',
    },
    {
      key: 'policy-status',
      titleFa: 'وضعیت بیمه‌نامه‌ها',
      subtitleFa: 'فعال، در انتظار و منقضی',
      kind: 'pie',
      valueLabel: 'بیمه‌نامه',
    },
  ],
  CONTRACTING: [
    {
      key: 'projects-trend',
      titleFa: 'پروژه‌های جدید',
      subtitleFa: 'ثبت پروژه در هفت روز',
      kind: 'bar',
      valueLabel: 'پروژه',
    },
    {
      key: 'project-status',
      titleFa: 'وضعیت پروژه‌ها',
      subtitleFa: 'توزیع وضعیت پروژه‌های پیمانکاری',
      kind: 'pie',
      valueLabel: 'پروژه',
    },
  ],
  PHOTOGRAPHY: [
    {
      key: 'sessions-trend',
      titleFa: 'جلسات عکاسی',
      subtitleFa: 'رزرو جلسه در هفت روز',
      kind: 'bar',
      valueLabel: 'جلسه',
    },
    {
      key: 'session-status',
      titleFa: 'وضعیت جلسات',
      subtitleFa: 'توزیع وضعیت رزروها',
      kind: 'pie',
      valueLabel: 'جلسه',
    },
  ],
  CLEANING: [
    {
      key: 'jobs-trend',
      titleFa: 'سفارش نظافت',
      subtitleFa: 'سفارش‌های هفت روز گذشته',
      kind: 'bar',
      valueLabel: 'سفارش',
    },
    {
      key: 'job-status',
      titleFa: 'وضعیت سفارش‌ها',
      subtitleFa: 'توزیع وضعیت کارهای نظافتی',
      kind: 'pie',
      valueLabel: 'سفارش',
    },
  ],
  PRINTING: [
    {
      key: 'orders-trend',
      titleFa: 'سفارش چاپ',
      subtitleFa: 'سفارش‌های هفت روز گذشته',
      kind: 'bar',
      valueLabel: 'سفارش',
    },
    {
      key: 'order-status',
      titleFa: 'وضعیت سفارش‌ها',
      subtitleFa: 'توزیع وضعیت چاپ',
      kind: 'pie',
      valueLabel: 'سفارش',
    },
  ],
  LOGISTICS: [
    {
      key: 'jobs-trend',
      titleFa: 'محموله‌های جدید',
      subtitleFa: 'ثبت محموله در هفت روز',
      kind: 'bar',
      valueLabel: 'محموله',
    },
    {
      key: 'job-status',
      titleFa: 'وضعیت محموله‌ها',
      subtitleFa: 'فعال، برنامه‌ریزی و متوقف',
      kind: 'pie',
      valueLabel: 'محموله',
    },
  ],
  AUTOMOTIVE: [
    {
      key: 'jobs-trend',
      titleFa: 'معاملات خودرو',
      subtitleFa: 'ثبت معامله در هفت روز',
      kind: 'bar',
      valueLabel: 'معامله',
    },
    {
      key: 'job-status',
      titleFa: 'وضعیت معاملات',
      subtitleFa: 'توزیع وضعیت پرونده‌های خودرو',
      kind: 'pie',
      valueLabel: 'معامله',
    },
  ],
  HOSPITALITY: [
    {
      key: 'jobs-trend',
      titleFa: 'رزرو اقامت',
      subtitleFa: 'رزروهای هفت روز گذشته',
      kind: 'bar',
      valueLabel: 'رزرو',
    },
    {
      key: 'job-status',
      titleFa: 'وضعیت رزروها',
      subtitleFa: 'توزیع وضعیت اقامت',
      kind: 'pie',
      valueLabel: 'رزرو',
    },
  ],
  WHOLESALE: [
    {
      key: 'jobs-trend',
      titleFa: 'سفارش عمده',
      subtitleFa: 'سفارش‌های هفت روز گذشته',
      kind: 'bar',
      valueLabel: 'سفارش',
    },
    {
      key: 'job-status',
      titleFa: 'وضعیت سفارش‌ها',
      subtitleFa: 'توزیع وضعیت سفارش عمده',
      kind: 'pie',
      valueLabel: 'سفارش',
    },
  ],
  EVENTS: [
    {
      key: 'jobs-trend',
      titleFa: 'رویدادهای جدید',
      subtitleFa: 'ثبت رویداد در هفت روز',
      kind: 'bar',
      valueLabel: 'رویداد',
    },
    {
      key: 'job-status',
      titleFa: 'وضعیت رویدادها',
      subtitleFa: 'توزیع وضعیت مراسم',
      kind: 'pie',
      valueLabel: 'رویداد',
    },
  ],
  AGRICULTURE: [
    {
      key: 'jobs-trend',
      titleFa: 'سفارش محصول',
      subtitleFa: 'سفارش‌های هفت روز گذشته',
      kind: 'bar',
      valueLabel: 'سفارش',
    },
    {
      key: 'job-status',
      titleFa: 'وضعیت سفارش‌ها',
      subtitleFa: 'توزیع وضعیت فروش کشاورزی',
      kind: 'pie',
      valueLabel: 'سفارش',
    },
  ],
  HOME_SERVICES: [
    {
      key: 'jobs-trend',
      titleFa: 'سفارش خدمات',
      subtitleFa: 'سفارش‌های هفت روز گذشته',
      kind: 'bar',
      valueLabel: 'سفارش',
    },
    {
      key: 'job-status',
      titleFa: 'وضعیت سفارش‌ها',
      subtitleFa: 'توزیع وضعیت خدمات منزل',
      kind: 'pie',
      valueLabel: 'سفارش',
    },
  ],
  DISTRIBUTION: [
    {
      key: 'jobs-trend',
      titleFa: 'سفارش پخش',
      subtitleFa: 'سفارش‌های هفت روز گذشته',
      kind: 'bar',
      valueLabel: 'سفارش',
    },
    {
      key: 'job-status',
      titleFa: 'وضعیت مسیرها',
      subtitleFa: 'توزیع وضعیت پخش مویرگی',
      kind: 'pie',
      valueLabel: 'مسیر',
    },
  ],
};

const SPECIALTY_CHARTS: Record<string, PackDashboardChartDef[]> = {
  'seo-agency': [
    {
      key: 'traffic-trend',
      titleFa: 'روند بازدید',
      subtitleFa: 'بازدید ماهانه سایت کارفرما (نمونه)',
      kind: 'bar',
      valueLabel: 'بازدید',
    },
    {
      key: 'leads-trend',
      titleFa: 'سرنخ دیجیتال',
      subtitleFa: 'سرنخ‌های جدید در هفت روز',
      kind: 'bar',
      valueLabel: 'سرنخ',
    },
  ],
  'dry-cleaning': [
    {
      key: 'jobs-trend',
      titleFa: 'سفارش خشکشویی',
      subtitleFa: 'پذیرش لباس در هفت روز',
      kind: 'bar',
      valueLabel: 'سفارش',
    },
    {
      key: 'job-status',
      titleFa: 'وضعیت سفارش‌ها',
      subtitleFa: 'شستشو، اتو و آماده‌تحویل',
      kind: 'pie',
      valueLabel: 'سفارش',
    },
  ],
  'phone-repair': [
    {
      key: 'jobs-trend',
      titleFa: 'پذیرش موبایل',
      subtitleFa: 'دستگاه‌های پذیرش‌شده در هفت روز',
      kind: 'bar',
      valueLabel: 'دستگاه',
    },
    {
      key: 'job-status',
      titleFa: 'وضعیت تعمیرات',
      subtitleFa: 'عیب‌یابی تا آماده‌تحویل',
      kind: 'pie',
      valueLabel: 'کار',
    },
  ],
  'translation-bureau': [
    {
      key: 'leads-trend',
      titleFa: 'درخواست ترجمه',
      subtitleFa: 'درخواست‌های جدید در هفت روز',
      kind: 'bar',
      valueLabel: 'درخواست',
    },
    {
      key: 'campaign-status',
      titleFa: 'وضعیت پروژه‌ها',
      subtitleFa: 'توزیع پروژه‌های ترجمه باز',
      kind: 'pie',
      valueLabel: 'پروژه',
    },
  ],
  'medical-aesthetics': [
    {
      key: 'appointments-trend',
      titleFa: 'نوبت زیبایی پزشکی',
      subtitleFa: 'نوبت‌های هفت روز گذشته',
      kind: 'bar',
      valueLabel: 'نوبت',
    },
    {
      key: 'visit-status',
      titleFa: 'وضعیت مراجعات',
      subtitleFa: 'توزیع وضعیت جلسات زیبایی',
      kind: 'pie',
      valueLabel: 'مورد',
    },
  ],
  'home-appliances': [
    {
      key: 'sales-trend',
      titleFa: 'فروش لوازم خانگی',
      subtitleFa: 'پرداخت‌های هفت روز',
      kind: 'bar',
      valueLabel: 'فروش',
      format: 'currency',
    },
    {
      key: 'top-products',
      titleFa: 'پرفروش‌ترین دستگاه‌ها',
      subtitleFa: 'بر اساس خروج انبار',
      kind: 'bar',
      valueLabel: 'فروش',
    },
  ],
  'coworking-space': [
    {
      key: 'memberships-trend',
      titleFa: 'عضویت میز کار',
      subtitleFa: 'عضویت‌های جدید در هفت روز',
      kind: 'bar',
      valueLabel: 'عضویت',
    },
    {
      key: 'membership-status',
      titleFa: 'وضعیت اعضا',
      subtitleFa: 'فعال، منقضی و متوقف',
      kind: 'pie',
      valueLabel: 'عضو',
    },
  ],
  'driving-school': [
    {
      key: 'enrollments-trend',
      titleFa: 'ثبت‌نام رانندگی',
      subtitleFa: 'هنرجویان جدید در هفت روز',
      kind: 'bar',
      valueLabel: 'ثبت‌نام',
    },
    {
      key: 'enrollment-status',
      titleFa: 'وضعیت هنرجویان',
      subtitleFa: 'توزیع وضعیت دوره',
      kind: 'pie',
      valueLabel: 'هنرجو',
    },
  ],
  'veterinary-clinic': [
    {
      key: 'appointments-trend',
      titleFa: 'نوبت دامپزشکی',
      subtitleFa: 'ویزیت حیوانات در هفت روز',
      kind: 'bar',
      valueLabel: 'نوبت',
    },
    {
      key: 'visit-status',
      titleFa: 'وضعیت مراجعات',
      subtitleFa: 'توزیع وضعیت ویزیت',
      kind: 'pie',
      valueLabel: 'مورد',
    },
  ],
  'flower-shop': [
    {
      key: 'sales-trend',
      titleFa: 'فروش گل',
      subtitleFa: 'پرداخت‌های هفت روز',
      kind: 'bar',
      valueLabel: 'فروش',
      format: 'currency',
    },
    {
      key: 'top-products',
      titleFa: 'پرفروش‌ترین دسته',
      subtitleFa: 'بر اساس خروج انبار',
      kind: 'bar',
      valueLabel: 'فروش',
    },
  ],
  'gaming-cafe': [
    {
      key: 'memberships-trend',
      titleFa: 'ساعت بازی / عضویت',
      subtitleFa: 'ثبت در هفت روز',
      kind: 'bar',
      valueLabel: 'نوبت',
    },
    {
      key: 'membership-status',
      titleFa: 'وضعیت اعضا',
      subtitleFa: 'فعال و منقضی',
      kind: 'pie',
      valueLabel: 'بازیکن',
    },
  ],
};

export function getPackDashboardChartDefs(
  packId: string,
  specialtyId?: string | null,
): PackDashboardChartDef[] {
  if (specialtyId && SPECIALTY_CHARTS[specialtyId]) {
    return SPECIALTY_CHARTS[specialtyId]!;
  }
  return BASE_PACK_CHARTS[packId as IndustryPackId] ?? [];
}

/** Packs that expose at least one dashboard chart (excludes GENERAL). */
export function listPackIdsWithDashboardCharts(): IndustryPackId[] {
  return (Object.keys(BASE_PACK_CHARTS) as IndustryPackId[]).filter(
    (id) => (BASE_PACK_CHARTS[id]?.length ?? 0) > 0,
  );
}
