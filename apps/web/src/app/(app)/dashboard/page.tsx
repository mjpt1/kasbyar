import {
  formatCurrency,
  getPackLayoutModel,
  getPackNavItemLabel,
  isPackNavKeyEnabled,
  LEAD_LABELS,
} from '@kesbyar/shared';
import {
  AlertCircle,
  CalendarClock,
  CheckSquare,
  Receipt,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { PackDashboardWidgets } from '@/components/dashboard/pack-dashboard-widgets';
import { StatCard } from '@/components/dashboard/stat-card';
import { ConversationPanel } from '@/components/conversation/conversation-panel';
import { OperationalInsightCard } from '@/components/dashboard/operational-insight-card';
import { SalesTrendChart } from '@/components/dashboard/sales-trend-chart';
import { HelpLink } from '@/components/help/help-link';
import { PageHeader } from '@/components/layout/page-header';
import { InlineEmpty } from '@/components/shared/inline-empty';
import { JalaliDate } from '@/components/shared/jalali-date';
import { InvoiceStatusBadge } from '@/components/shared/status-badges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSession } from '@/lib/auth/session';
import { getDashboardDetails, getSalesTrend } from '@/server/dashboard/dashboard.service';

export default async function DashboardPage() {
  const session = await requireSession();
  const pack = session.industryPack;
  const layout = getPackLayoutModel(pack);
  const showLeads = isPackNavKeyEnabled(pack, 'leads');
  const showTasks = isPackNavKeyEnabled(pack, 'tasks');
  const showConversation = isPackNavKeyEnabled(pack, 'conversation');
  const showPayments = isPackNavKeyEnabled(pack, 'payments');
  const customersLabel = getPackNavItemLabel(pack, 'customers', 'مشتریان');
  const leadsActiveLabel = getPackNavItemLabel(pack, 'leads', LEAD_LABELS.active);
  const leadsStaleLabel = getPackNavItemLabel(pack, 'leads', LEAD_LABELS.stale);

  const [{ stats, overdue, staleLeads, recentActivity, upcomingTasks }, salesTrend] =
    await Promise.all([
      getDashboardDetails(session.organizationId),
      getSalesTrend(session.organizationId),
    ]);

  const statsBlock = (
    <div className="ky-dash-stats">
      {showPayments ? (
        <StatCard
          title="فروش امروز"
          value={formatCurrency(stats.todaySales)}
          subtitle="مجموع پرداخت‌های ثبت‌شده امروز"
          href="/payments"
          icon={TrendingUp}
        />
      ) : null}
      <StatCard
        title="فاکتورهای باز"
        value={String(stats.openInvoices)}
        subtitle="پیش‌نویس، ارسال‌شده و جزئی"
        href="/invoices"
        icon={Receipt}
      />
      <StatCard
        title="مطالبات سررسید گذشته"
        value={formatCurrency(stats.overdueReceivables)}
        subtitle="نیازمند پیگیری"
        href="/invoices"
        icon={AlertCircle}
      />
      {showLeads ? (
        <StatCard
          title={leadsActiveLabel}
          value={String(stats.activeLeads)}
          subtitle="در قیف فروش"
          href="/leads"
          icon={Target}
        />
      ) : null}
      {showTasks ? (
        <StatCard
          title="وظایف در انتظار"
          value={String(stats.pendingTasks)}
          subtitle="باز و در حال انجام"
          href="/tasks"
          icon={CheckSquare}
        />
      ) : null}
      <StatCard
        title={`${customersLabel} جدید این ماه`}
        value={String(stats.newCustomersThisMonth)}
        href="/customers"
        icon={Users}
      />
    </div>
  );

  const scheduleHero =
    layout === 'calendar_forward' || layout === 'schedule_grid' ? (
      <Card className="ky-pack-hero">
        <CardHeader>
          <CardTitle className="text-base">
            {layout === 'calendar_forward' ? 'برنامه و پیگیری امروز' : 'جدول زمانی'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {showTasks && upcomingTasks.length > 0 ? (
            upcomingTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="rounded-md border border-border/70 bg-card/80 p-3">
                <div className="font-medium">{task.title}</div>
                {task.dueDate ? (
                  <div className="text-sm text-muted-foreground">
                    سررسید: <JalaliDate date={task.dueDate} />
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <InlineEmpty
              icon={CalendarClock}
              message="آیتم زمان‌بندی‌شده‌ای برای نمایش نیست."
              hint="نوبت‌ها و وظایف اینجا برجسته می‌شوند."
            />
          )}
        </CardContent>
      </Card>
    ) : null;

  return (
    <div className="ky-pack-panel space-y-6">
      <PageHeader
        title="داشبورد"
        description={`وضعیت عملیات ${session.organizationName}`}
        actions={<HelpLink section="dashboard" />}
      />

      {layout === 'calendar_forward' || layout === 'order_board' ? (
        <div className="ky-dash-shell">
          {layout === 'calendar_forward' ? scheduleHero : statsBlock}
          {layout === 'calendar_forward' ? statsBlock : (
            <div className="ky-pack-hero space-y-4">
              <PackDashboardWidgets organizationId={session.organizationId} />
              <OperationalInsightCard organizationId={session.organizationId} />
            </div>
          )}
        </div>
      ) : (
        <>
          {scheduleHero}
          {statsBlock}
        </>
      )}

      {layout !== 'order_board' ? (
        <PackDashboardWidgets organizationId={session.organizationId} />
      ) : null}

      {layout !== 'order_board' ? (
        <OperationalInsightCard organizationId={session.organizationId} />
      ) : null}

      <Card className="ky-pack-card">
        <CardHeader>
          <CardTitle className="text-base">روند فروش ۷ روز اخیر</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesTrendChart data={salesTrend} />
        </CardContent>
      </Card>

      <div className={`grid gap-6 ${showConversation ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
        <div className={`space-y-6 ${showConversation ? 'lg:col-span-2' : ''}`}>
          <Card className="ky-pack-card">
            <CardHeader>
              <CardTitle className="text-base">فاکتورهای سررسید گذشته</CardTitle>
            </CardHeader>
            <CardContent>
              {overdue.length === 0 ? (
                <InlineEmpty
                  icon={Receipt}
                  message="فاکتور سررسید گذشته‌ای ندارید."
                  hint="وضعیت خوبی است — فاکتورهای باز را از بخش فاکتورها پیگیری کنید."
                />
              ) : (
                <div className="space-y-3">
                  {overdue.map((inv) => (
                    <Link
                      key={inv.id}
                      href={`/invoices/${inv.id}`}
                      className="ky-list-row p-3 hover:bg-muted/50"
                    >
                      <div>
                        <div className="font-medium">{inv.customer.name}</div>
                        <div className="text-sm text-muted-foreground">{inv.number}</div>
                      </div>
                      <div className="text-start sm:text-left">
                        <InvoiceStatusBadge status={inv.status} />
                        <div className="mt-1 text-sm">{formatCurrency(Number(inv.total))}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {showLeads ? (
            <Card className="ky-pack-card">
              <CardHeader>
                <CardTitle className="text-base">{leadsStaleLabel}</CardTitle>
              </CardHeader>
              <CardContent>
                {staleLeads.length === 0 ? (
                  <InlineEmpty
                    icon={Target}
                    message={`${LEAD_LABELS.singular} بدون پیگیری ندارید.`}
                    hint={`${LEAD_LABELS.plural} جدید را از همان بخش مدیریت کنید.`}
                  />
                ) : (
                  <div className="space-y-2">
                    {staleLeads.map((lead) => (
                      <Link
                        key={lead.id}
                        href={`/leads/${lead.id}`}
                        className="block rounded-md border p-3 hover:bg-muted/50"
                      >
                        <div className="font-medium">{lead.title}</div>
                        {lead.contactPhone ? (
                          <div className="text-sm text-muted-foreground">{lead.contactPhone}</div>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>

        {showConversation ? <ConversationPanel /> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {showTasks && layout !== 'calendar_forward' ? (
          <Card className="ky-pack-card">
            <CardHeader>
              <CardTitle className="text-base">وظایف پیشِ رو</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingTasks.length === 0 ? (
                <InlineEmpty
                  icon={CalendarClock}
                  message="وظیفه‌ای در هفتهٔ پیشِ رو ندارید."
                />
              ) : (
                upcomingTasks.map((task) => (
                  <div key={task.id} className="rounded-md border p-3">
                    <div className="font-medium">{task.title}</div>
                    {task.dueDate ? (
                      <div className="text-sm text-muted-foreground">
                        سررسید: <JalaliDate date={task.dueDate} />
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ) : null}

        <Card className="ky-pack-card">
          <CardHeader>
            <CardTitle className="text-base">آخرین فعالیت‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentActivity.length === 0 ? (
              <InlineEmpty
                message="هنوز فعالیتی ثبت نشده."
                hint={
                  showLeads
                    ? `با ثبت مشتری، فاکتور یا ${LEAD_LABELS.singular} فعالیت‌ها اینجا نمایش داده می‌شوند.`
                    : 'با ثبت مشتری و فاکتور فعالیت‌ها اینجا نمایش داده می‌شوند.'
                }
              />
            ) : (
              recentActivity.map((act) => (
                <div key={act.id} className="rounded-md border p-3">
                  <div className="font-medium">{act.title}</div>
                  <div className="text-xs text-muted-foreground">
                    <JalaliDate date={act.createdAt} showTime />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
