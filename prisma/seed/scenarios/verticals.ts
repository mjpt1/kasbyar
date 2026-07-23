import type { IndustryPack, PrismaClient } from '@prisma/client';

import { PIPELINE_STAGES_DEFAULT } from '../constants';
import type { SeedUsers } from '../types';
import {
  CLINIC_PRESETS,
  GENERAL_PRESETS,
  RETAIL_PRESETS,
} from './industry-presets';
import {
  seedBeautyPackData,
  seedClinicPackData,
  seedEducationPackData,
  seedFitnessPackData,
  seedFoodPackData,
  seedRealEstatePackData,
  seedRetailPackData,
  seedTravelPackData,
  seedWorkshopPackData,
  seedLawPackData,
  seedAccountingPackData,
  seedInsurancePackData,
  seedMarketingPackData,
  seedContractingPackData,
  seedPhotographyPackData,
  seedCleaningPackData,
  seedPrintingPackData,
} from './pack-extensions';
import {
  atHour,
  createInvoiceWithItems,
  createPayment,
  daysAgo,
  daysFromNow,
  endOfToday,
  invoiceNumber,
  startOfToday,
} from '../utils';

const YEAR = new Date().getFullYear();

interface VerticalConfig {
  slug: string;
  name: string;
  industryPack: IndustryPack;
  phone: string;
  email: string;
  address: string;
}

const SUBSCRIPTION_PRESETS: Record<string, { planCode: 'FREE' | 'STARTER' | 'BUSINESS'; status: 'ACTIVE' | 'TRIALING'; trialDays?: number }> = {
  'demo-retail': { planCode: 'STARTER', status: 'ACTIVE' },
  'demo-supermarket': { planCode: 'STARTER', status: 'ACTIVE' },
  'demo-pharmacy': { planCode: 'BUSINESS', status: 'ACTIVE' },
  'demo-clinic': { planCode: 'BUSINESS', status: 'TRIALING', trialDays: 7 },
  'demo-medical-office': { planCode: 'BUSINESS', status: 'ACTIVE' },
  'demo-hospital': { planCode: 'BUSINESS', status: 'ACTIVE' },
  'demo-treatment-center': { planCode: 'STARTER', status: 'ACTIVE' },
  'demo-travel': { planCode: 'FREE', status: 'ACTIVE' },
  'demo-contracting': { planCode: 'BUSINESS', status: 'ACTIVE' },
  'demo-education-center': { planCode: 'STARTER', status: 'ACTIVE' },
  'demo-beauty-salon': { planCode: 'STARTER', status: 'ACTIVE' },
  'demo-restaurant': { planCode: 'BUSINESS', status: 'ACTIVE' },
  'demo-cafe': { planCode: 'STARTER', status: 'ACTIVE' },
  'demo-bakery': { planCode: 'STARTER', status: 'ACTIVE' },
  'demo-mobile-shop': { planCode: 'BUSINESS', status: 'ACTIVE' },
  'demo-electronics-store': { planCode: 'BUSINESS', status: 'ACTIVE' },
  'demo-flower-shop': { planCode: 'STARTER', status: 'ACTIVE' },
  'demo-pet-shop': { planCode: 'STARTER', status: 'ACTIVE' },
  'demo-real-estate': { planCode: 'BUSINESS', status: 'ACTIVE' },
  'demo-law-office': { planCode: 'BUSINESS', status: 'ACTIVE' },
  'demo-accounting-office': { planCode: 'BUSINESS', status: 'ACTIVE' },
  'demo-gym': { planCode: 'STARTER', status: 'ACTIVE' },
  'demo-auto-repair': { planCode: 'STARTER', status: 'ACTIVE' },
};

const DEFAULT_SUBSCRIPTION_BY_PACK: Record<IndustryPack, { planCode: 'FREE' | 'STARTER' | 'BUSINESS'; status: 'ACTIVE' | 'TRIALING'; trialDays?: number }> = {
  GENERAL: { planCode: 'STARTER', status: 'ACTIVE' },
  CLINIC: { planCode: 'BUSINESS', status: 'TRIALING', trialDays: 7 },
  RETAIL: { planCode: 'STARTER', status: 'ACTIVE' },
  TRAVEL_AGENCY: { planCode: 'FREE', status: 'ACTIVE' },
  BEAUTY_SALON: { planCode: 'STARTER', status: 'ACTIVE' },
  FOOD_SERVICE: { planCode: 'STARTER', status: 'ACTIVE' },
  EDUCATION: { planCode: 'STARTER', status: 'ACTIVE' },
  FITNESS: { planCode: 'STARTER', status: 'ACTIVE' },
  REAL_ESTATE: { planCode: 'STARTER', status: 'ACTIVE' },
  WORKSHOP: { planCode: 'STARTER', status: 'ACTIVE' },
  LAW_FIRM: { planCode: 'BUSINESS', status: 'ACTIVE' },
  ACCOUNTING_FIRM: { planCode: 'BUSINESS', status: 'ACTIVE' },
  INSURANCE_AGENCY: { planCode: 'BUSINESS', status: 'ACTIVE' },
  MARKETING_AGENCY: { planCode: 'BUSINESS', status: 'ACTIVE' },
  CONTRACTING: { planCode: 'BUSINESS', status: 'ACTIVE' },
  PHOTOGRAPHY: { planCode: 'STARTER', status: 'ACTIVE' },
  CLEANING: { planCode: 'STARTER', status: 'ACTIVE' },
  PRINTING: { planCode: 'STARTER', status: 'ACTIVE' },
};

