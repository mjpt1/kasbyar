'use client';

import { INDUSTRY_PACK_LABELS, MEMBERSHIP_ROLE_LABELS } from '@kesbyar/shared';
import { Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkspaceOption {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: string;
  industryPack: string;
  workspaceId: string;
  isDemo: boolean;
}

interface WorkspaceSelectClientProps {
  workspaces: WorkspaceOption[];
  currentOrganizationId?: string;
}

export function WorkspaceSelectClient({
  workspaces,
  currentOrganizationId,
}: WorkspaceSelectClientProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function selectWorkspace(organizationId: string) {
    setLoadingId(organizationId);
    try {
      const res = await fetch('/api/workspace/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'انتخاب فضای کاری ناموفق بود');
        return;
      }
      toast.success(`فضای کاری «${data.data.organizationName}» فعال شد`);
      router.push('/dashboard');
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {workspaces.map((workspace) => (
        <Card
          key={workspace.organizationId}
          className={
            workspace.organizationId === currentOrganizationId
              ? 'border-primary ring-1 ring-primary'
              : undefined
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5 text-primary" />
              {workspace.organizationName}
            </CardTitle>
            <CardDescription>
              {INDUSTRY_PACK_LABELS[workspace.industryPack] ?? workspace.industryPack}
              {' · '}
              {MEMBERSHIP_ROLE_LABELS[workspace.role] ?? workspace.role}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant={
                workspace.organizationId === currentOrganizationId ? 'secondary' : 'default'
              }
              disabled={loadingId === workspace.organizationId}
              onClick={() => selectWorkspace(workspace.organizationId)}
            >
              {loadingId === workspace.organizationId
                ? 'در حال انتخاب...'
                : workspace.organizationId === currentOrganizationId
                  ? 'فضای کاری فعال'
                  : 'انتخاب این فضا'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
