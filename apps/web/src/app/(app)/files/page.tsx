import { FolderOpen } from 'lucide-react';
import Link from 'next/link';

import { FilesUploadForm } from '@/components/features/files/files-upload-form';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { JalaliDate } from '@/components/shared/jalali-date';
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
      <PageHeader
        title="فایل‌ها"
        description="پیوست‌های آپلودشده در سیستم"
      />

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
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-right font-medium">نام فایل</th>
                    <th className="p-3 text-right font-medium">نوع</th>
                    <th className="p-3 text-right font-medium">حجم</th>
                    <th className="p-3 text-right font-medium">موجودیت</th>
                    <th className="p-3 text-right font-medium">تاریخ</th>
                    <th className="p-3 text-right font-medium">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium">{file.fileName}</td>
                      <td className="p-3 text-muted-foreground">{file.mimeType}</td>
                      <td className="p-3">{formatFileSize(file.sizeBytes)}</td>
                      <td className="p-3 text-muted-foreground">{file.entityType}</td>
                      <td className="p-3 text-muted-foreground">
                        <JalaliDate date={file.createdAt} />
                      </td>
                      <td className="p-3">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/api/files/${file.id}`} target="_blank">
                            دانلود
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
