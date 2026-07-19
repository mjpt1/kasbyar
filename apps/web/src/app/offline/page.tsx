import Link from 'next/link';

export const metadata = {
  title: 'آفلاین — کسب‌یار',
  description: 'اتصال اینترنت برقرار نیست',
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo.svg" alt="" width={64} height={64} className="h-16 w-16 rounded-2xl" />
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
