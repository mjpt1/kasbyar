import { getPackNavFamily, type PackNavFamily } from './nav-profiles';
import { getPackDefinition, getPackHomeHref } from './registry';
import { getSpecialty } from './specialties';
import type { IndustryPackId } from './types';

export interface PackDashboardEndUserAction {
  labelFa: string;
  descriptionFa: string;
  hrefHint: string;
}

export interface PackDashboardSurface {
  titleFa: string;
  descriptionFa: string;
  primaryCta?: { href: string; labelFa: string };
  endUserActions: PackDashboardEndUserAction[];
}

type SurfaceSeed = Omit<PackDashboardSurface, 'primaryCta'> & {
  primaryCta?: { href?: string; labelFa: string };
};

const FAMILY_SURFACES: Record<PackNavFamily, SurfaceSeed> = {
  general_crm: {
    titleFa: 'داشبورد',
    descriptionFa: 'فروش، مطالبات، سرنخ‌ها و وظایف روزمره در یک نگاه',
    endUserActions: [
      {
        labelFa: 'فاکتورها و پرداخت',
        descriptionFa: 'مشاهده وضعیت فاکتور و پرداخت آنلاین',
        hrefHint: 'invoices',
      },
      {
        labelFa: 'پیگیری درخواست',
        descriptionFa: 'وضعیت فرصت‌ها و پیگیری‌های باز',
        hrefHint: 'leads',
      },
      {
        labelFa: 'کارهای باز',
        descriptionFa: 'وظایفی که تیم برای شما ثبت کرده',
        hrefHint: 'tasks',
      },
    ],
  },
  care: {
    titleFa: 'پیشخوان مراقبت',
    descriptionFa: 'نوبت امروز، مراجعان و پیگیری جلسات',
    primaryCta: { labelFa: 'نوبت‌ها' },
    endUserActions: [
      {
        labelFa: 'نوبت‌های من',
        descriptionFa: 'زمان مراجعه و وضعیت نوبت',
        hrefHint: 'appointments',
      },
      {
        labelFa: 'صورتحساب درمان',
        descriptionFa: 'فاکتور خدمات و پرداخت مانده',
        hrefHint: 'invoices',
      },
      {
        labelFa: 'پیام تیم',
        descriptionFa: 'یادآوری و کارهای پیگیری',
        hrefHint: 'tasks',
      },
    ],
  },
  retail_ops: {
    titleFa: 'پیشخوان فروشگاه',
    descriptionFa: 'موجودی، فروش و مشتریان فروشگاهی',
    primaryCta: { labelFa: 'موجودی' },
    endUserActions: [
      {
        labelFa: 'سفارش‌ها و فاکتور',
        descriptionFa: 'خریدهای ثبت‌شده و مانده پرداخت',
        hrefHint: 'invoices',
      },
      {
        labelFa: 'پیگیری تحویل',
        descriptionFa: 'وضعیت سفارش و هماهنگی ارسال',
        hrefHint: 'tasks',
      },
      {
        labelFa: 'حساب خریدار',
        descriptionFa: 'اطلاعات تماس و سوابق فروشگاه',
        hrefHint: 'profile',
      },
    ],
  },
  food_ops: {
    titleFa: 'پیشخوان سالن',
    descriptionFa: 'سفارش‌های باز، منو و آماده‌سازی',
    primaryCta: { labelFa: 'سفارش‌ها' },
    endUserActions: [
      {
        labelFa: 'سفارش من',
        descriptionFa: 'وضعیت آماده‌سازی و سرو',
        hrefHint: 'orders',
      },
      {
        labelFa: 'صورتحساب میز',
        descriptionFa: 'فاکتور و پرداخت آنلاین',
        hrefHint: 'invoices',
      },
      {
        labelFa: 'رزرو / پیگیری',
        descriptionFa: 'درخواست‌ها و یادآوری تیم',
        hrefHint: 'tasks',
      },
    ],
  },
  schedule: {
    titleFa: 'پیشخوان برنامه',
    descriptionFa: 'زمان‌بندی جلسات، ظرفیت و ثبت‌نام',
    primaryCta: { labelFa: 'برنامه' },
    endUserActions: [
      {
        labelFa: 'جلسات من',
        descriptionFa: 'زمان کلاس یا رزرو بعدی',
        hrefHint: 'schedule',
      },
      {
        labelFa: 'شهریه و فاکتور',
        descriptionFa: 'پرداخت شهریه یا پکیج',
        hrefHint: 'invoices',
      },
      {
        labelFa: 'پیگیری ثبت‌نام',
        descriptionFa: 'وضعیت درخواست و کارهای باز',
        hrefHint: 'tasks',
      },
    ],
  },
  sales_pipeline: {
    titleFa: 'پیشخوان فروش',
    descriptionFa: 'سرنخ‌ها، پیگیری معامله و فاکتور',
    primaryCta: { labelFa: 'سرنخ‌ها' },
    endUserActions: [
      {
        labelFa: 'درخواست من',
        descriptionFa: 'وضعیت فرصت و مرحله فروش',
        hrefHint: 'leads',
      },
      {
        labelFa: 'پیش‌فاکتور',
        descriptionFa: 'فاکتور و پرداخت توافق‌شده',
        hrefHint: 'invoices',
      },
      {
        labelFa: 'بازدید / پیگیری',
        descriptionFa: 'کارهای زمان‌بندی‌شده تیم',
        hrefHint: 'tasks',
      },
    ],
  },
  agency: {
    titleFa: 'پیشخوان دفتر',
    descriptionFa: 'پرونده‌ها، موکلان و تحویل پروژه',
    primaryCta: { labelFa: 'پرونده‌ها' },
    endUserActions: [
      {
        labelFa: 'پرونده من',
        descriptionFa: 'وضعیت کار و مراحل پیگیری',
        hrefHint: 'matters',
      },
      {
        labelFa: 'صورتحساب خدمات',
        descriptionFa: 'فاکتور دوره‌ای و پرداخت',
        hrefHint: 'invoices',
      },
      {
        labelFa: 'جلسات و موعد',
        descriptionFa: 'یادآوری و کارهای باز',
        hrefHint: 'tasks',
      },
    ],
  },
  field_service: {
    titleFa: 'پیشخوان خدمات',
    descriptionFa: 'پذیرش کار، وضعیت تعمیر و تحویل',
    primaryCta: { labelFa: 'پذیرش‌ها' },
    endUserActions: [
      {
        labelFa: 'وضعیت کار',
        descriptionFa: 'پیگیری تعمیر یا اعزام',
        hrefHint: 'jobs',
      },
      {
        labelFa: 'فاکتور خدمات',
        descriptionFa: 'هزینه و پرداخت مانده',
        hrefHint: 'invoices',
      },
      {
        labelFa: 'هماهنگی تحویل',
        descriptionFa: 'کارهای باز تیم فنی',
        hrefHint: 'tasks',
      },
    ],
  },
  travel: {
    titleFa: 'پیشخوان سفر',
    descriptionFa: 'درخواست رزرو، مسافران و برنامه سفر',
    primaryCta: { labelFa: 'رزروها' },
    endUserActions: [
      {
        labelFa: 'رزرو من',
        descriptionFa: 'وضعیت بلیت و برنامه سفر',
        hrefHint: 'bookings',
      },
      {
        labelFa: 'پیش‌پرداخت و فاکتور',
        descriptionFa: 'پرداخت اقساط سفر',
        hrefHint: 'invoices',
      },
      {
        labelFa: 'مدارک و پیگیری',
        descriptionFa: 'یادآوری مدارک و کارهای باز',
        hrefHint: 'tasks',
      },
    ],
  },
};

