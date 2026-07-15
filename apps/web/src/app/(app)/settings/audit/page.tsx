import type { MembershipRole } from '@prisma/client';

import Link from 'next/link';
import { redirect } from 'next/navigation';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSession } from '@/lib/auth/session';
import { hasMinRole } from '@/lib/permissions';
import { listAuditEvents } from '@/server/audit/audit.service';

export default async function AuditLogPage() {
  const session = await requireSession();
  if (!hasMinRole(session.role as MembershipRole, 'ADMIN')) {
    redirect('/settings');
  }

  const { items } = await listAuditEvents(session.organizationId, { pageSize: 50 });

  return (
    <div className="space-y-6">
      <PageHeader
        title="گزارش ممیزی"
        description="رویدادهای حساس عملیاتی این فضای کاری"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/settings">بازگشت به تنظیمات</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">آخرین رویدادها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">رویداد ممیزی ثبت نشده است.</p>
          ) : (
            items.map((event) => (
              <div key={event.id} className="rounded-md border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="secondary">{event.action}</Badge>
                  <span className="text-xs text-muted-foreground">
                    <JalaliDate date={event.createdAt} showTime />
                  </span>
                </div>
                <div className="mt-2 text-muted-foreground">
                  {event.user?.name ?? 'سیستم'}
                  {event.entityType ? ` · ${event.entityType}` : ''}
                  {event.entityId ? ` · ${event.entityId.slice(0, 8)}…` : ''}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
