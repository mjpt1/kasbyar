import type { CSSProperties } from 'react';
import {
  formatCurrencyWithOptionalToman,
  getPackTheme,
  LEAD_STATUS_LABELS,
  packThemeToCssVars,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from '@kesbyar/shared';
import { ClipboardList, Flag, Receipt, UserRound } from 'lucide-react';
import Link from 'next/link';

import { PortalLogoutButton } from '@/components/features/portal/portal-logout-button';
import { JalaliDate } from '@/components/shared/jalali-date';
import {
  InvoiceStatusBadge,
  LeadStatusBadge,
  TaskPriorityBadge,
  TaskStatusBadge,
} from '@/components/shared/status-badges';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CustomerPortalView as PortalData } from '@/server/portal/customer-portal.service';

export function CustomerPortalView({
  portal,
  showLogout = false,
}: {
  portal: PortalData;
  showLogout?: boolean;
}) {
  const showToman = portal.organization.showTomanAlongside;
  const customer = portal.customer;
  const contactBits = [
    customer.company,
    customer.phone,
    customer.email,
    [customer.city, customer.province].filter(Boolean).join('، ') || null,
    customer.address,
  ].filter(Boolean);

  const theme = getPackTheme(
    portal.organization.industryPack,
    portal.organization.industrySpecialty,
  );
  const themeVars = packThemeToCssVars(theme) as CSSProperties;

  return (
    <div
      className="ky-portal-shell min-h-screen px-4 py-10"
      dir="rtl"
      data-pack={portal.organization.industryPack}
      data-specialty={portal.organization.industrySpecialty ?? undefined}
      data-pack-theme={theme.id}
      style={themeVars}
    >
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="ky-metric-icon" aria-hidden>
            <Receipt className="size-4" />
          </span>
          <span>پورتال مشتری — {portal.organization.name}</span>
          {showLogout ? (
            <span className="w-full sm:ms-auto sm:w-auto">
              <PortalLogoutButton />
            </span>
          ) : null}
        </div>

        <Card className="ky-pack-card">
          <CardHeader>
            <div className="flex items-start gap-3">
              <span className="ky-avatar-chip mt-0.5" aria-hidden>
                <UserRound className="size-4" />
              </span>
              <div className="space-y-1">
                <CardTitle>{customer.name}</CardTitle>
                <CardDescription>
                  وضعیت حساب و پیگیری‌ها — اعتبار نشست تا{' '}
                  <JalaliDate date={portal.expiresAt} showTime />
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          {contactBits.length > 0 ? (
            <CardContent>
              <ul className="space-y-1 text-sm text-muted-foreground" role="list">
                {contactBits.map((bit) => (
                  <li
                    key={String(bit)}
                    dir={bit === customer.phone || bit === customer.email ? 'ltr' : 'rtl'}
                  >
                    {bit}
                  </li>
                ))}
              </ul>
            </CardContent>
          ) : null}
        </Card>

        <Card className="ky-pack-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="size-4" aria-hidden />
              فاکتورها
            </CardTitle>
            <CardDescription>وضعیت پرداخت و لینک پرداخت آنلاین (در صورت فعال بودن)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {portal.invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">فاکتور فعالی ثبت نشده است.</p>
            ) : (
              <ul className="space-y-3" role="list">
                {portal.invoices.map((invoice) => {
                  const remaining = Number(invoice.total) - Number(invoice.paidAmount);
                  const amountLabel = formatCurrencyWithOptionalToman(Math.max(remaining, 0), {
                    showToman,
                  });
                  const totalLabel = formatCurrencyWithOptionalToman(Number(invoice.total), {
                    showToman,
                  });
                  return (
                    <li
                      key={invoice.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-[calc(var(--radius)-4px)] border border-border/70 bg-background/50 p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium" dir="ltr">
                            {invoice.number}
                          </span>
                          <InvoiceStatusBadge status={invoice.status} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          مبلغ کل: {totalLabel} — صدور: <JalaliDate date={invoice.issueDate} />
                          {invoice.dueDate ? (
                            <>
                              {' '}
                              — سررسید: <JalaliDate date={invoice.dueDate} />
                            </>
                          ) : null}
                        </p>
                        {remaining > 0 ? (
                          <p className="text-sm">مانده: {amountLabel}</p>
                        ) : (
                          <p className="text-sm text-emerald-700 dark:text-emerald-400">تسویه شده</p>
                        )}
                      </div>
                      {invoice.payUrl && remaining > 0 ? (
                        <Button asChild size="sm">
                          <Link href={invoice.payUrl}>پرداخت آنلاین</Link>
                        </Button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="ky-pack-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Flag className="size-4" aria-hidden />
              درخواست‌ها و فرصت‌ها
            </CardTitle>
            <CardDescription>وضعیت سرنخ‌های مرتبط با حساب شما</CardDescription>
          </CardHeader>
          <CardContent>
            {portal.leads.length === 0 ? (
              <p className="text-sm text-muted-foreground">سرنخ فعالی ثبت نشده است.</p>
            ) : (
              <ul className="space-y-3" role="list">
                {portal.leads.map((lead) => (
                  <li key={lead.id} className="rounded-[calc(var(--radius)-4px)] border border-border/70 bg-background/50 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{lead.title}</span>
                      <LeadStatusBadge status={lead.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {lead.stage?.name ? `مرحله: ${lead.stage.name} — ` : null}
                      وضعیت: {LEAD_STATUS_LABELS[lead.status] ?? lead.status}
                      {lead.nextFollowUpAt ? (
                        <>
                          {' '}
                          — پیگیری بعدی: <JalaliDate date={lead.nextFollowUpAt} />
                        </>
                      ) : null}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="ky-pack-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="size-4" aria-hidden />
              کارهای باز
            </CardTitle>
            <CardDescription>وظایف پیگیری که تیم برای شما ثبت کرده است</CardDescription>
          </CardHeader>
          <CardContent>
            {portal.tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">کار بازی ثبت نشده است.</p>
            ) : (
              <ul className="space-y-3" role="list">
                {portal.tasks.map((task) => (
                  <li key={task.id} className="rounded-[calc(var(--radius)-4px)] border border-border/70 bg-background/50 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{task.title}</span>
                      <TaskStatusBadge status={task.status} />
                      <TaskPriorityBadge priority={task.priority} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {TASK_STATUS_LABELS[task.status] ?? task.status}
                      {' · '}
                      {TASK_PRIORITY_LABELS[task.priority] ?? task.priority}
                      {task.dueDate ? (
                        <>
                          {' '}
                          — موعد: <JalaliDate date={task.dueDate} />
                        </>
                      ) : null}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          این نشست محرمانه است. پس از انقضا دوباره از لینک ورود یا درخواست لینک جادویی استفاده کنید.
          {' · '}
          <Link href="/portal/login" className="text-primary hover:underline">
            ورود با لینک جادویی
          </Link>
        </p>
      </div>
    </div>
  );
}
