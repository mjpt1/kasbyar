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

const DEMO_WEEK_LOW = [
  { label: 'شنبه', value: 4 },
  { label: 'یکشنبه', value: 6 },
  { label: 'دوشنبه', value: 5 },
  { label: 'سه‌شنبه', value: 8 },
  { label: 'چهارشنبه', value: 7 },
  { label: 'پنجشنبه', value: 9 },
  { label: 'جمعه', value: 3 },
];

const DEMO_WEEK_MID = [
  { label: 'شنبه', value: 8 },
  { label: 'یکشنبه', value: 11 },
  { label: 'دوشنبه', value: 9 },
  { label: 'سه‌شنبه', value: 14 },
  { label: 'چهارشنبه', value: 12 },
  { label: 'پنجشنبه', value: 16 },
  { label: 'جمعه', value: 6 },
];

const PROJECT_STATUS_LABELS: Record<string, string> = {
  PLANNED: 'برنامه‌ریزی',
  ACTIVE: 'فعال',
  ON_HOLD: 'متوقف',
  DONE: 'تمام‌شده',
  CANCELLED: 'لغو شده',
};

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

function mapStatusGroups(
  groups: Array<{ status: string; _count: { _all: number } }>,
  labels: Record<string, string>,
): PackChartPoint[] {
  return groups.map((g) => ({
    label: labels[g.status] ?? g.status,
    value: g._count._all,
  }));
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
    'visit-status': withDemoFallback(mapStatusGroups(statusGroups, statusLabels), [
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
    'bookings-trend': withDemoFallback(trend, DEMO_WEEK_MID),
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

  return {
    'leads-trend': withDemoFallback(leadsTrend, DEMO_WEEK_LOW),
    'campaign-status': withDemoFallback(mapStatusGroups(campaigns, PROJECT_STATUS_LABELS), [
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
    'leads-trend': withDemoFallback(leadsTrend, DEMO_WEEK_LOW),
  };
}

async function getTravelCharts(organizationId: string): Promise<Record<string, PackChartPoint[]>> {
  const [trend, statusGroups] = await Promise.all([
    countByDay(organizationId, 7, (start, end) =>
      prisma.travelBooking.count({
        where: { organizationId, createdAt: { gte: start, lte: end } },
      }),
    ),
    prisma.travelBooking.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { _all: true },
    }),
  ]);

  const statusLabels: Record<string, string> = {
    INQUIRY: 'استعلام',
    QUOTED: 'قیمت‌داده‌شده',
    CONFIRMED: 'تأیید‌شده',
    DEPARTED: 'اعزام‌شده',
    COMPLETED: 'پایان‌یافته',
    CANCELLED: 'لغو شده',
  };

  return {
    'bookings-trend': withDemoFallback(trend, DEMO_WEEK_MID),
    'booking-status': withDemoFallback(mapStatusGroups(statusGroups, statusLabels), [
      { label: 'استعلام', value: 9 },
      { label: 'تأیید‌شده', value: 14 },
      { label: 'اعزام‌شده', value: 6 },
      { label: 'لغو شده', value: 2 },
    ]),
  };
}

async function getEducationCharts(organizationId: string): Promise<Record<string, PackChartPoint[]>> {
  const [trend, statusGroups] = await Promise.all([
    countByDay(organizationId, 7, (start, end) =>
      prisma.courseEnrollment.count({
        where: { organizationId, enrolledAt: { gte: start, lte: end } },
      }),
    ),
    prisma.courseEnrollment.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { _all: true },
    }),
  ]);

  const statusLabels: Record<string, string> = {
    INTERESTED: 'علاقه‌مند',
    ENROLLED: 'ثبت‌نام‌شده',
    ACTIVE: 'فعال',
    COMPLETED: 'پایان‌یافته',
    DROPPED: 'انصراف',
  };

  return {
    'enrollments-trend': withDemoFallback(trend, DEMO_WEEK_LOW),
    'enrollment-status': withDemoFallback(mapStatusGroups(statusGroups, statusLabels), [
      { label: 'فعال', value: 28 },
      { label: 'ثبت‌نام‌شده', value: 12 },
      { label: 'علاقه‌مند', value: 9 },
      { label: 'پایان‌یافته', value: 15 },
    ]),
  };
}

