import type { MoadianPayload, MoadianReadinessResult, MoadianIntegrationMode } from '@kesbyar/shared';
import { ACTIVE_RECORD_FILTER } from '@kesbyar/shared';

import {
  isValidEconomicCode,
  isValidLegalNationalId,
  isValidNationalId,
  isValidPostalCode,
  isValidSheba,
  normalizeEconomicCode,
  normalizeNationalId,
  normalizePostalCode,
  normalizeSheba,
} from '@/lib/validators/iranian';
import { prisma } from '@/lib/prisma';
import { resolveMoadianCredentials } from '@/server/integrations/org-credentials.service';

export async function getMoadianModeForOrg(
  organizationId: string,
): Promise<MoadianIntegrationMode> {
  const creds = await resolveMoadianCredentials(organizationId);
  if (creds.intermediaryUrl && creds.apiKey) {
    return 'intermediary';
  }
  return 'export';
}

/** @deprecated Prefer getMoadianModeForOrg — env-only snapshot */
export function getMoadianMode(): MoadianIntegrationMode {
  if (process.env.MOADIAN_INTERMEDIARY_URL && process.env.MOADIAN_INTERMEDIARY_API_KEY) {
    return 'intermediary';
  }
  return 'export';
}

type OrgLike = {
  name: string;
  taxId: string | null;
  economicCode: string | null;
  companyNationalId: string | null;
  sheba: string | null;
  postalCode: string | null;
  address: string | null;
  taxMemoryId: string | null;
};

type CustomerLike = {
  name: string;
  nationalId: string | null;
  economicCode: string | null;
  sheba: string | null;
  postalCode: string | null;
  address: string | null;
  company: string | null;
};

export function assessMoadianReadiness(params: {
  organization: OrgLike;
  customer: CustomerLike;
  invoice: {
    kind: string;
    status: string;
    total: number;
    taxAmount: number;
    items: {
      description: string;
      quantity: number;
      unitPrice: number;
      taxRate: number;
      lineTotal: number;
      discount: number;
    }[];
  };
  mode?: MoadianIntegrationMode;
}): MoadianReadinessResult {
  const mode = params.mode ?? getMoadianMode();
  const sellerTin =
    params.organization.economicCode ||
    params.organization.companyNationalId ||
    params.organization.taxId;
  const buyerTin = params.customer.economicCode || params.customer.nationalId;

  const items = [
    {
      id: 'invoice_kind',
      labelFa: 'فاکتور قطعی (نه پیش‌فاکتور)',
      ok: params.invoice.kind === 'SALE',
      hintFa: 'پیش‌فاکتور برای مؤدیان ارسال نمی‌شود',
    },
    {
      id: 'seller_tin',
      labelFa: 'شناسه/کد اقتصادی فروشنده',
      ok: Boolean(
        sellerTin &&
          (isValidEconomicCode(sellerTin) ||
            isValidNationalId(sellerTin) ||
            isValidLegalNationalId(sellerTin) ||
            sellerTin.length >= 10),
      ),
      hintFa: 'در تنظیمات سازمان کد اقتصادی یا شناسه ملی را تکمیل کنید',
    },
    {
      id: 'tax_memory',
      labelFa: 'شناسه حافظه مالیاتی',
      ok: Boolean(params.organization.taxMemoryId && params.organization.taxMemoryId.trim().length >= 6),
      hintFa: 'شناسه حافظه مالیاتی را از کارپوشه مؤدیان بگیرید و در تنظیمات وارد کنید',
    },
    {
      id: 'seller_sheba',
      labelFa: 'شبا فروشنده',
      ok: Boolean(params.organization.sheba && isValidSheba(params.organization.sheba)),
      hintFa: 'شبا برای چاپ رسمی و برخی الگوهای ارسال لازم است',
    },
    {
      id: 'seller_postal',
      labelFa: 'کد پستی فروشنده',
      ok: Boolean(params.organization.postalCode && isValidPostalCode(params.organization.postalCode)),
      hintFa: 'کد پستی ۱۰ رقمی سازمان',
    },
    {
      id: 'buyer_id',
      labelFa: 'کد ملی / اقتصادی خریدار',
      ok: Boolean(
        buyerTin &&
          (isValidNationalId(buyerTin) ||
            isValidLegalNationalId(buyerTin) ||
            isValidEconomicCode(buyerTin)),
      ),
      hintFa: 'برای خریدار حقیقی کد ملی و برای حقوقی شناسه/اقتصادی لازم است',
    },
    {
      id: 'line_items',
      labelFa: 'حداقل یک ردیف کالا/خدمت',
      ok: params.invoice.items.length > 0,
    },
    {
      id: 'totals',
      labelFa: 'مبالغ فاکتور معتبر',
      ok: params.invoice.total > 0,
    },
  ];

  const missingCount = items.filter((i) => !i.ok).length;
  return {
    ready: missingCount === 0,
    mode,
    items,
    missingCount,
  };
}

