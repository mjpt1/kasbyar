import {
  INDUSTRY_PACK_LABELS,
  MEMBERSHIP_ROLE_LABELS,
} from '@kesbyar/shared';

import type { MembershipRole } from '@prisma/client';

import Link from 'next/link';

import { SettingsEditForm } from '@/components/features/settings/settings-edit-form';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSession } from '@/lib/auth/session';
import { hasMinRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export default async function SettingsPage() {
  const session = await requireSession();
  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
  });

  if (!org) {
    return (
      <div className="space-y-6">
        <PageHeader title="تنظیمات" description="سازمان یافت نشد." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="تنظیمات"
        description="اطلاعات سازمان و ترجیحات سیستم"
        actions={
          <div className="flex flex-wrap gap-2">
            {hasMinRole(session.role as MembershipRole, 'ADMIN') ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/settings/members">اعضا و نقش‌ها</Link>
              </Button>
            ) : null}
            {hasMinRole(session.role as MembershipRole, 'ADMIN') ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/settings/audit">گزارش ممیزی</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" size="sm">
              <Link href="/settings/billing">اشتراک و صورتحساب</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/help">راهنما و پشتیبانی</Link>
            </Button>
          </div>
        }
      />

      <SettingsEditForm
        role={session.role as MembershipRole}
        org={{
          name: org.name,
          phone: org.phone,
          email: org.email,
          address: org.address,
          taxId: org.taxId,
        }}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">اطلاعات سازمان</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">نام کسب‌وکار</span>
              <span className="font-medium">{org.name}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">شناسه (slug)</span>
              <span dir="ltr" className="text-left font-mono text-xs">
                {org.slug}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">بسته صنعتی</span>
              <Badge variant="secondary">
                {INDUSTRY_PACK_LABELS[org.industryPack] ?? org.industryPack}
              </Badge>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">تلفن</span>
              <span dir="ltr" className="text-left">
                {org.phone ?? '—'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">ایمیل</span>
              <span dir="ltr" className="text-left">
                {org.email ?? '—'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">آدرس</span>
              <span className="max-w-xs text-left">{org.address ?? '—'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">شناسه مالیاتی</span>
              <span>{org.taxId ?? '—'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">ترجیحات سیستم</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">واحد پول</span>
              <span>{org.currency === 'IRR' ? 'ریال (IRR)' : org.currency}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">منطقه زمانی</span>
              <span dir="ltr" className="text-left">
                {org.timezone}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">نقش شما</span>
              <Badge>
                {MEMBERSHIP_ROLE_LABELS[session.role] ?? session.role}
              </Badge>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">تاریخ ایجاد</span>
              <span>
                <JalaliDate date={org.createdAt} />
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">آخرین به‌روزرسانی</span>
              <span>
                <JalaliDate date={org.updatedAt} showTime />
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