const PACK_SURFACES: Partial<Record<IndustryPackId, Partial<SurfaceSeed>>> = {
  CLINIC: {
    titleFa: 'کلینیک',
    descriptionFa: 'نوبت‌دهی، بیماران و پرونده ویزیت امروز',
    primaryCta: { href: '/clinic/appointments', labelFa: 'نوبت‌ها' },
  },
  BEAUTY_SALON: {
    titleFa: 'سالن زیبایی',
    descriptionFa: 'نوبت خدمات، مراجعان و برنامه امروز سالن',
    primaryCta: { href: '/beauty/appointments', labelFa: 'نوبت‌ها' },
  },
  RETAIL: {
    titleFa: 'فروشگاه',
    descriptionFa: 'محصولات، موجودی، فروش و مشتریان',
    primaryCta: { href: '/retail/inventory', labelFa: 'موجودی' },
  },
  FOOD_SERVICE: {
    titleFa: 'غذا و نوشیدنی',
    descriptionFa: 'منو، سفارش سالن و آماده‌سازی آشپزخانه',
    primaryCta: { href: '/food/orders', labelFa: 'سفارش‌ها' },
  },
  TRAVEL_AGENCY: {
    titleFa: 'مسافرتی',
    descriptionFa: 'رزرو، مسافران و برنامه سفر',
    primaryCta: { href: '/travel/bookings', labelFa: 'رزروها' },
  },
  EDUCATION: {
    titleFa: 'آموزشگاه',
    descriptionFa: 'دوره، ثبت‌نام و ظرفیت کلاس',
    primaryCta: { href: '/education/courses', labelFa: 'دوره‌ها' },
  },
  FITNESS: {
    titleFa: 'باشگاه',
    descriptionFa: 'عضویت، انقضا و کلاس‌های گروهی',
    primaryCta: { href: '/fitness/memberships', labelFa: 'عضویت‌ها' },
  },
  REAL_ESTATE: {
    titleFa: 'املاک',
    descriptionFa: 'فایل ملک، بازدید و وضعیت معامله',
    primaryCta: { href: '/real-estate/listings', labelFa: 'فایل‌ها' },
  },
};

