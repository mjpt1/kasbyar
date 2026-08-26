import type { IndustryPackId } from './types';

export type SpecialtyId = string;

export type SpecialtyMetric =
  | 'customers'
  | 'openInvoices'
  | 'activeLeads'
  | 'pendingTasks'
  | 'packA'
  | 'packB'
  | 'packC';

export interface SpecialtyDefinition {
  id: SpecialtyId;
  basePack: IndustryPackId;
  label: string;
  description: string;
  icon: string;
  homePath: string;
  labels: { customer: string; customers: string };
  widgets: Array<{ key: string; title: string; metric: SpecialtyMetric }>;
  tips: string[];
}

type SpecialtySeed = [
  id: string,
  label: string,
  description: string,
  customer: string,
  customers: string,
];

interface SpecialtyBatch {
  basePack: IndustryPackId;
  icon: string;
  items: SpecialtySeed[];
}

const WIDGET_SETS: Array<
  Array<{ key: string; title: string; metric: SpecialtyMetric }>
> = [
  [
    { key: 'core-customers', title: 'مراجعان فعال', metric: 'customers' },
    { key: 'core-invoices', title: 'فاکتور باز', metric: 'openInvoices' },
    { key: 'pack-a', title: 'شاخص تخصصی ۱', metric: 'packA' },
    { key: 'pack-b', title: 'شاخص تخصصی ۲', metric: 'packB' },
  ],
  [
    { key: 'core-leads', title: 'سرنخ فروش فعال', metric: 'activeLeads' },
    { key: 'core-tasks', title: 'وظیفه باز', metric: 'pendingTasks' },
    { key: 'pack-a', title: 'شاخص امروز', metric: 'packA' },
    { key: 'pack-c', title: 'شاخص هفته', metric: 'packC' },
  ],
  [
    { key: 'core-customers', title: 'مشتریان', metric: 'customers' },
    { key: 'core-leads', title: 'سرنخ فروش فعال', metric: 'activeLeads' },
    { key: 'pack-a', title: 'اولویت امروز', metric: 'packA' },
    { key: 'pack-b', title: 'پیگیری باز', metric: 'packB' },
  ],
];

const DEFAULT_TIPS = [
  'هر روز صبح داشبورد تخصصی را برای اولویت‌های امروز بررسی کنید.',
  'مشتریان و فاکتورهای باز را از همین صفحه پیگیری کنید.',
  'برای جزئیات عملیاتی به پیشخوان بسته پایه بروید.',
];

