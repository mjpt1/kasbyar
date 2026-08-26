import {
  formatJalali,
  getPackDashboardChartDefs,
  type PackChartPoint,
  type PackDashboardChartDef,
} from '@kesbyar/shared';

import { prisma } from '@/lib/prisma';
import { getSalesTrend } from '@/server/dashboard/dashboard.service';

export interface PackDashboardChartBundle {
  def: PackDashboardChartDef;
  points: PackChartPoint[];
}

function sumValues(points: PackChartPoint[]): number {
  return points.reduce((acc, p) => acc + p.value, 0);
}

function withDemoFallback(points: PackChartPoint[], demo: PackChartPoint[]): PackChartPoint[] {
  return sumValues(points) > 0 ? points : demo;
}

async function countByDay(
  organizationId: string,
  days: number,
  counter: (dayStart: Date, dayEnd: Date) => Promise<number>,
): Promise<PackChartPoint[]> {
  const result: PackChartPoint[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const dayStart = new Date();
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const count = await counter(dayStart, dayEnd);
    result.push({
      label: formatJalali(dayStart, { persianDigits: true }),
      value: count,
    });
  }

  return result;
}

async function getClinicCharts(organizationId: string): Promise<Record<string, PackChartPoint[]>> {
  const [trend, statusGroups] = await Promise.all([
    countByDay(organizationId, 7, (start, end) =>
      prisma.appointment.count({
        where: { organizationId, scheduledAt: { gte: start, lte: end } },
      }),
    ),
    prisma.appointment.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { _all: true },
    }),
  ]);

  const statusLabels: Record<string, string> = {
    SCHEDULED: 'زمان‌بندی‌شده',
    CONFIRMED: 'تأیید‌شده',
    IN_PROGRESS: 'در حال ویزیت',
    COMPLETED: 'انجام‌شده',
    MISSED: 'از دست رفته',
    NO_SHOW: 'عدم حضور',
    CANCELLED: 'لغو شده',
  };

  const statusPoints = statusGroups.map((g) => ({
    label: statusLabels[g.status] ?? g.status,
    value: g._count._all,
  }));

  return {
    'appointments-trend': withDemoFallback(trend, [
      { label: 'شنبه', value: 12 },
      { label: 'یکشنبه', value: 18 },
      { label: 'دوشنبه', value: 15 },
      { label: 'سه‌شنبه', value: 22 },
      { label: 'چهارشنبه', value: 19 },
      { label: 'پنجشنبه', value: 24 },
      { label: 'جمعه', value: 8 },
    ]),
    'visit-status': withDemoFallback(statusPoints, [
      { label: 'انجام‌شده', value: 42 },
      { label: 'زمان‌بندی‌شده', value: 28 },
      { label: 'از دست رفته', value: 5 },
      { label: 'لغو شده', value: 3 },
    ]),
  };
}

async function getBeautyCharts(organizationId: string): Promise<Record<string, PackChartPoint[]>> {
  const [trend, services] = await Promise.all([
    countByDay(organizationId, 7, (start, end) =>
      prisma.beautyAppointment.count({
        where: { organizationId, scheduledAt: { gte: start, lte: end } },
      }),
    ),
    prisma.beautyAppointment.groupBy({
      by: ['serviceName'],
      where: { organizationId },
      _count: { _all: true },
      orderBy: { _count: { serviceName: 'desc' } },
      take: 5,
    }),
  ]);

  const servicePoints = services.map((s) => ({
    label: s.serviceName,
    value: s._count._all,
  }));

  return {
    'bookings-trend': withDemoFallback(trend, [
      { label: 'شنبه', value: 8 },
      { label: 'یکشنبه', value: 11 },
      { label: 'دوشنبه', value: 9 },
      { label: 'سه‌شنبه', value: 14 },
      { label: 'چهارشنبه', value: 12 },
      { label: 'پنجشنبه', value: 16 },
      { label: 'جمعه', value: 6 },
    ]),
    'services-mix': withDemoFallback(servicePoints, [
      { label: 'کوتاهی مو', value: 24 },
      { label: 'رنگ و مش', value: 18 },
      { label: 'ناخن', value: 12 },
      { label: 'میکاپ', value: 9 },
      { label: 'پاکسازی', value: 6 },
    ]),
  };
}

async function getRetailCharts(organizationId: string): Promise<Record<string, PackChartPoint[]>> {
  const [salesTrend, movements] = await Promise.all([
    getSalesTrend(organizationId, 7),
    prisma.stockMovement.findMany({
      where: {
        organizationId,
        type: 'OUT',
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      include: { product: { select: { name: true } } },
      take: 200,
    }),
  ]);

  const productCounts = new Map<string, number>();
  for (const m of movements) {
    const name = m.product?.name ?? 'محصول';
    productCounts.set(name, (productCounts.get(name) ?? 0) + Number(m.quantity));
  }

  const topProducts = [...productCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }));

  return {
    'sales-trend': withDemoFallback(
      salesTrend.map((d) => ({ label: d.label, value: d.amount })),
      [
        { label: 'شنبه', value: 5_200_000 },
        { label: 'یکشنبه', value: 4_800_000 },
        { label: 'دوشنبه', value: 6_100_000 },
        { label: 'سه‌شنبه', value: 5_800_000 },
        { label: 'چهارشنبه', value: 7_000_000 },
        { label: 'پنجشنبه', value: 6_600_000 },
        { label: 'جمعه', value: 6_800_000 },
      ],
    ),
    'top-products': withDemoFallback(topProducts, [
      { label: 'محصول الف', value: 34 },
      { label: 'محصول ب', value: 28 },
      { label: 'محصول ج', value: 21 },
      { label: 'محصول د', value: 15 },
      { label: 'محصول ه', value: 11 },
    ]),
  };
}