async function getFitnessCharts(organizationId: string): Promise<Record<string, PackChartPoint[]>> {
  const [trend, statusGroups] = await Promise.all([
    countByDay(organizationId, 7, (start, end) =>
      prisma.gymMembership.count({
        where: { organizationId, createdAt: { gte: start, lte: end } },
      }),
    ),
    prisma.gymMembership.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { _all: true },
    }),
  ]);

  const statusLabels: Record<string, string> = {
    ACTIVE: 'فعال',
    EXPIRED: 'منقضی',
    PAUSED: 'متوقف',
    CANCELLED: 'لغو شده',
  };

  return {
    'memberships-trend': withDemoFallback(trend, DEMO_WEEK_MID),
    'membership-status': withDemoFallback(mapStatusGroups(statusGroups, statusLabels), [
      { label: 'فعال', value: 86 },
      { label: 'منقضی', value: 14 },
      { label: 'متوقف', value: 7 },
    ]),
  };
}

async function getRealEstateCharts(organizationId: string): Promise<Record<string, PackChartPoint[]>> {
  const [trend, statusGroups] = await Promise.all([
    countByDay(organizationId, 7, (start, end) =>
      prisma.propertyShowing.count({
        where: { organizationId, scheduledAt: { gte: start, lte: end } },
      }),
    ),
    prisma.propertyListing.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { _all: true },
    }),
  ]);

  const statusLabels: Record<string, string> = {
    AVAILABLE: 'آزاد',
    RESERVED: 'رزرو شده',
    SOLD: 'فروخته‌شده',
    RENTED: 'اجاره‌رفته',
    WITHDRAWN: 'خارج‌شده',
  };

  return {
    'showings-trend': withDemoFallback(trend, DEMO_WEEK_MID),
    'listing-status': withDemoFallback(mapStatusGroups(statusGroups, statusLabels), [
      { label: 'آزاد', value: 22 },
      { label: 'رزرو شده', value: 8 },
      { label: 'فروخته‌شده', value: 5 },
      { label: 'اجاره‌رفته', value: 4 },
    ]),
  };
}

async function getWorkshopCharts(organizationId: string): Promise<Record<string, PackChartPoint[]>> {
  const [trend, statusGroups] = await Promise.all([
    countByDay(organizationId, 7, (start, end) =>
      prisma.repairJob.count({
        where: { organizationId, intakeAt: { gte: start, lte: end } },
      }),
    ),
    prisma.repairJob.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { _all: true },
    }),
  ]);

  const statusLabels: Record<string, string> = {
    INTAKE: 'پذیرش',
    DIAGNOSING: 'عیب‌یابی',
    WAITING_PARTS: 'انتظار قطعه',
    IN_PROGRESS: 'در حال تعمیر',
    READY: 'آماده تحویل',
    DELIVERED: 'تحویل‌شده',
    CANCELLED: 'لغو شده',
  };

  return {
    'jobs-trend': withDemoFallback(trend, DEMO_WEEK_MID),
    'job-status': withDemoFallback(mapStatusGroups(statusGroups, statusLabels), [
      { label: 'پذیرش', value: 7 },
      { label: 'در حال تعمیر', value: 11 },
      { label: 'آماده تحویل', value: 5 },
      { label: 'تحویل‌شده', value: 18 },
    ]),
  };
}

async function getLawCharts(organizationId: string): Promise<Record<string, PackChartPoint[]>> {
  const [trend, statusGroups] = await Promise.all([
    countByDay(organizationId, 7, (start, end) =>
      prisma.legalCase.count({
        where: { organizationId, createdAt: { gte: start, lte: end } },
      }),
    ),
    prisma.legalCase.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { _all: true },
    }),
  ]);

  const statusLabels: Record<string, string> = {
    OPEN: 'باز',
    ACTIVE: 'فعال',
    WAITING: 'در انتظار',
    CLOSED: 'بسته',
  };

  return {
    'cases-trend': withDemoFallback(trend, DEMO_WEEK_LOW),
    'case-status': withDemoFallback(mapStatusGroups(statusGroups, statusLabels), [
      { label: 'فعال', value: 12 },
      { label: 'باز', value: 8 },
      { label: 'در انتظار', value: 5 },
      { label: 'بسته', value: 20 },
    ]),
  };
}

