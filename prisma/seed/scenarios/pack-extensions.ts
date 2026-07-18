import type { PrismaClient } from '@prisma/client';

import {
  CLINIC_PACK_EXTENSIONS,
  RETAIL_PACK_EXTENSIONS,
  type ClinicPackExtensionPreset,
  type RetailPackExtensionPreset,
} from './industry-presets';
import { atHour, daysAgo, daysFromNow, endOfToday, startOfToday } from '../utils';

const DEFAULT_CLINIC_EXT = CLINIC_PACK_EXTENSIONS['demo-clinic']!;
const DEFAULT_RETAIL_EXT = RETAIL_PACK_EXTENSIONS['demo-retail']!;

export async function seedClinicPackData(
  prisma: PrismaClient,
  organizationId: string,
  customerIds: string[],
  ownerId: string,
  slug?: string,
) {
  const [p1, p2, p3] = customerIds;
  if (!p1 || !p2 || !p3) return;

  const ext: ClinicPackExtensionPreset =
    (slug ? CLINIC_PACK_EXTENSIONS[slug] : undefined) ?? DEFAULT_CLINIC_EXT;

  const practitioner = await prisma.practitioner.create({
    data: {
      organizationId,
      name: ext.practitionerName,
      specialty: ext.specialty,
      phone: '09121110000',
    },
  });

  await prisma.patientProfile.createMany({
    data: [
      {
        organizationId,
        customerId: p1,
        fileNumber: `${ext.filePrefix}-1001`,
        notes: ext.patientNotes[0],
      },
      {
        organizationId,
        customerId: p2,
        fileNumber: `${ext.filePrefix}-1002`,
        allergies: ext.allergies,
        notes: ext.patientNotes[1],
      },
      {
        organizationId,
        customerId: p3,
        fileNumber: `${ext.filePrefix}-1003`,
        notes: ext.patientNotes[2],
      },
    ],
  });

  const todayAppt = await prisma.appointment.create({
    data: {
      organizationId,
      customerId: p2,
      practitionerId: practitioner.id,
      status: 'CONFIRMED',
      scheduledAt: atHour(startOfToday(), 10),
      durationMin: 60,
      reason: ext.appointmentReasons.today,
      notes: ext.visit.treatmentNotes,
    },
  });

  await prisma.appointment.createMany({
    data: [
      {
        organizationId,
        customerId: p3,
        practitionerId: practitioner.id,
        status: 'SCHEDULED',
        scheduledAt: atHour(startOfToday(), 14),
        durationMin: 45,
        reason: ext.appointmentReasons.afternoon,
      },
      {
        organizationId,
        customerId: p1,
        status: 'SCHEDULED',
        scheduledAt: atHour(daysFromNow(2), 11),
        durationMin: 30,
        reason: ext.appointmentReasons.upcoming,
      },
      {
        organizationId,
        customerId: p2,
        practitionerId: practitioner.id,
        status: 'NO_SHOW',
        scheduledAt: daysAgo(3),
        durationMin: 30,
        reason: ext.appointmentReasons.noShow,
      },
      {
        organizationId,
        customerId: p1,
        practitionerId: practitioner.id,
        status: 'COMPLETED',
        scheduledAt: daysAgo(5),
        durationMin: 30,
        reason: ext.appointmentReasons.upcoming,
        completedAt: daysAgo(5),
        followUpAt: daysFromNow(3),
      },
    ],
  });

  await prisma.visitRecord.create({
    data: {
      organizationId,
      customerId: p2,
      appointmentId: todayAppt.id,
      practitionerId: practitioner.id,
      chiefComplaint: ext.visit.chiefComplaint,
      treatmentNotes: ext.visit.treatmentNotes,
      followUpAt: daysFromNow(14),
    },
  });

  await prisma.visitRecord.create({
    data: {
      organizationId,
      customerId: p1,
      practitionerId: practitioner.id,
      visitDate: daysAgo(5),
      chiefComplaint: ext.appointmentReasons.upcoming,
      treatmentNotes: 'ویزیت تکمیل شد — پیگیری طبق برنامه',
      followUpAt: daysFromNow(3),
    },
  });

  await prisma.task.create({
    data: {
      organizationId,
      assigneeId: ownerId,
      title: ext.taskTitle,
      priority: 'HIGH',
      dueDate: endOfToday(),
    },
  });
}

