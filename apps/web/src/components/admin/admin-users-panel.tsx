'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  INDUSTRY_PACK_LABELS,
  MEMBERSHIP_ROLE_LABELS,
  PLATFORM_ROLE_LABELS,
} from '@kesbyar/shared';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  platformRole: string;
  memberships: Array<{
    id: string;
    role: string;
    organization: {
      id: string;
      name: string;
      industryPack: string;
      slug: string;
    };
  }>;
}

interface AdminOrgOption {
  id: string;
  name: string;
  industryPack: string;
}

export function AdminUsersPanel({
  initialUsers,
  organizations,
}: {
  initialUsers: AdminUserRow[];
  organizations: AdminOrgOption[];
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    platformRole: 'USER',
    organizationId: '',
    membershipRole: 'STAFF',
  });

  async function refreshUsers() {
    const res = await fetch('/api/admin/users');
    const json = await res.json();
    if (json.success) setUsers(json.data);
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          organizationId: form.organizationId || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? 'خطا');
      toast.success('کاربر ایجاد شد');
      setForm({
        name: '',
        email: '',
        password: '',
        platformRole: 'USER',
        organizationId: '',
        membershipRole: 'STAFF',
      });
      await refreshUsers();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا در ایجاد کاربر');
    } finally {
      setLoading(false);
    }
  }

  async function assignMembership(userId: string, organizationId: string, role: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, organizationId, role }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? 'خطا');
      toast.success('عضویت به‌روز شد');
      await refreshUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا');
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(user: AdminUserRow) {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, isActive: !user.isActive }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? 'خطا');
      toast.success(user.isActive ? 'کاربر غیرفعال شد' : 'کاربر فعال شد');
      await refreshUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ایجاد کاربر جدید</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createUser} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">نام</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label>نقش پلتفرم</Label>
              <Select
                value={form.platformRole}
                onValueChange={(v) => setForm({ ...form, platformRole: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PLATFORM_ROLE_LABELS).map(([k, label]) => (
                    <SelectItem key={k} value={k}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>سازمان (اختیاری)</Label>
              <Select
                value={form.organizationId || 'none'}
                onValueChange={(v) =>
                  setForm({ ...form, organizationId: v === 'none' ? '' : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="بدون سازمان" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون سازمان</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name} ({INDUSTRY_PACK_LABELS[org.industryPack]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>نقش در سازمان</Label>
              <Select
                value={form.membershipRole}
                onValueChange={(v) => setForm({ ...form, membershipRole: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MEMBERSHIP_ROLE_LABELS).map(([k, label]) => (
                    <SelectItem key={k} value={k}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={loading}>
                ایجاد کاربر
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">کاربران ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">
                    {user.email}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={user.isActive ? 'default' : 'secondary'}>
                    {user.isActive ? 'فعال' : 'غیرفعال'}
                  </Badge>
                  <Badge variant="outline">
                    {PLATFORM_ROLE_LABELS[user.platformRole] ?? user.platformRole}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => toggleActive(user)}
                  >
                    {user.isActive ? 'غیرفعال' : 'فعال'}
                  </Button>
                </div>
              </div>

              {user.memberships.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {user.memberships.map((m) => (
                    <li
                      key={m.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-2"
                    >
                      <span>
                        {m.organization.name} —{' '}
                        <Badge variant="secondary" className="ms-1">
                          {INDUSTRY_PACK_LABELS[m.organization.industryPack]}
                        </Badge>
                      </span>
                      <div className="flex items-center gap-2">
                        <Select
                          value={m.role}
                          onValueChange={(role) =>
                            assignMembership(user.id, m.organization.id, role)
                          }
                        >
                          <SelectTrigger className="h-8 w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(MEMBERSHIP_ROLE_LABELS).map(([k, label]) => (
                              <SelectItem key={k} value={k}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">بدون عضویت سازمانی</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
