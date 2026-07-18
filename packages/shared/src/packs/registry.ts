import type { IndustryPackId, PackDefinition } from './types';

export const PACK_REGISTRY: Record<IndustryPackId, PackDefinition> = {
  GENERAL: {
    id: 'GENERAL',
    label: 'عمومی',
    description: 'هسته مشترک بدون ماژول عمودی',
    navItems: [],
    homeRoute: null,
    labels: { customer: 'مشتری', customers: 'مشتریان' },
  },
  CLINIC: {
    id: 'CLINIC',
    label: 'کلینیک / مطب',
    description: 'نوبت‌دهی، بیماران و پرونده ویزیت',
    homeRoute: '/clinic',
    navItems: [
      { href: '/clinic', label: 'کلینیک', icon: 'Stethoscope' },
      { href: '/clinic/appointments', label: 'نوبت‌ها', icon: 'Calendar' },
      { href: '/clinic/patients', label: 'بیماران', icon: 'HeartPulse' },
      { href: '/clinic/visits', label: 'پرونده ویزیت', icon: 'FolderOpen' },
    ],
    labels: { customer: 'بیمار', customers: 'بیماران' },
  },
  TRAVEL_AGENCY: {
    id: 'TRAVEL_AGENCY',
    label: 'آژانس مسافرتی',
    description: 'درخواست رزرو، مسافران و برنامه سفر',
    homeRoute: '/travel',
    navItems: [
      { href: '/travel', label: 'مسافرتی', icon: 'Plane' },
      { href: '/travel/bookings', label: 'رزروها', icon: 'Luggage' },
    ],
    labels: { customer: 'مسافر', customers: 'مسافران' },
  },
  RETAIL: {
    id: 'RETAIL',
    label: 'خرده‌فروشی',
    description: 'محصولات، موجودی و هشدار کمبود',
    homeRoute: '/retail',
    navItems: [
      { href: '/retail', label: 'فروشگاه', icon: 'Store' },
      { href: '/retail/products', label: 'محصولات', icon: 'Package' },
      { href: '/retail/inventory', label: 'موجودی', icon: 'Boxes' },
    ],
    labels: { customer: 'مشتری', customers: 'مشتریان' },
  },
};

export function getPackDefinition(packId: string): PackDefinition {
  return PACK_REGISTRY[packId as IndustryPackId] ?? PACK_REGISTRY.GENERAL;
}

export function isVerticalPack(packId: string): boolean {
  return packId !== 'GENERAL';
}

export function getPackNavItems(packId: string): PackDefinition['navItems'] {
  return getPackDefinition(packId).navItems;
}