export async function seedTravelPackData(
  prisma: PrismaClient,
  organizationId: string,
  customerIds: string[],
) {
  const [c1, c2] = customerIds;
  if (!c1 || !c2) return;

  await prisma.travelerProfile.createMany({
    data: [
      {
        organizationId,
        customerId: c1,
        passportNo: 'P12345678',
        notes: 'تور دبی — ۴ نفر',
      },
      {
        organizationId,
        customerId: c2,
        notes: 'ویزای شینگن — کارمندان شرکت',
      },
    ],
  });

  await prisma.travelBooking.createMany({
    data: [
      {
        organizationId,
        customerId: c1,
        title: 'تور ۵ شب دبی — خانواده رستمی',
        destination: 'دبی',
        departureDate: daysFromNow(12),
        returnDate: daysFromNow(17),
        travelersCount: 4,
        status: 'CONFIRMED',
        quotedAmount: 168000000,
        notes: 'هتل ۴ ستاره — پرواز ایران‌ایر',
      },
      {
        organizationId,
        customerId: c2,
        title: 'ویزای شینگن توریستی',
        destination: 'آلمان',
        departureDate: daysFromNow(45),
        travelersCount: 2,
        status: 'QUOTED',
        quotedAmount: 17000000,
        followUpAt: daysFromNow(2),
      },
      {
        organizationId,
        customerId: c1,
        title: 'تور استانبول نوروز',
        destination: 'استانبول',
        departureDate: daysFromNow(60),
        travelersCount: 2,
        status: 'INQUIRY',
        notes: 'استعلام قیمت — هنوز تأیید نشده',
      },
    ],
  });
}

export async function seedRetailPackData(
  prisma: PrismaClient,
  organizationId: string,
  productIds: string[],
  slug?: string,
) {
  const [prod1, prod2] = productIds;
  if (!prod1 || !prod2) return;

  const ext: RetailPackExtensionPreset =
    (slug ? RETAIL_PACK_EXTENSIONS[slug] : undefined) ?? DEFAULT_RETAIL_EXT;

  await prisma.product.update({
    where: { id: prod1 },
    data: { reorderLevel: ext.reorderLevels[0] },
  });
  await prisma.product.update({
    where: { id: prod2 },
    data: { reorderLevel: ext.reorderLevels[1], stockQty: 8 },
  });

  await prisma.stockMovement.createMany({
    data: [
      {
        organizationId,
        productId: prod1,
        type: 'IN',
        quantity: 50,
        reason: ext.stockInReason,
        reference: 'PO-2401',
        createdAt: daysAgo(10),
      },
      {
        organizationId,
        productId: prod2,
        type: 'OUT',
        quantity: 12,
        reason: ext.stockOutReason,
        reference: 'SL-8891',
        createdAt: daysAgo(3),
      },
      {
        organizationId,
        productId: prod2,
        type: 'OUT',
        quantity: 8,
        reason: ext.stockBulkReason,
        reference: ext.bulkRef,
        createdAt: daysAgo(1),
      },
    ],
  });
}

