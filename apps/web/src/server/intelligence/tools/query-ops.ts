import type { OperationalContextSnapshot } from '@kesbyar/shared/ai';
import { formatCurrency } from '@kesbyar/shared';

export function querySalesSummary(ctx: OperationalContextSnapshot): string {
  const change = ctx.week_sales_change_pct;
  let trend = '';
  if (change !== undefined) {
    trend = change >= 0 ? ` (رشد ${change.toFixed(1)}٪ هفتگی)` : ` (افت ${Math.abs(change).toFixed(1)}٪ هفتگی)`;
  }
  return `فروش امروز: ${formatCurrency(ctx.today_sales)}؛ فروش هفتگی: ${formatCurrency(ctx.week_sales ?? ctx.today_sales)}${trend}`;
}

export function queryInvoicesSummary(ctx: OperationalContextSnapshot): string {
  if (ctx.overdue_invoice_count === 0) {
    return 'فاکتور سررسید گذشته‌ای ندارید.';
  }
  return `${ctx.overdue_invoice_count} فاکتور معوق به مبلغ ${formatCurrency(ctx.overdue_receivables)} — مشتریان: ${ctx.top_overdue_customers.slice(0, 5).join('، ')}`;
}

export function queryCustomersSummary(ctx: OperationalContextSnapshot): string {
  return `${ctx.active_leads} لید فعال؛ ${ctx.stale_lead_count} لید بدون پیگیری؛ ${ctx.new_customers_month ?? 0} مشتری جدید این ماه`;
}
