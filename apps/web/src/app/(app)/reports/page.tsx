import {
  formatCurrency,
  INVOICE_STATUS_LABELS,
} from '@kesbyar/shared';

import { PLAN_FEATURE_LABELS } from '@kesbyar/shared';

import { UpgradePrompt } from '@/components/billing/upgrade-prompt';
import { ReportsInvoiceChart } from '@/components/features/reports/reports-invoice-chart';
import { PageHeader } from '@/components/layout/page-header';
import { InvoiceStatusBadge } from '@/components/shared/status-badges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSession } from '@/lib/auth/session';
import { checkFeature } from '@/server/billing/entitlement.service';
import { getReportsOverview } from '@/server/reports/reports.service';

export default async function ReportsPage() {
  const session = await requireSession();
  const access = await checkFeature(session.organizationId, 'reports');

  if (!access.allowed) {
    return (
      <div className="space-y-6">
        <PageHeader title="گزارش‌ها" description="نمای کلی عملکرد مالی و فروش" />
        <UpgradePrompt
          message={
            access.message ??
            `قابلیت ${PLAN_FEATURE_LABELS.reports} در طرح فعلی شما فعال نیست.`
          }
          suggestedPlan={access.suggestedPlan}
        />
      </div>
    );
  }

  const overview = await getReportsOverview(session.organizationId);

  const chartData = overview.invoiceByStatus.map((row) => ({
    status: row.status,
    label: INVOICE_STATUS_LABELS[row.status] ?? row.status,
    count: row._count,
    total: Number(row._sum.total ?? 0),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="گزارش‌ها"
        description="نمای کلی عملکرد مالی و فروش"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">مشتریان فعال</div>
            <div className="mt-1 text-2xl font-bold">{overview.totalCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">لیدهای فعال</div>
            <div className="mt-1 text-2xl font-bold">{overview.activeLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">دریافتی این ماه</div>
            <div className="mt-1 text-2xl font-bold">
              {formatCurrency(overview.monthlyPaymentTotal)}
            </div>
            <div className="text-xs text-muted-foreground">
              {overview.monthlyPaymentCount} پرداخت
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">مطالبات معوق</div>
            <div className="mt-1 text-2xl font-bold text-destructive">
              {formatCurrency(overview.overdueReceivables)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">فاکتورهای پرداخت‌نشده</div>
            <div className="mt-1 text-2xl font-bold">{overview.unpaidInvoiceCount}</div>
            <div className="text-xs text-muted-foreground">
              {formatCurrency(overview.unpaidInvoiceTotal)} مانده
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">وظایف امروز</div>
            <div className="mt-1 text-2xl font-bold">{overview.tasksDueToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">وظایف انجام‌شده (ماه)</div>
            <div className="mt-1 text-2xl font-bold">{overview.tasksCompletedThisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">لیدهای بدون پیگیری</div>
            <div className="mt-1 text-2xl font-bold">{overview.staleLeadCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">نمودار فاکتورها بر اساس وضعیت</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportsInvoiceChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">فاکتورها بر اساس وضعیت</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.invoiceByStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground">داده‌ای موجود نیست.</p>
            ) : (
              overview.invoiceByStatus.map((row) => (
                <div
                  key={row.status}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-2">
                    <InvoiceStatusBadge status={row.status} />
                    <span className="text-sm text-muted-foreground">
                      {INVOICE_STATUS_LABELS[row.status] ?? row.status}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{row._count} فاکتور</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(Number(row._sum.total ?? 0))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">مشتریان برتر این ماه</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.topCustomers.length === 0 ? (
              <p className="text-sm text-muted-foreground">فروشی این ماه ثبت نشده.</p>
            ) : (
              overview.topCustomers.map((customer, index) => (
                <div
                  key={customer.customerId}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {index + 1}
                    </span>
                    <span className="font-medium">{customer.customerName}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(customer.total)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
