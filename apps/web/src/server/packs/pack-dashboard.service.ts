import type { PackDashboardWidget } from '@kesbyar/shared';

import { getBeautyDashboardSignals } from '@/server/packs/beauty/beauty.service';
import { getClinicDashboardSignals } from '@/server/packs/clinic/clinic.service';
import { getEducationDashboardSignals } from '@/server/packs/education/education.service';
import { getFitnessDashboardSignals } from '@/server/packs/fitness/fitness.service';
import { getFoodDashboardSignals } from '@/server/packs/food/food.service';
import { getPackContext } from '@/server/packs/pack-context';
import { getRealEstateDashboardSignals } from '@/server/packs/real-estate/real-estate.service';
import { getRetailDashboardSignals } from '@/server/packs/retail/retail.service';
import { getTravelDashboardSignals } from '@/server/packs/travel/travel.service';
import { getWorkshopDashboardSignals } from '@/server/packs/workshop/workshop.service';
import { getLawDashboardSignals } from '@/server/packs/law/law.service';
import { getAccountingDashboardSignals } from '@/server/packs/accounting/accounting.service';
import { getInsuranceDashboardSignals } from '@/server/packs/insurance/insurance.service';
import { getAgencyDashboardSignals } from '@/server/packs/agency/agency.service';
import { getContractingDashboardSignals } from '@/server/packs/contracting/contracting.service';
import { getPhotographyDashboardSignals } from '@/server/packs/photography/photography.service';
import { getCleaningDashboardSignals } from '@/server/packs/cleaning/cleaning.service';
import { getPrintingDashboardSignals } from '@/server/packs/printing/printing.service';

