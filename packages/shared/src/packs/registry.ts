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
  BEAUTY_SALON: {
    id: 'BEAUTY_SALON',
    label: 'سالن زیبایی',
    description: 'نوبت خدمات، مراجعان و پرسنل زیبایی',
    homeRoute: '/beauty',
    navItems: [
      { href: '/beauty', label: 'سالن زیبایی', icon: 'Sparkles' },
      { href: '/beauty/appointments', label: 'نوبت‌ها', icon: 'Calendar' },
    ],
    labels: { customer: 'مراجع', customers: 'مراجعان' },
  },
  FOOD_SERVICE: {
    id: 'FOOD_SERVICE',
    label: 'رستوران و کافه',
    description: 'منو، سفارش سالن و آماده‌سازی',
    homeRoute: '/food',
    navItems: [
      { href: '/food', label: 'غذا و نوشیدنی', icon: 'UtensilsCrossed' },
      { href: '/food/orders', label: 'سفارش‌ها', icon: 'ClipboardList' },
      { href: '/food/menu', label: 'منو', icon: 'Package' },
    ],
    labels: { customer: 'مهمان', customers: 'مهمانان' },
  },
  EDUCATION: {
    id: 'EDUCATION',
    label: 'آموزشگاه',
    description: 'دوره، ثبت‌نام و ظرفیت کلاس',
    homeRoute: '/education',
    navItems: [
      { href: '/education', label: 'آموزشگاه', icon: 'GraduationCap' },
      { href: '/education/courses', label: 'دوره‌ها', icon: 'BookOpen' },
      { href: '/education/enrollments', label: 'ثبت‌نام‌ها', icon: 'Users' },
    ],
    labels: { customer: 'هنرجو', customers: 'هنرجویان' },
  },
  FITNESS: {
    id: 'FITNESS',
    label: 'باشگاه ورزشی',
    description: 'عضویت، انقضا و کلاس‌های گروهی',
    homeRoute: '/fitness',
    navItems: [
      { href: '/fitness', label: 'باشگاه', icon: 'Dumbbell' },
      { href: '/fitness/memberships', label: 'عضویت‌ها', icon: 'BadgeCheck' },
      { href: '/fitness/classes', label: 'کلاس‌ها', icon: 'Calendar' },
    ],
    labels: { customer: 'عضو', customers: 'اعضا' },
  },
  REAL_ESTATE: {
    id: 'REAL_ESTATE',
    label: 'املاک',
    description: 'فایل ملک، بازدید و وضعیت معامله',
    homeRoute: '/real-estate',
    navItems: [
      { href: '/real-estate', label: 'املاک', icon: 'Building2' },
      { href: '/real-estate/listings', label: 'فایل‌ها', icon: 'Home' },
      { href: '/real-estate/showings', label: 'بازدیدها', icon: 'Calendar' },
    ],
    labels: { customer: 'متقاضی', customers: 'متقاضیان' },
  },
  WORKSHOP: {
    id: 'WORKSHOP',
    label: 'تعمیرگاه / خدمات فنی',
    description: 'پذیرش دستگاه، وضعیت تعمیر و تحویل',
    homeRoute: '/workshop',
    navItems: [
      { href: '/workshop', label: 'تعمیرگاه', icon: 'Wrench' },
      { href: '/workshop/jobs', label: 'پذیرش‌ها', icon: 'ClipboardList' },
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
