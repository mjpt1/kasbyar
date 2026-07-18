import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export async function listCourses(
  organizationId: string,
  params: { page?: number; pageSize?: number; activeOnly?: boolean },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.CourseWhereInput = {
    organizationId,
    ...(params.activeOnly ? { isActive: true } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy: { title: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { enrollments: true } } },
    }),
    prisma.course.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createCourse(
  organizationId: string,
  data: Omit<Prisma.CourseUncheckedCreateInput, 'organizationId'>,
) {
  return prisma.course.create({ data: { ...data, organizationId } });
}

export async function listCourseEnrollments(
  organizationId: string,
  params: { status?: string; page?: number; pageSize?: number },
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where: Prisma.CourseEnrollmentWhereInput = {
    organizationId,
    ...(params.status
      ? { status: params.status as Prisma.EnumEnrollmentStatusFilter['equals'] }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.courseEnrollment.findMany({
      where,
      orderBy: { enrolledAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        course: { select: { id: true, title: true } },
      },
    }),
    prisma.courseEnrollment.count({ where }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createCourseEnrollment(
  organizationId: string,
  data: Omit<Prisma.CourseEnrollmentUncheckedCreateInput, 'organizationId'>,
) {
  return prisma.courseEnrollment.create({
    data: { ...data, organizationId },
    include: {
      customer: { select: { id: true, name: true } },
      course: { select: { id: true, title: true } },
    },
  });
}

export async function listRecentEnrollments(organizationId: string) {
  return prisma.courseEnrollment.findMany({
    where: { organizationId },
    orderBy: { enrolledAt: 'desc' },
    take: 10,
    include: {
      customer: { select: { id: true, name: true } },
      course: { select: { title: true } },
    },
  });
}

export async function getEducationDashboardSignals(organizationId: string) {
  const [activeCourseCount, enrollmentCount, interestedCount] = await Promise.all([
    prisma.course.count({ where: { organizationId, isActive: true } }),
    prisma.courseEnrollment.count({
      where: { organizationId, status: { in: ['ENROLLED', 'ACTIVE'] } },
    }),
    prisma.courseEnrollment.count({
      where: { organizationId, status: 'INTERESTED' },
    }),
  ]);

  return { activeCourseCount, enrollmentCount, interestedCount };
}
