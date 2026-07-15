/** شناسه‌های استاندارد رویداد audit — برای یکپارچگی گزارش‌گیری */
export const AUDIT_ACTIONS = {
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_REGISTER: 'auth.register',
  SETTINGS_UPDATE: 'settings.update',
  CUSTOMER_ARCHIVE: 'customer.archive',
  CUSTOMER_RESTORE: 'customer.restore',
  LEAD_ARCHIVE: 'lead.archive',
  INVOICE_ARCHIVE: 'invoice.archive',
  INVOICE_STATUS: 'invoice.status_change',
  PAYMENT_CREATE: 'payment.create',
  DEMO_RESET: 'demo.reset',
  DB_RESTORE: 'db.restore',
  MEMBERSHIP_CHANGE: 'membership.change',
  SUBSCRIPTION_CHANGE: 'subscription.change',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export const AUDIT_ENTITY_TYPES = {
  USER: 'User',
  ORGANIZATION: 'Organization',
  CUSTOMER: 'Customer',
  LEAD: 'Lead',
  INVOICE: 'Invoice',
  PAYMENT: 'Payment',
  DEMO: 'Demo',
  SUBSCRIPTION: 'Subscription',
} as const;
