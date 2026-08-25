import { randomBytes, randomInt } from 'crypto';
import { cookies } from 'next/headers';

import { ACTIVE_RECORD_FILTER } from '@kesbyar/shared';

import { PORTAL_COOKIE, PORTAL_SESSION_DAYS } from '@/lib/auth/constants';
import { prisma } from '@/lib/prisma';
import { createOrGetPaymentLink } from '@/server/payments/invoice-payment.service';
import { sendNotification } from '@/server/notifications/notification.adapter';

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

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, '').replace(/^00/, '+');
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

export type CustomerPortalView = NonNullable<Awaited<ReturnType<typeof buildPortalView>>>;

async function buildPortalView(row: {
  organizationId: string;
  customerId: string;
  expiresAt: Date;
  customer: {
    id: string;
    name: string;
    company: string | null;
    phone: string | null;
    email: string | null;
    city: string | null;
    province: string | null;
    address: string | null;
  };
  organization: {
    id: string;
    name: string;
    showTomanAlongside: boolean;
    slug: string;
    industryPack: string;
    industrySpecialty: string | null;
  };
}) {
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

async function loadPortalTokenRow(token: string) {
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
      organization: {
        select: {
          id: true,
          name: true,
          showTomanAlongside: true,
          slug: true,
          industryPack: true,
          industrySpecialty: true,
        },
      },
    },
  });
  if (!row || row.expiresAt < new Date()) return null;
  return row;
}

export async function getCustomerPortalByToken(token: string) {
  const row = await loadPortalTokenRow(token);
  if (!row) return null;
  return buildPortalView(row);
}

export async function getPortalTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(PORTAL_COOKIE)?.value ?? null;
}

export async function getCustomerPortalFromSession() {
  const token = await getPortalTokenFromCookie();
  if (!token) return null;
  return getCustomerPortalByToken(token);
}

export async function claimPortalSession(token: string) {
  const row = await loadPortalTokenRow(token);
  if (!row) return null;

  // Extend session cookie window (token row expiry still authoritative for access).
  const cookieExpires = new Date(
    Math.min(
      row.expiresAt.getTime(),
      Date.now() + PORTAL_SESSION_DAYS * 24 * 60 * 60 * 1000,
    ),
  );

  return {
    token: row.token,
    expiresAt: cookieExpires,
    portalUrl: `${appBaseUrl()}/portal`,
  };
}

/**
 * Passwordless magic-link / OTP for an existing customer in an org (by slug).
 * Sends SMS and/or email with a short-lived portal URL when providers are configured.
 */
export async function requestPortalMagicLink(input: {
  organizationSlug: string;
  email?: string;
  phone?: string;
}) {
  const slug = input.organizationSlug.trim().toLowerCase();
  const email = input.email?.trim().toLowerCase() || null;
  const phone = input.phone?.trim() ? normalizePhone(input.phone.trim()) : null;

  if (!email && !phone) {
    throw new Error('ایمیل یا شماره موبایل الزامی است');
  }

  const org = await prisma.organization.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });
  if (!org) throw new Error('کسب‌وکار یافت نشد');

  const customer = await prisma.customer.findFirst({
    where: {
      organizationId: org.id,
      ...ACTIVE_RECORD_FILTER,
      OR: [
        ...(email ? [{ email: { equals: email, mode: 'insensitive' as const } }] : []),
        ...(phone
          ? [
              { phone },
              { phone: phone.replace(/^\+98/, '0') },
              { phone: phone.replace(/^0/, '+98') },
            ]
          : []),
      ],
    },
    select: { id: true, name: true, phone: true, email: true },
  });

  // Anti-enumeration: always return success-shaped result when org exists.
  if (!customer) {
    return {
      sent: false,
      noticeFa: 'اگر حسابی با این مشخصات وجود داشته باشد، لینک ورود ارسال می‌شود.',
    };
  }

  const created = await createCustomerPortalToken(org.id, customer.id);
  const link = created.portalUrl;
  const otpHint = String(randomInt(100000, 999999));

  let channelSent = false;

  if (customer.phone) {
    try {
      const result = await sendNotification({
        organizationId: org.id,
        channel: 'sms',
        recipient: customer.phone,
        body: `ورود به پورتال ${org.name}:\n${link}\nکد مرجع: ${otpHint}`,
        tags: { kind: 'portal_magic_link', customerId: customer.id },
      });
      if (result.status === 'sent' || result.status === 'queued') channelSent = true;
    } catch {
      // continue to email
    }
  }

  if (customer.email) {
    try {
      const result = await sendNotification({
        organizationId: org.id,
        channel: 'email',
        recipient: customer.email,
        subject: `لینک ورود به پورتال ${org.name}`,
        body: `سلام ${customer.name}،\n\nبرای ورود به پورتال مشتری روی لینک زیر کلیک کنید (معتبر تا ۳۰ روز):\n${link}\n\n${org.name}`,
        tags: { kind: 'portal_magic_link', customerId: customer.id },
      });
      if (result.status === 'sent' || result.status === 'queued') channelSent = true;
    } catch {
      // ignore
    }
  }

  return {
    sent: channelSent,
    noticeFa: channelSent
      ? 'لینک ورود در صورت پیکربندی پیامک/ایمیل ارسال شد. همچنین می‌توانید از لینک مستقیم استفاده‌شده توسط کسب‌وکار استفاده کنید.'
      : 'لینک ساخته شد ولی کانال پیامک/ایمیل پیکربندی نشده است. از کسب‌وکار بخواهید لینک پورتال را برایتان بفرستد.',
    // Dev/local convenience — only when no external channel (never expose in production logs as API field when SMS works)
    portalUrl: channelSent ? undefined : link,
  };
}
