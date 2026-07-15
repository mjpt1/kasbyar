import type { FileEntityType, PrismaClient } from '@prisma/client';

import { ACTIVE_RECORD_FILTER } from '@kesbyar/shared';

import { NotFoundError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

type Db = Pick<
  PrismaClient,
  | 'customer'
  | 'lead'
  | 'invoice'
  | 'product'
  | 'service'
  | 'pipelineStage'
  | 'practitioner'
  | 'task'
  | 'payment'
  | 'membership'
>;

const defaultDb = prisma as Db;

/**
 * تأیید مالکیت tenant — در صورت عدم تطابق، NotFound برمی‌گرداند (بدون افشای وجود رکورد).
 */
export async function requireCustomerInOrg(
  organizationId: string,
  customerId: string,
  db: Db = defaultDb,
) {
  const row = await db.customer.findFirst({
    where: { id: customerId, organizationId, ...ACTIVE_RECORD_FILTER },
    select: { id: true },
  });
  if (!row) throw new NotFoundError('مشتری در این فضای کاری یافت نشد');
  return row;
}

export async function requireLeadInOrg(
  organizationId: string,
  leadId: string,
  db: Db = defaultDb,
) {
  const row = await db.lead.findFirst({
    where: { id: leadId, organizationId, ...ACTIVE_RECORD_FILTER },
    select: { id: true },
  });
  if (!row) throw new NotFoundError('لید در این فضای کاری یافت نشد');
  return row;
}

export async function requireInvoiceInOrg(
  organizationId: string,
  invoiceId: string,
  db: Db = defaultDb,
) {
  const row = await db.invoice.findFirst({
    where: { id: invoiceId, organizationId, ...ACTIVE_RECORD_FILTER },
    select: { id: true, customerId: true },
  });
  if (!row) throw new NotFoundError('فاکتور در این فضای کاری یافت نشد');
  return row;
}

export async function requireProductInOrg(
  organizationId: string,
  productId: string,
  db: Db = defaultDb,
) {
  const row = await db.product.findFirst({
    where: { id: productId, organizationId, isActive: true },
    select: { id: true },
  });
  if (!row) throw new NotFoundError('محصول در این فضای کاری یافت نشد');
  return row;
}

export async function requireServiceInOrg(
  organizationId: string,
  serviceId: string,
  db: Db = defaultDb,
) {
  const row = await db.service.findFirst({
    where: { id: serviceId, organizationId, isActive: true },
    select: { id: true },
  });
  if (!row) throw new NotFoundError('خدمت در این فضای کاری یافت نشد');
  return row;
}

export async function requirePipelineStageInOrg(
  organizationId: string,
  stageId: string,
  db: Db = defaultDb,
) {
  const row = await db.pipelineStage.findFirst({
    where: { id: stageId, organizationId },
    select: { id: true },
  });
  if (!row) throw new NotFoundError('مرحله قیف در این فضای کاری یافت نشد');
  return row;
}

export async function requireMemberInOrg(
  organizationId: string,
  userId: string,
  db: Db = defaultDb,
) {
  const row = await db.membership.findFirst({
    where: { organizationId, userId, isActive: true },
    select: { userId: true },
  });
  if (!row) throw new NotFoundError('کاربر عضو این فضای کاری نیست');
  return row;
}

export async function requirePractitionerInOrg(
  organizationId: string,
  practitionerId: string,
  db: Db = defaultDb,
) {
  const row = await db.practitioner.findFirst({
    where: { id: practitionerId, organizationId, isActive: true },
    select: { id: true },
  });
  if (!row) throw new NotFoundError('پزشک در این فضای کاری یافت نشد');
  return row;
}

export async function assertInvoiceBelongsToCustomer(
  organizationId: string,
  invoiceId: string,
  customerId: string,
  db: Db = defaultDb,
) {
  const invoice = await requireInvoiceInOrg(organizationId, invoiceId, db);
  if (invoice.customerId !== customerId) {
    throw new NotFoundError('فاکتور با مشتری انتخاب‌شده مطابقت ندارد');
  }
  return invoice;
}

export async function assertAttachmentEntityInOrg(
  organizationId: string,
  entityType: FileEntityType,
  entityId: string,
  db: Db = defaultDb,
) {
  switch (entityType) {
    case 'CUSTOMER':
      await requireCustomerInOrg(organizationId, entityId, db);
      break;
    case 'LEAD':
      await requireLeadInOrg(organizationId, entityId, db);
      break;
    case 'INVOICE':
      await requireInvoiceInOrg(organizationId, entityId, db);
      break;
    case 'TASK': {
      const task = await db.task.findFirst({
        where: { id: entityId, organizationId },
        select: { id: true },
      });
      if (!task) throw new NotFoundError('وظیفه در این فضای کاری یافت نشد');
      break;
    }
    default:
      throw new NotFoundError('نوع موجودیت پیوست پشتیبانی نمی‌شود');
  }
}

export async function validateInvoiceLineCatalogRefs(
  organizationId: string,
  items: { productId?: string | null; serviceId?: string | null }[],
  db: Db = defaultDb,
) {
  for (const item of items) {
    if (item.productId) {
      await requireProductInOrg(organizationId, item.productId, db);
    }
    if (item.serviceId) {
      await requireServiceInOrg(organizationId, item.serviceId, db);
    }
  }
}