async function getAccountingCharts(organizationId: string): Promise<Record<string, PackChartPoint[]>> {
  const [trend, statusGroups] = await Promise.all([
    countByDay(organizationId, 7, (start, end) =>
      prisma.accountingMatter.count({
        where: { organizationId, createdAt: { gte: start, lte: end } },
      }),
    ),
    prisma.accountingMatter.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { _all: true },
    }),
  ]);

  const statusLabels: Record<string, string> = {
    OPEN: 'باز',
    ACTIVE: 'فعال',
    WAITING: 'در انتظار',
    CLOSED: 'بسته',
  };

  return {
    'matters-trend': withDemoFallback(trend, DEMO_WEEK_LOW),
    'matter-status': withDemoFallback(mapStatusGroups(statusGroups, statusLabels), [
      { label: 'فعال', value: 15 },
      { label: 'باز', value: 9 },
      { label: 'در انتظار', value: 6 },
      { label: 'بسته', value: 22 },
    ]),
  };
}

async function getInsuranceCharts(organizationId: string): Promise<Record<string, PackChartPoint[]>> {
  const [trend, statusGroups] = await Promise.all([
    countByDay(organizationId, 7, (start, end) =>
      prisma.insurancePolicy.count({
        where: { organizationId, createdAt: { gte: start, lte: end } },
      }),
    ),
    prisma.insurancePolicy.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { _all: true },
    }),
  ]);

  const statusLabels: Record<string, string> = {
    ACTIVE: 'فعال',
    PENDING: 'در انتظار',
    EXPIRED: 'منقضی',
    CANCELLED: 'لغو شده',
  };

  return {
    'policies-trend': withDemoFallback(trend, DEMO_WEEK_MID),
    'policy-status': withDemoFallback(mapStatusGroups(statusGroups, statusLabels), [
      { label: 'فعال', value: 48 },
      { label: 'در انتظار', value: 11 },
      { label: 'منقضی', value: 7 },
    ]),
  };
}

async function getContractingCharts(organizationId: string): Promise<Record<string, PackChartPoint[]>> {
  const [trend, statusGroups] = await Promise.all([
    countByDay(organizationId, 7, (start, end) =>
      prisma.contractProject.count({
        where: { organizationId, createdAt: { gte: start, lte: end } },
      }),
    ),
    prisma.contractProject.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { _all: true },
    }),
  ]);

  return {
    'projects-trend': withDemoFallback(trend, DEMO_WEEK_LOW),
    'project-status': withDemoFallback(mapStatusGroups(statusGroups, PROJECT_STATUS_LABELS), [
      { label: 'فعال', value: 6 },
      { label: 'برنامه‌ریزی', value: 4 },
      { label: 'متوقف', value: 1 },
      { label: 'تمام‌شده', value: 9 },
    ]),
  };
}

async function getPhotographyCharts(organizationId: string): Promise<Record<string, PackChartPoint[]>> {
  const [trend, statusGroups] = await Promise.all([
    countByDay(organizationId, 7, (start, end) =>
      prisma.photoSession.count({
        where: { organizationId, scheduledAt: { gte: start, lte: end } },
      }),
    ),
    prisma.photoSession.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { _all: true },
    }),
  ]);

  const statusLabels: Record<string, string> = {
    SCHEDULED: 'زمان‌بندی',
    CONFIRMED: 'تأیید‌شده',
    COMPLETED: 'انجام‌شده',
    CANCELLED: 'لغو شده',
    NO_SHOW: 'عدم حضور',
  };

  return {
    'sessions-trend': withDemoFallback(trend, DEMO_WEEK_MID),
    'session-status': withDemoFallback(mapStatusGroups(statusGroups, statusLabels), [
      { label: 'زمان‌بندی', value: 8 },
      { label: 'تأیید‌شده', value: 5 },
      { label: 'انجام‌شده', value: 22 },
      { label: 'لغو شده', value: 2 },
    ]),
  };
}

async function getCleaningCharts(organizationId: string): Promise<Record<string, PackChartPoint[]>> {
  const [trend, statusGroups] = await Promise.all([
    countByDay(organizationId, 7, (start, end) =>
      prisma.cleaningJob.count({
        where: { organizationId, scheduledAt: { gte: start, lte: end } },
      }),
    ),
    prisma.cleaningJob.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { _all: true },
    }),
  ]);

  const statusLabels: Record<string, string> = {
    SCHEDULED: 'زمان‌بندی',
    CONFIRMED: 'تأیید‌شده',
    COMPLETED: 'انجام‌شده',
    CANCELLED: 'لغو شده',
    NO_SHOW: 'عدم حضور',
  };

  return {
    'jobs-trend': withDemoFallback(trend, DEMO_WEEK_MID),
    'job-status': withDemoFallback(mapStatusGroups(statusGroups, statusLabels), [
      { label: 'زمان‌بندی', value: 9 },
      { label: 'تأیید‌شده', value: 6 },
      { label: 'انجام‌شده', value: 18 },
    ]),
  };
}

