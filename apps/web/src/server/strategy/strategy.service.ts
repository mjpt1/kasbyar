import { prisma } from '@/lib/prisma';
import { chatWithLlm } from '@/lib/ai';
import { buildOperationalContext } from '@/server/intelligence/operational-context';

type StrategyPlanBody = {
  goal: string;
  source: 'heuristic' | 'llm' | 'llm-text';
  pillars: Array<{
    name: string;
    currentMonth?: number;
    targetIncreasePct?: number;
    actions: string[];
  }>;
  sales: {
    staleLeads: number;
    focus: string[];
    openLeads: number;
  };
  kpis: Array<{ name: string; value: number }>;
  timeline: Record<string, string>;
  llmNotes?: string;
};

function buildHeuristicPlan(
  goal: string,
  ctx: Awaited<ReturnType<typeof buildOperationalContext>>,
): StrategyPlanBody {
  const needsHiring = ctx.pending_tasks > 20 || ctx.tasks_due_today > 5;
  const salesPressure = ctx.stale_lead_count > 0 || (ctx.week_sales_change_pct ?? 0) < 0;
  const cashPressure = ctx.overdue_invoice_count > 0;

  return {
    goal,
    source: 'heuristic',
    pillars: [
      {
        name: 'درآمد',
        currentMonth: ctx.month_sales ?? ctx.today_sales,
        targetIncreasePct: salesPressure ? 30 : 50,
        actions: [
          salesPressure ? 'فعال‌سازی پیگیری روزانه لیدهای راکد' : 'تقویت کانال فروش فعلی',
          'افزایش بودجه تبلیغات هدفمند تا ۱۵٪ در صورت حاشیه مثبت',
          'بهینه‌سازی نرخ تبدیل پیشنهادها',
        ],
      },
      {
        name: 'نقدینگی',
        actions: cashPressure
          ? [
              `پیگیری ${ctx.overdue_invoice_count} فاکتور معوق`,
              'اولویت وصول از مشتریان پرتکرار بدهکار',
              'بازنگری شرایط پرداخت برای مشتریان پرریسک',
            ]
          : ['حفظ چرخه وصول فعلی', 'رزرو نقدی برای ۳۰ روز عملیات'],
      },
      {
        name: 'عملیات و منابع',
        actions: [
          needsHiring ? 'استخدام/برون‌سپاری پشتیبانی برای کاهش انباشت وظایف' : 'تثبیت ظرفیت فعلی تیم',
          `بستن ${ctx.tasks_due_today} وظیفه سررسید امروز`,
          'اتوماسیون پیگیری‌های تکراری',
        ],
      },
    ],
    sales: {
      staleLeads: ctx.stale_lead_count,
      focus: ctx.top_stale_leads.slice(0, 5),
      openLeads: ctx.active_leads,
    },
    kpis: [
      { name: 'فروش ماه', value: ctx.month_sales ?? 0 },
      { name: 'لیدهای راکد', value: ctx.stale_lead_count },
      { name: 'مطالبات معوق', value: ctx.overdue_receivables },
      { name: 'وظایف باز', value: ctx.pending_tasks },
    ],
    timeline: {
      week1: 'تحلیل شکاف هدف، اولویت‌بندی لیدها و مطالبات',
      week2_4: 'اجرای کمپین فروش + پیگیری روزانه',
      month2_3: 'اندازه‌گیری KPI و تنظیم بودجه/قیمت',
    },
  };
}

export async function generateStrategyPlan(organizationId: string, goal: string) {
  const ctx = await buildOperationalContext(organizationId);
  const heuristic = buildHeuristicPlan(goal, ctx);

  const llm = await chatWithLlm({
    systemPrompt:
      'شما مشاور استراتژی کسب‌وکار ایرانی هستید. فقط JSON معتبر برگردانید با کلیدهای pillars (آرایه)، timeline (آبجکت)، kpis (آرایه). متن‌ها فارسی و عملیاتی باشند.',
    userContent: `هدف: ${goal}\nداده عملیاتی: ${JSON.stringify({
      month_sales: ctx.month_sales,
      stale_lead_count: ctx.stale_lead_count,
      overdue_invoice_count: ctx.overdue_invoice_count,
      pending_tasks: ctx.pending_tasks,
      week_sales_change_pct: ctx.week_sales_change_pct,
    })}\nپایه پیشنهادی: ${JSON.stringify(heuristic)}`,
    temperature: 0.4,
    maxTokens: 1200,
  });

  let plan: StrategyPlanBody = heuristic;
  if (llm) {
    try {
      const parsed = JSON.parse(llm) as Partial<StrategyPlanBody>;
      plan = {
        ...heuristic,
        ...parsed,
        goal,
        source: 'llm',
        timeline: parsed.timeline ?? heuristic.timeline,
        pillars: parsed.pillars ?? heuristic.pillars,
        kpis: parsed.kpis ?? heuristic.kpis,
      };
    } catch {
      plan = {
        ...heuristic,
        source: 'llm-text',
        llmNotes: llm.slice(0, 2000),
      };
    }
  }

  return prisma.strategyPlan.create({
    data: {
      organizationId,
      goal,
      status: 'ACTIVE',
      plan,
      timeline: plan.timeline,
    },
  });
}

export async function listStrategyPlans(organizationId: string) {
  return prisma.strategyPlan.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}
