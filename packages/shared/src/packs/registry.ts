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
  LAW_FIRM: {
    id: 'LAW_FIRM',
    label: 'دفتر حقوقی',
    description: 'پرونده، موکل و پیگیری جلسات',
    homeRoute: '/law',
    navItems: [
      { href: '/law', label: 'حقوقی', icon: 'Scale' },
      { href: '/law/cases', label: 'پرونده‌ها', icon: 'ClipboardList' },
    ],
    labels: { customer: 'موکل', customers: 'موکلان' },
  },
  ACCOUNTING_FIRM: {
    id: 'ACCOUNTING_FIRM',
    label: 'دفتر حسابداری',
    description: 'پرونده مشتری، سررسید و خدمات دوره‌ای',
    homeRoute: '/accounting',
    navItems: [
      { href: '/accounting', label: 'حسابداری', icon: 'Calculator' },
      { href: '/accounting/matters', label: 'پرونده‌ها', icon: 'ClipboardList' },
    ],
    labels: { customer: 'مشتری', customers: 'مشتریان' },
  },
  INSURANCE_AGENCY: {
    id: 'INSURANCE_AGENCY',
    label: 'نمایندگی بیمه',
    description: 'بیمه‌نامه، تمدید و پیگیری حق‌بیمه',
    homeRoute: '/insurance',
    navItems: [
      { href: '/insurance', label: 'بیمه', icon: 'Shield' },
      { href: '/insurance/policies', label: 'بیمه‌نامه‌ها', icon: 'ClipboardList' },
    ],
    labels: { customer: 'بیمه‌گذار', customers: 'بیمه‌گذاران' },
  },
  MARKETING_AGENCY: {
    id: 'MARKETING_AGENCY',
    label: 'آژانس بازاریابی',
    description: 'کمپین، بودجه و تحویل پروژه',
    homeRoute: '/agency',
    navItems: [
      { href: '/agency', label: 'بازاریابی', icon: 'Megaphone' },
      { href: '/agency/campaigns', label: 'کمپین‌ها', icon: 'ClipboardList' },
    ],
    labels: { customer: 'کارفرما', customers: 'کارفرمایان' },
  },
  CONTRACTING: {
    id: 'CONTRACTING',
    label: 'پیمانکاری',
    description: 'پروژه، صورت‌وضعیت و پیشرفت کار',
    homeRoute: '/contracting',
    navItems: [
      { href: '/contracting', label: 'پیمانکاری', icon: 'HardHat' },
      { href: '/contracting/projects', label: 'پروژه‌ها', icon: 'ClipboardList' },
    ],
    labels: { customer: 'کارفرما', customers: 'کارفرمایان' },
  },
  PHOTOGRAPHY: {
    id: 'PHOTOGRAPHY',
    label: 'آتلیه عکاسی',
    description: 'رزرو جلسه، پکیج و تحویل',
    homeRoute: '/photography',
    navItems: [
      { href: '/photography', label: 'عکاسی', icon: 'Camera' },
      { href: '/photography/sessions', label: 'جلسات', icon: 'Calendar' },
    ],
    labels: { customer: 'مشتری', customers: 'مشتریان' },
  },
  CLEANING: {
    id: 'CLEANING',
    label: 'خدمات نظافتی',
    description: 'سفارش نظافت، زمان‌بندی و اعزام',
    homeRoute: '/cleaning',
    navItems: [
      { href: '/cleaning', label: 'نظافت', icon: 'SprayCan' },
      { href: '/cleaning/jobs', label: 'سفارش‌ها', icon: 'ClipboardList' },
    ],
    labels: { customer: 'مشتری', customers: 'مشتریان' },
  },
  PRINTING: {
    id: 'PRINTING',
    label: 'چاپ و تبلیغات',
    description: 'سفارش چاپ، تیراژ و تحویل',
    homeRoute: '/printing',
    navItems: [
      { href: '/printing', label: 'چاپ', icon: 'Printer' },
      { href: '/printing/orders', label: 'سفارش‌ها', icon: 'ClipboardList' },
    ],
    labels: { customer: 'مشتری', customers: 'مشتریان' },
  },
  LOGISTICS: {
    id: 'LOGISTICS',
    label: 'حمل‌ونقل و پیک',
    description: 'باربری، پیک شهری و پیگیری محموله',
    homeRoute: '/logistics',
    navItems: [
      { href: '/logistics', label: 'حمل‌ونقل', icon: 'Truck' },
      { href: '/logistics/jobs', label: 'محموله‌ها', icon: 'ClipboardList' },
    ],
    labels: { customer: 'فرستنده', customers: 'فرستندگان' },
  },
  AUTOMOTIVE: {
    id: 'AUTOMOTIVE',
    label: 'خودرو',
    description: 'نمایشگاه، نمایندگی و اجاره خودرو',
    homeRoute: '/automotive',
    navItems: [
      { href: '/automotive', label: 'خودرو', icon: 'Car' },
      { href: '/automotive/jobs', label: 'پرونده‌ها', icon: 'ClipboardList' },
    ],
    labels: { customer: 'خریدار', customers: 'خریداران' },
  },
  HOSPITALITY: {
    id: 'HOSPITALITY',
    label: 'هتل و اقامتگاه',
    description: 'رزرو اتاق، مهمان و اقامت',
    homeRoute: '/hospitality',
    navItems: [
      { href: '/hospitality', label: 'اقامتگاه', icon: 'Hotel' },
      { href: '/hospitality/jobs', label: 'رزروها', icon: 'ClipboardList' },
    ],
    labels: { customer: 'مهمان', customers: 'مهمانان' },
  },
  WHOLESALE: {
    id: 'WHOLESALE',
    label: 'عمده‌فروشی و هایپر',
    description: 'فروش عمده، هایپر و مجتمع تجاری',
    homeRoute: '/wholesale',
    navItems: [
      { href: '/wholesale', label: 'عمده', icon: 'Warehouse' },
      { href: '/wholesale/jobs', label: 'سفارش‌ها', icon: 'ClipboardList' },
    ],
    labels: { customer: 'خریدار عمده', customers: 'خریداران عمده' },
  },
  EVENTS: {
    id: 'EVENTS',
    label: 'تشریفات و مراسم',
    description: 'تالار، رویداد و پذیرایی',
    homeRoute: '/events',
    navItems: [
      { href: '/events', label: 'مراسم', icon: 'PartyPopper' },
      { href: '/events/jobs', label: 'رویدادها', icon: 'ClipboardList' },
    ],
    labels: { customer: 'برگزارکننده', customers: 'برگزارکنندگان' },
  },
  AGRICULTURE: {
    id: 'AGRICULTURE',
    label: 'کشاورزی و دام',
    description: 'گلخانه، دامداری و فروش محصول',
    homeRoute: '/agriculture',
    navItems: [
      { href: '/agriculture', label: 'کشاورزی', icon: 'Sprout' },
      { href: '/agriculture/jobs', label: 'سفارش‌ها', icon: 'ClipboardList' },
    ],
    labels: { customer: 'خریدار', customers: 'خریداران' },
  },
  HOME_SERVICES: {
    id: 'HOME_SERVICES',
    label: 'خدمات منزل',
    description: 'نقاشی، اسباب‌کشی و سرویس تأسیسات',
    homeRoute: '/home-services',
    navItems: [
      { href: '/home-services', label: 'خدمات منزل', icon: 'House' },
      { href: '/home-services/jobs', label: 'سفارش‌ها', icon: 'ClipboardList' },
    ],
    labels: { customer: 'مشتری', customers: 'مشتریان' },
  },
  DISTRIBUTION: {
    id: 'DISTRIBUTION',
    label: 'پخش و نمایندگی',
    description: 'پخش مویرگی، نمایندگی برند و توزیع',
    homeRoute: '/distribution',
    navItems: [
      { href: '/distribution', label: 'پخش', icon: 'Route' },
      { href: '/distribution/jobs', label: 'مسیرها', icon: 'ClipboardList' },
    ],
    labels: { customer: 'فروشگاه', customers: 'فروشگاه‌ها' },
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
