import type { IndustryPack, PrismaClient } from '@prisma/client';

import { PIPELINE_STAGES_DEFAULT } from '../constants';
import type { SeedUsers } from '../types';
import {
  seedClinicPackData,
  seedRetailPackData,
  seedTravelPackData,
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
];

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
  const { owner } = users;

  const organization = await prisma.organization.create({
    data: {
      name: config.name,
      slug: config.slug,
      industryPack: config.industryPack,
      isDemo: true,
      phone: config.phone,
      email: config.email,
      address: config.address,
      workspaces: {
        create: { name: 'شعبه اصلی', slug: 'main', isDefault: true },
      },
      memberships: {
        create: { userId: owner.id, role: 'OWNER' },
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
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          organizationId: orgId,
          name: 'لیلا فرهمند',
          phone: '09131112233',
          city: 'تهران',
          createdAt: daysAgo(60),
        },
      }),
      prisma.customer.create({
        data: {
          organizationId: orgId,
          name: 'بوتیک ماهان',
          company: 'ماهان استایل',
          phone: '09132223344',
          city: 'اصفهان',
          createdAt: daysAgo(20),
        },
      }),
      prisma.customer.create({
        data: {
          organizationId: orgId,
          name: 'پریسا نادری',
          phone: '09133334455',
          city: 'شیراز',
          isActive: false,
          createdAt: daysAgo(120),
        },
      }),
    ]);

    const products = await Promise.all([
      prisma.product.create({
        data: {
          organizationId: orgId,
          name: 'مانتو کتی زنانه',
          sku: 'RT-101',
          unitPrice: 3200000,
          stockQty: 45,
        },
      }),
      prisma.product.create({
        data: {
          organizationId: orgId,
          name: 'شلوار جین مردانه',
          sku: 'RT-202',
          unitPrice: 1850000,
          stockQty: 80,
        },
      }),
    ]);

    await prisma.lead.createMany({
      data: [
        {
          organizationId: orgId,
          stageId: stages[0]!.id,
          title: 'سفارش عمده مانتو پاییزه',
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
          title: 'تمدید قرارداد نمایندگی',
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
      paidAmount: 5050000,
      items: [
        {
          description: 'مانتو کتی زنانه',
          quantity: 1,
          unitPrice: 3200000,
          productId: products[0]!.id,
        },
        {
          description: 'شلوار جین مردانه',
          quantity: 1,
          unitPrice: 1850000,
          productId: products[1]!.id,
        },
      ],
    });

    await createPayment(prisma, {
      organizationId: orgId,
      customerId: customers[0]!.id,
      invoiceId: invPaid.id,
      amount: 5050000,
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
          description: 'مانتو کتی زنانه — عمده',
          quantity: 10,
          unitPrice: 2800000,
          productId: products[0]!.id,
        },
      ],
    });

    await prisma.task.createMany({
      data: [
        {
          organizationId: orgId,
          assigneeId: owner.id,
          title: 'انبارگردانی پایان فصل',
          priority: 'MEDIUM',
          dueDate: daysFromNow(5),
        },
        {
          organizationId: orgId,
          title: 'پیگیری بدهی بوتیک ماهان',
          priority: 'HIGH',
          status: 'TODO',
          dueDate: endOfToday(),
        },
      ],
    });

    await seedRetailPackData(prisma, orgId, [products[0]!.id, products[1]!.id]);
  }

  if (config.industryPack === 'CLINIC') {
    const patients = await Promise.all([
      prisma.customer.create({
        data: {
          organizationId: orgId,
          name: 'دکتر آرش میرزایی',
          company: 'مشتری شخصی',
          phone: '09136667788',
          city: 'تهران',
        },
      }),
      prisma.customer.create({
        data: {
          organizationId: orgId,
          name: 'فاطمه حیدری',
          phone: '09137778899',
          city: 'کرج',
          notes: 'ایمپلنت — دو جلسه باقی‌مانده',
        },
      }),
      prisma.customer.create({
        data: {
          organizationId: orgId,
          name: 'محمد جوادی',
          phone: '09138889900',
          city: 'تهران',
        },
      }),
    ]);

    const services = await Promise.all([
      prisma.service.create({
        data: {
          organizationId: orgId,
          name: 'معاینه و مشاوره',
          unitPrice: 850000,
          durationMin: 30,
        },
      }),
      prisma.service.create({
        data: {
          organizationId: orgId,
          name: 'جرم‌گیری و بروساژ',
          unitPrice: 1200000,
          durationMin: 45,
        },
      }),
      prisma.service.create({
        data: {
          organizationId: orgId,
          name: 'ایمپلنت دندان',
          unitPrice: 45000000,
          durationMin: 90,
        },
      }),
    ]);

    await prisma.lead.createMany({
      data: [
        {
          organizationId: orgId,
          stageId: stages[1]!.id,
          title: 'درخواست مشاوره ارتودنسی',
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
          title: 'طرح درمان ایمپلنت',
          status: 'WON',
          source: 'REFERRAL',
          customerId: patients[1]!.id,
          value: 45000000,
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
      notes: 'پیش‌پرداخت ایمپلنت',
      items: [
        {
          description: 'ایمپلنت دندان',
          quantity: 1,
          unitPrice: 45000000,
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
          description: 'جرم‌گیری و بروساژ',
          quantity: 1,
          unitPrice: 1200000,
          serviceId: services[1]!.id,
        },
      ],
    });

    await prisma.reminder.create({
      data: {
        organizationId: orgId,
        userId: owner.id,
        title: 'یادآوری نوبت فاطمه حیدری',
        message: 'جلسه دوم ایمپلنت',
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
          description: '۲۰٬۰۰۰٬۰۰۰ ریال — فاطمه حیدری',
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
  if (config.industryPack === 'RETAIL') {
    await seedOrganizationSubscription(prisma, orgId, {
      planCode: 'STARTER',
      status: 'ACTIVE',
    });
  } else if (config.industryPack === 'CLINIC') {
    await seedOrganizationSubscription(prisma, orgId, {
      planCode: 'BUSINESS',
      status: 'TRIALING',
      trialDays: 7,
    });
  } else if (config.industryPack === 'TRAVEL_AGENCY') {
    await seedOrganizationSubscription(prisma, orgId, {
      planCode: 'FREE',
      status: 'ACTIVE',
    });
  }
}
