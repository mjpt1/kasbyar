import { formatCurrency } from '@kesbyar/shared';
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

import { DemoDashboardWalkthrough } from '@/components/demo/demo-dashboard-walkthrough';
import { PackDashboardWidgets } from '@/components/dashboard/pack-dashboard-widgets';
import { StatCard } from '@/components/dashboard/stat-card';
import { ConversationPanel } from '@/components/conversation/conversation-panel';
import { OperationalInsightCard } from '@/components/dashboard/operational-insight-card';
import { SalesTrendChart } from '@/components/dashboard/sales-trend-chart';
import { PageHeader } from '@/components/layout/page-header';
import { InlineEmpty } from '@/components/shared/inline-empty';
import { JalaliDate } from '@/components/shared/jalali-date';
import { InvoiceStatusBadge } from '@/components/shared/status-badges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSession } from '@/lib/auth/session';
import { getDashboardDetails, getSalesTrend } from '@/server/dashboard/dashboard.service';

export default async function DashboardPage() {
  const session = await requireSession();
  const [{ stats, overdue, staleLeads, recentActivity, upcomingTasks }, salesTrend] =
    await Promise.all([
      getDashboardDetails(session.organizationId),
      getSalesTrend(session.organizationId),
    ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="داشبورد"
        description={`وضعیت عملیات ${session.organizationName}`}
      />

      <DemoDashboardWalkthrough organizationId={session.organizationId} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="فروش امروز"
          value={formatCurrency(stats.todaySales)}
          subtitle="مجموع پرداخت‌های ثبت‌شده امروز"
          href="/payments"
          icon={TrendingUp}
        />
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
        <StatCard
          title="لیدهای فعال"
          value={String(stats.activeLeads)}
          subtitle="در قیف فروش"
          href="/leads"
          icon={Target}
        />
        <StatCard
          title="وظایف در انتظار"
          value={String(stats.pendingTasks)}
          subtitle="باز و در حال انجام"
          href="/tasks"
          icon={CheckSquare}
        />
        <StatCard
          title="مشتریان جدید این ماه"
          value={String(stats.newCustomersThisMonth)}
          href="/customers"
          icon={Users}
        />
      </div>

      <PackDashboardWidgets organizationId={session.organizationId} />

      <OperationalInsightCard organizationId={session.organizationId} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">روند فروش ۷ روز اخیر</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesTrendChart data={salesTrend} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">لیدهای نیازمند پیگیری</CardTitle>
            </CardHeader>
            <CardContent>
              {staleLeads.length === 0 ? (
                <InlineEmpty
                  icon={Target}
                  message="لید بدون پیگیری ندارید."
                  hint="لیدهای جدید را از بخش لیدها مدیریت کنید."
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
        </div>

        <ConversationPanel />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">آخرین فعالیت‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentActivity.length === 0 ? (
              <InlineEmpty message="هنوز فعالیتی ثبت نشده." hint="با ثبت مشتری، فاکتور یا لید فعالیت‌ها اینجا نمایش داده می‌شوند." />
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
