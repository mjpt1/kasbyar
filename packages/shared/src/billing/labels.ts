export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  TRIALING: 'دوره آزمایشی',
  ACTIVE: 'فعال',
  PAST_DUE: 'سررسید پرداخت',
  CANCELED: 'لغو‌شده',
  EXPIRED: 'منقضی',
};

export const BILLING_PERIOD_LABELS: Record<string, string> = {
  MONTHLY: 'ماهانه',
  YEARLY: 'سالانه',
};

export const PLAN_FEATURE_LABELS: Record<string, string> = {
  reports: 'گزارش‌های پایه',
  reportsAdvanced: 'گزارش‌های پیشرفته',
  aiAssistant: 'دستیار هوشمند',
  automation: 'اتوماسیون',
  files: 'مدیریت فایل',
  conversation: 'گفتگو با دستیار',
};

export const PLAN_QUOTA_LABELS: Record<string, string> = {
  members: 'اعضای تیم',
  customers: 'مشتریان',
  leads: 'لیدها',
  invoicesPerMonth: 'فاکتور در ماه',
  automationRules: 'قوانین اتوماسیون',
  fileAttachments: 'فایل‌های پیوست',
};