export function buildMoadianPayload(params: {
  organization: OrgLike;
  customer: CustomerLike;
  invoice: {
    id: string;
    number: string;
    issueDate: Date;
    items: {
      description: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      taxRate: number;
      lineTotal: number;
    }[];
  };
}): MoadianPayload {
  const tins =
    params.organization.economicCode ||
    params.organization.companyNationalId ||
    params.organization.taxId ||
    '';
  const tinb = params.customer.economicCode || params.customer.nationalId || undefined;

  const body = params.invoice.items.map((item, index) => {
    const am = item.quantity;
    const fee = item.unitPrice;
    const prdis = Math.round(am * fee);
    const dis = Math.round(item.discount);
    const adis = prdis - dis;
    const vra = item.taxRate;
    const vam = Math.round((adis * vra) / 100);
    const tsstam = adis + vam;
    return {
      sstid: `GEN${String(index + 1).padStart(10, '0')}`,
      sstt: item.description.slice(0, 400),
      am,
      fee,
      prdis,
      dis,
      adis,
      vra,
      vam,
      tsstam,
    };
  });

  return {
    header: {
      indatim: params.invoice.issueDate.toISOString(),
      inty: 1,
      inp: 1,
      inso: 1,
      tins: normalizeEconomicCode(tins) || normalizeNationalId(tins),
      setm: 1,
      tinb: tinb ? normalizeNationalId(tinb) || normalizeEconomicCode(tinb) : undefined,
      taxid: params.organization.taxMemoryId ?? undefined,
    },
    body,
  };
}

export async function prepareInvoiceForMoadian(organizationId: string, invoiceId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId, ...ACTIVE_RECORD_FILTER },
    include: {
      customer: true,
      organization: true,
      items: { orderBy: { sortOrder: 'asc' } },
    },
  });
  if (!invoice) throw new Error('فاکتور یافت نشد');

  const mode = await getMoadianModeForOrg(organizationId);

  const readiness = assessMoadianReadiness({
    organization: invoice.organization,
    customer: invoice.customer,
    invoice: {
      kind: invoice.kind,
      status: invoice.status,
      total: Number(invoice.total),
      taxAmount: Number(invoice.taxAmount),
      items: invoice.items.map((i) => ({
        description: i.description,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        taxRate: Number(i.taxRate),
        lineTotal: Number(i.lineTotal),
        discount: Number(i.discount),
      })),
    },
    mode,
  });

  const payload = buildMoadianPayload({
    organization: invoice.organization,
    customer: invoice.customer,
    invoice: {
      id: invoice.id,
      number: invoice.number,
      issueDate: invoice.issueDate,
      items: invoice.items.map((i) => ({
        description: i.description,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        discount: Number(i.discount),
        taxRate: Number(i.taxRate),
        lineTotal: Number(i.lineTotal),
      })),
    },
  });

  const sellerSnapshot = {
    name: invoice.organization.name,
    taxId: invoice.organization.taxId,
    economicCode: invoice.organization.economicCode,
    companyNationalId: invoice.organization.companyNationalId,
    sheba: invoice.organization.sheba,
    postalCode: invoice.organization.postalCode,
    address: invoice.organization.address,
    taxMemoryId: invoice.organization.taxMemoryId,
  };
  const buyerSnapshot = {
    name: invoice.customer.name,
    company: invoice.customer.company,
    nationalId: invoice.customer.nationalId,
    economicCode: invoice.customer.economicCode,
    sheba: invoice.customer.sheba,
    postalCode: invoice.customer.postalCode,
    address: invoice.customer.address,
  };

  const updated = await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      moadianPayload: payload as object,
      sellerSnapshot: sellerSnapshot as object,
      buyerSnapshot: buyerSnapshot as object,
      moadianStatus: readiness.ready ? 'READY' : 'DRAFT',
      moadianLastError: readiness.ready
        ? null
        : `${readiness.missingCount} مورد ناقص — چک‌لیست را تکمیل کنید`,
    },
  });

  return { invoice: updated, readiness, payload, mode: readiness.mode };
}

