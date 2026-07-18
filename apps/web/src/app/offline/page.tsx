import Link from 'next/link';

export const metadata = {
  title: 'آفلاین — کسب‌یار',
  description: 'اتصال اینترنت برقرار نیست',
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/15 text-2xl font-bold text-primary">
        ک
      </div>
      <h1 className="text-xl font-bold">اتصال برقرار نیست</h1>
      <p className="max-w-sm text-sm leading-7 text-muted-foreground">
        فعلاً آفلاین هستید. پس از وصل شدن اینترنت، صفحه را تازه‌سازی کنید یا به داشبورد برگردید.
      </p>
      <Link
        href="/dashboard"
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
      >
        تلاش مجدد
      </Link>
    </main>
  );
}
