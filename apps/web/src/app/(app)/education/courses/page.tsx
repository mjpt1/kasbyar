import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@kesbyar/shared';
import { listCourses } from '@/server/packs/education/education.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

export default async function EducationCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requirePackPage('EDUCATION');
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total } = await listCourses(session.organizationId, { page });

  return (
    <div className="space-y-6">
      <PageHeader title="دوره‌ها" description={`${total} دوره`} />

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">دوره‌ای ثبت نشده است.</p>
        ) : (
          items.map((course) => (
            <div
              key={course.id}
              className="ky-list-row bg-card p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{course.title}</span>
                  {!course.isActive ? <Badge variant="outline">غیرفعال</Badge> : null}
                </div>
                <div className="text-sm text-muted-foreground">
                  {course.instructor ? `${course.instructor} · ` : ''}
                  ظرفیت {course.capacity} · {course._count.enrollments} ثبت‌نام
                </div>
              </div>
              <div className="text-left text-sm">
                {course.startDate ? <JalaliDate date={course.startDate} /> : '—'}
                {course.price ? (
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(Number(course.price))}
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
