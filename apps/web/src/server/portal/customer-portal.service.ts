import { randomBytes } from 'crypto';

import { ACTIVE_RECORD_FILTER } from '@kesbyar/shared';

import { prisma } from '@/lib/prisma';
import { createOrGetPaymentLink } from '@/server/payments/invoice-payment.service';

function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    process.env.APP_URL?.replace(/\/$/, '') ||
    'http://localhost:3000'
  );
}

function newPortalToken(): string {
  return randomBytes(24).toString('hex');
}

export async function createCustomerPortalToken(organizationId: string, customerId: string) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, organizationId, ...ACTIVE_RECORD_FILTER },
    select: { id: true },
  });
  if (!customer) throw new Error('مشتری یافت نشد');

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const token = await prisma.customerPortalToken.create({
    data: {
      organizationId,
      customerId,
      token: newPortalToken(),
      expiresAt,
    },
  });

  return {
    token: token.token,
    expiresAt: token.expiresAt,
    portalUrl: `${appBaseUrl()}/portal/${token.token}`,
  };
}

export async function getCustomerPortalByToken(token: string) {
  if (!token || token.length < 16) return null;

  const row = await prisma.customerPortalToken.findUnique({
    where: { token },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          company: true,
          phone: true,
          email: true,
          city: true,
          province: true,
          address: true,
        },
      },
      organization: { select: { id: true, name: true, showTomanAlongside: true } },
    },
  });
  if (!row || row.expiresAt < new Date()) return null;

  const [invoices, leads, tasks] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        organizationId: row.organizationId,
        customerId: row.customerId,
        ...ACTIVE_RECORD_FILTER,
        kind: 'SALE',
      },
      orderBy: { issueDate: 'desc' },
      take: 50,
      select: {
        id: true,
        number: true,
        status: true,
        total: true,
        paidAmount: true,
        issueDate: true,
        dueDate: true,
      },
    }),
    prisma.lead.findMany({
      where: {
        organizationId: row.organizationId,
        customerId: row.customerId,
        ...ACTIVE_RECORD_FILTER,
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        status: true,
        nextFollowUpAt: true,
        updatedAt: true,
        stage: { select: { name: true } },
      },
    }),
    prisma.task.findMany({
      where: {
        organizationId: row.organizationId,
        customerId: row.customerId,
        status: { in: ['TODO', 'IN_PROGRESS'] },
      },
      orderBy: [{ dueDate: 'asc' }, { updatedAt: 'desc' }],
      take: 20,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
      },
    }),
  ]);

  const invoicesWithPayLinks = await Promise.all(
    invoices.map(async (invoice) => {
      const remaining = Number(invoice.total) - Number(invoice.paidAmount);
      if (remaining <= 0 || ['PAID', 'CANCELLED'].includes(invoice.status)) {
        return { ...invoice, payUrl: null as string | null, remaining };
      }
      try {
        const link = await createOrGetPaymentLink(row.organizationId, invoice.id);
        return { ...invoice, payUrl: link.publicUrl, remaining: link.remaining };
      } catch {
        return { ...invoice, payUrl: null as string | null, remaining };
      }
    }),
  );

  return {
    customer: row.customer,
    organization: row.organization,
    expiresAt: row.expiresAt,
    invoices: invoicesWithPayLinks,
    leads,
    tasks,
  };
}
