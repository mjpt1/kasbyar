'use client';

import {
  DEMO_SCENARIO_LIST,
  INDUSTRY_PACK_LABELS,
  MEMBERSHIP_ROLE_LABELS,
  getScenarioByOrgSlug,
} from '@kesbyar/shared';
import { Building2, Presentation } from 'lucide-react';
import Link from 'next/link';
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
  showDemoHints?: boolean;
}

export function WorkspaceSelectClient({
  workspaces,
  currentOrganizationId,
  showDemoHints = false,
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
      router.push(showDemoHints ? '/demo' : '/dashboard');
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoadingId(null);
    }
  }

  const demoWorkspaces = workspaces.filter((w) => w.isDemo);

  return (
    <div className="space-y-6">
      {showDemoHints && demoWorkspaces.length > 0 ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Presentation className="h-4 w-4" />
              سناریوهای نمایش
            </CardTitle>
            <CardDescription>
              هر کارت یک کسب‌وکار نمونه با داده واقعی است — برای دمو فروش یا سرمایه‌گذار
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {DEMO_SCENARIO_LIST.map((scenario) => {
              const ws = workspaces.find((w) => w.organizationSlug === scenario.orgSlug);
              if (!ws) return null;
              return (
                <Button
                  key={scenario.id}
                  variant={ws.organizationId === currentOrganizationId ? 'default' : 'outline'}
                  size="sm"
                  disabled={loadingId === ws.organizationId}
                  onClick={() => selectWorkspace(ws.organizationId)}
                >
                  {scenario.title}
                </Button>
              );
            })}
            <Button asChild variant="link" size="sm">
              <Link href="/demo">مرکز نمایش</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {workspaces.map((workspace) => {
          const scenario = getScenarioByOrgSlug(workspace.organizationSlug);
          return (
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
                  {scenario?.title ??
                    (INDUSTRY_PACK_LABELS[workspace.industryPack] ?? workspace.industryPack)}
                  {' · '}
                  {MEMBERSHIP_ROLE_LABELS[workspace.role] ?? workspace.role}
                  {workspace.isDemo ? ' · دمو' : ''}
                </CardDescription>
                {scenario ? (
                  <p className="text-xs text-muted-foreground">{scenario.valueProposition}</p>
                ) : null}
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
          );
        })}
      </div>
    </div>
  );
}
