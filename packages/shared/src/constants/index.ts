export const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const;

export const JALALI_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

export const JALALI_WEEKDAY_NAMES = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
] as const;

export const APP_NAME = 'کسب‌یار';
export const APP_NAME_EN = 'KesbYar';
export const DEFAULT_CURRENCY = 'IRR';
export const DEFAULT_TIMEZONE = 'Asia/Tehran';

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: 'جدید',
  CONTACTED: 'تماس گرفته‌شده',
  QUALIFIED: 'واجد شرایط',
  PROPOSAL: 'پیشنهاد ارسال‌شده',
  WON: 'موفق',
  LOST: 'از دست رفته',
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'پیش‌نویس',
  SENT: 'ارسال‌شده',
  PARTIAL: 'پرداخت جزئی',
  PAID: 'پرداخت‌شده',
  OVERDUE: 'سررسید گذشته',
  CANCELLED: 'لغو‌شده',
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  TODO: 'انجام نشده',
  IN_PROGRESS: 'در حال انجام',
  DONE: 'انجام‌شده',
  CANCELLED: 'لغو‌شده',
};

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  LOW: 'کم',
  MEDIUM: 'متوسط',
  HIGH: 'بالا',
  URGENT: 'فوری',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'نقد',
  CARD: 'کارت',
  TRANSFER: 'انتقال بانکی',
  CHEQUE: 'چک',
  ONLINE: 'آنلاین',
  OTHER: 'سایر',
};

export const MEMBERSHIP_ROLE_LABELS: Record<string, string> = {
  OWNER: 'مالک',
  ADMIN: 'مدیر',
  MANAGER: 'سرپرست',
  STAFF: 'کارمند',
  VIEWER: 'بازدیدکننده',
};

export const INDUSTRY_PACK_LABELS: Record<string, string> = {
  GENERAL: 'عمومی',
  CLINIC: 'کلینیک / مطب',
  TRAVEL_AGENCY: 'آژانس مسافرتی',
  RETAIL: 'خرده‌فروشی',
};

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  REFERRAL: 'معرفی',
  INSTAGRAM: 'اینستاگرام',
  WHATSAPP: 'واتساپ',
  TELEGRAM: 'تلگرام',
  WEBSITE: 'وب‌سایت',
  WALK_IN: 'حضوری',
  PHONE: 'تلفن',
  OTHER: 'سایر',
};

export const AUTOMATION_TRIGGER_LABELS: Record<string, string> = {
  INVOICE_OVERDUE: 'سررسید فاکتور',
  LEAD_STALE: 'لید بدون پیگیری',
  TASK_DUE: 'سررسید وظیفه',
  PAYMENT_RECEIVED: 'دریافت پرداخت',
  CUSTOMER_CREATED: 'مشتری جدید',
};

export const AUTOMATION_ACTION_LABELS: Record<string, string> = {
  CREATE_TASK: 'ایجاد وظیفه',
  SEND_REMINDER: 'ارسال یادآوری',
  NOTIFY_USER: 'اعلان به کاربر',
  UPDATE_STATUS: 'به‌روزرسانی وضعیت',
};