async function getPrintingCharts(organizationId: string): Promise<Record<string, PackChartPoint[]>> {
  const [trend, statusGroups] = await Promise.all([
    countByDay(organizationId, 7, (start, end) =>
      prisma.printOrder.count({
        where: { organizationId, createdAt: { gte: start, lte: end } },
      }),
    ),
    prisma.printOrder.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { _all: true },
    }),
  ]);

  return {
    'orders-trend': withDemoFallback(trend, DEMO_WEEK_LOW),
    'order-status': withDemoFallback(mapStatusGroups(statusGroups, PROJECT_STATUS_LABELS), [
      { label: 'فعال', value: 7 },
      { label: 'برنامه‌ریزی', value: 5 },
      { label: 'تمام‌شده', value: 16 },
    ]),
  };
}

async function getWave4Charts(
  organizationId: string,
  packId: string,
): Promise<Record<string, PackChartPoint[]>> {
  const [trend, statusGroups] = await Promise.all([
    countByDay(organizationId, 7, (start, end) =>
      prisma.packWorkItem.count({
        where: {
          organizationId,
          pack: packId as never,
          createdAt: { gte: start, lte: end },
        },
      }),
    ),
    prisma.packWorkItem.groupBy({
      by: ['status'],
      where: { organizationId, pack: packId as never },
      _count: { _all: true },
    }),
  ]);

  return {
    'jobs-trend': withDemoFallback(trend, DEMO_WEEK_MID),
    'job-status': withDemoFallback(mapStatusGroups(statusGroups, PROJECT_STATUS_LABELS), [
      { label: 'فعال', value: 8 },
      { label: 'برنامه‌ریزی', value: 5 },
      { label: 'متوقف', value: 2 },
      { label: 'تمام‌شده', value: 14 },
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
  if (specialtyId === 'translation-bureau') {
    return getAgencyCharts(organizationId);
  }
  if (
    specialtyId === 'medical-aesthetics' ||
    specialtyId === 'veterinary-clinic'
  ) {
    return getClinicCharts(organizationId);
  }
  if (specialtyId === 'home-appliances' || specialtyId === 'flower-shop') {
    return getRetailCharts(organizationId);
  }
  if (specialtyId === 'phone-repair' || specialtyId === 'dry-cleaning') {
    return specialtyId === 'dry-cleaning'
      ? getCleaningCharts(organizationId)
      : getWorkshopCharts(organizationId);
  }
  if (specialtyId === 'coworking-space' || specialtyId === 'gaming-cafe') {
    return getFitnessCharts(organizationId);
  }
  if (specialtyId === 'driving-school') {
    return getEducationCharts(organizationId);
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
    case 'TRAVEL_AGENCY':
      return getTravelCharts(organizationId);
    case 'EDUCATION':
      return getEducationCharts(organizationId);
    case 'FITNESS':
      return getFitnessCharts(organizationId);
    case 'REAL_ESTATE':
      return getRealEstateCharts(organizationId);
    case 'WORKSHOP':
      return getWorkshopCharts(organizationId);
    case 'LAW_FIRM':
      return getLawCharts(organizationId);
    case 'ACCOUNTING_FIRM':
      return getAccountingCharts(organizationId);
    case 'INSURANCE_AGENCY':
      return getInsuranceCharts(organizationId);
    case 'CONTRACTING':
      return getContractingCharts(organizationId);
    case 'PHOTOGRAPHY':
      return getPhotographyCharts(organizationId);
    case 'CLEANING':
      return getCleaningCharts(organizationId);
    case 'PRINTING':
      return getPrintingCharts(organizationId);
    case 'LOGISTICS':
    case 'AUTOMOTIVE':
    case 'HOSPITALITY':
    case 'WHOLESALE':
    case 'EVENTS':
    case 'AGRICULTURE':
    case 'HOME_SERVICES':
    case 'DISTRIBUTION':
      return getWave4Charts(organizationId, packId);
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
