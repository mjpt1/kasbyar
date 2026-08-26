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
