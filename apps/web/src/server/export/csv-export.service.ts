import {
  ACTIVE_RECORD_FILTER,
  formatJalali,
  INVOICE_STATUS_LABELS,
  LEAD_STATUS_LABELS,
} from '@kesbyar/shared';

import { prisma } from '@/lib/prisma';

function csvEscape(value: string | number | null | undefined): string {
  const raw = value == null ? '' : String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function toCsv(headers: string[], rows: Array<Array<string | number | null | undefined>>): string {
  const bom = '\uFEFF';
  const lines = [
    headers.map(csvEscape).join(','),
    ...rows.map((row) => row.map(csvEscape).join(',')),
  ];
  return bom + lines.join('\r\n');
}

function jalali(d: Date | null | undefined): string {
  if (!d) return '';
  return formatJalali(d);
}

export async function exportCustomersCsv(organizationId: string): Promise<string> {
  const customers = await prisma.customer.findMany({
    where: { organizationId, ...ACTIVE_RECORD_FILTER },
    orderBy: { createdAt: 'desc' },
    take: 5000,
    select: {
      name: true,
      company: true,
      phone: true,
      email: true,
      city: true,
      province: true,
      nationalId: true,
      createdAt: true,
    },
  });

  return toCsv(
    ['نام', 'شرکت', 'تلفن', 'ایمیل', 'شهر', 'استان', 'کد ملی', 'تاریخ ایجاد'],
    customers.map((c) => [
      c.name,
      c.company,
      c.phone,
      c.email,
      c.city,
      c.province,
      c.nationalId,
      jalali(c.createdAt),
    ]),
  );
}

export async function exportLeadsCsv(organizationId: string): Promise<string> {
  const leads = await prisma.lead.findMany({
    where: { organizationId, ...ACTIVE_RECORD_FILTER },
    orderBy: { updatedAt: 'desc' },
    take: 5000,
    include: {
      stage: { select: { name: true } },
      customer: { select: { name: true } },
    },
  });

  return toCsv(
    [
      'عنوان',
      'وضعیت',
      'مرحله',
      'مشتری',
      'نام تماس',
      'تلفن',
      'ایمیل',
      'ارزش',
      'پیگیری بعدی',
      'تاریخ ایجاد',
    ],
    leads.map((l) => [
      l.title,
      LEAD_STATUS_LABELS[l.status] ?? l.status,
      l.stage?.name ?? '',
      l.customer?.name ?? '',
      l.contactName,
      l.contactPhone,
      l.contactEmail,
      l.value != null ? Number(l.value) : '',
      jalali(l.nextFollowUpAt),
      jalali(l.createdAt),
    ]),
  );
}

export async function exportInvoicesCsv(organizationId: string): Promise<string> {
  const invoices = await prisma.invoice.findMany({
    where: { organizationId, ...ACTIVE_RECORD_FILTER, kind: 'SALE' },
    orderBy: { issueDate: 'desc' },
    take: 5000,
    include: { customer: { select: { name: true } } },
  });

  return toCsv(
    [
      'شماره',
      'مشتری',
      'وضعیت',
      'مبلغ کل',
      'پرداخت‌شده',
      'مانده',
      'تاریخ صدور',
      'سررسید',
      'وضعیت مؤدیان',
    ],
    invoices.map((inv) => {
      const total = Number(inv.total);
      const paid = Number(inv.paidAmount);
      return [
        inv.number,
        inv.customer.name,
        INVOICE_STATUS_LABELS[inv.status] ?? inv.status,
        total,
        paid,
        total - paid,
        jalali(inv.issueDate),
        jalali(inv.dueDate),
        inv.moadianStatus ?? '',
      ];
    }),
  );
}