async function getFoodCharts(organizationId: string): Promise<Record<string, PackChartPoint[]>> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todayOrders = await prisma.foodOrder.findMany({
    where: { organizationId, orderedAt: { gte: startOfToday } },
    select: { orderedAt: true, tableLabel: true, customerId: true },
  });

  const hourBuckets = new Map<number, number>();
  let dineIn = 0;
  let takeaway = 0;

  for (const order of todayOrders) {
    const hour = order.orderedAt.getHours();
    hourBuckets.set(hour, (hourBuckets.get(hour) ?? 0) + 1);
    if (order.tableLabel) dineIn += 1;
    else takeaway += 1;
  }

  const hourPoints = [...hourBuckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([hour, value]) => ({
      label: `${hour.toString().padStart(2, '0')}:۰۰`,
      value,
    }));

  return {
    'orders-by-hour': withDemoFallback(hourPoints, [
      { label: '۱۱:۰۰', value: 3 },
      { label: '۱۲:۰۰', value: 8 },
      { label: '۱۳:۰۰', value: 12 },
      { label: '۱۴:۰۰', value: 6 },
      { label: '۱۹:۰۰', value: 10 },
      { label: '۲۰:۰۰', value: 14 },
      { label: '۲۱:۰۰', value: 9 },
    ]),
    'service-type': withDemoFallback(
      [
        { label: 'سالن', value: dineIn },
        { label: 'بیرون‌بر', value: takeaway },
      ],
      [
        { label: 'سالن', value: 18 },
        { label: 'بیرون‌بر', value: 11 },
      ],
    ),
  };
}

async function getAgencyCharts(organizationId: string): Promise<Record<string, PackChartPoint[]>> {
  const [leadsTrend, campaigns] = await Promise.all([
    countByDay(organizationId, 7, (start, end) =>
      prisma.lead.count({
        where: { organizationId, createdAt: { gte: start, lte: end } },
      }),
    ),
    prisma.marketingCampaign.groupBy({
      by: ['status'],
      where: { organizationId, status: { notIn: ['DONE', 'CANCELLED'] } },
      _count: { _all: true },
    }),
  ]);

  const campaignLabels: Record<string, string> = {
    PLANNED: 'برنامه‌ریزی',
    ACTIVE: 'فعال',
    ON_HOLD: 'متوقف',
  };

  const campaignPoints = campaigns.map((c) => ({
    label: campaignLabels[c.status] ?? c.status,
    value: c._count._all,
  }));

  return {
    'leads-trend': withDemoFallback(leadsTrend, [
      { label: 'شنبه', value: 4 },
      { label: 'یکشنبه', value: 6 },
      { label: 'دوشنبه', value: 5 },
      { label: 'سه‌شنبه', value: 8 },
      { label: 'چهارشنبه', value: 7 },
      { label: 'پنجشنبه', value: 9 },
      { label: 'جمعه', value: 3 },
    ]),
    'campaign-status': withDemoFallback(campaignPoints, [
      { label: 'فعال', value: 5 },
      { label: 'برنامه‌ریزی', value: 3 },
      { label: 'متوقف', value: 1 },
    ]),
  };
}

async function getSeoAgencyCharts(organizationId: string): Promise<Record<string, PackChartPoint[]>> {
  const leadsTrend = await countByDay(organizationId, 7, (start, end) =>
    prisma.lead.count({
      where: { organizationId, createdAt: { gte: start, lte: end } },
    }),
  );

  return {
    'traffic-trend': [
      { label: 'مهر', value: 12_400 },
      { label: 'آبان', value: 14_200 },
      { label: 'آذر', value: 15_800 },
      { label: 'دی', value: 17_500 },
      { label: 'بهمن', value: 19_100 },
      { label: 'اسفند', value: 21_300 },
    ],
    'leads-trend': withDemoFallback(leadsTrend, [
      { label: 'شنبه', value: 2 },
      { label: 'یکشنبه', value: 4 },
      { label: 'دوشنبه', value: 3 },
      { label: 'سه‌شنبه', value: 5 },
      { label: 'چهارشنبه', value: 4 },
      { label: 'پنجشنبه', value: 6 },
      { label: 'جمعه', value: 2 },
    ]),
  };
}

async function fetchChartData(
  organizationId: string,
  packId: string,
  specialtyId?: string | null,
): Promise<Record<string, PackChartPoint[]>> {
  if (specialtyId === 'seo-agency') {
    return getSeoAgencyCharts(organizationId);
  }

  switch (packId) {
    case 'CLINIC':
      return getClinicCharts(organizationId);
    case 'BEAUTY_SALON':
      return getBeautyCharts(organizationId);
    case 'RETAIL':
      return getRetailCharts(organizationId);
    case 'FOOD_SERVICE':
      return getFoodCharts(organizationId);
    case 'MARKETING_AGENCY':
      return getAgencyCharts(organizationId);
    default:
      return {};
  }
}

export async function getPackDashboardCharts(
  organizationId: string,
  packId: string,
  specialtyId?: string | null,
): Promise<PackDashboardChartBundle[]> {
  const defs = getPackDashboardChartDefs(packId, specialtyId);
  if (defs.length === 0) return [];

  const data = await fetchChartData(organizationId, packId, specialtyId);

  return defs.map((def) => ({
    def,
    points: data[def.key] ?? [],
  }));
}
