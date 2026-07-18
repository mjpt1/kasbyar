import Link from 'next/link';
import { BookOpen, GraduationCap } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { JalaliDate } from '@/components/shared/jalali-date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getEducationDashboardSignals,
  listRecentEnrollments,
} from '@/server/packs/education/education.service';
import { requirePackPage } from '@/server/packs/require-pack-page';

const ENROLLMENT_LABELS: Record<string, string> = {
  INTERESTED: 'علاقه‌مند',
  ENROLLED: 'ثبت‌نام‌شده',
  ACTIVE: 'فعال',
  COMPLETED: 'پایان‌یافته',
  DROPPED: 'انصراف',
};

export default async function EducationHomePage() {
  const { session } = await requirePackPage('EDUCATION');
  const [signals, recentEnrollments] = await Promise.all([
    getEducationDashboardSignals(session.organizationId),
    listRecentEnrollments(session.organizationId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="آموزشگاه"
        description="دوره، ثبت‌نام و ظرفیت کلاس"
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/education/courses">
                <BookOpen className="ms-2 h-4 w-4" />
                دوره‌ها
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/education/enrollments">
                <GraduationCap className="ms-2 h-4 w-4" />
                ثبت‌نام‌ها
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">دوره فعال</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.activeCourseCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">ثبت‌نام فعال</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{signals.enrollmentCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">علاقه‌مند</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-amber-600">{signals.interestedCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">آخرین ثبت‌نام‌ها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentEnrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">ثبت‌نامی ثبت نشده است.</p>
          ) : (
            recentEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between rounded-md border p-3">
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
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