export async function seedBeautyPackData(
  prisma: PrismaClient,
  organizationId: string,
  customerIds: string[],
) {
  const [c1, c2] = customerIds;
  if (!c1 || !c2) return;

  await prisma.beautyAppointment.createMany({
    data: [
      {
        organizationId,
        customerId: c1,
        stylistName: 'مینا رضایی',
        serviceName: 'رنگ و کوتاهی',
        status: 'CONFIRMED',
        scheduledAt: atHour(startOfToday(), 11),
        durationMin: 90,
        price: 2800000,
        notes: 'مشتری VIP — پکیج عروس',
      },
      {
        organizationId,
        customerId: c2,
        stylistName: 'سارا کریمی',
        serviceName: 'مانیکور و پدیکور',
        status: 'SCHEDULED',
        scheduledAt: atHour(daysFromNow(1), 15),
        durationMin: 60,
        price: 950000,
      },
      {
        organizationId,
        customerId: c1,
        serviceName: 'ابرو و اصلاح صورت',
        status: 'COMPLETED',
        scheduledAt: daysAgo(4),
        durationMin: 45,
        price: 450000,
      },
    ],
  });
}

export async function seedFoodPackData(
  prisma: PrismaClient,
  organizationId: string,
  customerIds: string[],
) {
  const [c1, c2] = customerIds;
  if (!c1 || !c2) return;

  await prisma.menuItem.createMany({
    data: [
      {
        organizationId,
        name: 'چلوکباب کوبیده',
        category: 'غذای اصلی',
        price: 1850000,
        isAvailable: true,
      },
      {
        organizationId,
        name: 'سالاد سزار',
        category: 'پیش‌غذا',
        price: 420000,
        isAvailable: true,
      },
      {
        organizationId,
        name: 'لاته دبل',
        category: 'نوشیدنی',
        price: 285000,
        isAvailable: true,
      },
    ],
  });

  await prisma.foodOrder.createMany({
    data: [
      {
        organizationId,
        customerId: c1,
        tableLabel: 'میز ۵',
        status: 'PREPARING',
        totalAmount: 2270000,
        itemsSummary: 'چلوکباب کوبیده ×۱، سالاد سزار ×۱',
        orderedAt: atHour(startOfToday(), 12),
      },
      {
        organizationId,
        customerId: c2,
        tableLabel: 'میز ۲',
        status: 'OPEN',
        totalAmount: 570000,
        itemsSummary: 'لاته دبل ×۲',
        orderedAt: atHour(startOfToday(), 13),
      },
      {
        organizationId,
        customerId: c1,
        status: 'SERVED',
        totalAmount: 1850000,
        itemsSummary: 'چلوکباب کوبیده ×۱',
        orderedAt: daysAgo(1),
      },
    ],
  });
}

export async function seedEducationPackData(
  prisma: PrismaClient,
  organizationId: string,
  customerIds: string[],
) {
  const [c1, c2] = customerIds;
  if (!c1 || !c2) return;

  const course = await prisma.course.create({
    data: {
      organizationId,
      title: 'دوره مهارت‌افزایی دیجیتال مارکتینگ',
      instructor: 'مهندس نوری',
      capacity: 25,
      price: 8500000,
      startDate: daysFromNow(7),
      endDate: daysFromNow(60),
      isActive: true,
    },
  });

  await prisma.course.create({
    data: {
      organizationId,
      title: 'کلاس زبان انگلیسی سطح متوسط',
      instructor: 'خانم احمدی',
      capacity: 15,
      price: 4200000,
      startDate: daysFromNow(3),
      endDate: daysFromNow(90),
      isActive: true,
    },
  });

  await prisma.courseEnrollment.createMany({
    data: [
      {
        organizationId,
        courseId: course.id,
        customerId: c1,
        status: 'ENROLLED',
        enrolledAt: daysAgo(5),
      },
      {
        organizationId,
        courseId: course.id,
        customerId: c2,
        status: 'ACTIVE',
        enrolledAt: daysAgo(2),
      },
    ],
  });
}

