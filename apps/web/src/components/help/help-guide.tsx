'use client';

import Link from 'next/link';
import { BookOpen, ExternalLink, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { HELP_SECTIONS, type HelpSection } from '@/components/help/help-sections';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

function matchesQuery(section: HelpSection, q: string): boolean {
  if (!q) return true;
  const hay = [
    section.title,
    section.what,
    ...section.does,
    ...section.howTo,
    ...section.tips,
    ...section.keywords,
    ...(section.subsections?.map((s) => `${s.title} ${s.body}`) ?? []),
  ]
    .join(' ')
    .toLowerCase();
  return hay.includes(q.toLowerCase());
}

export function HelpGuide() {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = useMemo(
    () => HELP_SECTIONS.filter((s) => matchesQuery(s, query.trim())),
    [query],
  );

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) return;
    setActiveId(hash);
    // Delay for layout paint
    const t = window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const sections = HELP_SECTIONS.map((s) => s.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveId(visible.target.id);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0.1, 0.25, 0.5] },
    );
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  function jumpTo(id: string) {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${id}`);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="size-4 text-primary" aria-hidden />
              فهرست مطالب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search
                className="text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجو در راهنما…"
                className="ps-8"
                aria-label="جستجو در بخش‌های راهنما"
              />
            </div>
            <nav className="max-h-[60vh] space-y-0.5 overflow-y-auto text-sm" aria-label="فهرست بخش‌ها">
              {filtered.length === 0 ? (
                <p className="text-muted-foreground px-2 py-1 text-xs">نتیجه‌ای پیدا نشد.</p>
              ) : (
                filtered.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => jumpTo(s.id)}
                    className={`block w-full rounded-md px-2 py-1.5 text-start transition-colors ${
                      activeId === s.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {s.title}
                  </button>
                ))
              )}
            </nav>
          </CardContent>
        </Card>
      </aside>

      <div className="space-y-6">
        <Card className="border-dashed">
          <CardContent className="space-y-2 pt-6 text-sm leading-7 text-muted-foreground">
            <p>
              این راهنما بخش‌های «هوشمند» و عملیات اصلی کسب‌یار را توضیح می‌دهد. هر بخش شامل تعریف،
              قابلیت‌ها، گام‌به‌گام استفاده، نکات/محدودیت‌ها و لینک مستقیم است.
            </p>
            <p>
              منوی کناری دو لایه دارد: بالا بخش هوشمند (تحلیل و پیشنهاد) و پایین‌تر CRM/عملیات
              (ثبت داده). خروجی هوشمند فقط به‌اندازهٔ کامل بودن دادهٔ عملیاتی شما دقیق است.
            </p>
          </CardContent>
        </Card>

        {filtered.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-24"
            aria-labelledby={`${section.id}-title`}
          >
            <Card>
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <CardTitle id={`${section.id}-title`} className="text-lg">
                    {section.title}
                  </CardTitle>
                  <Button asChild variant="outline" size="sm">
                    <Link href={section.href}>
                      {section.hrefLabel}
                      <ExternalLink className="size-3.5" aria-hidden />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 text-sm leading-7">
                <div>
                  <h3 className="mb-1 font-medium text-foreground">این بخش چیست؟</h3>
                  <p className="text-muted-foreground">{section.what}</p>
                </div>

                <div>
                  <h3 className="mb-1 font-medium text-foreground">چه کاری انجام می‌دهد؟</h3>
                  <ul className="text-muted-foreground list-disc space-y-1 ps-5">
                    {section.does.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-1 font-medium text-foreground">چطور استفاده کنم؟</h3>
                  <ol className="text-muted-foreground list-decimal space-y-1 ps-5">
                    {section.howTo.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </div>

                {section.example ? (
                  <div className="bg-muted/50 rounded-md border p-3">
                    <h3 className="mb-1 font-medium text-foreground">مثال سناریو</h3>
                    <p className="text-muted-foreground">{section.example}</p>
                  </div>
                ) : null}

                {section.subsections?.length ? (
                  <div className="space-y-3">
                    <h3 className="font-medium text-foreground">زیربخش‌ها</h3>
                    {section.subsections.map((sub) => (
                      <div
                        key={sub.id}
                        id={sub.id}
                        className="scroll-mt-24 rounded-md border border-dashed p-3"
                      >
                        <p className="font-medium">{sub.title}</p>
                        <p className="text-muted-foreground mt-1">{sub.body}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div>
                  <h3 className="mb-1 font-medium text-foreground">نکات و محدودیت‌ها</h3>
                  <ul className="text-muted-foreground list-disc space-y-1 ps-5">
                    {section.tips.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>
        ))}

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-10 text-center text-sm">
              با این عبارت بخشی پیدا نشد. عبارت دیگری امتحان کنید.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
