import { z } from 'zod';

import { iranianMobileSchema, normalizeIranianMobile } from './iranian';

export const loginSchema = z.object({
  email: z.string().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(6, 'رمز عبور حداقل ۶ کاراکتر باشد'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'نام حداقل ۲ کاراکتر باشد'),
  email: z.string().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(6, 'رمز عبور حداقل ۶ کاراکتر باشد'),
  organizationName: z.string().min(2, 'نام کسب‌وکار حداقل ۲ کاراکتر باشد'),
  industryPack: z
    .enum(['GENERAL', 'CLINIC', 'TRAVEL_AGENCY', 'RETAIL'])
    .optional(),
});

export const customerSchema = z.object({
  name: z.string().min(2, 'نام مشتری الزامی است'),
  company: z.string().optional(),
  phone: z
    .string()
    .optional()
    .transform((v) => (v ? normalizeIranianMobile(v) : v))
    .pipe(iranianMobileSchema),
  email: z.string().email('ایمیل معتبر نیست').optional().or(z.literal('')),
  nationalId: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
});

export const customerUpdateSchema = customerSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const leadSchema = z.object({
  title: z.string().min(2, 'عنوان لید الزامی است'),
  status: z
    .enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'])
    .optional(),
  source: z
    .enum([
      'REFERRAL',
      'INSTAGRAM',
      'WHATSAPP',
      'TELEGRAM',
      'WEBSITE',
      'WALK_IN',
      'PHONE',
      'OTHER',
    ])
    .optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
  description: z.string().optional(),
  value: z.coerce.number().optional(),
  customerId: z.string().optional(),
  nextFollowUpAt: z.string().optional(),
  stageId: z.string().optional(),
});

export const leadUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  status: z
    .enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'])
    .optional(),
  source: z
    .enum([
      'REFERRAL',
      'INSTAGRAM',
      'WHATSAPP',
      'TELEGRAM',
      'WEBSITE',
      'WALK_IN',
      'PHONE',
      'OTHER',
    ])
    .optional(),
  contactName: z.string().optional(),
  contactPhone: z
    .string()
    .optional()
    .transform((v) => (v ? normalizeIranianMobile(v) : v))
    .pipe(iranianMobileSchema),
  contactEmail: z.string().optional(),
  description: z.string().optional(),
  value: z.coerce.number().optional(),
  customerId: z.string().nullable().optional(),
  nextFollowUpAt: z.string().nullable().optional(),
  stageId: z.string().nullable().optional(),
});

export const followUpSchema = z.object({
  note: z.string().min(2, 'متن پیگیری الزامی است'),
  channel: z.string().optional(),
  nextFollowUpAt: z.string().optional(),
});

export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'شرح آیتم الزامی است'),
  quantity: z.coerce.number().positive('تعداد باید مثبت باشد'),
  unitPrice: z.coerce.number().min(0, 'قیمت نامعتبر است'),
  discount: z.coerce.number().min(0).optional(),
  taxRate: z.coerce.number().min(0).max(100).optional(),
});

export const invoiceSchema = z.object({
  customerId: z.string().min(1, 'انتخاب مشتری الزامی است'),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    invoiceItemSchema.extend({
      productId: z.string().optional(),
      serviceId: z.string().optional(),
    }),
  ).min(1, 'حداقل یک آیتم لازم است'),
});

export const invoiceStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED']),
});

export const paymentSchema = z.object({
  customerId: z.string().min(1, 'انتخاب مشتری الزامی است'),
  invoiceId: z.string().optional(),
  amount: z.coerce.number().positive('مبلغ باید مثبت باشد'),
  method: z.enum(['CASH', 'CARD', 'TRANSFER', 'CHEQUE', 'ONLINE', 'OTHER']),
  reference: z.string().optional(),
  notes: z.string().optional(),
  paidAt: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(2, 'عنوان وظیفه الزامی است'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
});

export const reminderSchema = z.object({
  title: z.string().min(2, 'عنوان یادآور الزامی است'),
  message: z.string().optional(),
  remindAt: z.string().min(1, 'زمان یادآوری الزامی است'),
  taskId: z.string().optional(),
});

export const organizationSettingsSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z
    .string()
    .optional()
    .transform((v) => (v ? normalizeIranianMobile(v) : v))
    .pipe(iranianMobileSchema),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  taxId: z.string().optional(),
});