export async function seedFitnessPackData(
  prisma: PrismaClient,
  organizationId: string,
  customerIds: string[],
) {
  const [c1, c2] = customerIds;
  if (!c1 || !c2) return;

  await prisma.gymMembership.createMany({
    data: [
      {
        organizationId,
        customerId: c1,
        planName: 'عضویت سه ماهه طلایی',
        status: 'ACTIVE',
        startsAt: daysAgo(20),
        endsAt: daysFromNow(70),
      },
      {
        organizationId,
        customerId: c2,
        planName: 'عضویت یک ماهه',
        status: 'ACTIVE',
        startsAt: daysAgo(5),
        endsAt: daysFromNow(25),
      },
    ],
  });

  await prisma.gymClass.createMany({
    data: [
      {
        organizationId,
        title: 'یوگا صبحگاهی',
        coach: 'مریم حسینی',
        scheduledAt: atHour(startOfToday(), 8),
        capacity: 20,
        enrolledCount: 12,
      },
      {
        organizationId,
        title: 'کراس‌فیت',
        coach: 'علی مرادی',
        scheduledAt: atHour(daysFromNow(1), 18),
        capacity: 15,
        enrolledCount: 8,
      },
    ],
  });
}

export async function seedRealEstatePackData(
  prisma: PrismaClient,
  organizationId: string,
  customerIds: string[],
) {
  const [c1, c2] = customerIds;
  if (!c1 || !c2) return;

  const listing = await prisma.propertyListing.create({
    data: {
      organizationId,
      title: 'آپارتمان ۱۲۰ متری سعادت‌آباد',
      address: 'تهران، سعادت‌آباد، میدان کاج',
      listingType: 'SALE',
      status: 'AVAILABLE',
      price: 18500000000,
      areaSqm: 120,
      bedrooms: 3,
      notes: 'نورگیر جنوبی — پارکینگ و انباری',
    },
  });

  await prisma.propertyListing.create({
    data: {
      organizationId,
      title: 'دفتر اداری ۷۵ متری ونک',
      address: 'تهران، ونک، خیابان گاندی',
      listingType: 'RENT',
      status: 'AVAILABLE',
      price: 450000000,
      areaSqm: 75,
      bedrooms: 0,
    },
  });

  await prisma.propertyShowing.createMany({
    data: [
      {
        organizationId,
        listingId: listing.id,
        customerId: c1,
        scheduledAt: atHour(daysFromNow(2), 16),
        notes: 'بازدید با خانوادگی',
      },
      {
        organizationId,
        listingId: listing.id,
        customerId: c2,
        scheduledAt: atHour(startOfToday(), 11),
        notes: 'بازدید دوم — تصمیم‌گیری',
      },
    ],
  });
}

export async function seedWorkshopPackData(
  prisma: PrismaClient,
  organizationId: string,
  customerIds: string[],
) {
  const [c1, c2] = customerIds;
  if (!c1 || !c2) return;

  await prisma.repairJob.createMany({
    data: [
      {
        organizationId,
        customerId: c1,
        deviceLabel: 'پژو ۲۰۶ — موتور',
        issue: 'روغن‌سوزی و صدای غیرعادی موتور',
        status: 'IN_PROGRESS',
        quotedAmount: 8500000,
        intakeAt: daysAgo(3),
        notes: 'در انتظار قطعه پیستون',
      },
      {
        organizationId,
        customerId: c2,
        deviceLabel: 'لپ‌تاپ ایسوس',
        issue: 'روشن نمی‌شود — احتمالاً پاور',
        status: 'DIAGNOSING',
        quotedAmount: 2200000,
        intakeAt: daysAgo(1),
      },
      {
        organizationId,
        customerId: c1,
        deviceLabel: 'یخچال سامسونگ',
        issue: 'خنک نمی‌کند',
        status: 'READY',
        quotedAmount: 3800000,
        intakeAt: daysAgo(7),
        readyAt: startOfToday(),
      },
    ],
  });
}