export async function getPackDashboardWidgets(
  organizationId: string,
): Promise<PackDashboardWidget[]> {
  const ctx = await getPackContext(organizationId);

  if (ctx.industryPack === 'CLINIC') {
    const s = await getClinicDashboardSignals(organizationId);
    return [
      { key: 'today', title: 'نوبت‌های امروز', value: s.todayCount, href: '/clinic/appointments' },
      {
        key: 'missed',
        title: 'نوبت‌های از دست رفته',
        value: s.missedCount,
        href: '/clinic/appointments',
        variant: s.missedCount > 0 ? 'warning' : 'default',
      },
      { key: 'followup', title: 'پیگیری درمان', value: s.followUpCount, href: '/clinic' },
      { key: 'patients', title: 'بیماران ثبت‌شده', value: s.patientCount, href: '/clinic/patients' },
    ];
  }

  if (ctx.industryPack === 'TRAVEL_AGENCY') {
    const s = await getTravelDashboardSignals(organizationId);
    return [
      {
        key: 'pending',
        title: 'درخواست‌های باز',
        value: s.pendingCount,
        href: '/travel/bookings',
        variant: s.pendingCount > 0 ? 'warning' : 'default',
      },
      {
        key: 'upcoming',
        title: 'اعزام ۳۰ روز آینده',
        value: s.upcomingCount,
        href: '/travel/bookings',
      },
      {
        key: 'unpaid',
        title: 'رزرو با مانده حساب',
        value: s.unpaidCount,
        href: '/invoices',
        variant: s.unpaidCount > 0 ? 'warning' : 'default',
      },
    ];
  }

  if (ctx.industryPack === 'RETAIL') {
    const s = await getRetailDashboardSignals(organizationId);
    return [
      {
        key: 'lowstock',
        title: 'محصول کم‌موجود',
        value: s.lowStockCount,
        href: '/retail/products?lowStock=1',
        variant: s.lowStockCount > 0 ? 'warning' : 'default',
      },
      {
        key: 'movements',
        title: 'گردش موجودی (۷ روز)',
        value: s.movementCount,
        href: '/retail/inventory',
      },
      {
        key: 'products',
        title: 'محصول فعال',
        value: s.activeProductCount,
        href: '/retail/products',
      },
    ];
  }

  if (ctx.industryPack === 'BEAUTY_SALON') {
    const s = await getBeautyDashboardSignals(organizationId);
    return [
      { key: 'today', title: 'نوبت‌های امروز', value: s.todayCount, href: '/beauty/appointments' },
      {
        key: 'open',
        title: 'نوبت‌های باز',
        value: s.openCount,
        href: '/beauty/appointments',
        variant: s.openCount > 0 ? 'warning' : 'default',
      },
      { key: 'upcoming', title: '۷ روز آینده', value: s.upcomingCount, href: '/beauty' },
    ];
  }

  if (ctx.industryPack === 'FOOD_SERVICE') {
    const s = await getFoodDashboardSignals(organizationId);
    return [
      {
        key: 'open',
        title: 'سفارش باز',
        value: s.openCount,
        href: '/food/orders',
        variant: s.openCount > 0 ? 'warning' : 'default',
      },
      { key: 'today', title: 'سفارش امروز', value: s.todayCount, href: '/food/orders' },
      { key: 'menu', title: 'آیتم منو', value: s.menuCount, href: '/food/menu' },
    ];
  }

  if (ctx.industryPack === 'EDUCATION') {
    const s = await getEducationDashboardSignals(organizationId);
    return [
      { key: 'courses', title: 'دوره فعال', value: s.activeCourseCount, href: '/education/courses' },
      { key: 'enrollments', title: 'ثبت‌نام فعال', value: s.enrollmentCount, href: '/education/enrollments' },
      {
        key: 'interested',
        title: 'علاقه‌مند',
        value: s.interestedCount,
        href: '/education/enrollments',
        variant: s.interestedCount > 0 ? 'warning' : 'default',
      },
    ];
  }

  if (ctx.industryPack === 'FITNESS') {
    const s = await getFitnessDashboardSignals(organizationId);
    return [
      { key: 'active', title: 'عضویت فعال', value: s.activeCount, href: '/fitness/memberships' },
      {
        key: 'expiring',
        title: 'انقضای ۳۰ روز',
        value: s.expiringCount,
        href: '/fitness/memberships',
        variant: s.expiringCount > 0 ? 'warning' : 'default',
      },
      { key: 'classes', title: 'کلاس ۷ روز آینده', value: s.upcomingClassCount, href: '/fitness/classes' },
    ];
  }

  if (ctx.industryPack === 'REAL_ESTATE') {
    const s = await getRealEstateDashboardSignals(organizationId);
    return [
      { key: 'available', title: 'فایل موجود', value: s.availableCount, href: '/real-estate/listings' },
      {
        key: 'reserved',
        title: 'رزرو شده',
        value: s.reservedCount,
        href: '/real-estate/listings',
        variant: s.reservedCount > 0 ? 'warning' : 'default',
      },
      { key: 'showings', title: 'بازدید ۷ روز آینده', value: s.upcomingShowingCount, href: '/real-estate/showings' },
    ];
  }

  if (ctx.industryPack === 'WORKSHOP') {
    const s = await getWorkshopDashboardSignals(organizationId);
    return [
      { key: 'open', title: 'پذیرش باز', value: s.openCount, href: '/workshop/jobs' },
      {
        key: 'ready',
        title: 'آماده تحویل',
        value: s.readyCount,
        href: '/workshop/jobs',
        variant: s.readyCount > 0 ? 'warning' : 'default',
      },
      { key: 'inprogress', title: 'در حال تعمیر', value: s.inProgressCount, href: '/workshop/jobs' },
    ];
  }

  if (ctx.industryPack === 'LAW_FIRM') {
    const s = await getLawDashboardSignals(organizationId);
    return [
      { key: 'open', title: 'پرونده باز', value: s.openCount, href: '/law/cases' },
      { key: 'active', title: 'فعال', value: s.activeCount, href: '/law/cases' },
      {
        key: 'waiting',
        title: 'در انتظار',
        value: s.waitingCount,
        href: '/law/cases',
        variant: s.waitingCount > 0 ? 'warning' : 'default',
      },
    ];
  }

  if (ctx.industryPack === 'ACCOUNTING_FIRM') {
    const s = await getAccountingDashboardSignals(organizationId);
    return [
      { key: 'open', title: 'پرونده باز', value: s.openCount, href: '/accounting/matters' },
      { key: 'active', title: 'فعال', value: s.activeCount, href: '/accounting/matters' },
      {
        key: 'due',
        title: 'سررسید ۷ روز',
        value: s.dueSoonCount,
        href: '/accounting/matters',
        variant: s.dueSoonCount > 0 ? 'warning' : 'default',
      },
    ];
  }

  if (ctx.industryPack === 'INSURANCE_AGENCY') {
    const s = await getInsuranceDashboardSignals(organizationId);
    return [
      { key: 'active', title: 'فعال', value: s.activeCount, href: '/insurance/policies' },
      {
        key: 'pending',
        title: 'در انتظار',
        value: s.pendingCount,
        href: '/insurance/policies',
        variant: s.pendingCount > 0 ? 'warning' : 'default',
      },
      { key: 'expiring', title: 'نزدیک تمدید', value: s.expiringCount, href: '/insurance/policies' },
    ];
  }

  if (ctx.industryPack === 'MARKETING_AGENCY') {
    const s = await getAgencyDashboardSignals(organizationId);
    return [
      { key: 'active', title: 'فعال', value: s.activeCount, href: '/agency/campaigns' },
      { key: 'planned', title: 'برنامه‌ریزی', value: s.plannedCount, href: '/agency/campaigns' },
      {
        key: 'hold',
        title: 'متوقف',
        value: s.onHoldCount,
        href: '/agency/campaigns',
        variant: s.onHoldCount > 0 ? 'warning' : 'default',
      },
    ];
  }

  if (ctx.industryPack === 'CONTRACTING') {
    const s = await getContractingDashboardSignals(organizationId);
    return [
      { key: 'active', title: 'فعال', value: s.activeCount, href: '/contracting/projects' },
      { key: 'planned', title: 'برنامه‌ریزی', value: s.plannedCount, href: '/contracting/projects' },
      {
        key: 'hold',
        title: 'متوقف',
        value: s.onHoldCount,
        href: '/contracting/projects',
        variant: s.onHoldCount > 0 ? 'warning' : 'default',
      },
    ];
  }

  if (ctx.industryPack === 'PHOTOGRAPHY') {
    const s = await getPhotographyDashboardSignals(organizationId);
    return [
      { key: 'today', title: 'امروز', value: s.todayCount, href: '/photography/sessions' },
      { key: 'upcoming', title: '۷ روز آینده', value: s.upcomingCount, href: '/photography/sessions' },
      { key: 'confirmed', title: 'تأیید‌شده', value: s.confirmedCount, href: '/photography/sessions' },
    ];
  }

  if (ctx.industryPack === 'CLEANING') {
    const s = await getCleaningDashboardSignals(organizationId);
    return [
      { key: 'today', title: 'امروز', value: s.todayCount, href: '/cleaning/jobs' },
      { key: 'upcoming', title: '۷ روز آینده', value: s.upcomingCount, href: '/cleaning/jobs' },
      { key: 'confirmed', title: 'تأیید‌شده', value: s.confirmedCount, href: '/cleaning/jobs' },
    ];
  }

  if (ctx.industryPack === 'PRINTING') {
    const s = await getPrintingDashboardSignals(organizationId);
    return [
      { key: 'active', title: 'فعال', value: s.activeCount, href: '/printing/orders' },
      { key: 'planned', title: 'برنامه‌ریزی', value: s.plannedCount, href: '/printing/orders' },
      {
        key: 'due',
        title: 'سررسید ۷ روز',
        value: s.dueSoonCount,
        href: '/printing/orders',
        variant: s.dueSoonCount > 0 ? 'warning' : 'default',
      },
    ];
  }

  return [];
}

export async function getPackDashboardSummaryLine(organizationId: string): Promise<string | null> {
  const widgets = await getPackDashboardWidgets(organizationId);
  if (widgets.length === 0) return null;

  const parts = widgets.slice(0, 2).map((w) => `${w.title}: ${w.value}`);
  return parts.join(' · ');
}
