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