const VERTICALS: VerticalConfig[] = [
  {
    slug: 'demo-retail',
    name: 'فروشگاه پوشاک آرتین',
    industryPack: 'RETAIL',
    phone: '02144556677',
    email: 'info@artin-style.ir',
    address: 'تهران، بازار بزرگ، پاساژ نور، واحد ۲۱۴',
  },
  {
    slug: 'demo-clinic',
    name: 'کلینیک دندانپزشکی سپهر',
    industryPack: 'CLINIC',
    phone: '02177665544',
    email: 'info@sepehr-clinic.ir',
    address: 'تهران، سعادت‌آباد، میدان کاج، برج میلاد طبقه ۳',
  },
  {
    slug: 'demo-travel',
    name: 'آژانس مسافرتی آسمان آبی',
    industryPack: 'TRAVEL_AGENCY',
    phone: '02188990011',
    email: 'booking@asemanabi.ir',
    address: 'تهران، ولیعصر، نرسیده به پارک وی، پلاک ۸۹',
  },
  {
    slug: 'demo-medical-office',
    name: 'مطب دکتر نادری',
    industryPack: 'CLINIC',
    phone: '02122223344',
    email: 'office@nadery-med.ir',
    address: 'تهران، جردن، خیابان ناهید، پلاک ۱۲',
  },
  {
    slug: 'demo-hospital',
    name: 'بیمارستان مهر سلامت',
    industryPack: 'CLINIC',
    phone: '02133334455',
    email: 'info@mehrhospital.ir',
    address: 'تهران، بلوار کشاورز، خیابان قدس، پلاک ۳۲',
  },
  {
    slug: 'demo-treatment-center',
    name: 'درمانگاه امید',
    industryPack: 'CLINIC',
    phone: '02144445566',
    email: 'info@omid-treatment.ir',
    address: 'کرج، میدان سپاه، خیابان شهید بهشتی، پلاک ۴۷',
  },
  {
    slug: 'demo-supermarket',
    name: 'سوپرمارکت باران',
    industryPack: 'RETAIL',
    phone: '02155556677',
    email: 'info@baran-market.ir',
    address: 'تهران، صادقیه، خیابان گلستان، پلاک ۷',
  },
  {
    slug: 'demo-pharmacy',
    name: 'داروخانه درمان-یار',
    industryPack: 'RETAIL',
    phone: '02166667788',
    email: 'info@darmanyar-pharmacy.ir',
    address: 'تهران، نارمک، خیابان ثانی، پلاک ۲۱',
  },
  {
    slug: 'demo-contracting',
    name: 'پیمانکاری سازه-گستر',
    industryPack: 'CONTRACTING',
    phone: '02177778899',
    email: 'info@sazegostar-co.ir',
    address: 'تهران، شهرک غرب، بلوار دادمان، پلاک ۱۰۳',
  },
  {
    slug: 'demo-education-center',
    name: 'آموزشگاه مهارت-افزا',
    industryPack: 'EDUCATION',
    phone: '02188889911',
    email: 'info@maharatafza.ir',
    address: 'تهران، ونک، خیابان ملاصدرا، پلاک ۵۱',
  },
  {
    slug: 'demo-beauty-salon',
    name: 'سالن زیبایی ماه-چهره',
    industryPack: 'BEAUTY_SALON',
    phone: '02188991122',
    email: 'hello@mahchehre-salon.ir',
    address: 'تهران، پاسداران، بوستان هشتم، پلاک ۱۴',
  },
  {
    slug: 'demo-restaurant',
    name: 'رستوران شبستان',
    industryPack: 'FOOD_SERVICE',
    phone: '02177112233',
    email: 'info@shabestan-food.ir',
    address: 'تهران، یوسف\u200cآباد، خیابان ۳۳، پلاک ۱۸',
  },
  {
    slug: 'demo-cafe',
    name: 'کافه روشنه',
    industryPack: 'FOOD_SERVICE',
    phone: '02177223344',
    email: 'hello@rosheneh-cafe.ir',
    address: 'تهران، کریمخان، خیابان خردمند، پلاک ۲۵',
  },
  {
    slug: 'demo-bakery',
    name: 'قنادی نان و نبات',
    industryPack: 'FOOD_SERVICE',
    phone: '02177334455',
    email: 'orders@nannonabat.ir',
    address: 'تهران، پونک، بلوار عدل، پلاک ۴۹',
  },
  {
    slug: 'demo-mobile-shop',
    name: 'موبایل سنتر پایتخت',
    industryPack: 'RETAIL',
    phone: '02177445566',
    email: 'sales@paytakht-mobile.ir',
    address: 'تهران، جمهوری، پاساژ علاءالدین، طبقه ۲',
  },
  {
    slug: 'demo-electronics-store',
    name: 'دیجیتال پارس',
    industryPack: 'RETAIL',
    phone: '02177556677',
    email: 'info@digitalpars.ir',
    address: 'تهران، لاله\u200cزار، پلاک ۷۲',
  },
  {
    slug: 'demo-flower-shop',
    name: 'گل\u200cفروشی بهارستان',
    industryPack: 'RETAIL',
    phone: '02177667788',
    email: 'hello@baharestan-flowers.ir',
    address: 'تهران، هفت\u200cتیر، خیابان مفتح، پلاک ۱۵',
  },
  {
    slug: 'demo-pet-shop',
    name: 'پت\u200cشاپ پاپی',
    industryPack: 'RETAIL',
    phone: '02177778890',
    email: 'support@puppy-pet.ir',
    address: 'تهران، مرزداران، خیابان ایثار، پلاک ۱۰',
  },
  {
    slug: 'demo-real-estate',
    name: 'املاک آسمان',
    industryPack: 'REAL_ESTATE',
    phone: '02177889911',
    email: 'info@aseman-melk.ir',
    address: 'تهران، ستارخان، خیابان پاتریس، پلاک ۳۱',
  },
  {
    slug: 'demo-law-office',
    name: 'دفتر حقوقی دادآور',
    industryPack: 'LAW_FIRM',
    phone: '02177991122',
    email: 'office@dadavar-law.ir',
    address: 'تهران، ونک، خیابان برزیل غربی، پلاک ۱۲',
  },
  {
    slug: 'demo-accounting-office',
    name: 'حساب\u200cیاران تراز',
    industryPack: 'ACCOUNTING_FIRM',
    phone: '02178112233',
    email: 'info@taraz-accounting.ir',
    address: 'تهران، مطهری، خیابان سرافراز، پلاک ۲۲',
  },
  {
    slug: 'demo-gym',
    name: 'باشگاه انرژی+',
    industryPack: 'FITNESS',
    phone: '02178223344',
    email: 'hello@energyplus-gym.ir',
    address: 'تهران، تهرانپارس، خیابان جشنواره، پلاک ۶۰',
  },
  {
    slug: 'demo-auto-repair',
    name: 'تعمیرگاه چابک',
    industryPack: 'WORKSHOP',
    phone: '02178334455',
    email: 'service@chabok-auto.ir',
    address: 'تهران، جاده قدیم کرج، خیابان فتح، پلاک ۸۸',
  },
  {
    slug: 'demo-optician',
    name: 'اپتیک دیدآور',
    industryPack: 'RETAIL',
    phone: '02178445566',
    email: 'info@didavar-optic.ir',
    address: 'تهران، ولیعصر، بالاتر از فاطمی، پلاک ۴۴',
  },
  {
    slug: 'demo-stationery-store',
    name: 'نوشت‌افزار مهر',
    industryPack: 'RETAIL',
    phone: '02178556677',
    email: 'hello@mehr-stationery.ir',
    address: 'تهران، هروی، خیابان وفامنش، پلاک ۱۹',
  },
  {
    slug: 'demo-bookstore',
    name: 'کتاب‌فروشی فرهنگ',
    industryPack: 'RETAIL',
    phone: '02178667788',
    email: 'sales@farhang-book.ir',
    address: 'تهران، انقلاب، روبه‌روی دانشگاه تهران، پلاک ۱۲۸',
  },
  {
    slug: 'demo-hardware-store',
    name: 'ابزارسرا',
    industryPack: 'RETAIL',
    phone: '02178778899',
    email: 'info@abzarsara.ir',
    address: 'تهران، حسن‌آباد، خیابان وحدت اسلامی، پلاک ۸',
  },
  {
    slug: 'demo-cosmetics-store',
    name: 'زیبانگار',
    industryPack: 'RETAIL',
    phone: '02178889910',
    email: 'hello@zibanegar.ir',
    address: 'تهران، تجریش، خیابان مقصودبیک، پلاک ۳۷',
  },
  {
    slug: 'demo-tailor-shop',
    name: 'مزون نقش',
    industryPack: 'WORKSHOP',
    phone: '02178991121',
    email: 'info@naghsh-maison.ir',
    address: 'تهران، ونک، خیابان خدامی، پلاک ۹',
  },
  {
    slug: 'demo-jewelry-store',
    name: 'جواهری زرین',
    industryPack: 'RETAIL',
    phone: '02179012232',
    email: 'gold@zarrin-jewelry.ir',
    address: 'تهران، بازار زرگرها، پاساژ طلا، واحد ۱۱',
  },
  {
    slug: 'demo-cleaning-services',
    name: 'پاک‌خانه',
    industryPack: 'CLEANING',
    phone: '02179123343',
    email: 'ops@pakkhaneh.ir',
    address: 'تهران، صادقیه، بلوار فردوس، پلاک ۵۵',
  },
  {
    slug: 'demo-marketing-agency',
    name: 'رشدنو',
    industryPack: 'MARKETING_AGENCY',
    phone: '02179234454',
    email: 'hello@roshdno.ir',
    address: 'تهران، میرداماد، خیابان نفت شمالی، پلاک ۲۴',
  },
  {
    slug: 'demo-printing-shop',
    name: 'چاپ‌خانه رنگین',
    industryPack: 'PRINTING',
    phone: '02179345565',
    email: 'print@ranginprint.ir',
    address: 'تهران، جمهوری، خیابان رازی، پلاک ۷۰',
  },
  {
    slug: 'demo-insurance-agency',
    name: 'بیمه‌یار',
    industryPack: 'INSURANCE_AGENCY',
    phone: '02179456676',
    email: 'info@bimehyar.ir',
    address: 'تهران، سیدخندان، خیابان دبستان، پلاک ۳۶',
  },
  {
    slug: 'demo-appliance-repair',
    name: 'خانه‌ساز سرویس',
    industryPack: 'WORKSHOP',
    phone: '02179567787',
    email: 'service@khanehsaz.ir',
    address: 'تهران، آریاشهر، خیابان کاشانی، پلاک ۱۰۱',
  },
  {
    slug: 'demo-photography-studio',
    name: 'آتلیه نور',
    industryPack: 'PHOTOGRAPHY',
    phone: '02179678898',
    email: 'booking@noor-studio.ir',
    address: 'تهران، بلوار فردوس شرق، پلاک ۲۸',
  },
  {
    slug: 'demo-daycare-center',
    name: 'مهد ستاره‌ها',
    industryPack: 'EDUCATION',
    phone: '02179789909',
    email: 'info@setareha-kindergarten.ir',
    address: 'تهران، پیروزی، خیابان پنجم نیروهوایی، پلاک ۶۶',
  },
  {
    slug: 'demo-computer-service',
    name: 'فناوران سیستم',
    industryPack: 'WORKSHOP',
    phone: '02179890010',
    email: 'support@fanavaran-system.ir',
    address: 'تهران، جلال آل‌احمد، خیابان کارگر شمالی، پلاک ۱۷۴',
  },
  {
    slug: 'demo-veterinary-clinic',
    name: 'دامپزشکی مهربان',
    industryPack: 'CLINIC',
    phone: '02179901121',
    email: 'hello@mehraban-vet.ir',
    address: 'تهران، نیاوران، خیابان باهنر، پلاک ۸۵',
  },
];

