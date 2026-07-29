'use client';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useDraggable } from '@dnd-kit/core';
import { formatCurrency, LEAD_STATUS_LABELS } from '@kesbyar/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
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

function LeadCard({
  lead,
  stages,
  movingId,
  onMove,
  isOverlay,
}: {
  lead: KanbanLead;
  stages: KanbanStage[];
  movingId: string | null;
  onMove: (leadId: string, stageId: string | null) => void;
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    disabled: movingId === lead.id || isOverlay,
    data: { lead },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border bg-card p-3 text-sm shadow-sm touch-manipulation',
        isDragging && 'opacity-40',
        isOverlay && 'cursor-grabbing shadow-lg ring-2 ring-primary/40',
        movingId === lead.id && 'pointer-events-none opacity-60',
      )}
      {...(isOverlay ? {} : { ...listeners, ...attributes })}
      role="listitem"
      aria-roledescription="کارت قابل کشیدن"
      aria-label={lead.title}
      tabIndex={isOverlay ? -1 : 0}
    >
      <Link
        href={`/leads/${lead.id}`}
        className="font-medium hover:text-primary hover:underline"
        onClick={(event) => {
          if (isDragging) event.preventDefault();
        }}
      >
        {lead.title}
      </Link>
      {lead.contactName ? (
        <p className="mt-1 text-xs text-muted-foreground">{lead.contactName}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-1">
        <Badge variant="outline" className="text-xs">
          {LEAD_STATUS_LABELS[lead.status as keyof typeof LEAD_STATUS_LABELS] ?? lead.status}
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
        {stages
          .filter((s) => s.id !== (lead.stageId ?? UNASSIGNED_COLUMN_ID))
          .map((target) => (
            <button
              key={target.id}
              type="button"
              disabled={movingId === lead.id}
              onClick={() => onMove(lead.id, target.id === UNASSIGNED_COLUMN_ID ? null : target.id)}
              className="rounded border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              → {target.name}
            </button>
          ))}
      </div>
    </div>
  );
}

function KanbanColumn({
  stage,
  leads,
  stages,
  movingId,
  onMove,
}: {
  stage: KanbanStage;
  leads: KanbanLead[];
  stages: KanbanStage[];
  movingId: string | null;
  onMove: (leadId: string, stageId: string | null) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div className="min-w-[280px] flex-1" ref={setNodeRef}>
      <Card
        className={cn(
          'h-full transition-colors',
          isOver && 'border-primary bg-primary/5 ring-2 ring-primary/30',
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
              {leads.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[120px] space-y-2" role="list" aria-label={stage.name}>
          {leads.length === 0 ? (
            <p className="rounded-md border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
              {isOver ? 'اینجا رها کنید' : 'خالی — کارت را اینجا بکشید'}
            </p>
          ) : (
            leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                stages={stages}
                movingId={movingId}
                onMove={onMove}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

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

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = String(active.id);
    let columnId = String(over.id);

    // Dropped on another card → use that card's column
    const overLead = leads.find((l) => l.id === columnId);
    if (overLead) {
      columnId = overLead.stageId ?? UNASSIGNED_COLUMN_ID;
    }

    const stageId = columnId === UNASSIGNED_COLUMN_ID ? null : columnId;
    await moveLead(leadId, stageId);
  }

  const unassigned = leads.filter((l) => !l.stageId);
  const showUnassigned = unassigned.length > 0 || activeId !== null;
  const columns = useMemo(
    () => [
      ...(showUnassigned
        ? [{ id: UNASSIGNED_COLUMN_ID, name: 'بدون مرحله', color: null, order: -1 }]
        : []),
      ...stages,
    ],
    [showUnassigned, stages],
  );

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={(e) => void onDragEnd(e)}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-4 overflow-x-auto pb-4" role="region" aria-label="کانبان سرنخ‌ها">
        {columns.map((stage) => {
          const columnLeads =
            stage.id === UNASSIGNED_COLUMN_ID
              ? unassigned
              : leads.filter((l) => l.stageId === stage.id);
          return (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              leads={columnLeads}
              stages={columns}
              movingId={movingId}
              onMove={(id, sid) => void moveLead(id, sid)}
            />
          );
        })}
      </div>
      <DragOverlay>
        {activeLead ? (
          <LeadCard
            lead={activeLead}
            stages={columns}
            movingId={null}
            onMove={() => undefined}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