export const fileUploadMetaSchema = z.object({
  entityType: z.enum(['CUSTOMER', 'LEAD', 'INVOICE', 'TASK', 'NOTE', 'ORGANIZATION']),
  entityId: z.string().min(1),
});

export const automationToggleSchema = z.object({
  isActive: z.boolean(),
});

export const automationRuleSchema = z.object({
  name: z.string().min(2, 'نام قانون الزامی است'),
  description: z.string().optional(),
  trigger: z.enum([
    'INVOICE_OVERDUE',
    'LEAD_STALE',
    'TASK_DUE',
    'PAYMENT_RECEIVED',
    'CUSTOMER_CREATED',
  ]),
  action: z.enum(['CREATE_TASK', 'SEND_REMINDER', 'NOTIFY_USER', 'UPDATE_STATUS']),
  isActive: z.boolean().optional(),
});

export const conversationSchema = z.object({
  question: z.string().min(2, 'سؤال خود را بنویسید').max(2000),
});

export const workspaceSelectSchema = z.object({
  organizationId: z.string().min(1, 'شناسه سازمان الزامی است'),
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'شناسه نامعتبر است'),
});

export const appointmentSchema = z.object({
  customerId: z.string().min(1, 'بیمار الزامی است'),
  practitionerId: z.string().optional(),
  scheduledAt: z.coerce.date(),
  durationMin: z.coerce.number().int().min(15).max(240).optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  status: z
    .enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
    .optional(),
  followUpAt: z.coerce.date().optional().nullable(),
});

export const appointmentUpdateSchema = appointmentSchema.partial();

export const visitRecordSchema = z.object({
  customerId: z.string().min(1, 'بیمار الزامی است'),
  practitionerId: z.string().optional(),
  appointmentId: z.string().optional(),
  visitDate: z.coerce.date().optional(),
  chiefComplaint: z.string().optional(),
  diagnosis: z.string().optional(),
  treatmentNotes: z.string().optional(),
  followUpAt: z.coerce.date().optional().nullable(),
});

export const patientProfileSchema = z.object({
  customerId: z.string().min(1),
  fileNumber: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
});

export const travelBookingSchema = z.object({
  customerId: z.string().min(1, 'مسافر الزامی است'),
  title: z.string().min(2, 'عنوان رزرو الزامی است'),
  destination: z.string().min(2, 'مقصد الزامی است'),
  departureDate: z.coerce.date(),
  returnDate: z.coerce.date().optional().nullable(),
  travelersCount: z.coerce.number().int().min(1).max(50).optional(),
  status: z
    .enum(['INQUIRY', 'QUOTED', 'CONFIRMED', 'DEPARTED', 'COMPLETED', 'CANCELLED'])
    .optional(),
  quotedAmount: z.coerce.number().optional().nullable(),
  notes: z.string().optional(),
  followUpAt: z.coerce.date().optional().nullable(),
});

export const travelBookingUpdateSchema = travelBookingSchema.partial();

export const stockMovementSchema = z.object({
  productId: z.string().min(1, 'محصول الزامی است'),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  quantity: z.coerce.number().positive('مقدار باید مثبت باشد'),
  reason: z.string().optional(),
  reference: z.string().optional(),
});

export const productRetailSchema = z.object({
  name: z.string().min(2, 'نام محصول الزامی است'),
  sku: z.string().optional(),
  description: z.string().optional(),
  unitPrice: z.coerce.number().min(0).optional(),
  unit: z.string().optional(),
  stockQty: z.coerce.number().min(0).optional(),
  reorderLevel: z.coerce.number().min(0).optional().nullable(),
});
