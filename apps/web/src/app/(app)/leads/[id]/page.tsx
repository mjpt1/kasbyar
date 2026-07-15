import { formatCurrency, LEAD_SOURCE_LABELS } from '@kesbyar/shared';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { LeadsEditPanel } from '@/components/features/leads/leads-edit-panel';
import { LeadsFollowUpForm } from '@/components/features/leads/leads-follow-up-form';
import { EntityFilesPanel } from '@/components/features/files/entity-files-panel';
import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { LeadStatusBadge } from '@/components/shared/status-badges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSession } from '@/lib/auth/session';
import { getLead, listPipelineStages } from '@/server/leads/lead.service';
import { listFileAttachments } from '@/server/files/file.service';

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const [lead, stages] = await Promise.all([
    getLead(session.organizationId, id),
    listPipelineStages(session.organizationId),
  ]);

  if (!lead) {
    notFound();
  }

  const files = await listFileAttachments(session.organizationId, {
    entityType: 'LEAD',
    entityId: id,
  });

  const fileRows = files.map((f) => ({
    id: f.id,
    fileName: f.fileName,
    mimeType: f.mimeType,
    sizeBytes: f.sizeBytes,
    createdAt: f.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={lead.title}
        description={LEAD_SOURCE_LABELS[lead.source] ?? lead.source}
        actions={
          <Link href="/leads" className="text-sm text-muted-foreground hover:text-foreground">
            بازگشت به لیست
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">اطلاعات لید</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-muted-foreground">وضعیت</div>
                <LeadStatusBadge status={lead.status} />
              </div>
              <div>
                <div className="text-muted-foreground">مرحله</div>
                <div>{lead.stage?.name ?? '—'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">ارزش تقریبی</div>
                <div>{lead.value ? formatCurrency(Number(lead.value)) : '—'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">نام تماس</div>
                <div>{lead.contactName ?? '—'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">تلفن</div>
                <div dir="ltr" className="text-left">
                  {lead.contactPhone ?? '—'}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">پیگیری بعدی</div>
                <div>
                  {lead.nextFollowUpAt ? <JalaliDate date={lead.nextFollowUpAt} /> : '—'}
                </div>
              </div>
              {lead.customer ? (
                <div>
                  <div className="text-muted-foreground">مشتری مرتبط</div>
                  <Link
                    href={`/customers/${lead.customer.id}`}
                    className="text-primary hover:underline"
                  >
                    {lead.customer.name}
                  </Link>
                </div>
              ) : null}
              {lead.description ? (
                <div>
                  <div className="text-muted-foreground">توضیحات</div>
                  <div>{lead.description}</div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <LeadsEditPanel
            leadId={lead.id}
            status={lead.status}
            stageId={lead.stageId}
            nextFollowUpAt={lead.nextFollowUpAt?.toISOString() ?? null}
            stages={stages}
          />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <LeadsFollowUpForm leadId={lead.id} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">تاریخچه پیگیری‌ها</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lead.followUps.length === 0 ? (
                <p className="text-sm text-muted-foreground">پیگیری ثبت نشده.</p>
              ) : (
                lead.followUps.map((followUp) => (
                  <div key={followUp.id} className="rounded-md border p-3">
                    <div>{followUp.note}</div>
                    {followUp.channel ? (
                      <div className="text-xs text-muted-foreground">کانال: {followUp.channel}</div>
                    ) : null}
                    <div className="mt-1 text-xs text-muted-foreground">
                      <JalaliDate date={followUp.createdAt} showTime />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">فعالیت‌ها</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lead.activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">فعالیتی ثبت نشده.</p>
              ) : (
                lead.activities.map((activity) => (
                  <div key={activity.id} className="rounded-md border p-3">
                    <div className="font-medium">{activity.title}</div>
                    {activity.description ? (
                      <div className="text-sm text-muted-foreground">{activity.description}</div>
                    ) : null}
                    <div className="mt-1 text-xs text-muted-foreground">
                      <JalaliDate date={activity.createdAt} showTime />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <EntityFilesPanel entityType="LEAD" entityId={lead.id} files={fileRows} />
        </div>
      </div>
    </div>
  );
}
