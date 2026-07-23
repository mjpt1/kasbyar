export function formatFaNumber(value?: number | null): string {
  if (value === undefined || value === null) return '—';
  return new Intl.NumberFormat('fa-IR').format(value);
}

export function formatFaDate(value?: string | Date | null): string {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(typeof value === 'string' ? new Date(value) : value);
  } catch {
    return String(value);
  }
}

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: 'جدید',
  CONTACTED: 'تماس‌گرفته',
  QUALIFIED: 'واجد شرایط',
  PROPOSAL: 'پیشنهاد',
  WON: 'برنده',
  LOST: 'از دست‌رفته',
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'پیش‌نویس',
  SENT: 'ارسال‌شده',
  PARTIAL: 'پرداخت جزئی',
  PAID: 'پرداخت‌شده',
  OVERDUE: 'معوق',
  CANCELLED: 'لغو',
};

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  LOW: 'کم',
  MEDIUM: 'متوسط',
  HIGH: 'بالا',
  URGENT: 'فوری',
};
