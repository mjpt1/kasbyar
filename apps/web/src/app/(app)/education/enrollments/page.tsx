import Link from 'next/link';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { listCourseEnrollments } from '@/server/packs/education/education.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const ENROLLMENT_LABELS: Record<string, string> = {
  INTERESTED: 'علاقه‌مند',
  ENROLLED: 'ثبت‌نام‌شده',
  ACTIVE: 'فعال',
  COMPLETED: 'پایان‌یافته',
  DROPPED: 'انصراف',
};

export default async function EducationEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requirePackPage('EDUCATION');
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total } = await listCourseEnrollments(session.organizationId, { page });

  return (
    <div className="space-y-6">
      <PageHeader title="ثبت‌نام‌ها" description={`${total} ثبت‌نام`} />

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">ثبت‌نامی ثبت نشده است.</p>
        ) : (
          items.map((enrollment) => (
            <Link
              key={enrollment.id}
              href={`/customers/${enrollment.customer.id}`}
              className="ky-list-row bg-card p-4 hover:bg-muted/50"
            >
              <div>
                <div className="font-medium">{enrollment.customer.name}</div>
                <div className="text-sm text-muted-foreground">{enrollment.course.title}</div>
              </div>
              <div className="text-left">
                <Badge variant="secondary">
                  {ENROLLMENT_LABELS[enrollment.status] ?? enrollment.status}
                </Badge>
                <div className="mt-1 text-sm">
                  <JalaliDate date={enrollment.enrolledAt} />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
