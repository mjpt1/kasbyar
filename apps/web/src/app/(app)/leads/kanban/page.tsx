import { LEAD_LABELS } from '@kesbyar/shared';
import { List } from 'lucide-react';
import Link from 'next/link';

import { LeadsKanbanBoard } from '@/components/features/leads/leads-kanban-board';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { requireSession } from '@/lib/auth/session';
import { listLeadsForKanban } from '@/server/leads/lead.service';

export default async function LeadsKanbanPage() {
  const session = await requireSession();
  const { stages, leads } = await listLeadsForKanban(session.organizationId);

  const rows = leads.map((lead) => ({
    id: lead.id,
    title: lead.title,
    contactName: lead.contactName,
    contactPhone: lead.contactPhone,
    status: lead.status,
    stageId: lead.stageId,
    value: lead.value ? Number(lead.value) : null,
    nextFollowUpAt: lead.nextFollowUpAt?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${LEAD_LABELS.plural} — کانبان`}
        description="مراحل قیف فروش — کارت را بکشید و رها کنید، یا روی نام مرحله مقصد کلیک کنید"
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/leads">
              <List className="size-4" aria-hidden />
              نمای جدول
            </Link>
          </Button>
        }
      />

      {stages.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          مرحله‌ای در قیف فروش تعریف نشده. از تنظیمات یا seed دیتابیس مراحل را اضافه کنید.
        </p>
      ) : (
        <LeadsKanbanBoard
          stages={stages.map((s) => ({
            id: s.id,
            name: s.name,
            color: s.color,
            order: s.order,
          }))}
          leads={rows}
        />
      )}
    </div>
  );
}
