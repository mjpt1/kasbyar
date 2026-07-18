import Link from 'next/link';
import { ClipboardList, Shield } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@kesbyar/shared';
import {
  getInsuranceDashboardSignals,
  listActiveInsurancePolicies,
} from '@/server/packs/insurance/insurance.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const POLICY_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'فعال',
  PENDING: 'در انتظار',
  EXPIRED: 'منقضی',
  CANCELLED: 'لغو شده',
};

export default async function InsuranceHomePage() {
  const { session } = await requirePackPage('INSURANCE_AGENCY');
  const [signals, policies] = await Promise.all([
    getInsuranceDashboardSignals(session.organizationId),
    listActiveInsurancePolicies(session.organizationId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="نمایندگی بیمه"
        description="بیمه‌نامه، تمدید و پیگیری حق‌بیمه"
        actions={
          <Button asChild size="sm">
            <Link href="/insurance/policies">
              <ClipboardList className="ms-2 h-4 w-4" />
              همه بیمه‌نامه‌ها
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">فعال</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.activeCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">در انتظار</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-amber-600">{signals.pendingCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">نزدیک تمدید</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-600">{signals.expiringCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            بیمه‌نامه‌های فعال
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {policies.length === 0 ? (
            <p className="text-sm text-muted-foreground">بیمه‌نامه‌ای ثبت نشده است.</p>
          ) : (
            policies.map((item) => (
              <div key={item.id} className="ky-list-row p-3">
                <div>
                  <div className="font-medium">{item.policyNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.customer.name} — {item.policyType}
                  </div>
                </div>
                <div className="text-left">
                  <Badge variant="secondary">{POLICY_STATUS_LABELS[item.status] ?? item.status}</Badge>
                  {item.expiresAt ? (
                    <div className="mt-1 text-sm">
                      <JalaliDate date={item.expiresAt} />
                    </div>
                  ) : null}
                  {item.premium ? (
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(Number(item.premium))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
