'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { INDUSTRY_PACK_LABELS, listSpecialties } from '@kesbyar/shared';

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
  industrySpecialty: string | null;
  isDemo: boolean;
  _count: { memberships: number; customers: number };
  subscription: { planCode: string; status: string } | null;
}

const NONE_SPECIALTY = '__none__';

export function AdminOrganizationsPanel({
  initialOrgs,
}: {
  initialOrgs: AdminOrgRow[];
}) {
  const router = useRouter();
  const [orgs, setOrgs] = useState(initialOrgs);
  const [loading, setLoading] = useState(false);
  const allSpecialties = useMemo(() => listSpecialties(), []);

  async function saveOrg(
    organizationId: string,
    industryPack: string,
    industrySpecialty: string | null,
  ) {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/organizations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId, industryPack, industrySpecialty }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? 'خطا');
      toast.success('بسته و تخصص به‌روز شد');
      setOrgs((prev) =>
        prev.map((o) =>
          o.id === organizationId ? { ...o, industryPack, industrySpecialty } : o,
        ),
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
        {orgs.map((org) => {
          const specialtyOptions = allSpecialties.filter((s) => s.basePack === org.industryPack);

          return (
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
                  {org.industrySpecialty ? (
                    <Badge variant="outline">تخصص: {org.industrySpecialty}</Badge>
                  ) : null}
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
              <div className="flex min-w-[12rem] flex-col gap-2 sm:min-w-[24rem] sm:flex-row">
                <div className="min-w-[12rem] flex-1">
                  <p className="mb-1 text-xs text-muted-foreground">بسته صنعتی</p>
                  <Select
                    value={org.industryPack}
                    disabled={loading}
                    onValueChange={(pack) => {
                      const specialtyStillValid =
                        org.industrySpecialty &&
                        allSpecialties.some(
                          (s) => s.id === org.industrySpecialty && s.basePack === pack,
                        );
                      saveOrg(
                        org.id,
                        pack,
                        specialtyStillValid ? org.industrySpecialty : null,
                      );
                    }}
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
                <div className="min-w-[12rem] flex-1">
                  <p className="mb-1 text-xs text-muted-foreground">تخصص (داشبورد)</p>
                  <Select
                    value={org.industrySpecialty ?? NONE_SPECIALTY}
                    disabled={loading}
                    onValueChange={(value) =>
                      saveOrg(
                        org.id,
                        org.industryPack,
                        value === NONE_SPECIALTY ? null : value,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="بدون تخصص" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE_SPECIALTY}>بدون تخصص</SelectItem>
                      {specialtyOptions.map((specialty) => (
                        <SelectItem key={specialty.id} value={specialty.id}>
                          {specialty.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
