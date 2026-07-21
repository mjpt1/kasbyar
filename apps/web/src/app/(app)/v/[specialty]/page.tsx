import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  ArrowLeft,
  CheckSquare,
  LayoutDashboard,
  MessageSquare,
  Receipt,
  Target,
  Users,
} from 'lucide-react';

import { getPackDefinition, getSpecialty } from '@kesbyar/shared';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { getSpecialtyDashboardWidgets } from '@/server/packs/specialty-dashboard.service';

export default async function SpecialtyDashboardPage({
  params,
}: {
  params: Promise<{ specialty: string }>;
}) {
  const { specialty: specialtyId } = await params;
  const session = await requireSession();
  const specialty = getSpecialty(specialtyId);

  if (!specialty) {
    notFound();
  }

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: { industrySpecialty: true, industryPack: true },
  });

  const canAccess =
    org?.industrySpecialty === specialtyId || org?.industryPack === specialty.basePack;

  if (!canAccess) {
    redirect('/dashboard');
  }

  const [widgets, basePack] = await Promise.all([
    getSpecialtyDashboardWidgets(session.organizationId, specialty),
    Promise.resolve(getPackDefinition(specialty.basePack)),
  ]);

  const packHome = basePack.homeRoute;

  return (
    <div className="space-y-6">
      <PageHeader
        title={specialty.label}
        description={specialty.description}
        actions={
          <div className="flex flex-wrap gap-2">
            {packHome ? (
              <Button asChild variant="outline" size="sm">
                <Link href={packHome}>
                  <LayoutDashboard className="ms-2 h-4 w-4" />
                  پیشخوان {basePack.label}
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" size="sm">
              <Link href="/customers">
                <Users className="ms-2 h-4 w-4" />
                {specialty.labels.customers}
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
        {widgets.map((widget) => (
          <Card
            key={widget.key}
            className="border-white/80 bg-gradient-to-br from-sky-50/90 via-white to-rose-50/70 shadow-sm dark:from-sky-950/30 dark:via-card dark:to-rose-950/20"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {widget.href ? (
                <Link
                  href={widget.href}
                  className={`text-3xl font-bold tabular-nums hover:underline ${
                    widget.variant === 'warning' ? 'text-amber-600' : ''
                  }`}
                >
                  {widget.value}
                </Link>
              ) : (
                <p
                  className={`text-3xl font-bold tabular-nums ${
                    widget.variant === 'warning' ? 'text-amber-600' : ''
                  }`}
                >
                  {widget.value}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-emerald-100/80 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <CardHeader>
            <CardTitle className="text-base">نکات عملیاتی</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
              {specialty.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-violet-100/80 bg-violet-50/40 dark:border-violet-900/40 dark:bg-violet-950/20">
          <CardHeader>
            <CardTitle className="text-base">
              {specialtyId === 'freelancer' || specialtyId === 'software-house'
                ? 'دسترسی سریع پروژه'
                : 'دسترسی سریع CRM'}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild variant="outline" size="sm" className="justify-start">
              <Link href="/customers">
                <Users className="ms-2 h-4 w-4" />
                {specialty.labels.customers}
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="justify-start">
              <Link href="/leads">
                <Target className="ms-2 h-4 w-4" />
                {specialtyId === 'freelancer' ? 'فرصت پروژه' : 'لیدها'}
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="justify-start">
              <Link href="/invoices">
                <Receipt className="ms-2 h-4 w-4" />
                فاکتورها
              </Link>
            </Button>
            {(specialtyId === 'freelancer' ||
              specialtyId === 'software-house' ||
              specialty.basePack === 'GENERAL') && (
              <>
                <Button asChild variant="outline" size="sm" className="justify-start">
                  <Link href="/tasks">
                    <CheckSquare className="ms-2 h-4 w-4" />
                    {specialtyId === 'software-house' ? 'تسک‌های تحویل' : 'کارها و پروژه‌ها'}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="justify-start">
                  <Link href="/conversation">
                    <MessageSquare className="ms-2 h-4 w-4" />
                    اتاق فرمان
                  </Link>
                </Button>
              </>
            )}
            <Button asChild variant="ghost" size="sm" className="justify-start">
              <Link href="/dashboard">
                <ArrowLeft className="ms-2 h-4 w-4" />
                داشبورد عمومی
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
