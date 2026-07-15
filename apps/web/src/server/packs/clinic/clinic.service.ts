import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import {
  requireCustomerInOrg,
  requirePractitionerInOrg,
} from '@/server/tenant/tenant-scope';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function listAppointments(
  organizationId: string,
  params: { date?: Date; status?: string; page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.AppointmentWhereInput = {
    organizationId,
    ...(params.status ? { status: params.status as Prisma.EnumAppointmentStatusFilter['equals'] } : {}),
    ...(params.date
      ? {
          scheduledAt: {
            gte: startOfToday(),
            lte: endOfToday(),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        practitioner: { select: { id: true, name: true, specialty: true } },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function listTodayAppointments(organizationId: string) {
  return prisma.appointment.findMany({
    where: {
      organizationId,
      scheduledAt: { gte: startOfToday(), lte: endOfToday() },
      status: { notIn: ['CANCELLED'] },
    },
    orderBy: { scheduledAt: 'asc' },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
      practitioner: { select: { name: true } },
    },
  });
}

export async function createAppointment(
  organizationId: string,
  data: Omit<Prisma.AppointmentUncheckedCreateInput, 'organizationId'>,
) {
  await requireCustomerInOrg(organizationId, data.customerId);
  if (data.practitionerId) {
    await requirePractitionerInOrg(organizationId, data.practitionerId);
  }

  return prisma.appointment.create({
    data: { ...data, organizationId },
    include: {
      customer: true,
      practitioner: true,
    },
  });
}

export async function updateAppointment(
  organizationId: string,
  id: string,
  data: Prisma.AppointmentUpdateInput,
) {
  const existing = await prisma.appointment.findFirst({ where: { id, organizationId } });
  if (!existing) return null;
  return prisma.appointment.update({
    where: { id },
    data,
    include: { customer: true, practitioner: true },
  });
}

export async function listPatients(organizationId: string, params: { search?: string; page?: number }) {
  const page = params.page ?? 1;
  const pageSize = 20;
  const where: Prisma.CustomerWhereInput = {
    organizationId,
    patientProfile: { isNot: null },
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { phone: { contains: params.search } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        patientProfile: true,
        _count: { select: { appointments: true } },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function ensurePatientProfile(
  organizationId: string,
  customerId: string,
  profile?: { fileNumber?: string; allergies?: string; notes?: string },
) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, organizationId },
  });
  if (!customer) return null;

  return prisma.patientProfile.upsert({
    where: { customerId },
    create: {
      organizationId,
      customerId,
      ...profile,
    },
    update: profile ?? {},
    include: { customer: true },
  });
}

export async function getClinicDashboardSignals(organizationId: string) {
  const todayStart = startOfToday();
  const todayEnd = endOfToday();

  const [todayCount, missedCount, followUpCount, patientCount] = await Promise.all([
    prisma.appointment.count({
      where: {
        organizationId,
        scheduledAt: { gte: todayStart, lte: todayEnd },
        status: { notIn: ['CANCELLED'] },
      },
    }),
    prisma.appointment.count({
      where: {
        organizationId,
        scheduledAt: { lt: todayStart },
        status: { in: ['SCHEDULED', 'CONFIRMED', 'NO_SHOW'] },
      },
    }),
    prisma.appointment.count({
      where: {
        organizationId,
        followUpAt: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        status: 'COMPLETED',
      },
    }),
    prisma.patientProfile.count({ where: { organizationId } }),
  ]);

  return { todayCount, missedCount, followUpCount, patientCount };
}

export async function listPractitioners(organizationId: string) {
  return prisma.practitioner.findMany({
    where: { organizationId, isActive: true },
    orderBy: { name: 'asc' },
  });
}