/** Default specialty dashboard per demo vertical (matches business name in seed). */
const DEMO_SPECIALTY_BY_SLUG: Record<string, string> = {
  'demo-retail': 'clothing-store',
  'demo-clinic': 'dental-clinic',
  'demo-travel': 'tour-agency',
  'demo-medical-office': 'medical-office',
  'demo-hospital': 'hospital',
  'demo-treatment-center': 'treatment-center',
  'demo-supermarket': 'supermarket',
  'demo-pharmacy': 'pharmacy',
  'demo-contracting': 'contracting',
  'demo-education-center': 'education-center',
  'demo-beauty-salon': 'beauty-salon',
  'demo-restaurant': 'restaurant',
  'demo-cafe': 'cafe',
  'demo-bakery': 'bakery',
  'demo-mobile-shop': 'mobile-shop',
  'demo-electronics-store': 'electronics-store',
  'demo-flower-shop': 'flower-shop',
  'demo-pet-shop': 'pet-shop',
  'demo-real-estate': 'real-estate',
  'demo-law-office': 'law-office',
  'demo-accounting-office': 'accounting-office',
  'demo-gym': 'gym',
  'demo-auto-repair': 'auto-repair',
  'demo-optician': 'optician',
  'demo-stationery-store': 'stationery-store',
  'demo-bookstore': 'bookstore',
  'demo-hardware-store': 'hardware-store',
  'demo-cosmetics-store': 'cosmetics-store',
  'demo-tailor-shop': 'tailor-shop',
  'demo-jewelry-store': 'jewelry-store',
  'demo-cleaning-services': 'cleaning-services',
  'demo-marketing-agency': 'marketing-agency',
  'demo-printing-shop': 'printing-shop',
  'demo-insurance-agency': 'insurance-agency',
  'demo-appliance-repair': 'appliance-repair',
  'demo-photography-studio': 'photography-studio',
  'demo-daycare-center': 'daycare-center',
  'demo-computer-service': 'computer-service',
  'demo-veterinary-clinic': 'veterinary-clinic',
};

