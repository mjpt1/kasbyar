'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { MEMBERSHIP_ROLE_LABELS } from '@kesbyar/shared';

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

interface MemberRow {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
}

export function MembersManagePanel({
  initialMembers,
  currentUserId,
}: {
  initialMembers: MemberRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [loading, setLoading] = useState(false);
  const [invite, setInvite] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF',
  });

  async function refresh() {
    const res = await fetch('/api/members');
    const json = await res.json();
    if (json.success) setMembers(json.data);
  }

  async function inviteMember(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invite),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? 'خطا');
      toast.success('عضو اضافه شد');
      setInvite({ name: '', email: '', password: '', role: 'STAFF' });
      await refresh();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا');
    } finally {
      setLoading(false);
    }
  }

  async function changeRole(membershipId: string, role: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipId, role }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? 'خطا');
      toast.success('نقش به‌روز شد');
      await refresh();
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
          <CardTitle className="text-base">دعوت عضو جدید</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={inviteMember} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="m-name">نام</Label>
              <Input
                id="m-name"
                value={invite.name}
                onChange={(e) => setInvite({ ...invite, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-email">ایمیل</Label>
              <Input
                id="m-email"
                type="email"
                dir="ltr"
                value={invite.email}
                onChange={(e) => setInvite({ ...invite, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-pass">رمز عبور اولیه</Label>
              <Input
                id="m-pass"
                type="password"
                value={invite.password}
                onChange={(e) => setInvite({ ...invite, password: e.target.value })}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label>نقش</Label>
              <Select
                value={invite.role}
                onValueChange={(v) => setInvite({ ...invite, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['ADMIN', 'MANAGER', 'STAFF', 'VIEWER'] as const).map((k) => (
                    <SelectItem key={k} value={k}>
                      {MEMBERSHIP_ROLE_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={loading}>
                افزودن عضو
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">اعضای سازمان</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">
                  {m.user.name}
                  {m.user.id === currentUserId ? (
                    <Badge className="ms-2" variant="secondary">
                      شما
                    </Badge>
                  ) : null}
                </p>
                <p className="text-sm text-muted-foreground" dir="ltr">
                  {m.user.email}
                </p>
              </div>
              <Select
                value={m.role}
                disabled={loading || m.user.id === currentUserId}
                onValueChange={(role) => changeRole(m.id, role)}
              >
                <SelectTrigger className="w-36">
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
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
