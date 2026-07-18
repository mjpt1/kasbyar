import { FolderOpen } from 'lucide-react';
import Link from 'next/link';

import { FilesUploadForm } from '@/components/features/files/files-upload-form';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { JalaliDate } from '@/components/shared/jalali-date';
import { ResponsiveTable } from '@/components/shared/responsive-table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { requireSession } from '@/lib/auth/session';
import { listFileAttachments } from '@/server/files/file.service';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} بایت`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} کیلوبایت`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} مگابایت`;
}

export default async function FilesPage() {
  const session = await requireSession();
  const files = await listFileAttachments(session.organizationId);

  return (
    <div className="space-y-6">
      <PageHeader title="فایل‌ها" description="پیوست‌های آپلودشده در سیستم" />

      <FilesUploadForm
        defaultEntityType="ORGANIZATION"
        defaultEntityId={session.organizationId}
      />

      {files.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="فایلی آپلود نشده"
          description="فایل‌های مرتبط با مشتری، فاکتور یا سازمان را از فرم بالا آپلود کنید."
        />
      ) : (
        <Card>
          <CardContent className="p-3 md:p-0">
            <ResponsiveTable
              columns={[
                { key: 'name', header: 'نام فایل' },
                { key: 'type', header: 'نوع', hideOnMobile: true },
                { key: 'size', header: 'حجم' },
                { key: 'entity', header: 'موجودیت', hideOnMobile: true },
                { key: 'date', header: 'تاریخ' },
                { key: 'actions', header: 'عملیات' },
              ]}
              rows={files.map((file) => ({
                id: file.id,
                cells: {
                  name: <span className="font-medium break-all">{file.fileName}</span>,
                  type: <span className="text-muted-foreground">{file.mimeType}</span>,
                  size: formatFileSize(file.sizeBytes),
                  entity: <span className="text-muted-foreground">{file.entityType}</span>,
                  date: <JalaliDate date={file.createdAt} />,
                  actions: (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/api/files/${file.id}`} target="_blank">
                        دانلود
                      </Link>
                    </Button>
                  ),
                },
              }))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
