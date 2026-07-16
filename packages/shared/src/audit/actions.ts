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
  MEMBER_INVITE: 'member.invite',
  MEMBER_ROLE_UPDATE: 'member.role_update',
  MEMBER_REMOVE: 'member.remove',
  ADMIN_USER_CREATE: 'admin.user_create',
  ADMIN_USER_UPDATE: 'admin.user_update',
  ADMIN_MEMBERSHIP_UPSERT: 'admin.membership_upsert',
  ADMIN_MEMBERSHIP_REMOVE: 'admin.membership_remove',
  ADMIN_ORG_UPDATE: 'admin.org_update',
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
  MEMBERSHIP: 'Membership',
  SUBSCRIPTION: 'Subscription',
} as const;
