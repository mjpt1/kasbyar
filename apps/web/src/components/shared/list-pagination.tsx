import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface ListPaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}

export function ListPagination({
  page,
  totalPages,
  basePath,
  searchParams = {},
}: ListPaginationProps) {
  if (totalPages <= 1) return null;

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set('page', String(targetPage));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      <p className="text-sm text-muted-foreground">
        صفحه {page} از {totalPages}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={hrefFor(page - 1)}>قبلی</Link>
          </Button>
        ) : null}
        {page < totalPages ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={hrefFor(page + 1)}>بعدی</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
