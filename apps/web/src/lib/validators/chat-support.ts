import { z } from 'zod';

export const chatMessageSchema = z.object({
  body: z.string().min(1, 'متن پیام الزامی است').max(4000, 'پیام خیلی طولانی است'),
});

export const chatCreateDirectSchema = z.object({
  type: z.literal('direct'),
  peerUserId: z.string().min(1, 'کاربر مقصد الزامی است'),
});

export const chatCreateChannelSchema = z.object({
  type: z.literal('channel'),
  name: z.string().min(2, 'نام کانال حداقل ۲ کاراکتر باشد').max(80),
});

export const chatCreateSchema = z.discriminatedUnion('type', [
  chatCreateDirectSchema,
  chatCreateChannelSchema,
]);

export const supportTicketSchema = z.object({
  subject: z.string().min(3, 'موضوع حداقل ۳ کاراکتر باشد').max(200),
  body: z.string().min(10, 'شرح درخواست حداقل ۱۰ کاراکتر باشد').max(8000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});

export const ticketMessageSchema = z.object({
  body: z.string().min(1, 'متن پیام الزامی است').max(8000),
});

export const ticketStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
});

export const orgModuleToggleSchema = z.object({
  moduleKey: z.string().min(1),
  enabled: z.boolean(),
});
