/**
 * Org-scoped product modules (افزونه / ماژول) — real features, not demo placeholders.
 */

export type OrgModuleCategory = 'integration' | 'ai' | 'operations';

export type OrgModuleDefinition = {
  key: string;
  nameFa: string;
  descriptionFa: string;
  category: OrgModuleCategory;
  /** Settings path when module needs configuration after enable */
  settingsHref?: string;
  /** Linked IntegrationConfig.provider when category is integration */
  integrationProvider?: 'payment' | 'kavenegar' | 'moadian' | 'whatsapp' | 'resend' | 'voip' | 'telegram' | 'instagram';
  /** Default enabled for new orgs */
  defaultEnabled: boolean;
};

export const ORG_MODULE_CATALOG: OrgModuleDefinition[] = [
  {
    key: 'payment_gateway',
    nameFa: 'درگاه پرداخت آنلاین',
    descriptionFa: 'پرداخت آنلاین فاکتور با زرین‌پال یا آیدی‌پی',
    category: 'integration',
    settingsHref: '/settings',
    integrationProvider: 'payment',
    defaultEnabled: true,
  },
  {
    key: 'sms_kavenegar',
    nameFa: 'پیامک (کاوه‌نگار)',
    descriptionFa: 'ارسال یادآوری پرداخت و پیامک عملیاتی',
    category: 'integration',
    settingsHref: '/settings',
    integrationProvider: 'kavenegar',
    defaultEnabled: true,
  },
  {
    key: 'moadian',
    nameFa: 'سامانه مؤدیان',
    descriptionFa: 'صدور و ارسال فاکتور الکترونیکی از طریق واسط مؤدیان',
    category: 'integration',
    settingsHref: '/settings',
    integrationProvider: 'moadian',
    defaultEnabled: true,
  },
  {
    key: 'ai_assistant',
    nameFa: 'دستیار هوشمند',
    descriptionFa: 'پرسش از داده‌های فروش، مطالبات و وظایف',
    category: 'ai',
    settingsHref: '/conversation',
    defaultEnabled: true,
  },
  {
    key: 'ai_briefing',
    nameFa: 'اتاق فرمان و بریفینگ',
    descriptionFa: 'خلاصه روزانه عملیات و پیشنهاد اقدام',
    category: 'ai',
    settingsHref: '/command',
    defaultEnabled: true,
  },
  {
    key: 'automation',
    nameFa: 'اتوماسیون',
    descriptionFa: 'قوانین خودکار برای پیگیری سرنخ و وظایف',
    category: 'operations',
    settingsHref: '/automation',
    defaultEnabled: true,
  },
  {
    key: 'push_notifications',
    nameFa: 'اعلان مرورگر (Push)',
    descriptionFa: 'اعلان‌های فوری در مرورگر برای رویدادهای مهم',
    category: 'operations',
    defaultEnabled: true,
  },
  {
    key: 'inventory',
    nameFa: 'مدیریت موجودی',
    descriptionFa: 'ردیابی موجودی کالا برای بسته خرده‌فروشی',
    category: 'operations',
    settingsHref: '/retail/inventory',
    defaultEnabled: true,
  },
  {
    key: 'internal_chat',
    nameFa: 'گفتگوی داخلی تیم',
    descriptionFa: 'پیام مستقیم و کانال گفتگو بین اعضای شرکت',
    category: 'operations',
    settingsHref: '/chat',
    defaultEnabled: true,
  },
  {
    key: 'support_tickets',
    nameFa: 'تیکت پشتیبانی',
    descriptionFa: 'ارسال درخواست به تیم پشتیبانی کسب‌یار',
    category: 'operations',
    settingsHref: '/support',
    defaultEnabled: true,
  },
  {
    key: 'customer_inbox',
    nameFa: 'صندوق پیام مشتری (واتساپ)',
    descriptionFa: 'دریافت و ارسال پیام واتساپ در پروفایل مشتری و سرنخ',
    category: 'integration',
    settingsHref: '/settings',
    integrationProvider: 'whatsapp',
    defaultEnabled: true,
  },
  {
    key: 'email_resend',
    nameFa: 'ایمیل (Resend)',
    descriptionFa: 'ارسال و دریافت ایمیل مشتری در CRM',
    category: 'integration',
    settingsHref: '/settings',
    integrationProvider: 'resend',
    defaultEnabled: true,
  },
  {
    key: 'voip_calls',
    nameFa: 'تماس VoIP',
    descriptionFa: 'ثبت خودکار تماس‌های ورودی/خروجی از مرکز تماس یا PBX',
    category: 'integration',
    settingsHref: '/settings',
    integrationProvider: 'voip',
    defaultEnabled: true,
  },
  {
    key: 'telegram_inbox',
    nameFa: 'تلگرام (ربات)',
    descriptionFa: 'دریافت و ارسال پیام تلگرام در صندوق پیام CRM',
    category: 'integration',
    settingsHref: '/settings',
    integrationProvider: 'telegram',
    defaultEnabled: true,
  },
  {
    key: 'instagram_dm',
    nameFa: 'اینستاگرام DM',
    descriptionFa: 'آماده‌سازی webhook و شناسه صفحه — پشتیبانی کامل DM به‌زودی',
    category: 'integration',
    settingsHref: '/settings',
    integrationProvider: 'instagram',
    defaultEnabled: false,
  },
];

export const ORG_MODULE_BY_KEY = Object.fromEntries(
  ORG_MODULE_CATALOG.map((m) => [m.key, m]),
) as Record<string, OrgModuleDefinition>;

export const ORG_MODULE_CATEGORY_LABELS: Record<OrgModuleCategory, string> = {
  integration: 'یکپارچه‌سازی',
  ai: 'هوش مصنوعی',
  operations: 'عملیات',
};
