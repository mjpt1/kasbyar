import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function AppNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <FileQuestion className="h-10 w-10 text-muted-foreground" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold">صفحه یافت نشد</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        مورد درخواستی در این فضای کاری وجود ندارد یا دسترسی شما محدود است.
      </p>
      <div className="mt-6 flex gap-2">
        <Button asChild>
          <Link href="/dashboard">بازگشت به داشبورد</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/customers">مشتریان</Link>
        </Button>
      </div>
    </div>
  );
}
