import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { listGymClasses } from '@/server/packs/fitness/fitness.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

export default async function FitnessClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { session } = await requirePackPage('FITNESS');
  const params = await searchParams;
  const page = Number(params.page ?? 1);

  const { items, total } = await listGymClasses(session.organizationId, { page });

  return (
    <div className="space-y-6">
      <PageHeader title="کلاس‌ها" description={`${total} کلاس`} />

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">کلاسی ثبت نشده است.</p>
        ) : (
          items.map((gymClass) => (
            <div
              key={gymClass.id}
              className="flex items-center justify-between rounded-md border bg-card p-4"
            >
              <div>
                <div className="font-medium">{gymClass.title}</div>
                <div className="text-sm text-muted-foreground">
                  {gymClass.coach ? `${gymClass.coach} · ` : ''}
                  {gymClass.enrolledCount}/{gymClass.capacity} نفر
                </div>
              </div>
              <div className="text-left text-sm">
                <JalaliDate date={gymClass.scheduledAt} showTime />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
