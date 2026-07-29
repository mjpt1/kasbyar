'use client';

import { formatCurrency, LEAD_STATUS_LABELS } from '@kesbyar/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type DragEvent } from 'react';
import { toast } from 'sonner';

import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type KanbanStage = {
  id: string;
  name: string;
  color: string | null;
  order: number;
};

type KanbanLead = {
  id: string;
  title: string;
  contactName: string | null;
  contactPhone: string | null;
  status: string;
  stageId: string | null;
  value: number | null;
  nextFollowUpAt: string | null;
};

const UNASSIGNED_COLUMN_ID = '__none__';

export function LeadsKanbanBoard({
  stages,
  leads: initialLeads,
}: {
  stages: KanbanStage[];
  leads: KanbanLead[];
}) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  async function moveLead(leadId: string, stageId: string | null) {
    const lead = leads.find((item) => item.id === leadId);
    if (!lead) return;
    if ((lead.stageId ?? null) === (stageId ?? null)) return;

    setMovingId(leadId);
    const previous = leads;
    setLeads((prev) =>
      prev.map((item) => (item.id === leadId ? { ...item, stageId } : item)),
    );

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId }),
      });
      const data = await res.json();
      if (!data.success) {
        setLeads(previous);
        toast.error(data.error?.message ?? 'انتقال ناموفق بود');
        return;
      }
      toast.success('سرنخ به مرحله جدید منتقل شد');
      router.refresh();
    } catch {
      setLeads(previous);
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setMovingId(null);
    }
  }

  function resolveDropStageId(columnId: string): string | null {
    return columnId === UNASSIGNED_COLUMN_ID ? null : columnId;
  }

  function onDragStart(event: DragEvent<HTMLDivElement>, leadId: string) {
    event.dataTransfer.setData('text/plain', leadId);
    event.dataTransfer.effectAllowed = 'move';
    setDraggingId(leadId);
  }

  function onDragEnd() {
    setDraggingId(null);
    setDropTargetId(null);
  }

  function onDragOverColumn(event: DragEvent<HTMLDivElement>, columnId: string) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (dropTargetId !== columnId) {
      setDropTargetId(columnId);
    }
  }

  function onDragLeaveColumn(event: DragEvent<HTMLDivElement>, columnId: string) {
    const related = event.relatedTarget as Node | null;
    if (related && event.currentTarget.contains(related)) return;
    if (dropTargetId === columnId) {
      setDropTargetId(null);
    }
  }

  async function onDropColumn(event: DragEvent<HTMLDivElement>, columnId: string) {
    event.preventDefault();
    const leadId = event.dataTransfer.getData('text/plain') || draggingId;
    setDropTargetId(null);
    setDraggingId(null);
    if (!leadId) return;
    await moveLead(leadId, resolveDropStageId(columnId));
  }

  const unassigned = leads.filter((l) => !l.stageId);
  const showUnassigned = unassigned.length > 0 || draggingId !== null;
  const columns = [
    ...(showUnassigned
      ? [{ id: UNASSIGNED_COLUMN_ID, name: 'بدون مرحله', color: null, order: -1 }]
      : []),
    ...stages,
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((stage) => {
        const columnLeads =
          stage.id === UNASSIGNED_COLUMN_ID
            ? unassigned
            : leads.filter((l) => l.stageId === stage.id);
        const isDropTarget = dropTargetId === stage.id;

        return (
          <div
            key={stage.id}
            className="min-w-[280px] flex-1"
            onDragOver={(event) => onDragOverColumn(event, stage.id)}
            onDragLeave={(event) => onDragLeaveColumn(event, stage.id)}
            onDrop={(event) => void onDropColumn(event, stage.id)}
          >
            <Card
              className={cn(
                'h-full transition-colors',
                isDropTarget && 'border-primary bg-primary/5 ring-2 ring-primary/30',
              )}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  {stage.color ? (
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: stage.color }}
                      aria-hidden
                    />
                  ) : null}
                  {stage.name}
                  <Badge variant="secondary" className="ms-auto">
                    {columnLeads.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[120px] space-y-2">
                {columnLeads.length === 0 ? (
                  <p className="rounded-md border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
                    {isDropTarget ? 'اینجا رها کنید' : 'خالی — کارت را اینجا بکشید'}
                  </p>
                ) : (
                  columnLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable={movingId !== lead.id}
                      onDragStart={(event) => onDragStart(event, lead.id)}
                      onDragEnd={onDragEnd}
                      className={cn(
                        'cursor-grab rounded-lg border bg-card p-3 text-sm shadow-sm active:cursor-grabbing',
                        draggingId === lead.id && 'opacity-50',
                        movingId === lead.id && 'pointer-events-none opacity-60',
                      )}
                    >
                      <Link
                        href={`/leads/${lead.id}`}
                        className="font-medium hover:text-primary hover:underline"
                        draggable={false}
                        onClick={(event) => {
                          if (draggingId === lead.id) {
                            event.preventDefault();
                          }
                        }}
                      >
                        {lead.title}
                      </Link>
                      {lead.contactName ? (
                        <p className="mt-1 text-xs text-muted-foreground">{lead.contactName}</p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {LEAD_STATUS_LABELS[lead.status as keyof typeof LEAD_STATUS_LABELS] ??
                            lead.status}
                        </Badge>
                        {lead.value ? (
                          <Badge variant="secondary" className="text-xs">
                            {formatCurrency(lead.value)}
                          </Badge>
                        ) : null}
                      </div>
                      {lead.nextFollowUpAt ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          پیگیری: <JalaliDate date={lead.nextFollowUpAt} />
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {(stage.id === UNASSIGNED_COLUMN_ID
                          ? stages
                          : stages.filter((s) => s.id !== lead.stageId)
                        ).map((target) => (
                          <button
                            key={target.id}
                            type="button"
                            disabled={movingId === lead.id}
                            onClick={() => void moveLead(lead.id, target.id)}
                            className="rounded border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                          >
                            → {target.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
