import type {
  AssistantAskResponse,
  OperationalContextSnapshot,
  OperationalSummaryResponse,
} from '@kesbyar/shared/ai';
import { formatCurrency } from '@kesbyar/shared';

export function buildLocalOperationalSummary(
  ctx: OperationalContextSnapshot,
): OperationalSummaryResponse {
  const highlights: string[] = [];
  const parts: string[] = ['خلاصه وضعیت عملیات امروز:'];

  parts.push(`• فروش امروز: ${formatCurrency(ctx.today_sales)}`);
  highlights.push(`فروش امروز ${formatCurrency(ctx.today_sales)}`);

  if (ctx.overdue_receivables > 0) {
    parts.push(
      `• مطالبات سررسید گذشته: ${formatCurrency(ctx.overdue_receivables)} (${ctx.overdue_invoice_count} فاکتور)`,
    );
    highlights.push('پیگیری مطالبات معوق توصیه می‌شود');
    if (ctx.top_overdue_customers.length > 0) {
      parts.push(`  مشتریان: ${ctx.top_overdue_customers.slice(0, 3).join('، ')}`);
    }
  } else {
    parts.push('• فاکتور سررسید گذشته‌ای ندارید.');
  }

  if (ctx.stale_lead_count > 0) {
    parts.push(`• ${ctx.stale_lead_count} لید بدون پیگیری اخیر`);
    highlights.push('لیدهای عقب‌افتاده نیاز به تماس دارند');
    if (ctx.top_stale_leads.length > 0) {
      parts.push(`  نمونه: ${ctx.top_stale_leads.slice(0, 3).join('، ')}`);
    }
  }

  if (ctx.tasks_due_today > 0) {
    parts.push(`• ${ctx.tasks_due_today} وظیفه سررسید امروز`);
    if (ctx.tasks_due_today_titles.length > 0) {
      parts.push(`  ${ctx.tasks_due_today_titles.slice(0, 3).join('؛ ')}`);
    }
  }

  parts.push(`• ${ctx.open_invoices} فاکتور باز و ${ctx.active_leads} لید فعال`);

  return {
    summary: parts.join('\n'),
    highlights,
    confidence: 0.75,
    generated_at: new Date().toISOString(),
  };
}

export function buildLocalAssistantAnswer(
  question: string,
  ctx: OperationalContextSnapshot,
): AssistantAskResponse {
  const q = question.trim();

  if (q.includes('فروش') && q.includes('امروز')) {
    return {
      answer: `فروش امروز شما ${formatCurrency(ctx.today_sales)} است.`,
      confidence: 0.9,
      sources: ['dashboard', 'local-fallback'],
      degraded: true,
    };
  }

  if (q.includes('بدهکار') || q.includes('مطالبات') || q.includes('سررسید')) {
    if (ctx.overdue_invoice_count === 0) {
      return {
        answer: 'در حال حاضر فاکتور سررسید گذشته‌ای ندارید.',
        confidence: 0.9,
        sources: ['invoices', 'local-fallback'],
        degraded: true,
      };
    }
    const list = ctx.top_overdue_customers.slice(0, 5).map((n) => `• ${n}`).join('\n');
    return {
      answer: `${ctx.overdue_invoice_count} فاکتور سررسید گذشته به مبلغ ${formatCurrency(ctx.overdue_receivables)}:\n${list}`,
      confidence: 0.85,
      sources: ['invoices', 'local-fallback'],
      degraded: true,
    };
  }

  if (q.includes('لید') || q.includes('پیگیری')) {
    if (ctx.stale_lead_count === 0) {
      return {
        answer: 'لید بدون پیگیری در هفتهٔ اخیر ندارید.',
        confidence: 0.9,
        sources: ['leads', 'local-fallback'],
        degraded: true,
      };
    }
    const list = ctx.top_stale_leads.map((t) => `• ${t}`).join('\n');
    return {
      answer: `${ctx.stale_lead_count} لید نیاز به پیگیری دارند:\n${list}`,
      confidence: 0.85,
      sources: ['leads', 'local-fallback'],
      degraded: true,
    };
  }

  if (q.includes('وظیفه') || q.includes('کار')) {
    if (ctx.tasks_due_today === 0) {
      return {
        answer: 'وظیفه‌ای با سررسید امروز ندارید.',
        confidence: 0.85,
        sources: ['tasks', 'local-fallback'],
        degraded: true,
      };
    }
    const list = ctx.tasks_due_today_titles.map((t) => `• ${t}`).join('\n');
    return {
      answer: `${ctx.tasks_due_today} وظیفه برای امروز:\n${list}`,
      confidence: 0.85,
      sources: ['tasks', 'local-fallback'],
      degraded: true,
    };
  }

  return {
    answer:
      'سؤال شما دریافت شد. برای جزئیات بیشتر از داشبورد، گزارش‌ها یا ماژول‌های مربوطه استفاده کنید.',
    confidence: 0.5,
    sources: ['local-fallback'],
    degraded: true,
  };
}
