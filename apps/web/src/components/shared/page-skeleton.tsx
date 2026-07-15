import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Route-level loading skeletons — match final layout to reduce CLS.
 * @see docs/performance/ui-state-consistency-rules.md
 * @see docs/performance/dashboard-loading-guidelines.md
 */

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="در حال بارگذاری داشبورد">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export function ListPageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="در حال بارگذاری لیست">
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-10 max-w-md" />
      <Skeleton className="h-10 w-32" />
      <div className="space-y-2 rounded-lg border p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
