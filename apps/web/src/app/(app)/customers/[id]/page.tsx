import { formatCurrency } from '@kesbyar/shared';
import { FileText, History } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CustomerPortalLinkButton } from '@/components/features/customers/customer-portal-link-button';
import { CustomersEditForm } from '@/components/features/customers/customers-edit-form';
import { LogActivityForm } from '@/components/features/activities/log-activity-form';
import { InboxThreadPanel } from '@/components/features/inbox/inbox-thread-panel';
import { EntityFilesPanel } from '@/components/features/files/entity-files-panel';
import { ClickToCallLink } from '@/components/shared/click-to-call-link';
import { PageHeader } from '@/components/layout/page-header';
import { InlineEmpty } from '@/components/shared/inline-empty';
import { JalaliDate } from '@/components/shared/jalali-date';
import { InvoiceStatusBadge } from '@/components/shared/status-badges';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSession } from '@/lib/auth/session';
import { getCustomer } from '@/server/customers/customer.service';
import { listFileAttachments } from '@/server/files/file.service';

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  const customer = await getCustomer(session.organizationId, id);

  if (!customer) {
    notFound();
  }

  const files = await listFileAttachments(session.organizationId, {
    entityType: 'CUSTOMER',
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
        title={customer.name}
        description={customer.company ?? 'جزئیات مشتری'}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <CustomerPortalLinkButton customerId={customer.id} />
            <CustomersEditForm customer={customer} />
            <Link
              href="/customers"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              بازگشت به لیست
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">اطلاعات تماس</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="text-muted-foreground">تلفن</div>
              <div dir="ltr" className="text-left">
                {customer.phone ? <ClickToCallLink phone={customer.phone} /> : '—'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">ایمیل</div>
              <div dir="ltr" className="text-left">
                {customer.email ?? '—'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">شهر</div>
              <div>{customer.city ?? '—'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">آدرس</div>
              <div>{customer.address ?? '—'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">وضعیت</div>
              <Badge variant={customer.isActive ? 'success' : 'secondary'}>
                {customer.isActive ? 'فعال' : 'غیرفعال'}
              </Badge>
            </div>
            {customer.notes ? (
              <div>
                <div className="text-muted-foreground">یادداشت</div>
                <div>{customer.notes}</div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <LogActivityForm customerId={customer.id} />
          <InboxThreadPanel
            apiPath={`/api/inbox/customer/${customer.id}`}
            title="واتساپ مشتری"
            channel="whatsapp"
          />
          <InboxThreadPanel
            apiPath={`/api/inbox/customer/${customer.id}/sms`}
            title="پیامک مشتری"
            channel="sms"
          />
          <InboxThreadPanel
            apiPath={`/api/inbox/customer/${customer.id}/email`}
            title="ایمیل مشتری"
            channel="email"
          />
          <InboxThreadPanel
            apiPath={`/api/inbox/customer/${customer.id}/phone`}
            title="تاریخچه تماس"
            channel="phone"
            readOnly
          />
          <InboxThreadPanel
            apiPath={`/api/inbox/customer/${customer.id}/telegram`}
            title="تلگرام مشتری"
            channel="telegram"
            emptyHint="هنوز مکالمه تلگرامی با این مشتری ثبت نشده. پس از اولین پیام ورودی، thread اینجا نمایش داده می‌شود."
          />
          <InboxThreadPanel
            apiPath={`/api/inbox/customer/${customer.id}/instagram`}
            title="اینستاگرام مشتری"
            channel="instagram"
            emptyHint="هنوز DM اینستاگرامی با این مشتری ثبت نشده. پس از اولین پیام ورودی، thread اینجا نمایش داده می‌شود."
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">فاکتورها</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.invoices.length === 0 ? (
                <InlineEmpty
                  icon={FileText}
                  message="فاکتوری برای این مشتری ثبت نشده."
                  hint="از بخش فاکتورها صدور کنید."
                />
              ) : (
                <div className="space-y-2">
                  {customer.invoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/invoices/${invoice.id}`}
                      className="ky-list-row p-3 hover:bg-muted/50"
                    >
                      <div>
                        <div className="font-medium">{invoice.number}</div>
                        <div className="text-xs text-muted-foreground">
                          <JalaliDate date={invoice.issueDate} />
                        </div>
                      </div>
                      <div className="text-left">
                        <InvoiceStatusBadge status={invoice.status} />
                        <div className="mt-1 text-sm">{formatCurrency(Number(invoice.total))}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">فعالیت‌ها</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {customer.activities.length === 0 ? (
                <InlineEmpty
                  icon={History}
                  message="فعالیتی ثبت نشده."
                  hint="فعالیت‌ها پس از تعامل با مشتری اینجا نمایش داده می‌شوند."
                />
              ) : (
                customer.activities.map((activity) => (
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

          <EntityFilesPanel
            entityType="CUSTOMER"
            entityId={customer.id}
            files={fileRows}
          />
        </div>
      </div>
    </div>
  );
}
