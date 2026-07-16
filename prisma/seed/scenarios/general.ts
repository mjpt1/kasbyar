import type { PrismaClient } from '@prisma/client';

import { PIPELINE_STAGES_DEFAULT } from '../constants';
import type { OrgSeedContext, SeedUsers } from '../types';
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

export async function seedGeneralBusiness(
  prisma: PrismaClient,
  users: SeedUsers,
): Promise<OrgSeedContext> {
  const { owner, manager, staff, superAdmin } = users;

  const organization = await prisma.organization.create({
    data: {
      name: 'شرکت خدمات تدبیر کسب‌وکار',
      slug: 'demo-general',
      industryPack: 'GENERAL',
      isDemo: true,
      phone: '02188776655',
      email: 'info@tadbir-demo.ir',
      address: 'تهران، خیابان ولیعصر، بالاتر از پارک ساعی، پلاک ۱۲۴',
      taxId: '14009876543',
      workspaces: {
        create: { name: 'دفتر مرکزی', slug: 'main', isDefault: true },
      },
      memberships: {
        create: [
          { userId: owner.id, role: 'OWNER' },
          { userId: superAdmin.id, role: 'OWNER' },
          { userId: manager.id, role: 'MANAGER' },
          { userId: staff.id, role: 'STAFF' },
        ],
      },
      pipelineStages: {
        create: PIPELINE_STAGES_DEFAULT.map((s) => ({ ...s })),
      },
    },
    include: { workspaces: true, pipelineStages: { orderBy: { order: 'asc' } } },
  });

  const workspace = organization.workspaces[0]!;
  const stages = organization.pipelineStages;
  const orgId = organization.id;

  const tagVip = await prisma.tag.create({
    data: { organizationId: orgId, name: 'مشتری ویژه', color: '#eab308' },
  });
  const tagWholesale = await prisma.tag.create({
    data: { organizationId: orgId, name: 'عمده‌فروش', color: '#3b82f6' },
  });
  const tagNew = await prisma.tag.create({
    data: { organizationId: orgId, name: 'تازه‌وارد', color: '#22c55e' },
  });

  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        organizationId: orgId,
        name: 'علی محمدی',
        phone: '09121111111',
        email: 'ali.mohammadi@example.com',
        city: 'تهران',
        address: 'تهران، سعادت‌آباد، میدان کاج',
        notes: 'مشتری قدیمی — پرداخت معمولاً با تأخیر کوتاه',
        createdAt: daysAgo(120),
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: orgId,
        name: 'زهرا احمدی',
        company: 'شرکت نوآوران دیجیتال',
        phone: '09122222222',
        email: 'z.ahmadi@novaran.ir',
        city: 'تهران',
        nationalId: '0012345678',
        createdAt: daysAgo(90),
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: orgId,
        name: 'رضا کریمی',
        phone: '09123333333',
        city: 'مشهد',
        isActive: true,
        createdAt: daysAgo(45),
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: orgId,
        name: 'فروشگاه پوشاک رز',
        company: 'رز استایل',
        phone: '09124444444',
        city: 'اصفهان',
        notes: 'فروش اینستاگرامی — سفارش‌های فصلی',
        createdAt: daysAgo(30),
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: orgId,
        name: 'حمید نوری',
        phone: '09125555555',
        city: 'شیراز',
        isActive: false,
        notes: 'غیرفعال از آبان — بدهی تسویه‌شده',
        createdAt: daysAgo(200),
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: orgId,
        name: 'سمانه رضایی',
        company: 'آموزشگاه زبان آفتاب',
        phone: '09126666666',
        email: 'samaneh@aftab-lang.ir',
        city: 'تهران',
        createdAt: daysAgo(14),
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: orgId,
        name: 'کافه رستوران آرام',
        company: 'آرام گروپ',
        phone: '09127777777',
        city: 'کرج',
        createdAt: daysAgo(7),
      },
    }),
    prisma.customer.create({
      data: {
        organizationId: orgId,
        name: 'مهدی صادقی',
        phone: '09128888888',
        city: 'تبریز',
        createdAt: daysAgo(3),
      },
    }),
  ]);

  await prisma.customerTag.createMany({
    data: [
      { customerId: customers[0]!.id, tagId: tagVip.id },
      { customerId: customers[1]!.id, tagId: tagWholesale.id },
      { customerId: customers[7]!.id, tagId: tagNew.id },
      { customerId: customers[6]!.id, tagId: tagNew.id },
    ],
  });

  await prisma.contact.createMany({
    data: [
      {
        customerId: customers[1]!.id,
        name: 'زهرا احمدی',
        phone: '09122222222',
        role: 'مدیرعامل',
        isPrimary: true,
      },
      {
        customerId: customers[1]!.id,
        name: 'پریسا جعفری',
        phone: '09122222223',
        role: 'حسابداری',
        isPrimary: false,
      },
      {
        customerId: customers[3]!.id,
        name: 'مینا رضوی',
        phone: '09124444445',
        role: 'مالک',
        isPrimary: true,
      },
    ],
  });

  const products = await Promise.all([
    prisma.product.create({
      data: {
        organizationId: orgId,
        name: 'بسته نرم‌افزار مدیریت فروش',
        sku: 'PRD-001',
        unitPrice: 45000000,
        unit: 'لایسنس',
        stockQty: 50,
        description: 'لایسنس سالانه — تا ۵ کاربر',
      },
    }),
    prisma.product.create({
      data: {
        organizationId: orgId,
        name: 'دستگاه صندوق فروشگاهی',
        sku: 'PRD-002',
        unitPrice: 28000000,
        unit: 'عدد',
        stockQty: 12,
      },
    }),
    prisma.product.create({
      data: {
        organizationId: orgId,
        name: 'بارکدخوان بی‌سیم',
        sku: 'PRD-003',
        unitPrice: 3200000,
        unit: 'عدد',
        stockQty: 40,
      },
    }),
  ]);

  const services = await Promise.all([
    prisma.service.create({
      data: {
        organizationId: orgId,
        name: 'مشاوره راه‌اندازی فروش آنلاین',
        unitPrice: 8000000,
        durationMin: 120,
        description: 'جلسه حضوری یا آنلاین',
      },
    }),
    prisma.service.create({
      data: {
        organizationId: orgId,
        name: 'پشتیبانی ماهانه',
        unitPrice: 2500000,
        durationMin: 0,
      },
    }),
    prisma.service.create({
      data: {
        organizationId: orgId,
        name: 'آموزش کار با سیستم',
        unitPrice: 3500000,
        durationMin: 180,
      },
    }),
  ]);

  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        organizationId: orgId,
        stageId: stages[0]!.id,
        title: 'سفارش عمده بسته نرم‌افزار',
        status: 'NEW',
        source: 'INSTAGRAM',
        contactName: 'امیرحسین مرادی',
        contactPhone: '09131234567',
        value: 135000000,
        nextFollowUpAt: daysFromNow(1),
        description: 'پیج ۴۰هزار فالوور — نیاز به دمو',
        createdAt: daysAgo(2),
      },
    }),
    prisma.lead.create({
      data: {
        organizationId: orgId,
        customerId: customers[3]!.id,
        stageId: stages[2]!.id,
        title: 'قرارداد پشتیبانی فصلی',
        status: 'PROPOSAL',
        source: 'REFERRAL',
        contactName: 'مینا رضوی',
        contactPhone: '09124444444',
        value: 30000000,
        nextFollowUpAt: daysFromNow(3),
        lastContactAt: daysAgo(2),
        createdAt: daysAgo(20),
      },
    }),
    prisma.lead.create({
      data: {
        organizationId: orgId,
        stageId: stages[1]!.id,
        title: 'استعلام قیمت صندوق + بارکدخوان',
        status: 'CONTACTED',
        source: 'WHATSAPP',
        contactName: 'جواد اکبری',
        contactPhone: '09139876543',
        value: 35000000,
        lastContactAt: daysAgo(10),
        nextFollowUpAt: daysAgo(3),
        description: 'لید بدون پیگیری — برای داشبورد stale',
        createdAt: daysAgo(25),
      },
    }),
    prisma.lead.create({
      data: {
        organizationId: orgId,
        stageId: stages[4]!.id,
        title: 'پیاده‌سازی سیستم برای آموزشگاه',
        status: 'WON',
        source: 'WEBSITE',
        customerId: customers[5]!.id,
        contactName: 'سمانه رضایی',
        value: 52000000,
        wonAt: daysAgo(5),
        lastContactAt: daysAgo(5),
        createdAt: daysAgo(40),
      },
    }),
    prisma.lead.create({
      data: {
        organizationId: orgId,
        stageId: stages[0]!.id,
        title: 'همکاری با تأمین‌کننده لوازم اداری',
        status: 'LOST',
        source: 'PHONE',
        contactName: 'حسین باقری',
        contactPhone: '09135556677',
        value: 18000000,
        lostAt: daysAgo(15),
        lostReason: 'بودجه کافی نداشتند',
        createdAt: daysAgo(50),
      },
    }),
    prisma.lead.create({
      data: {
        organizationId: orgId,
        stageId: stages[1]!.id,
        title: 'نیاز به گزارش‌گیری مالی',
        status: 'QUALIFIED',
        source: 'TELEGRAM',
        contactName: 'نرگس شریفی',
        contactPhone: '09137778899',
        value: 22000000,
        nextFollowUpAt: startOfToday(),
        lastContactAt: daysAgo(1),
        createdAt: daysAgo(8),
      },
    }),
  ]);

  await prisma.followUpLog.createMany({
    data: [
      {
        leadId: leads[1]!.id,
        note: 'پیشنهاد قیمت با ۱۰٪ تخفیف پرداخت نقدی ارسال شد.',
        channel: 'واتساپ',
        createdAt: daysAgo(2),
      },
      {
        leadId: leads[1]!.id,
        note: 'مشتری درخواست مهلت تا پایان هفته داد.',
        channel: 'تماس',
        createdAt: daysAgo(5),
      },
      {
        leadId: leads[2]!.id,
        note: 'اولین تماس — علاقه‌مند به دمو حضوری',
        channel: 'واتساپ',
        createdAt: daysAgo(10),
      },
      {
        leadId: leads[5]!.id,
        note: 'نیازمندی‌ها جمع‌آوری شد — منتظر تأیید مدیر مالی',
        channel: 'تلگرام',
        createdAt: daysAgo(1),
      },
    ],
  });

  const invoices = [];

  invoices.push(
    await createInvoiceWithItems(prisma, {
      organizationId: orgId,
      customerId: customers[0]!.id,
      number: invoiceNumber(YEAR, 1),
      status: 'PARTIAL',
      issueDate: daysAgo(20),
      dueDate: daysFromNow(5),
      paidAmount: 3000000,
      notes: 'پرداخت مرحله‌ای توافق شد',
      items: [
        {
          description: 'مشاوره راه‌اندازی فروش آنلاین',
          quantity: 1,
          unitPrice: 8000000,
          serviceId: services[0]!.id,
        },
        {
          description: 'آموزش کار با سیستم',
          quantity: 2,
          unitPrice: 3500000,
          serviceId: services[2]!.id,
        },
      ],
    }),
  );

  invoices.push(
    await createInvoiceWithItems(prisma, {
      organizationId: orgId,
      customerId: customers[1]!.id,
      number: invoiceNumber(YEAR, 2),
      status: 'OVERDUE',
      issueDate: daysAgo(45),
      dueDate: daysAgo(10),
      paidAmount: 0,
      items: [
        {
          description: 'بسته نرم‌افزار مدیریت فروش',
          quantity: 3,
          unitPrice: 45000000,
          productId: products[0]!.id,
        },
      ],
    }),
  );

  invoices.push(
    await createInvoiceWithItems(prisma, {
      organizationId: orgId,
      customerId: customers[5]!.id,
      number: invoiceNumber(YEAR, 3),
      status: 'PAID',
      issueDate: daysAgo(10),
      dueDate: daysAgo(2),
      paidAmount: 52000000,
      items: [
        {
          description: 'بسته نرم‌افزار + پیاده‌سازی',
          quantity: 1,
          unitPrice: 45000000,
          productId: products[0]!.id,
        },
        {
          description: 'پشتیبانی ماهانه (۲ ماه)',
          quantity: 2,
          unitPrice: 3500000,
          serviceId: services[1]!.id,
        },
      ],
    }),
  );

  invoices.push(
    await createInvoiceWithItems(prisma, {
      organizationId: orgId,
      customerId: customers[3]!.id,
      number: invoiceNumber(YEAR, 4),
      status: 'SENT',
      issueDate: daysAgo(5),
      dueDate: daysFromNow(10),
      paidAmount: 0,
      items: [
        {
          description: 'بارکدخوان بی‌سیم',
          quantity: 4,
          unitPrice: 3200000,
          productId: products[2]!.id,
        },
      ],
    }),
  );

  invoices.push(
    await createInvoiceWithItems(prisma, {
      organizationId: orgId,
      customerId: customers[6]!.id,
      number: invoiceNumber(YEAR, 5),
      status: 'DRAFT',
      issueDate: daysAgo(1),
      dueDate: daysFromNow(14),
      items: [
        {
          description: 'دستگاه صندوق فروشگاهی',
          quantity: 1,
          unitPrice: 28000000,
          productId: products[1]!.id,
        },
      ],
    }),
  );

  invoices.push(
    await createInvoiceWithItems(prisma, {
      organizationId: orgId,
      customerId: customers[2]!.id,
      number: invoiceNumber(YEAR, 6),
      status: 'PAID',
      issueDate: daysAgo(3),
      dueDate: daysFromNow(7),
      paidAmount: 2500000,
      items: [
        {
          description: 'پشتیبانی ماهانه',
          quantity: 1,
          unitPrice: 2500000,
          serviceId: services[1]!.id,
        },
      ],
    }),
  );

  await createPayment(prisma, {
    organizationId: orgId,
    customerId: customers[0]!.id,
    invoiceId: invoices[0]!.id,
    amount: 3000000,
    method: 'TRANSFER',
    paidAt: daysAgo(15),
    reference: 'TRX-88421',
  });

  await createPayment(prisma, {
    organizationId: orgId,
    customerId: customers[5]!.id,
    invoiceId: invoices[2]!.id,
    amount: 52000000,
    method: 'TRANSFER',
    paidAt: daysAgo(8),
    reference: 'TRX-88502',
  });

  await createPayment(prisma, {
    organizationId: orgId,
    customerId: customers[2]!.id,
    invoiceId: invoices[5]!.id,
    amount: 2500000,
    method: 'CARD',
    paidAt: startOfToday(),
    reference: 'POS-4421',
  });

  await createPayment(prisma, {
    organizationId: orgId,
    customerId: customers[7]!.id,
    amount: 1500000,
    method: 'CASH',
    paidAt: atHour(startOfToday(), 11),
    notes: 'بیعانه — بدون فاکتور',
  });

  const taskDueToday = await prisma.task.create({
    data: {
      organizationId: orgId,
      assigneeId: staff.id,
      createdById: manager.id,
      title: 'تماس پیگیری فاکتور معوق نوآوران',
      description: 'فاکتور INV با سررسید گذشته — هماهنگی با حسابداری',
      priority: 'URGENT',
      status: 'TODO',
      dueDate: endOfToday(),
    },
  });

  const taskOverdue = await prisma.task.create({
    data: {
      organizationId: orgId,
      assigneeId: manager.id,
      createdById: owner.id,
      title: 'ارسال پیش‌فاکتور لید اینستاگرام',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      dueDate: daysAgo(2),
    },
  });

  await prisma.task.createMany({
    data: [
      {
        organizationId: orgId,
        assigneeId: staff.id,
        createdById: manager.id,
        title: 'آماده‌سازی دمو برای لید جدید',
        priority: 'MEDIUM',
        dueDate: daysFromNow(2),
      },
      {
        organizationId: orgId,
        assigneeId: manager.id,
        title: 'بروزرسانی لیست قیمت محصولات',
        priority: 'LOW',
        status: 'DONE',
        dueDate: daysAgo(1),
        completedAt: daysAgo(1),
      },
      {
        organizationId: orgId,
        assigneeId: staff.id,
        title: 'ثبت رسید پرداخت علی محمدی',
        priority: 'MEDIUM',
        status: 'DONE',
        dueDate: daysAgo(14),
        completedAt: daysAgo(14),
      },
    ],
  });

  await prisma.reminder.createMany({
    data: [
      {
        organizationId: orgId,
        userId: staff.id,
        taskId: taskDueToday.id,
        title: 'یادآوری: تماس فاکتور معوق',
        message: 'شرکت نوآوران — پیگیری پرداخت',
        remindAt: atHour(startOfToday(), 14),
      },
      {
        organizationId: orgId,
        userId: manager.id,
        title: 'پیگیری لید نرگس شریفی',
        message: 'موعد پیگیری امروز',
        remindAt: atHour(startOfToday(), 16),
      },
      {
        organizationId: orgId,
        userId: owner.id,
        title: 'جلسه هفتگی تیم فروش',
        remindAt: daysFromNow(2),
      },
    ],
  });

  await prisma.note.createMany({
    data: [
      {
        organizationId: orgId,
        authorId: manager.id,
        title: 'یادداشت مشتری',
        content: 'علی محمدی معمولاً پایان ماه پرداخت می‌کند — حتماً ۳ روز قبل یادآوری شود.',
        entityType: 'CUSTOMER',
        entityId: customers[0]!.id,
        isPinned: true,
      },
      {
        organizationId: orgId,
        authorId: staff.id,
        content: 'فروشگاه رز برای خرید دوم منتظر تخفیف پشتیبانی است.',
        entityType: 'CUSTOMER',
        entityId: customers[3]!.id,
      },
    ],
  });

  await prisma.automationRule.createMany({
    data: [
      {
        organizationId: orgId,
        name: 'یادآوری فاکتور سررسید',
        trigger: 'INVOICE_OVERDUE',
        action: 'CREATE_TASK',
        description: 'ایجاد وظیفه پیگیری برای فاکتورهای معوق',
        isActive: true,
      },
      {
        organizationId: orgId,
        name: 'پیگیری لید راکد',
        trigger: 'LEAD_STALE',
        action: 'SEND_REMINDER',
        description: 'یادآور برای لیدهای بدون تماس بیش از ۷ روز',
        isActive: true,
      },
      {
        organizationId: orgId,
        name: 'وظایف امروز',
        trigger: 'TASK_DUE',
        action: 'NOTIFY_USER',
        description: 'اعلان وظایف سررسید امروز',
        isActive: false,
      },
    ],
  });

  await prisma.fileAttachment.createMany({
    data: [
      {
        organizationId: orgId,
        entityType: 'CUSTOMER',
        entityId: customers[1]!.id,
        fileName: 'قرارداد-نوآوران.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 245_000,
        storagePath: 'seed/demo-general/contract-novaran.pdf',
        uploadedById: manager.id,
        createdAt: daysAgo(40),
      },
      {
        organizationId: orgId,
        entityType: 'INVOICE',
        entityId: invoices[2]!.id,
        fileName: 'رسید-پرداخت-آموزشگاه.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 128_000,
        storagePath: 'seed/demo-general/receipt-aftab.pdf',
        uploadedById: staff.id,
        createdAt: daysAgo(8),
      },
    ],
  });

  const activityRows = [
    {
      organizationId: orgId,
      userId: owner.id,
      type: 'SYSTEM' as const,
      title: 'راه‌اندازی داده‌های نمونه',
      description: 'محیط دمو کسب‌یار آماده استفاده است',
      createdAt: daysAgo(0),
    },
    {
      organizationId: orgId,
      userId: manager.id,
      type: 'NOTE' as const,
      title: 'مشتری جدید ثبت شد',
      description: customers[7]!.name,
      customerId: customers[7]!.id,
      createdAt: daysAgo(3),
    },
    {
      organizationId: orgId,
      userId: staff.id,
      type: 'INVOICE' as const,
      title: 'فاکتور صادر شد',
      description: invoices[3]!.number,
      customerId: customers[3]!.id,
      invoiceId: invoices[3]!.id,
      createdAt: daysAgo(5),
    },
    {
      organizationId: orgId,
      userId: manager.id,
      type: 'PAYMENT' as const,
      title: 'پرداخت ثبت شد',
      description: '۲٬۵۰۰٬۰۰۰ ریال — رضا کریمی',
      customerId: customers[2]!.id,
      createdAt: startOfToday(),
    },
    {
      organizationId: orgId,
      userId: staff.id,
      type: 'STATUS_CHANGE' as const,
      title: 'لید به وضعیت موفق تغییر کرد',
      description: leads[3]!.title,
      leadId: leads[3]!.id,
      createdAt: daysAgo(5),
    },
    {
      organizationId: orgId,
      userId: manager.id,
      type: 'NOTE' as const,
      title: 'پیگیری لید ثبت شد',
      description: 'پیشنهاد قیمت ارسال شد',
      leadId: leads[1]!.id,
      createdAt: daysAgo(2),
    },
    {
      organizationId: orgId,
      userId: owner.id,
      type: 'CALL' as const,
      title: 'تماس با مشتری ویژه',
      description: 'هماهنگی پرداخت مرحله دوم',
      customerId: customers[0]!.id,
      createdAt: daysAgo(7),
    },
    {
      organizationId: orgId,
      userId: staff.id,
      type: 'TASK' as const,
      title: 'وظیفه تکمیل شد',
      description: 'ثبت رسید پرداخت',
      taskId: taskDueToday.id,
      createdAt: daysAgo(14),
    },
  ];

  for (const row of activityRows) {
    await prisma.activityLog.create({ data: row });
  }

  const { seedOrganizationSubscription } = await import('../billing');
  await seedOrganizationSubscription(prisma, orgId, {
    planCode: 'BUSINESS',
    status: 'ACTIVE',
  });

  return {
    organization,
    workspace,
    users,
    stages,
    customers,
    products,
    services,
    leads,
    invoices,
  };
}