export async function seedLawPackData(
  prisma: PrismaClient,
  organizationId: string,
  customerIds: string[],
) {
  const [c1, c2] = customerIds;
  if (!c1 || !c2) return;

  await prisma.legalCase.createMany({
    data: [
      {
        organizationId,
        customerId: c1,
        title: 'دعوای مطالبه چک',
        caseNumber: '1403-102',
        status: 'ACTIVE',
        nextHearingAt: daysFromNow(5),
        notes: 'جلسه اول رسیدگی',
      },
      {
        organizationId,
        customerId: c2,
        title: 'قرارداد اجاره تجاری',
        caseNumber: '1403-087',
        status: 'WAITING',
        nextHearingAt: daysFromNow(14),
      },
      {
        organizationId,
        customerId: c1,
        title: 'پرونده طلاق توافقی',
        status: 'OPEN',
      },
    ],
  });
}

export async function seedAccountingPackData(
  prisma: PrismaClient,
  organizationId: string,
  customerIds: string[],
) {
  const [c1, c2] = customerIds;
  if (!c1 || !c2) return;

  await prisma.accountingMatter.createMany({
    data: [
      {
        organizationId,
        customerId: c1,
        title: 'اظهارنامه مالیاتی ۱۴۰۳',
        status: 'ACTIVE',
        dueDate: daysFromNow(10),
      },
      {
        organizationId,
        customerId: c2,
        title: 'حسابرسی سالانه',
        status: 'OPEN',
        dueDate: daysFromNow(21),
      },
      {
        organizationId,
        customerId: c1,
        title: 'ثبت دفاتر قانونی',
        status: 'WAITING',
        dueDate: daysFromNow(3),
      },
    ],
  });
}

export async function seedInsurancePackData(
  prisma: PrismaClient,
  organizationId: string,
  customerIds: string[],
) {
  const [c1, c2] = customerIds;
  if (!c1 || !c2) return;

  await prisma.insurancePolicy.createMany({
    data: [
      {
        organizationId,
        customerId: c1,
        policyNumber: 'B-1403-5541',
        policyType: 'شخص ثالث',
        status: 'ACTIVE',
        premium: 12500000,
        startsAt: daysAgo(180),
        expiresAt: daysFromNow(20),
      },
      {
        organizationId,
        customerId: c2,
        policyNumber: 'B-1403-8892',
        policyType: 'بدنه',
        status: 'PENDING',
        premium: 28000000,
      },
      {
        organizationId,
        customerId: c1,
        policyNumber: 'B-1402-3310',
        policyType: 'آتش‌سوزی',
        status: 'ACTIVE',
        premium: 8900000,
        expiresAt: daysFromNow(45),
      },
    ],
  });
}

export async function seedMarketingPackData(
  prisma: PrismaClient,
  organizationId: string,
  customerIds: string[],
) {
  const [c1, c2] = customerIds;
  if (!c1 || !c2) return;

  await prisma.marketingCampaign.createMany({
    data: [
      {
        organizationId,
        customerId: c1,
        title: 'کمپین اینستاگرام بهار',
        channel: 'اینستاگرام',
        status: 'ACTIVE',
        budget: 45000000,
        startDate: daysAgo(7),
        endDate: daysFromNow(21),
      },
      {
        organizationId,
        customerId: c2,
        title: 'تولید محتوای لینکدین',
        channel: 'لینکدین',
        status: 'PLANNED',
        budget: 18000000,
        startDate: daysFromNow(5),
      },
      {
        organizationId,
        customerId: c1,
        title: 'بازطراحی برند',
        channel: 'چندکاناله',
        status: 'ON_HOLD',
        budget: 95000000,
      },
    ],
  });
}

