import type { PackDashboardWidget } from '@kesbyar/shared';

import { getClinicDashboardSignals } from '@/server/packs/clinic/clinic.service';
import { getPackContext } from '@/server/packs/pack-context';
import { getRetailDashboardSignals } from '@/server/packs/retail/retail.service';
import { getTravelDashboardSignals } from '@/server/packs/travel/travel.service';

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

  return [];
}

export async function getPackDashboardSummaryLine(organizationId: string): Promise<string | null> {
  const widgets = await getPackDashboardWidgets(organizationId);
  if (widgets.length === 0) return null;

  const parts = widgets.slice(0, 2).map((w) => `${w.title}: ${w.value}`);
  return parts.join(' · ');
}
