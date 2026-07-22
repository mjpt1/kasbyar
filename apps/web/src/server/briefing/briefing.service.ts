import type { DailyBriefing } from '@kesbyar/shared';
import { formatCurrency } from '@kesbyar/shared';

import { fetchOperationalSummary } from '@/lib/ai';
import { buildLocalOperationalSummary } from '@/server/intelligence/local-fallback';
import { buildOperationalContext } from '@/server/intelligence/operational-context';
import { getLatestHealthScores } from '@/server/health/health-score.service';
import { getLearningPreferences } from '@/server/platform/platform.service';

export async function buildDailyBriefing(
  organizationId: string,
  userName: string,
): Promise<DailyBriefing> {
  const [context, healthScores, prefs] = await Promise.all([
    buildOperationalContext(organizationId),
    getLatestHealthScores(organizationId),
    getLearningPreferences(organizationId),
  ]);

  const aiResult = await fetchOperationalSummary({ organization_id: organizationId, context });
  const local = buildLocalOperationalSummary(context);
  const summaryData = aiResult.ok ? aiResult.data : local;
  const degraded = !aiResult.ok;

  const alerts: DailyBriefing['alerts'] = [];

  if (context.overdue_receivables > 0) {
    alerts.push({
      level: context.overdue_invoice_count >= 3 ? 'critical' : 'warning',
      title: 'مطالبات معوق',
      description: `${formatCurrency(context.overdue_receivables)} ریال در ${context.overdue_invoice_count} فاکتور`,
      dimension: 'FINANCIAL',
    });
  }

  if (context.stale_lead_count > 0) {
    alerts.push({
      level: 'warning',
      title: 'لیدهای بدون پیگیری',
      description: `${context.stale_lead_count} لید نیاز به پیگیری دارد`,
      dimension: 'SALES',
    });
  }

  if (context.tasks_due_today > 0) {
    alerts.push({
      level: 'warning',
      title: 'وظایف امروز',
      description: `${context.tasks_due_today} وظیفه سررسید امروز دارد`,
      dimension: 'OPERATIONS',
    });
  }

  if (context.pending_tasks > 25) {
    alerts.push({
      level: 'warning',
      title: 'انباشت وظایف باز',
      description: `${context.pending_tasks} وظیفه باز — اولویت‌بندی لازم است`,
      dimension: 'OPERATIONS',
    });
  }

  const financial = healthScores.find((s) => s.dimension === 'FINANCIAL');
  if (financial && financial.score < 60) {
    alerts.push({
      level: 'critical',
      title: 'سلامت مالی پایین',
      description: `نمره مالی: ${financial.score} از ۱۰۰`,
      dimension: 'FINANCIAL',
    });
  }

  const salesHealth = healthScores.find((s) => s.dimension === 'SALES');
  if (salesHealth && salesHealth.score >= 70) {
    alerts.push({
      level: 'ok',
      title: 'فروش در وضعیت مناسب',
      description: `نمره فروش: ${salesHealth.score} از ۱۰۰`,
      dimension: 'SALES',
    });
  }

  const recommendations: DailyBriefing['recommendations'] = [];

  if (context.stale_lead_count > 0) {
    const leads = context.top_stale_leads.slice(0, 3).join('، ') || 'لیدهای راکد';
    recommendations.push({
      id: `rec-stale-leads-${Date.now()}`,
      title: 'پیگیری لیدهای راکد',
      description: `با ${leads} تماس بگیرید`,
      priority: 'high',
      actionType: 'CREATE_TASK',
      requiresConfirmation: true,
      payload: {
        actionType: 'CREATE_TASK',
        title: `پیگیری لیدهای راکد: ${leads}`,
        description: `اتاق فرمان — ${context.stale_lead_count} لید بدون پیگیری`,
      },
    });
  }

  if (context.overdue_invoice_count > 0) {
    const customers = context.top_overdue_customers.slice(0, 3).join('، ') || 'مشتریان بدهکار';
    recommendations.push({
      id: `rec-overdue-${Date.now()}`,
      title: 'پیگیری مطالبات',
      description: `پیگیری از ${customers}`,
      priority: 'high',
      actionType: 'CREATE_TASK',
      requiresConfirmation: true,
      payload: {
        actionType: 'CREATE_TASK',
        title: `پیگیری مطالبات: ${customers}`,
        description: `مبلغ معوق: ${formatCurrency(context.overdue_receivables)} ریال`,
      },
    });
  }

  if (context.tasks_due_today > 0) {
    recommendations.push({
      id: `rec-tasks-today-${Date.now()}`,
      title: 'بستن وظایف امروز',
      description: `${context.tasks_due_today} وظیفه امروز سررسید دارد`,
      priority: 'medium',
      actionType: 'CREATE_TASK',
      requiresConfirmation: true,
      payload: {
        actionType: 'CREATE_TASK',
        title: 'مرور و بستن وظایف سررسید امروز',
        description: 'از اتاق فرمان پیشنهاد شده است',
      },
    });
  }

  if ((context.week_sales_change_pct ?? 0) < -10) {
    recommendations.push({
      id: `rec-sales-drop-${Date.now()}`,
      title: 'بررسی افت فروش',
      description: 'فروش هفتگی بیش از ۱۰٪ کاهش داشته — بودجه تبلیغات یا قیمت‌گذاری را بازبینی کنید',
      priority: 'medium',
      actionType: 'CREATE_TASK',
      requiresConfirmation: true,
      payload: {
        actionType: 'CREATE_TASK',
        title: 'تحلیل افت فروش هفتگی',
        description: `تغییر هفته: ${context.week_sales_change_pct?.toFixed(1)}٪`,
      },
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: `rec-ops-review-${Date.now()}`,
      title: 'مرور وضعیت عملیاتی',
      description: 'وضعیت پایدار است — یک مرور کوتاه هفتگی پیشنهاد می‌شود',
      priority: 'low',
      actionType: 'CREATE_TASK',
      requiresConfirmation: true,
      payload: {
        actionType: 'CREATE_TASK',
        title: 'مرور هفتگی وضعیت کسب‌وکار',
        description: 'پیشنهاد اتاق فرمان برای حفظ ثبات عملیاتی',
      },
    });
  }

  const priorityBoost = prefs.preferredAgents;
  recommendations.sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 };
    const base = rank[a.priority] - rank[b.priority];
    if (base !== 0) return base;
    const aBoost = a.actionType && priorityBoost.includes('CEO') ? -1 : 0;
    return aBoost;
  });

  return {
    greeting: `سلام ${userName}`,
    summary: summaryData.summary,
    alerts,
    recommendations,
    healthScores,
    generatedAt: new Date().toISOString(),
    degraded,
  };
}

/** Side-effect path only — call from POST/cron, never from GET. Dedupe is once per day. */
export async function notifyDailyBriefingAlerts(
  organizationId: string,
  briefing: Pick<DailyBriefing, 'alerts' | 'summary'>,
): Promise<void> {
  const criticalAlerts = briefing.alerts.filter(
    (a) => a.level === 'critical' || a.level === 'warning',
  );
  if (criticalAlerts.length === 0) return;

  const { notifyOrgAdmins } = await import('@/server/notifications/notification.service');
  const top = criticalAlerts
    .slice(0, 3)
    .map((a) => a.title)
    .join('، ');
  await notifyOrgAdmins(organizationId, {
    title: 'اولویت‌های امروز کسب‌وکار',
    body: top || briefing.summary.slice(0, 160),
    href: '/command',
    category: 'BRIEFING',
    dedupeKey: 'daily-briefing',
  });
}