export async function seedContractingPackData(
  prisma: PrismaClient,
  organizationId: string,
  customerIds: string[],
) {
  const [c1, c2] = customerIds;
  if (!c1 || !c2) return;

  await prisma.contractProject.createMany({
    data: [
      {
        organizationId,
        customerId: c1,
        title: 'بازسازی واحد مسکونی',
        siteAddress: 'تهران، سعادت‌آباد',
        status: 'ACTIVE',
        contractAmount: 850000000,
        startDate: daysAgo(30),
        endDate: daysFromNow(60),
      },
      {
        organizationId,
        customerId: c2,
        title: 'نمای ساختمان اداری',
        siteAddress: 'تهران، ونک',
        status: 'PLANNED',
        contractAmount: 420000000,
        startDate: daysFromNow(10),
      },
      {
        organizationId,
        customerId: c1,
        title: 'تأسیسات برقی انبار',
        siteAddress: 'کرج، مهرشهر',
        status: 'ON_HOLD',
        contractAmount: 180000000,
      },
    ],
  });
}

export async function seedPhotographyPackData(
  prisma: PrismaClient,
  organizationId: string,
  customerIds: string[],
) {
  const [c1, c2] = customerIds;
  if (!c1 || !c2) return;

  await prisma.photoSession.createMany({
    data: [
      {
        organizationId,
        customerId: c1,
        title: 'عکاسی عروسی',
        packageName: 'پکیج طلایی',
        status: 'CONFIRMED',
        scheduledAt: atHour(daysFromNow(3), 16),
        price: 35000000,
      },
      {
        organizationId,
        customerId: c2,
        title: 'عکاسی پرتره خانوادگی',
        packageName: 'پکیج نقره‌ای',
        status: 'SCHEDULED',
        scheduledAt: atHour(daysFromNow(7), 11),
        price: 8500000,
      },
      {
        organizationId,
        customerId: c1,
        title: 'عکاسی نوزاد',
        packageName: 'پکیج برنزی',
        status: 'SCHEDULED',
        scheduledAt: atHour(startOfToday(), 14),
        price: 6200000,
      },
    ],
  });
}

export async function seedCleaningPackData(
  prisma: PrismaClient,
  organizationId: string,
  customerIds: string[],
) {
  const [c1, c2] = customerIds;
  if (!c1 || !c2) return;

  await prisma.cleaningJob.createMany({
    data: [
      {
        organizationId,
        customerId: c1,
        address: 'تهران، پاسداران، خیابان دولت',
        serviceType: 'نظافت منزل',
        status: 'CONFIRMED',
        scheduledAt: atHour(startOfToday(), 10),
        price: 2800000,
      },
      {
        organizationId,
        customerId: c2,
        address: 'تهران، ستارخان، کوچه ۱۲',
        serviceType: 'نظافت اداری',
        status: 'SCHEDULED',
        scheduledAt: atHour(daysFromNow(2), 9),
        price: 4500000,
      },
      {
        organizationId,
        customerId: c1,
        address: 'تهران، نیاوران، خیابان باهنر',
        serviceType: 'نظافت عمیق',
        status: 'SCHEDULED',
        scheduledAt: atHour(daysFromNow(5), 8),
        price: 5200000,
      },
    ],
  });
}

export async function seedPrintingPackData(
  prisma: PrismaClient,
  organizationId: string,
  customerIds: string[],
) {
  const [c1, c2] = customerIds;
  if (!c1 || !c2) return;

  await prisma.printOrder.createMany({
    data: [
      {
        organizationId,
        customerId: c1,
        title: 'کارت ویزیت مات',
        quantity: 1000,
        status: 'ACTIVE',
        dueAt: daysFromNow(3),
        totalAmount: 4200000,
      },
      {
        organizationId,
        customerId: c2,
        title: 'بنر تبلیغاتی ۳×۶',
        quantity: 2,
        status: 'PLANNED',
        dueAt: daysFromNow(7),
        totalAmount: 8900000,
      },
      {
        organizationId,
        customerId: c1,
        title: 'بروشور A4',
        quantity: 500,
        status: 'ACTIVE',
        dueAt: daysFromNow(2),
        totalAmount: 6500000,
      },
    ],
  });
}