export async function markMoadianSubmitted(
  organizationId: string,
  invoiceId: string,
  opts?: { uid?: string; taxId?: string; manualUpload?: boolean },
) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId, ...ACTIVE_RECORD_FILTER },
  });
  if (!invoice) throw new Error('فاکتور یافت نشد');
  if (invoice.moadianStatus !== 'READY' && invoice.moadianStatus !== 'REJECTED') {
    throw new Error('فقط فاکتور «آماده» یا «ردشده» قابل ارسال/بارگذاری است');
  }

  const mode = await getMoadianModeForOrg(organizationId);
  const creds = await resolveMoadianCredentials(organizationId);

  if (mode === 'intermediary' && creds.intermediaryUrl && creds.apiKey) {
    const url = creds.intermediaryUrl;
    const apiKey = creds.apiKey;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        invoiceId: invoice.id,
        number: invoice.number,
        payload: invoice.moadianPayload,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          moadianStatus: 'REJECTED',
          moadianLastError: text.slice(0, 500) || 'خطا از واسط مؤدیان',
        },
      });
      throw new Error('ارسال به واسط مؤدیان ناموفق بود');
    }
    const data = (await res.json().catch(() => ({}))) as { uid?: string; taxId?: string };
    return prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        moadianStatus: 'SUBMITTED',
        moadianUid: data.uid ?? opts?.uid,
        moadianTaxId: data.taxId ?? opts?.taxId,
        moadianSubmittedAt: new Date(),
        moadianLastError: null,
      },
    });
  }

  // Export / manual upload path — honest status: submitted means "uploaded by user" when flagged
  return prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      moadianStatus: 'SUBMITTED',
      moadianUid: opts?.uid,
      moadianTaxId: opts?.taxId,
      moadianSubmittedAt: new Date(),
      moadianLastError: opts?.manualUpload
        ? 'ثبت دستی: فایل خروجی در کارپوشه مؤدیان بارگذاری شد (بدون اتصال مستقیم به سازمان امور مالیاتی)'
        : 'خروجی JSON آماده است — از کارپوشه مؤدیان یا نرم‌افزار واسط بارگذاری کنید. برای ارسال زنده، URL و کلید واسط را در تنظیمات سازمان وارد کنید.',
    },
  });
}

export async function updateMoadianOutcome(
  organizationId: string,
  invoiceId: string,
  outcome: 'ACCEPTED' | 'REJECTED',
  errorMessage?: string,
) {
  return prisma.invoice.updateMany({
    where: { id: invoiceId, organizationId },
    data: {
      moadianStatus: outcome,
      moadianLastError: outcome === 'REJECTED' ? errorMessage || 'رد شده توسط سامانه' : null,
    },
  });
}

export { normalizeSheba, normalizePostalCode };