const BATCHES: SpecialtyBatch[] = [
  {
    basePack: 'GENERAL',
    icon: 'Briefcase',
    items: [
      ['general-business', 'کسب‌وکار عمومی', 'پیشخوان عمومی برای هر نوع فعالیت', 'مشتری', 'مشتریان'],
      ['freelancer', 'فریلنسر', 'پروژه، کارفرما، فاکتور و پیگیری تحویل', 'کارفرما', 'کارفرمایان'],
      [
        'software-house',
        'شرکت برنامه‌نویسی',
        'پروژه‌های نرم‌افزاری، مشتری سازمانی و تحویل محصول',
        'مشتری',
        'مشتریان',
      ],
      ['consulting-firm', 'مشاوره', 'قرارداد مشاوره و پیگیری جلسات', 'مراجع', 'مراجعان'],
      ['online-services', 'خدمات آنلاین', 'فروش و پشتیبانی خدمات اینترنتی', 'مشتری', 'مشتریان'],
      ['content-creator', 'تولید محتوا', 'پروژه محتوایی و فاکتور کارفرما', 'کارفرما', 'کارفرمایان'],
      [
        'translation-bureau',
        'دفتر ترجمه',
        'سفارش ترجمه، مهلت تحویل و فاکتور کارفرما',
        'کارفرما',
        'کارفرمایان',
      ],
      [
        'coworking-space',
        'فضای کار اشتراکی',
        'میز کار، عضویت و رزرو اتاق جلسه',
        'عضو',
        'اعضا',
      ],
    ],
  },
  {
    basePack: 'CLINIC',
    icon: 'Stethoscope',
    items: [
      ['dental-clinic', 'کلینیک دندانپزشکی', 'نوبت، بیمار و پیگیری درمان دندان', 'بیمار', 'بیماران'],
      ['medical-office', 'مطب پزشک عمومی', 'نوبت و پرونده مراجعان مطب', 'بیمار', 'بیماران'],
      ['hospital', 'بیمارستان خصوصی', 'مدیریت حجم بالای مراجعان و خدمات', 'بیمار', 'بیماران'],
      ['treatment-center', 'مرکز درمان', 'پیگیری دوره درمان و جلسات', 'مراجع', 'مراجعان'],
      ['veterinary-clinic', 'دامپزشکی', 'نوبت و پرونده حیوانات', 'صاحب حیوان', 'مراجعان'],
      ['dermatology-clinic', 'کلینیک پوست', 'ویزیت و پیگیری درمان پوست', 'بیمار', 'بیماران'],
      ['physiotherapy-clinic', 'فیزیوتراپی', 'جلسات درمان و برنامه تمرین', 'بیمار', 'بیماران'],
      ['psychology-clinic', 'مرکز روانشناسی', 'جلسات مشاوره و پیگیری', 'مراجع', 'مراجعان'],
      ['optometry-clinic', 'بینایی‌سنجی', 'معاینه چشم و فروش عینک', 'مراجع', 'مراجعان'],
      ['midwifery-clinic', 'مامایی', 'پیگیری بارداری و مراقبت', 'مراجع', 'مراجعان'],
      ['medical-lab', 'آزمایشگاه تشخیص طبی', 'نوبت، نمونه و نتیجه آزمایش', 'مراجع', 'مراجعان'],
      [
        'aesthetic-laser',
        'کلینیک زیبایی تزریقی و لیزر',
        'نوبت تزریق، لیزر و پیگیری جلسه',
        'مراجع',
        'مراجعان',
      ],
      [
        'medical-aesthetics',
        'کلینیک زیبایی پزشکی',
        'مشاوره، تزریق و درمان‌های زیبایی پزشکی',
        'مراجع',
        'مراجعان',
      ],
      [
        'nutrition-clinic',
        'کلینیک تغذیه',
        'برنامه غذایی، پیگیری وزن و جلسات مشاوره',
        'مراجع',
        'مراجعان',
      ],
    ],
  },
  {
    basePack: 'TRAVEL_AGENCY',
    icon: 'Plane',
    items: [
      ['tour-agency', 'آژانس تور', 'رزرو تور و پیگیری مسافران', 'مسافر', 'مسافران'],
      ['pilgrimage-agency', 'آژانس زیارتی', 'برنامه زیارت و اعزام', 'زائر', 'زائران'],
      ['visa-services', 'خدمات ویزا', 'پیگیری پرونده ویزا', 'متقاضی', 'متقاضیان'],
      ['domestic-tours', 'تور داخلی', 'برنامه سفر داخل کشور', 'مسافر', 'مسافران'],
      ['hotel-booking', 'رزرو هتل', 'رزرو اقامت و پیگیری', 'مهمان', 'مهمانان'],
    ],
  },
  {
    basePack: 'RETAIL',
    icon: 'Store',
    items: [
      ['clothing-store', 'فروشگاه پوشاک', 'موجودی و فروش پوشاک', 'مشتری', 'مشتریان'],
      ['supermarket', 'سوپرمارکت', 'موجودی و فروش روزانه', 'مشتری', 'مشتریان'],
      ['pharmacy', 'داروخانه', 'موجودی دارو و فروش', 'مراجع', 'مراجعان'],
      ['mobile-shop', 'موبایل و لوازم', 'فروش گوشی و لوازم جانبی', 'مشتری', 'مشتریان'],
      ['electronics-store', 'لوازم برقی', 'فروش لوازم خانگی و برقی', 'مشتری', 'مشتریان'],
      ['flower-shop', 'گل‌فروشی', 'سفارش دسته‌گل و موجودی', 'مشتری', 'مشتریان'],
      ['pet-shop', 'پت‌شاپ', 'فروش لوازم حیوانات', 'مشتری', 'مشتریان'],
      ['optician', 'عینک‌فروشی', 'فروش عینک و لنز', 'مشتری', 'مشتریان'],
      ['stationery-store', 'لوازم‌التحریر', 'موجودی و فروش نوشت‌افزار', 'مشتری', 'مشتریان'],
      ['bookstore', 'کتاب‌فروشی', 'موجودی و فروش کتاب', 'مشتری', 'مشتریان'],
      ['hardware-store', 'ابزارفروشی', 'موجودی ابزار و یراق', 'مشتری', 'مشتریان'],
      ['cosmetics-store', 'لوازم آرایشی', 'فروش محصولات زیبایی', 'مشتری', 'مشتریان'],
      ['jewelry-store', 'طلا و جواهر', 'فروش و سفارش جواهر', 'مشتری', 'مشتریان'],
      ['toy-store', 'اسباب‌بازی', 'موجودی و فروش اسباب‌بازی', 'مشتری', 'مشتریان'],
      ['sports-goods', 'لوازم ورزشی', 'فروش تجهیزات ورزشی', 'مشتری', 'مشتریان'],
      ['furniture-store', 'مبلمان', 'سفارش و فروش مبل', 'مشتری', 'مشتریان'],
      ['auto-parts-store', 'لوازم‌یدکی خودرو', 'کد قطعه، سازگاری و موجودی', 'مشتری', 'مشتریان'],
      ['art-gallery', 'گالری هنری', 'فروش اثر و سفارش سفارشی', 'خریدار', 'خریداران'],
      ['handicrafts-shop', 'صنایع‌دستی', 'موجودی دست‌ساز و سفارش', 'مشتری', 'مشتریان'],
      [
        'home-appliances',
        'فروشگاه لوازم خانگی',
        'فروش یخچال، ماشین لباسشویی و لوازم بزرگ',
        'مشتری',
        'مشتریان',
      ],
    ],
  },
  {
    basePack: 'BEAUTY_SALON',
    icon: 'Sparkles',
    items: [
      ['beauty-salon', 'سالن زیبایی', 'نوبت خدمات زیبایی', 'مراجع', 'مراجعان'],
      ['barber-shop', 'آرایشگاه مردانه', 'نوبت اصلاح و خدمات', 'مشتری', 'مشتریان'],
      ['nail-salon', 'ناخن‌کاری', 'نوبت مانیکور', 'مراجع', 'مراجعان'],
      ['spa-center', 'اسپا', 'رزرو خدمات spa', 'مهمان', 'مهمانان'],
      ['makeup-studio', 'میکاپ آرتیست', 'رزرو جلسات آرایش', 'مشتری', 'مشتریان'],
      [
        'massage-center',
        'مرکز ماساژ',
        'رزرو جلسه ماساژ و پیگیری مراجع',
        'مراجع',
        'مراجعان',
      ],
      [
        'bridal-atelier',
        'مزون لباس عروس',
        'سفارش دوخت، پرو و تحویل لباس عروس',
        'عروس',
        'عروس‌ها',
      ],
    ],
  },
  {
    basePack: 'FOOD_SERVICE',
    icon: 'UtensilsCrossed',
    items: [
      ['restaurant', 'رستوران', 'سفارش سالن و منو', 'مهمان', 'مهمانان'],
      ['cafe', 'کافه', 'سفارش و منوی نوشیدنی', 'مهمان', 'مهمانان'],
      ['bakery', 'نانوایی', 'سفارش و تولید نان', 'مشتری', 'مشتریان'],
      ['fast-food', 'فست‌فود', 'سفارش سریع و تحویل', 'مشتری', 'مشتریان'],
      ['catering', 'کatering', 'سفارش مراسم و پذیرایی', 'کارفرما', 'کارفرمایان'],
      ['juice-bar', 'آبمیوه‌فروشی', 'سفارش نوشیدنی', 'مشتری', 'مشتریان'],
    ],
  },
  {
    basePack: 'EDUCATION',
    icon: 'GraduationCap',
    items: [
      ['education-center', 'آموزشگاه', 'دوره و ثبت‌نام', 'هنرجو', 'هنرجویان'],
      ['daycare-center', 'مهدکودک', 'ثبت‌نام و پیگیری والدین', 'والد', 'والدین'],
      ['language-school', 'آموزشگاه زبان', 'دوره و ثبت‌نام', 'هنرجو', 'هنرجویان'],
      ['driving-school', 'آموزشگاه رانندگی', 'ثبت‌نام و جلسات', 'هنرجو', 'هنرجویان'],
      ['music-school', 'آموزشگاه موسیقی', 'کلاس و ثبت‌نام', 'هنرجو', 'هنرجویان'],
      ['tutoring-center', 'مرکز تقویتی', 'کلاس خصوصی و گروهی', 'دانش‌آموز', 'دانش‌آموزان'],
    ],
  },
  {
    basePack: 'FITNESS',
    icon: 'Dumbbell',
    items: [
      ['gym', 'باشگاه ورزشی', 'عضویت و کلاس', 'عضو', 'اعضا'],
      ['yoga-studio', 'استودیو یوگا', 'کلاس و ثبت‌نام', 'عضو', 'اعضا'],
      ['pilates-studio', 'پیلاتس', 'جلسات و عضویت', 'عضو', 'اعضا'],
      ['martial-arts-club', 'رزمی', 'کلاس و عضویت', 'هنرجو', 'هنرجویان'],
      ['gaming-cafe', 'کافه بازی / گیم‌نت', 'میز، ساعت بازی و عضویت', 'بازیکن', 'بازیکنان'],
    ],
  },
  {
    basePack: 'REAL_ESTATE',
    icon: 'Building2',
    items: [
      ['real-estate', 'املاک', 'فایل ملک و بازدید', 'متقاضی', 'متقاضیان'],
      ['property-management', 'مدیریت املاک', 'پیگیری واحدها و مستأجر', 'مالک', 'مالکان'],
      ['mortgage-broker', 'وام مسکن', 'پیگیری پرونده وام', 'متقاضی', 'متقاضیان'],
      ['rental-agency', 'اجاره', 'فایل اجاره و قرارداد', 'مستأجر', 'مستأجران'],
    ],
  },
  {
    basePack: 'WORKSHOP',
    icon: 'Wrench',
    items: [
      ['auto-repair', 'تعمیرگاه خودرو', 'پذیرش و تعمیر', 'مشتری', 'مشتریان'],
      ['appliance-repair', 'تعمیر لوازم خانگی', 'پذیرش دستگاه', 'مشتری', 'مشتریان'],
      ['computer-service', 'خدمات رایانه', 'پذیرش و تعمیر', 'مشتری', 'مشتریان'],
      ['tailor-shop', 'خیاطی', 'سفارش دوخت و تحویل', 'مشتری', 'مشتریان'],
      ['electrician', 'برق‌کاری', 'سفارش خدمات برق', 'مشتری', 'مشتریان'],
      ['plumber', 'لوله‌کشی', 'سفارش تعمیرات', 'مشتری', 'مشتریان'],
      [
        'phone-repair',
        'تعمیر موبایل',
        'پذیرش گوشی، تعمیر و تحویل',
        'مشتری',
        'مشتریان',
      ],
      ['locksmith', 'کلیدسازی', 'ساخت کلید و بازکردن قفل', 'مشتری', 'مشتریان'],
    ],
  },
  {
    basePack: 'LAW_FIRM',
    icon: 'Scale',
    items: [
      ['law-office', 'دفتر حقوقی', 'پرونده و موکل', 'موکل', 'موکلان'],
      ['family-law', 'حقوق خانواده', 'پرونده خانوادگی', 'موکل', 'موکلان'],
      ['corporate-law', 'حقوق شرکت‌ها', 'قرارداد و پرونده', 'موکل', 'موکلان'],
      ['notary-services', 'خدمات ثبتی', 'پیگیری اسناد', 'مراجع', 'مراجعان'],
    ],
  },
  {
    basePack: 'ACCOUNTING_FIRM',
    icon: 'Calculator',
    items: [
      ['accounting-office', 'دفتر حسابداری', 'پرونده مشتری', 'مشتری', 'مشتریان'],
      ['tax-advisor', 'مشاور مالیاتی', 'سررسید و اظهارنامه', 'مشتری', 'مشتریان'],
      ['audit-firm', 'حسابرسی', 'پرونده حسابرسی', 'مشتری', 'مشتریان'],
    ],
  },
  {
    basePack: 'INSURANCE_AGENCY',
    icon: 'Shield',
    items: [
      ['insurance-agency', 'نمایندگی بیمه', 'بیمه‌نامه و تمدید', 'بیمه‌گذار', 'بیمه‌گذاران'],
      ['car-insurance', 'بیمه خودرو', 'صدور و تمدید', 'بیمه‌گذار', 'بیمه‌گذاران'],
      ['life-insurance', 'بیمه عمر', 'پیگیری بیمه‌نامه', 'بیمه‌گذار', 'بیمه‌گذاران'],
    ],
  },
  {
    basePack: 'MARKETING_AGENCY',
    icon: 'Megaphone',
    items: [
      ['marketing-agency', 'آژانس بازاریابی', 'کمپین و بودجه', 'کارفرما', 'کارفرمایان'],
      ['social-media-agency', 'مدیریت شبکه اجتماعی', 'کمپین و محتوا', 'کارفرما', 'کارفرمایان'],
      ['seo-agency', 'سئو و دیجیتال', 'پروژه و گزارش', 'کارفرما', 'کارفرمایان'],
    ],
  },
  {
    basePack: 'CONTRACTING',
    icon: 'HardHat',
    items: [
      ['contracting', 'پیمانکاری', 'پروژه و صورت‌وضعیت', 'کارفرما', 'کارفرمایان'],
      ['renovation', 'بازسازی', 'پروژه تعمیرات', 'کارفرما', 'کارفرمایان'],
      ['landscaping', 'فضای سبز', 'پروژه محوطه‌سازی', 'کارفرما', 'کارفرمایان'],
      ['electrical-contractor', 'پیمانکار برق', 'پروژه برق صنعتی', 'کارفرما', 'کارفرمایان'],
    ],
  },
  {
    basePack: 'PHOTOGRAPHY',
    icon: 'Camera',
    items: [
      ['photography-studio', 'آتلیه عکاسی', 'رزرو جلسه', 'مشتری', 'مشتریان'],
      ['wedding-photography', 'عکاسی عروسی', 'رزرو مراسم', 'مشتری', 'مشتریان'],
      ['video-production', 'تولید ویدیو', 'پروژه و تحویل', 'کارفرما', 'کارفرمایان'],
    ],
  },
  {
    basePack: 'CLEANING',
    icon: 'SprayCan',
    items: [
      ['cleaning-services', 'خدمات نظافتی', 'سفارش و زمان‌بندی', 'مشتری', 'مشتریان'],
      ['carpet-cleaning', 'قالیشویی', 'سفارش شستشو', 'مشتری', 'مشتریان'],
      ['pool-maintenance', 'نگهداری استخر', 'برنامه سرویس', 'مشتری', 'مشتریان'],
      [
        'dry-cleaning',
        'خشکشویی',
        'پذیرش لباس، شستشو و تحویل',
        'مشتری',
        'مشتریان',
      ],
    ],
  },
  {
    basePack: 'PRINTING',
    icon: 'Printer',
    items: [
      ['printing-shop', 'چاپخانه', 'سفارش چاپ', 'مشتری', 'مشتریان'],
      ['signage-shop', 'تابلو و تبلیغات', 'سفارش تابلو', 'مشتری', 'مشتریان'],
      ['packaging-print', 'بسته‌بندی چاپ', 'سفارش بسته', 'مشتری', 'مشتریان'],
    ],
  },
  {
    basePack: 'LOGISTICS',
    icon: 'Truck',
    items: [
      ['freight-courier', 'باربری و پیک', 'محموله، مسیر و تسویه', 'فرستنده', 'فرستندگان'],
      ['last-mile-delivery', 'پیک شهری', 'تحویل سریع شهری', 'فرستنده', 'فرستندگان'],
      ['cargo-logistics', 'حمل بار', 'بار بین‌شهری و پیگیری', 'صاحب بار', 'صاحبان بار'],
    ],
  },
  {
    basePack: 'AUTOMOTIVE',
    icon: 'Car',
    items: [
      ['car-dealership', 'نمایشگاه خودرو', 'موجودی خودرو و فروش', 'خریدار', 'خریداران'],
      ['car-rental', 'اجاره خودرو', 'قرارداد اجاره و تحویل', 'مستأجر', 'مستأجران'],
      ['brand-dealer', 'نمایندگی خودرو', 'فروش برند و خدمات پس از فروش', 'مشتری', 'مشتریان'],
    ],
  },
  {
    basePack: 'HOSPITALITY',
    icon: 'Hotel',
    items: [
      ['hotel', 'هتل', 'اتاق، رزرو و مهمان', 'مهمان', 'مهمانان'],
      ['ecolodge', 'بوم‌گردی', 'اقامتگاه بومی و رزرو', 'مهمان', 'مهمانان'],
      ['guesthouse', 'مهمانپذیر', 'اتاق و پذیرش روزانه', 'مهمان', 'مهمانان'],
    ],
  },
  {
    basePack: 'WHOLESALE',
    icon: 'Warehouse',
    items: [
      ['wholesale-trade', 'عمده‌فروشی', 'سفارش عمده و انبار', 'خریدار عمده', 'خریداران عمده'],
      ['hypermarket', 'هایپرمارکت', 'فروش پرتیراژ و موجودی', 'مشتری', 'مشتریان'],
      ['commercial-complex', 'مجتمع تجاری', 'واحدها و مستأجران تجاری', 'مستأجر', 'مستأجران'],
    ],
  },
  {
    basePack: 'EVENTS',
    icon: 'PartyPopper',
    items: [
      ['wedding-hall', 'باغ تالار', 'رزرو مراسم و پیش‌پرداخت', 'برگزارکننده', 'برگزارکنندگان'],
      ['event-planning', 'تشریفات و مراسم', 'رویداد، تأمین‌کننده و تسویه', 'کارفرما', 'کارفرمایان'],
      ['conference-venue', 'سالن همایش', 'رزرو سالن و خدمات جانبی', 'برگزارکننده', 'برگزارکنندگان'],
    ],
  },
  {
    basePack: 'AGRICULTURE',
    icon: 'Sprout',
    items: [
      ['greenhouse', 'گلخانه', 'محصول فصلی و سفارش', 'خریدار', 'خریداران'],
      ['livestock-farm', 'دامداری', 'فروش و قرارداد دام', 'خریدار', 'خریداران'],
      ['agriculture-trade', 'کشاورزی و فروش محصول', 'محصول و مشتری عمده', 'خریدار', 'خریداران'],
    ],
  },
  {
    basePack: 'HOME_SERVICES',
    icon: 'House',
    items: [
      ['home-painting', 'نقاشی ساختمان', 'سفارش و اعزام نیرو', 'مشتری', 'مشتریان'],
      ['moving-services', 'اسباب‌کشی', 'جابه‌جایی و زمان‌بندی', 'مشتری', 'مشتریان'],
      ['ac-service', 'سرویس کولر', 'نصب و تعمیر تأسیسات', 'مشتری', 'مشتریان'],
    ],
  },
  {
    basePack: 'DISTRIBUTION',
    icon: 'Route',
    items: [
      ['brand-agency', 'نمایندگی برند', 'منطقه فروش و سفارش', 'فروشگاه', 'فروشگاه‌ها'],
      ['route-sales', 'پخش مویرگی', 'ویزیتور، مسیر و تسویه', 'فروشگاه', 'فروشگاه‌ها'],
      ['distributor', 'توزیع‌کننده', 'انبار توزیع و سفارش فروشگاهی', 'فروشگاه', 'فروشگاه‌ها'],
    ],
  },
];

