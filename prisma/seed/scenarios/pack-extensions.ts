import type { PrismaClient } from '@prisma/client';

import { atHour, daysAgo, daysFromNow, endOfToday, startOfToday } from '../utils';

export async function seedClinicPackData(
  prisma: PrismaClient,
  organizationId: string,
  customerIds: string[],
  ownerId: string,
) {
  const [p1, p2, p3] = customerIds;
  if (!p1 || !p2 || !p3) return;

  const practitioner = await prisma.practitioner.create({
    data: {
      organizationId,
      name: 'دکتر نیلوفر رضایی',
      specialty: 'دندانپزشک',
      phone: '09121110000',
    },
  });

  await prisma.patientProfile.createMany({
    data: [
      {
        organizationId,
        customerId: p1,
        fileNumber: 'P-1001',
        notes: 'مراجع دوره‌ای',
      },
      {
        organizationId,
        customerId: p2,
        fileNumber: 'P-1002',
        allergies: 'پنی‌سیلین',
        notes: 'ایمپلنت — دو جلسه باقی‌مانده',
      },
      {
        organizationId,
        customerId: p3,
        fileNumber: 'P-1003',
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
      reason: 'جلسه دوم ایمپلنت',
      notes: 'آماده‌سازی پروتز',
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
        reason: 'جرم‌گیری',
      },
      {
        organizationId,
        customerId: p1,
        status: 'SCHEDULED',
        scheduledAt: atHour(daysFromNow(2), 11),
        durationMin: 30,
        reason: 'معاینه دوره‌ای',
      },
      {
        organizationId,
        customerId: p2,
        practitionerId: practitioner.id,
        status: 'NO_SHOW',
        scheduledAt: daysAgo(3),
        durationMin: 30,
        reason: 'پیگیری درمان',
      },
    ],
  });

  await prisma.visitRecord.create({
    data: {
      organizationId,
      customerId: p2,
      appointmentId: todayAppt.id,
      practitionerId: practitioner.id,
      chiefComplaint: 'ایمپلنت فک پایین',
      treatmentNotes: 'پیچ گذاری انجام شد — جلسه بعدی پروتز',
      followUpAt: daysFromNow(14),
    },
  });

  await prisma.task.create({
    data: {
      organizationId,
      assigneeId: ownerId,
      title: 'تماس یادآوری نوبت فاطمه حیدری',
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
) {
  const [prod1, prod2] = productIds;
  if (!prod1 || !prod2) return;

  await prisma.product.update({
    where: { id: prod1 },
    data: { reorderLevel: 50 },
  });
  await prisma.product.update({
    where: { id: prod2 },
    data: { reorderLevel: 100, stockQty: 8 },
  });

  await prisma.stockMovement.createMany({
    data: [
      {
        organizationId,
        productId: prod1,
        type: 'IN',
        quantity: 50,
        reason: 'خرید فصل پاییز',
        reference: 'PO-2401',
        createdAt: daysAgo(10),
      },
      {
        organizationId,
        productId: prod2,
        type: 'OUT',
        quantity: 12,
        reason: 'فروش خرده',
        reference: 'SL-8891',
        createdAt: daysAgo(3),
      },
      {
        organizationId,
        productId: prod2,
        type: 'OUT',
        quantity: 8,
        reason: 'فروش عمده بوتیک ماهان',
        createdAt: daysAgo(1),
      },
    ],
  });
}