const SPECIALTY_SURFACES: Record<string, Partial<SurfaceSeed>> = {
  hospital: {
    titleFa: 'پیشخوان بیمارستان',
    descriptionFa: 'پذیرش، نوبت‌های پرتراکم و پیگیری خدمات بستری/سرپایی',
    primaryCta: { href: '/clinic/appointments', labelFa: 'نوبت‌ها و پذیرش' },
    endUserActions: [
      {
        labelFa: 'نوبت و پذیرش',
        descriptionFa: 'زمان مراجعه و بخش مربوطه',
        hrefHint: 'appointments',
      },
      {
        labelFa: 'صورتحساب درمان',
        descriptionFa: 'فاکتور خدمات بیمارستانی',
        hrefHint: 'invoices',
      },
      {
        labelFa: 'پیگیری پرونده',
        descriptionFa: 'یادآوری و کارهای باز تیم درمان',
        hrefHint: 'tasks',
      },
    ],
  },
  'dental-clinic': {
    titleFa: 'پیشخوان دندانپزشکی',
    descriptionFa: 'نوبت درمان دندان، پیگیری جلسه و پرونده بیمار',
    primaryCta: { href: '/clinic/appointments', labelFa: 'نوبت دندان' },
    endUserActions: [
      {
        labelFa: 'نوبت دندان',
        descriptionFa: 'زمان جلسه درمان و یادآوری',
        hrefHint: 'appointments',
      },
      {
        labelFa: 'هزینه درمان',
        descriptionFa: 'فاکتور و پرداخت قسط درمان',
        hrefHint: 'invoices',
      },
      {
        labelFa: 'پیگیری جلسه',
        descriptionFa: 'کارهای باز پس از ویزیت',
        hrefHint: 'tasks',
      },
    ],
  },
  cafe: {
    titleFa: 'پیشخوان کافه',
    descriptionFa: 'سفارش میز، منوی نوشیدنی و آماده‌سازی بار',
    primaryCta: { href: '/food/orders', labelFa: 'سفارش‌های باز' },
  },
  bakery: {
    titleFa: 'پیشخوان نانوایی',
    descriptionFa: 'سفارش تولید، موجودی و تحویل روزانه',
    primaryCta: { href: '/food/orders', labelFa: 'سفارش‌ها' },
  },
  'barber-shop': {
    titleFa: 'پیشخوان آرایشگاه',
    descriptionFa: 'نوبت اصلاح، خدمات و برنامه امروز',
    primaryCta: { href: '/beauty/appointments', labelFa: 'نوبت‌ها' },
  },
  'spa-center': {
    titleFa: 'پیشخوان اسپا',
    descriptionFa: 'رزرو خدمات آرامش، مهمانان و برنامه اتاق',
    primaryCta: { href: '/beauty/appointments', labelFa: 'رزروها' },
  },
  pharmacy: {
    titleFa: 'پیشخوان داروخانه',
    descriptionFa: 'موجودی دارو، فروش و مراجعان داروخانه',
    primaryCta: { href: '/retail/inventory', labelFa: 'موجودی دارو' },
  },
  'flower-shop': {
    titleFa: 'پیشخوان گل‌فروشی',
    descriptionFa: 'سفارش گل، موجودی و تحویل مناسبتی',
    primaryCta: { href: '/retail/inventory', labelFa: 'موجودی' },
  },
  florist: {
    titleFa: 'پیشخوان گل‌فروشی',
    descriptionFa: 'سفارش گل، موجودی و تحویل مناسبتی',
    primaryCta: { href: '/retail/inventory', labelFa: 'موجودی' },
  },
};

function mergeSurface(base: SurfaceSeed, patch?: Partial<SurfaceSeed>): SurfaceSeed {
  if (!patch) return base;
  return {
    titleFa: patch.titleFa ?? base.titleFa,
    descriptionFa: patch.descriptionFa ?? base.descriptionFa,
    primaryCta: patch.primaryCta
      ? { ...base.primaryCta, ...patch.primaryCta }
      : base.primaryCta,
    endUserActions: patch.endUserActions ?? base.endUserActions,
  };
}

export function getPackDashboardSurface(
  packId: string,
  specialtyId?: string | null,
): PackDashboardSurface {
  const family = getPackNavFamily(packId);
  const pack = packId as IndustryPackId;
  const specialty = getSpecialty(specialtyId);

  let seed = mergeSurface(FAMILY_SURFACES[family], PACK_SURFACES[pack]);
  if (specialtyId) {
    seed = mergeSurface(seed, SPECIALTY_SURFACES[specialtyId]);
  }

  const homeHref = specialty?.homePath ?? getPackHomeHref(packId);
  const primaryHref = seed.primaryCta?.href ?? homeHref;
  const def = getPackDefinition(packId);

  return {
    titleFa: seed.titleFa,
    descriptionFa: seed.descriptionFa,
    primaryCta: seed.primaryCta
      ? { href: primaryHref, labelFa: seed.primaryCta.labelFa }
      : homeHref !== '/dashboard'
        ? { href: homeHref, labelFa: def.navItems[0]?.label ?? 'پیشخوان' }
        : undefined,
    endUserActions: seed.endUserActions,
  };
}
