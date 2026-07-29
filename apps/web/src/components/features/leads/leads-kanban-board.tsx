'use client';

import { formatCurrency, LEAD_STATUS_LABELS } from '@kesbyar/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  async function moveLead(leadId: string, stageId: string) {
    setMovingId(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'انتقال ناموفق بود');
        return;
      }
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? { ...lead, stageId } : lead)),
      );
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setMovingId(null);
    }
  }

  const unassigned = leads.filter((l) => !l.stageId);
  const columns = [
    ...(unassigned.length > 0
      ? [{ id: '__none__', name: 'بدون مرحله', color: null, order: -1 }]
      : []),
    ...stages,
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((stage) => {
        const columnLeads =
          stage.id === '__none__'
            ? unassigned
            : leads.filter((l) => l.stageId === stage.id);

        return (
          <div key={stage.id} className="min-w-[280px] flex-1">
            <Card className="h-full">
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
              <CardContent className="space-y-2">
                {columnLeads.length === 0 ? (
                  <p className="text-xs text-muted-foreground">خالی</p>
                ) : (
                  columnLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="rounded-lg border bg-card p-3 text-sm shadow-sm"
                    >
                      <Link
                        href={`/leads/${lead.id}`}
                        className="font-medium hover:text-primary hover:underline"
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
                      {stage.id !== '__none__' ? (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {stages
                            .filter((s) => s.id !== lead.stageId)
                            .map((target) => (
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
                      ) : (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {stages.map((target) => (
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
                      )}
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
