import {
  formatCurrency,
  formatCurrencyWithOptionalToman,
} from '@kesbyar/shared';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { PrintButton } from '@/components/features/invoices/print-button';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Button } from '@/components/ui/button';
import { requireSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { getInvoice } from '@/server/invoices/invoice.service';

type Snapshot = {
  name?: string;
  company?: string | null;
  taxId?: string | null;
  economicCode?: string | null;
  companyNationalId?: string | null;
  nationalId?: string | null;
  sheba?: string | null;
  postalCode?: string | null;
  address?: string | null;
  phone?: string | null;
  province?: string | null;
  city?: string | null;
};

function PartyBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-md border border-neutral-200 p-3 print:rounded-none print:border-neutral-400">
      <h2 className="mb-2 border-b border-neutral-200 pb-1 text-sm font-semibold print:border-neutral-400">
        {title}
      </h2>
      <div className="space-y-1 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const invoice = await getInvoice(session.organizationId, id);
  if (!invoice) notFound();

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
  });
  const showToman = org?.showTomanAlongside ?? false;
  const money = (n: number) => formatCurrencyWithOptionalToman(n, { showToman });

  const seller = (invoice.sellerSnapshot as Snapshot | null) ?? {
    name: org?.name,
    taxId: org?.taxId,
    economicCode: org?.economicCode,
    companyNationalId: org?.companyNationalId,
    sheba: org?.sheba,
    postalCode: org?.postalCode,
    address: org?.address,
    phone: org?.phone,
    province: org?.province,
    city: org?.city,
  };
  const buyer = (invoice.buyerSnapshot as Snapshot | null) ?? {
    name: invoice.customer.name,
    company: invoice.customer.company,
    nationalId: invoice.customer.nationalId,
    economicCode: invoice.customer.economicCode,
    sheba: invoice.customer.sheba,
    postalCode: invoice.customer.postalCode,
    address: invoice.customer.address,
    phone: invoice.customer.phone,
    province: invoice.customer.province,
    city: invoice.customer.city,
  };

  const kindLabel = invoice.kind === 'PROFORMA' ? 'پیش‌فاکتور' : 'فاکتور فروش';

  return (
    <div className="mx-auto max-w-3xl bg-white p-6 text-black print:p-0" dir="rtl">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
      <div className="invoice-print space-y-6">
        <div className="no-print mb-4 flex flex-wrap items-center gap-2">
          <PrintButton />
          <Button asChild variant="ghost" size="sm">
            <Link href={`/invoices/${id}`}>بازگشت به فاکتور</Link>
          </Button>
        </div>

        <header className="border-b border-neutral-300 pb-4">
          <h1 className="text-2xl font-bold tracking-tight">{seller.name}</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {kindLabel} —{' '}
            <span dir="ltr" className="font-mono">
              {invoice.number}
            </span>
          </p>
          <p className="mt-1 text-sm">
            تاریخ صدور: <JalaliDate date={invoice.issueDate} />
            {invoice.dueDate ? (
              <>
                {' '}
                · سررسید: <JalaliDate date={invoice.dueDate} />
              </>
            ) : null}
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <PartyBlock title="فروشنده">
            <p>{seller.name}</p>
            {seller.economicCode ? <p>کد اقتصادی: {seller.economicCode}</p> : null}
            {seller.companyNationalId ? <p>شناسه ملی: {seller.companyNationalId}</p> : null}
            {seller.taxId ? <p>شناسه مالیاتی: {seller.taxId}</p> : null}
            {seller.sheba ? (
              <p dir="ltr" className="text-start">
                شبا: {seller.sheba}
              </p>
            ) : null}
            {seller.postalCode ? <p>کد پستی: {seller.postalCode}</p> : null}
            {seller.phone ? (
              <p dir="ltr" className="text-start">
                تلفن: {seller.phone}
              </p>
            ) : null}
            {seller.address ? <p>{seller.address}</p> : null}
          </PartyBlock>
          <PartyBlock title="خریدار">
            <p>
              {buyer.name}
              {buyer.company ? ` — ${buyer.company}` : ''}
            </p>
            {buyer.nationalId ? <p>کد ملی: {buyer.nationalId}</p> : null}
            {buyer.economicCode ? <p>کد اقتصادی: {buyer.economicCode}</p> : null}
            {buyer.sheba ? (
              <p dir="ltr" className="text-start">
                شبا: {buyer.sheba}
              </p>
            ) : null}
            {buyer.postalCode ? <p>کد پستی: {buyer.postalCode}</p> : null}
            {buyer.phone ? (
              <p dir="ltr" className="text-start">
                تلفن: {buyer.phone}
              </p>
            ) : null}
            {buyer.address ? <p>{buyer.address}</p> : null}
          </PartyBlock>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-300 bg-neutral-100 print:bg-neutral-100">
              <th className="p-2 text-start font-semibold">شرح</th>
              <th className="p-2 text-start font-semibold">تعداد</th>
              <th className="p-2 text-start font-semibold">فی</th>
              <th className="p-2 text-start font-semibold">مالیات٪</th>
              <th className="p-2 text-start font-semibold">جمع</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-neutral-200">
                <td className="p-2">{item.description}</td>
                <td className="p-2 tabular-nums">{Number(item.quantity)}</td>
                <td className="p-2 tabular-nums">{formatCurrency(Number(item.unitPrice))}</td>
                <td className="p-2 tabular-nums">{Number(item.taxRate)}</td>
                <td className="p-2 tabular-nums">{formatCurrency(Number(item.lineTotal))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ms-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-neutral-600">جمع جزء</span>
            <span className="tabular-nums">{money(Number(invoice.subtotal))}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-neutral-600">مالیات بر ارزش افزوده</span>
            <span className="tabular-nums">{money(Number(invoice.taxAmount))}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-neutral-300 pt-2 text-base font-bold">
            <span>مبلغ قابل پرداخت</span>
            <span className="tabular-nums">{money(Number(invoice.total))}</span>
          </div>
          <p className="text-xs text-neutral-500">واحد ذخیره و محاسبه: ریال</p>
        </div>

        {invoice.notes ? (
          <p className="border-t border-neutral-200 pt-3 text-sm text-neutral-700">
            یادداشت: {invoice.notes}
          </p>
        ) : null}
      </div>
    </div>
  );
}