function buildSpecialty(
  batch: SpecialtyBatch,
  seed: SpecialtySeed,
  index: number,
): SpecialtyDefinition {
  const [id, label, description, customer, customers] = seed;
  const widgets = WIDGET_SETS[index % WIDGET_SETS.length]!.map((w) => ({
    ...w,
    title:
      w.key === 'core-customers' && w.title === 'مراجعان فعال'
        ? `${customers} فعال`
        : w.title,
  }));

  return {
    id,
    basePack: batch.basePack,
    label,
    description,
    icon: batch.icon,
    homePath: `/v/${id}`,
    labels: { customer, customers },
    widgets,
    tips: DEFAULT_TIPS,
  };
}

let buildIndex = 0;
const built = BATCHES.flatMap((batch) =>
  batch.items.map((seed) => buildSpecialty(batch, seed, buildIndex++)),
);

const SPECIALTY_OVERRIDES: Record<string, Partial<SpecialtyDefinition>> = {
  freelancer: {
    tips: [
      'هر صبح پروژه‌ها و فاکتورهای باز را چک کنید تا هیچ کارفرمایی معطل نماند.',
      'برای هر پروژه یک وظیفه با سررسید بسازید تا تحویل از دست نرود.',
      'لیدهای جدید را سریع پاسخ دهید؛ فرصت‌های فریلنسری زود از بین می‌روند.',
    ],
    widgets: [
      { key: 'clients', title: 'کارفرمایان فعال', metric: 'customers' },
      { key: 'open-inv', title: 'فاکتور باز', metric: 'openInvoices' },
      { key: 'opps', title: 'فرصت پروژه', metric: 'activeLeads' },
      { key: 'work', title: 'کارهای باز', metric: 'pendingTasks' },
    ],
  },
  'software-house': {
    tips: [
      'وضعیت پروژه‌ها و فاکتورهای معوق را هر روز مرور کنید.',
      'لیدهای فروش نرم‌افزار را در قیف نگه دارید تا تیم فروش عقب نیفتد.',
      'از اتاق فرمان برای اولویت‌های روزانه تیم استفاده کنید.',
    ],
    widgets: [
      { key: 'clients', title: 'مشتریان فعال', metric: 'customers' },
      { key: 'pipeline', title: 'لید فروش', metric: 'activeLeads' },
      { key: 'billing', title: 'فاکتور باز', metric: 'openInvoices' },
      { key: 'delivery', title: 'تسک تحویل', metric: 'pendingTasks' },
    ],
  },
  'general-business': {
    tips: [
      'داشبورد را برای فروش، مطالبات و وظایف امروز باز کنید.',
      'اگر بعداً تخصص دقیق‌تری داشتید، از تنظیمات سازمان یا سوپرادمین به‌روز کنید.',
    ],
  },
};

export const SPECIALTY_ENTRIES: SpecialtyDefinition[] = built.map((entry) => {
  const override = SPECIALTY_OVERRIDES[entry.id];
  return override ? { ...entry, ...override } : entry;
});

export const SPECIALTY_REGISTRY: Record<string, SpecialtyDefinition> = Object.fromEntries(
  SPECIALTY_ENTRIES.map((s) => [s.id, s]),
);

export function getSpecialty(id: string | null | undefined): SpecialtyDefinition | null {
  if (!id) return null;
  return SPECIALTY_REGISTRY[id] ?? null;
}

export function listSpecialties(): SpecialtyDefinition[] {
  return SPECIALTY_ENTRIES;
}

export function specialtiesByBasePack(pack: IndustryPackId): SpecialtyDefinition[] {
  return SPECIALTY_ENTRIES.filter((s) => s.basePack === pack);
}
