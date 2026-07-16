'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { INDUSTRY_PACK_LABELS } from '@kesbyar/shared';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface AdminOrgRow {
  id: string;
  name: string;
  slug: string;
  industryPack: string;
  isDemo: boolean;
  _count: { memberships: number; customers: number };
  subscription: { planCode: string; status: string } | null;
}

export function AdminOrganizationsPanel({
  initialOrgs,
}: {
  initialOrgs: AdminOrgRow[];
}) {
  const router = useRouter();
  const [orgs, setOrgs] = useState(initialOrgs);
  const [loading, setLoading] = useState(false);

  async function changePack(organizationId: string, industryPack: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/organizations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId, industryPack }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? 'خطا');
      toast.success('بسته صنعتی به‌روز شد');
      setOrgs((prev) =>
        prev.map((o) => (o.id === organizationId ? { ...o, industryPack } : o)),
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">سازمان‌ها ({orgs.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {orgs.map((org) => (
          <div
            key={org.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
          >
            <div className="space-y-1">
              <p className="font-medium">{org.name}</p>
              <p className="text-xs text-muted-foreground" dir="ltr">
                {org.slug}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {org.isDemo ? <Badge variant="secondary">دمو</Badge> : null}
                <Badge variant="outline">
                  {org._count.memberships} عضو · {org._count.customers} مشتری
                </Badge>
                {org.subscription ? (
                  <Badge variant="outline">
                    {org.subscription.planCode} / {org.subscription.status}
                  </Badge>
                ) : null}
              </div>
            </div>
            <div className="min-w-[12rem]">
              <p className="mb-1 text-xs text-muted-foreground">پیشخوان / بسته</p>
              <Select
                value={org.industryPack}
                disabled={loading}
                onValueChange={(v) => changePack(org.id, v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INDUSTRY_PACK_LABELS).map(([k, label]) => (
                    <SelectItem key={k} value={k}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