export async function seedVerticalWorkspaces(
  prisma: PrismaClient,
  users: SeedUsers,
): Promise<void> {
  for (const config of VERTICALS) {
    await seedVertical(prisma, users, config);
  }
}

async function seedVertical(
  prisma: PrismaClient,
  users: SeedUsers,
  config: VerticalConfig,
): Promise<void> {
  const { owner, superAdmin } = users;

  const organization = await prisma.organization.create({
    data: {
      name: config.name,
      slug: config.slug,
      industryPack: config.industryPack,
      industrySpecialty: DEMO_SPECIALTY_BY_SLUG[config.slug] ?? null,
      isDemo: true,
      phone: config.phone,
      email: config.email,
      address: config.address,
      workspaces: {
        create: { name: 'شعبه اصلی', slug: 'main', isDefault: true },
      },
      memberships: {
        create: [
          { userId: owner.id, role: 'OWNER' },
          { userId: superAdmin.id, role: 'OWNER' },
        ],
      },
      pipelineStages: {
        create: PIPELINE_STAGES_DEFAULT.map((s) => ({ ...s })),
      },
    },
    include: { pipelineStages: { orderBy: { order: 'asc' } } },
  });

  const orgId = organization.id;
  const stages = organization.pipelineStages;
  let invoiceSeq = 1;

  if (config.industryPack === 'RETAIL') {
    const preset = RETAIL_PRESETS[config.slug] ?? RETAIL_PRESETS['demo-retail']!;
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          organizationId: orgId,
          name: preset.customerNames[0],
          phone: '09131112233',
          city: preset.customerCities[0],
          createdAt: daysAgo(60),
        },
      }),
      prisma.customer.create({
        data: {
          organizationId: orgId,
          name: preset.customerNames[1],
          company: preset.secondCustomerCompany,
          phone: '09132223344',
          city: preset.customerCities[1],
          createdAt: daysAgo(20),
        },
      }),
      prisma.customer.create({
        data: {
          organizationId: orgId,
          name: preset.customerNames[2],
          phone: '09133334455',
          city: preset.customerCities[2],
          isActive: false,
          createdAt: daysAgo(120),
        },
      }),
    ]);

    const products = await Promise.all([
      prisma.product.create({
        data: {
          organizationId: orgId,
          name: preset.productNames[0],
          sku: preset.productSkus[0],
          unitPrice: preset.productPrices[0],
          stockQty: preset.productStocks[0],
        },
      }),
      prisma.product.create({
        data: {
          organizationId: orgId,
          name: preset.productNames[1],
          sku: preset.productSkus[1],
          unitPrice: preset.productPrices[1],
          stockQty: preset.productStocks[1],
        },
      }),
    ]);

    await prisma.lead.createMany({
      data: [
        {
          organizationId: orgId,
          stageId: stages[0]!.id,
          title: preset.leadTitle,
          status: 'NEW',
          source: 'INSTAGRAM',
          contactName: 'نگین صالحی',
          contactPhone: '09134445566',
          value: 48000000,
          nextFollowUpAt: daysFromNow(2),
        },
        {
          organizationId: orgId,
          customerId: customers[1]!.id,
          stageId: stages[2]!.id,
          title: preset.renewalTitle,
          status: 'PROPOSAL',
          source: 'REFERRAL',
          value: 25000000,
          lastContactAt: daysAgo(3),
          nextFollowUpAt: startOfToday(),
        },
      ],
    });

    const invPaid = await createInvoiceWithItems(prisma, {
      organizationId: orgId,
      customerId: customers[0]!.id,
      number: invoiceNumber(YEAR, invoiceSeq++),
      status: 'PAID',
      issueDate: daysAgo(7),
      dueDate: daysAgo(1),
      paidAmount: preset.productPrices[0] + preset.productPrices[1],
      items: [
        {
          description: preset.paidInvoiceDescription,
          quantity: 1,
          unitPrice: preset.productPrices[0],
          productId: products[0]!.id,
        },
        {
          description: preset.productNames[1],
          quantity: 1,
          unitPrice: preset.productPrices[1],
          productId: products[1]!.id,
        },
      ],
    });

    await createPayment(prisma, {
      organizationId: orgId,
      customerId: customers[0]!.id,
      invoiceId: invPaid.id,
      amount: preset.productPrices[0] + preset.productPrices[1],
      method: 'CARD',
      paidAt: daysAgo(5),
    });

    await createInvoiceWithItems(prisma, {
      organizationId: orgId,
      customerId: customers[1]!.id,
      number: invoiceNumber(YEAR, invoiceSeq++),
      status: 'OVERDUE',
      issueDate: daysAgo(30),
      dueDate: daysAgo(5),
      paidAmount: 0,
      items: [
        {
          description: preset.overdueInvoiceDescription,
          quantity: 10,
          unitPrice: Math.max(100000, Math.round(preset.productPrices[0] * 0.87)),
          productId: products[0]!.id,
        },
      ],
    });

    await prisma.task.createMany({
      data: [
        {
          organizationId: orgId,
          assigneeId: owner.id,
          title: preset.taskTitles[0],
          priority: 'MEDIUM',
          dueDate: daysFromNow(5),
        },
        {
          organizationId: orgId,
          title: preset.taskTitles[1],
          priority: 'HIGH',
          status: 'TODO',
          dueDate: endOfToday(),
        },
      ],
    });

    await seedRetailPackData(prisma, orgId, [products[0]!.id, products[1]!.id], config.slug);
  }

  if (config.industryPack === 'CLINIC') {
    const preset = CLINIC_PRESETS[config.slug] ?? CLINIC_PRESETS['demo-clinic']!;
    const patients = await Promise.all([
      prisma.customer.create({
        data: {
          organizationId: orgId,
          name: preset.patientNames[0],
          company: 'مشتری شخصی',
          phone: '09136667788',
          city: preset.patientCities[0],
        },
      }),
      prisma.customer.create({
        data: {
          organizationId: orgId,
          name: preset.patientNames[1],
          phone: '09137778899',
          city: preset.patientCities[1],
          notes: preset.patientNote,
        },
      }),
      prisma.customer.create({
        data: {
          organizationId: orgId,
          name: preset.patientNames[2],
          phone: '09138889900',
          city: preset.patientCities[2],
        },
      }),
    ]);

    const services = await Promise.all([
      prisma.service.create({
        data: {
          organizationId: orgId,
          name: preset.serviceNames[0],
          unitPrice: preset.servicePrices[0],
          durationMin: 30,
        },
      }),
      prisma.service.create({
        data: {
          organizationId: orgId,
          name: preset.serviceNames[1],
          unitPrice: preset.servicePrices[1],
          durationMin: 45,
        },
      }),
      prisma.service.create({
        data: {
          organizationId: orgId,
          name: preset.serviceNames[2],
          unitPrice: preset.servicePrices[2],
          durationMin: 90,
        },
      }),
    ]);

    await prisma.lead.createMany({
      data: [
        {
          organizationId: orgId,
          stageId: stages[1]!.id,
          title: preset.leadTitle,
          status: 'CONTACTED',
          source: 'WHATSAPP',
          contactName: 'سارا امینی',
          contactPhone: '09139990011',
          value: 35000000,
          nextFollowUpAt: daysFromNow(1),
        },
        {
          organizationId: orgId,
          stageId: stages[4]!.id,
          title: preset.wonLeadTitle,
          status: 'WON',
          source: 'REFERRAL',
          customerId: patients[1]!.id,
          value: preset.servicePrices[2],
          wonAt: daysAgo(20),
        },
      ],
    });

    const invPartial = await createInvoiceWithItems(prisma, {
      organizationId: orgId,
      customerId: patients[1]!.id,
      number: invoiceNumber(YEAR, invoiceSeq++),
      status: 'PARTIAL',
      issueDate: daysAgo(25),
      dueDate: daysFromNow(10),
      paidAmount: 20000000,
      notes: `پیش‌پرداخت ${preset.serviceNames[2]}`,
      items: [
        {
          description: preset.serviceNames[2],
          quantity: 1,
          unitPrice: preset.servicePrices[2],
          serviceId: services[2]!.id,
        },
      ],
    });

    await createPayment(prisma, {
      organizationId: orgId,
      customerId: patients[1]!.id,
      invoiceId: invPartial.id,
      amount: 20000000,
      method: 'TRANSFER',
      paidAt: daysAgo(22),
      reference: 'CLN-2201',
    });

    await createInvoiceWithItems(prisma, {
      organizationId: orgId,
      customerId: patients[2]!.id,
      number: invoiceNumber(YEAR, invoiceSeq++),
      status: 'SENT',
      issueDate: daysAgo(3),
      dueDate: daysFromNow(7),
      items: [
        {
          description: preset.serviceNames[1],
          quantity: 1,
          unitPrice: preset.servicePrices[1],
          serviceId: services[1]!.id,
        },
      ],
    });

    await prisma.reminder.create({
      data: {
        organizationId: orgId,
        userId: owner.id,
        title: preset.reminderTitle,
        message: preset.reminderMessage,
        remindAt: atHour(daysFromNow(3), 9),
      },
    });

    await prisma.activityLog.createMany({
      data: [
        {
          organizationId: orgId,
          userId: owner.id,
          type: 'PAYMENT',
          title: 'پیش‌پرداخت دریافت شد',
          description: `۲۰٬۰۰۰٬۰۰۰ ریال — ${preset.patientNames[1]}`,
          customerId: patients[1]!.id,
          createdAt: daysAgo(22),
        },
        {
          organizationId: orgId,
          userId: owner.id,
          type: 'INVOICE',
          title: 'فاکتور صادر شد',
          customerId: patients[2]!.id,
          createdAt: daysAgo(3),
        },
      ],
    });

    await seedClinicPackData(
      prisma,
      orgId,
      [patients[0]!.id, patients[1]!.id, patients[2]!.id],
      owner.id,
      config.slug,
    );
  }

  if (config.industryPack === 'TRAVEL_AGENCY') {
    const clients = await Promise.all([
      prisma.customer.create({
        data: {
          organizationId: orgId,
          name: 'خانواده رستمی',
          phone: '09135556677',
          city: 'تهران',
          notes: 'تور دبی — ۴ نفر',
        },
      }),
      prisma.customer.create({
        data: {
          organizationId: orgId,
          name: 'شرکت فناوران صنعت',
          company: 'فناوران صنعت',
          phone: '02133445566',
          city: 'تهران',
        },
      }),
    ]);

    const services = await Promise.all([
      prisma.service.create({
        data: {
          organizationId: orgId,
          name: 'تور ۵ شب دبی',
          unitPrice: 42000000,
          durationMin: 0,
          description: 'شامل پرواز + هتل ۴ستاره',
        },
      }),
      prisma.service.create({
        data: {
          organizationId: orgId,
          name: 'ویزای شینگن توریستی',
          unitPrice: 8500000,
          durationMin: 0,
        },
      }),
    ]);

    await prisma.lead.createMany({
      data: [
        {
          organizationId: orgId,
          stageId: stages[0]!.id,
          title: 'تور استانبول نوروز',
          status: 'NEW',
          source: 'TELEGRAM',
          contactName: 'حامد قاسمی',
          contactPhone: '09136667700',
          value: 168000000,
          nextFollowUpAt: daysFromNow(1),
        },
        {
          organizationId: orgId,
          stageId: stages[1]!.id,
          title: 'ویزای کاری آلمان',
          status: 'QUALIFIED',
          source: 'PHONE',
          contactName: 'مهسا کریمی',
          value: 25000000,
          lastContactAt: daysAgo(12),
          nextFollowUpAt: daysAgo(2),
        },
      ],
    });

    const invPaid = await createInvoiceWithItems(prisma, {
      organizationId: orgId,
      customerId: clients[0]!.id,
      number: invoiceNumber(YEAR, invoiceSeq++),
      status: 'PAID',
      issueDate: daysAgo(14),
      dueDate: daysAgo(7),
      paidAmount: 168000000,
      items: [
        {
          description: 'تور ۵ شب دبی — ۴ نفر',
          quantity: 4,
          unitPrice: 42000000,
          serviceId: services[0]!.id,
        },
      ],
    });

    await createPayment(prisma, {
      organizationId: orgId,
      customerId: clients[0]!.id,
      invoiceId: invPaid.id,
      amount: 168000000,
      method: 'TRANSFER',
      paidAt: daysAgo(10),
      reference: 'TRV-9901',
    });

    const invPartial = await createInvoiceWithItems(prisma, {
      organizationId: orgId,
      customerId: clients[1]!.id,
      number: invoiceNumber(YEAR, invoiceSeq++),
      status: 'PARTIAL',
      issueDate: daysAgo(5),
      dueDate: daysFromNow(15),
      paidAmount: 8500000,
      items: [
        {
          description: 'ویزای شینگن — ۲ نفر',
          quantity: 2,
          unitPrice: 8500000,
          serviceId: services[1]!.id,
        },
      ],
    });

    await createPayment(prisma, {
      organizationId: orgId,
      customerId: clients[1]!.id,
      invoiceId: invPartial.id,
      amount: 8500000,
      method: 'TRANSFER',
      paidAt: daysAgo(4),
      reference: 'TRV-9902',
    });

    await prisma.task.create({
      data: {
        organizationId: orgId,
        assigneeId: owner.id,
        title: 'تأیید پرواز خانواده رستمی',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        dueDate: endOfToday(),
      },
    });

    await prisma.automationRule.create({
      data: {
        organizationId: orgId,
        name: 'یادآوری سررسید پیش‌پرداخت تور',
        trigger: 'INVOICE_OVERDUE',
        action: 'CREATE_TASK',
        description: 'پیگیری مانده حساب تورها',
        isActive: true,
      },
    });

    await seedTravelPackData(prisma, orgId, [clients[0]!.id, clients[1]!.id]);
  }

  const GENERAL_CORE_PACKS: IndustryPack[] = [
    'GENERAL',
    'BEAUTY_SALON',
    'FOOD_SERVICE',
    'EDUCATION',
    'FITNESS',
    'REAL_ESTATE',
    'WORKSHOP',
    'LAW_FIRM',
    'ACCOUNTING_FIRM',
    'INSURANCE_AGENCY',
    'MARKETING_AGENCY',
    'CONTRACTING',
    'PHOTOGRAPHY',
    'CLEANING',
    'PRINTING',
  ];

  if (GENERAL_CORE_PACKS.includes(config.industryPack)) {
    const preset = GENERAL_PRESETS[config.slug] ?? GENERAL_PRESETS['demo-contracting']!;
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          organizationId: orgId,
          name: preset.firstCustomerName,
          company: preset.firstCustomerCompany,
          phone: '09135556677',
          city: preset.firstCustomerCity,
          createdAt: daysAgo(50),
        },
      }),
      prisma.customer.create({
        data: {
          organizationId: orgId,
          name: preset.secondCustomerName,
          phone: '09136667788',
          city: preset.secondCustomerCity,
          createdAt: daysAgo(18),
        },
      }),
    ]);

    await prisma.lead.createMany({
      data: [
        {
          organizationId: orgId,
          customerId: customers[0]!.id,
          stageId: stages[1]!.id,
          title: preset.leadTitles[0],
          status: 'CONTACTED',
          source: 'REFERRAL',
          value: 98000000,
          nextFollowUpAt: daysFromNow(2),
        },
        {
          organizationId: orgId,
          stageId: stages[2]!.id,
          title: preset.leadTitles[1],
          status: 'PROPOSAL',
          source: 'WEBSITE',
          contactName: 'الناز صمدی',
          contactPhone: '09137778899',
          value: 56000000,
          nextFollowUpAt: startOfToday(),
        },
      ],
    });

    const invoice = await createInvoiceWithItems(prisma, {
      organizationId: orgId,
      customerId: customers[0]!.id,
      number: invoiceNumber(YEAR, invoiceSeq++),
      status: 'PARTIAL',
      issueDate: daysAgo(15),
      dueDate: daysFromNow(7),
      paidAmount: preset.paidAmount,
      items: [
        {
          description: preset.invoiceDescription,
          quantity: 1,
          unitPrice: preset.invoiceAmount,
        },
      ],
    });

    await createPayment(prisma, {
      organizationId: orgId,
      customerId: customers[0]!.id,
      invoiceId: invoice.id,
      amount: preset.paidAmount,
      method: 'TRANSFER',
      paidAt: daysAgo(4),
    });

    await prisma.task.createMany({
      data: [
        {
          organizationId: orgId,
          assigneeId: owner.id,
          title: preset.taskTitles[0],
          priority: 'HIGH',
          dueDate: endOfToday(),
        },
        {
          organizationId: orgId,
          title: preset.taskTitles[1],
          priority: 'MEDIUM',
          dueDate: daysFromNow(3),
        },
      ],
    });

    const customerIds = [customers[0]!.id, customers[1]!.id];
    if (config.industryPack === 'BEAUTY_SALON') {
      await seedBeautyPackData(prisma, orgId, customerIds);
    } else if (config.industryPack === 'FOOD_SERVICE') {
      await seedFoodPackData(prisma, orgId, customerIds);
    } else if (config.industryPack === 'EDUCATION') {
      await seedEducationPackData(prisma, orgId, customerIds);
    } else if (config.industryPack === 'FITNESS') {
      await seedFitnessPackData(prisma, orgId, customerIds);
    } else if (config.industryPack === 'REAL_ESTATE') {
      await seedRealEstatePackData(prisma, orgId, customerIds);
    } else if (config.industryPack === 'WORKSHOP') {
      await seedWorkshopPackData(prisma, orgId, customerIds);
    } else if (config.industryPack === 'LAW_FIRM') {
      await seedLawPackData(prisma, orgId, customerIds);
    } else if (config.industryPack === 'ACCOUNTING_FIRM') {
      await seedAccountingPackData(prisma, orgId, customerIds);
    } else if (config.industryPack === 'INSURANCE_AGENCY') {
      await seedInsurancePackData(prisma, orgId, customerIds);
    } else if (config.industryPack === 'MARKETING_AGENCY') {
      await seedMarketingPackData(prisma, orgId, customerIds);
    } else if (config.industryPack === 'CONTRACTING') {
      await seedContractingPackData(prisma, orgId, customerIds);
    } else if (config.industryPack === 'PHOTOGRAPHY') {
      await seedPhotographyPackData(prisma, orgId, customerIds);
    } else if (config.industryPack === 'CLEANING') {
      await seedCleaningPackData(prisma, orgId, customerIds);
    } else if (config.industryPack === 'PRINTING') {
      await seedPrintingPackData(prisma, orgId, customerIds);
    }
  }

  await prisma.activityLog.create({
    data: {
      organizationId: orgId,
      userId: owner.id,
      type: 'SYSTEM',
      title: `داده نمونه ${config.name}`,
      description: 'محیط دمو عمودی کسب‌یار',
      createdAt: daysAgo(0),
    },
  });

  const { seedOrganizationSubscription } = await import('../billing');
  const subscription = SUBSCRIPTION_PRESETS[config.slug] ?? DEFAULT_SUBSCRIPTION_BY_PACK[config.industryPack];
  if (subscription) {
    await seedOrganizationSubscription(prisma, orgId, subscription);
  }
}
