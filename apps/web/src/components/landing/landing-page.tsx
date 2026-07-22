'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

import './landing.css';

const CHAPTER_IDS = ['hero', 'details', 'sales', 'team', 'packs', 'start'] as const;

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const chapters = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]'));
    const dots = Array.from(root.querySelectorAll<HTMLAnchorElement>('#landing-dots a'));
    const navLinks = Array.from(
      root.querySelectorAll<HTMLAnchorElement>('.landing-nav-links a[href^="#"]'),
    );
    const footer = root.querySelector<HTMLElement>('footer');
    const state = chapters.map(() => ({ bg: 0, fg: 0 }));

    let animating = false;
    let scrollAnim = 0;
    let parallaxRaf = 0;
    const SCROLL_MS = 1450;
    const WHEEL_COOLDOWN = 1100;
    const PARALLAX_LERP = 0.085;

    const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
    const easeInOutQuart = (t: number) =>
      t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    const easeSilk = (t: number) => easeInOutQuart(easeOutQuint(t));

    const sectionTop = (el: HTMLElement) => window.scrollY + el.getBoundingClientRect().top;

    const setActive = (i: number) => {
      const idx = Math.max(0, Math.min(chapters.length - 1, i));
      const activeId = chapters[idx]?.id;
      dots.forEach((d) => d.classList.toggle('is-active', d.dataset.target === activeId));
      navLinks.forEach((a) => {
        const href = a.getAttribute('href')?.slice(1);
        a.classList.toggle('is-active', href === activeId);
      });
    };

    const nearestIndex = () => {
      const mid = window.scrollY + window.innerHeight * 0.45;
      let best = 0;
      let bestDist = Infinity;
      chapters.forEach((ch, i) => {
        const d = Math.abs(sectionTop(ch) + ch.offsetHeight / 2 - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      return best;
    };

    const scrollToY = (targetY: number, then?: () => void) => {
      const startY = window.scrollY;
      const delta = targetY - startY;
      if (Math.abs(delta) < 2) {
        animating = false;
        then?.();
        return;
      }
      animating = true;
      const start = performance.now();
      cancelAnimationFrame(scrollAnim);
      const frame = (now: number) => {
        const t = Math.min(1, (now - start) / SCROLL_MS);
        window.scrollTo(0, startY + delta * easeSilk(t));
        if (t < 1) {
          scrollAnim = requestAnimationFrame(frame);
        } else {
          window.scrollTo(0, targetY);
          animating = false;
          then?.();
        }
      };
      scrollAnim = requestAnimationFrame(frame);
    };

    const goTo = (i: number) => {
      if (i < 0 || i >= chapters.length) return;
      setActive(i);
      const ch = chapters[i];
      if (ch) scrollToY(sectionTop(ch));
    };

    const goFooter = () => {
      if (!footer) return;
      scrollToY(sectionTop(footer), () => setActive(chapters.length - 1));
    };

    const onStep = (dir: number) => {
      if (animating) return;
      const near = nearestIndex();
      setActive(near);
      if (dir > 0 && near >= chapters.length - 1) {
        if (footer && footer.getBoundingClientRect().top >= window.innerHeight * 0.85) {
          goFooter();
        }
        return;
      }
      if (
        dir < 0 &&
        footer &&
        window.scrollY + window.innerHeight > sectionTop(footer) + 40
      ) {
        goTo(chapters.length - 1);
        return;
      }
      goTo(near + dir);
    };

    if (reduce) {
      setActive(0);
      const onDotClick = (e: Event) => {
        e.preventDefault();
        const target = (e.currentTarget as HTMLAnchorElement).dataset.target;
        if (target) document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
      };
      dots.forEach((dot) => dot.addEventListener('click', onDotClick));
      return () => dots.forEach((dot) => dot.removeEventListener('click', onDotClick));
    }

    let wheelAccum = 0;
    let wheelTimer: ReturnType<typeof setTimeout> | null = null;
    let wheelLocked = false;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 2) return;
      e.preventDefault();
      if (animating || wheelLocked) return;
      wheelAccum += e.deltaY;
      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        if (Math.abs(wheelAccum) < 18) {
          wheelAccum = 0;
          return;
        }
        const dir = wheelAccum > 0 ? 1 : -1;
        wheelAccum = 0;
        wheelLocked = true;
        onStep(dir);
        setTimeout(() => {
          wheelLocked = false;
        }, WHEEL_COOLDOWN);
      }, 72);
    };

    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        if (!animating) onStep(1);
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        if (!animating) onStep(-1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goTo(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goTo(chapters.length - 1);
      }
    };

    let touchY: number | null = null;
    let touchMoved = false;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null;
      touchMoved = false;
    };
    const onTouchMove = () => {
      touchMoved = true;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchY == null || animating || !touchMoved) return;
      const endY = e.changedTouches[0]?.clientY ?? touchY;
      const dy = touchY - endY;
      touchY = null;
      if (Math.abs(dy) < 56) return;
      onStep(dy > 0 ? 1 : -1);
    };

    const onDotNav = (e: Event) => {
      e.preventDefault();
      const id = (e.currentTarget as HTMLAnchorElement).dataset.target;
      const i = chapters.findIndex((c) => c.id === id);
      if (i >= 0) goTo(i);
    };

    const onHashLink = (e: Event) => {
      const a = e.currentTarget as HTMLAnchorElement;
      if (a.closest('#landing-dots')) return;
      const hash = a.getAttribute('href')?.slice(1);
      const i = chapters.findIndex((c) => c.id === hash);
      if (i >= 0) {
        e.preventDefault();
        goTo(i);
      }
    };

    const tickParallax = () => {
      chapters.forEach((chapter, i) => {
        const rect = chapter.getBoundingClientRect();
        const progress = 1 - rect.bottom / (rect.height + window.innerHeight);
        const clamped = Math.max(0, Math.min(1, progress));
        const targetBg = (clamped - 0.5) * 72;
        const targetFg = (clamped - 0.5) * -16;
        const s = state[i]!;
        s.bg += (targetBg - s.bg) * PARALLAX_LERP;
        s.fg += (targetFg - s.fg) * PARALLAX_LERP;
        chapter.style.setProperty('--bg-y', `${s.bg.toFixed(2)}px`);
        chapter.style.setProperty('--fg-y', `${s.fg.toFixed(2)}px`);
      });
      parallaxRaf = requestAnimationFrame(tickParallax);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    dots.forEach((dot) => dot.addEventListener('click', onDotNav));
    root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', onHashLink);
    });

    setActive(0);
    parallaxRaf = requestAnimationFrame(tickParallax);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      dots.forEach((dot) => dot.removeEventListener('click', onDotNav));
      root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
        a.removeEventListener('click', onHashLink);
      });
      if (wheelTimer) clearTimeout(wheelTimer);
      cancelAnimationFrame(scrollAnim);
      cancelAnimationFrame(parallaxRaf);
    };
  }, []);

  return (
    <div className="landing-root" ref={rootRef}>
      <nav className="landing-dots" aria-label="بخش‌های صفحه" id="landing-dots">
        {CHAPTER_IDS.map((id) => (
          <a key={id} href={`#${id}`} data-target={id} title={id} />
        ))}
      </nav>

      <nav className="landing-nav" aria-label="منو">
        <a className="landing-nav-brand" href="#hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="landing-nav-logo"
            src="/brand/logo.svg"
            alt="لوگوی کسب‌یار"
            width={34}
            height={34}
          />
          <span>کسب‌یار</span>
        </a>
        <div className="landing-nav-links">
          <a href="#details">مشتری</a>
          <a href="#sales">فاکتور</a>
          <a href="#team">نقش</a>
          <a href="#packs">صنف</a>
        </div>
        <div className="landing-nav-actions">
          <Link className="landing-nav-ghost" href="/login">
            ورود
          </Link>
          <Link className="landing-nav-pill" href="/register">
            شروع رایگان
          </Link>
        </div>
      </nav>

      <section className="landing-chapter" id="hero" data-chapter>
        <div
          className="landing-bg"
          style={{ backgroundImage: "url('/landing/poster-hero.jpg')" }}
        />
        <div className="landing-tint" />
        <div className="landing-card start">
          <h1>کسب‌یار</h1>
          <p className="landing-lead">سیستم‌عاملِ رشدِ تو</p>
          <p className="landing-support">
            پلتفرمی که ابزارهای پراکنده را حذف می‌کند و مدیریت کسب‌وکارت را از یک
            «وظیفه» به یک «تجربه» تبدیل می‌کند — فارسی، جلالی، تومان.
          </p>
          <div className="landing-cta">
            <Link className="landing-btn-main" href="/register">
              ۱۴ روز رایگان
            </Link>
            <a className="landing-btn-soft" href="#details">
              ببینید چه کار می‌کند
            </a>
          </div>
        </div>
        <div className="landing-scroll-hint">اسکرول</div>
      </section>

      <section className="landing-chapter" id="details" data-chapter>
        <div
          className="landing-bg"
          style={{ backgroundImage: "url('/landing/poster-details.jpg')" }}
        />
        <div className="landing-tint" />
        <div className="landing-card end">
          <span className="landing-num" aria-hidden="true">
            ۰۱
          </span>
          <span className="landing-kicker">مشتری و لید</span>
          <h2>مشتریانت را به خاطر بسپار، قبل از اینکه رقبا آن‌ها را ببرند</h2>
          <p className="landing-support">
            کسب‌یار حافظهٔ بلندمدتِ تیم توست؛ جایی که هر لید تا لحظهٔ تبدیل شدن به
            مشتری، پیگیری می‌شود.
          </p>
          <ul className="landing-points">
            <li>جایی که لیدهای خاک‌خورده، به مشتری‌های وفادار تبدیل می‌شوند</li>
            <li>به مشتریانتان نه یک شماره، بلکه یک تجربه بدهید</li>
            <li>داستانِ هر مشتری در یک نگاه — تصویر ۳۶۰ درجه از تعاملات</li>
          </ul>
          <div className="landing-cta">
            <a className="landing-btn-soft" href="#sales">
              فاکتور و مالی
            </a>
          </div>
        </div>
      </section>

      <section className="landing-chapter" id="sales" data-chapter>
        <div
          className="landing-bg"
          style={{ backgroundImage: "url('/landing/poster-sales.jpg')" }}
        />
        <div className="landing-tint" />
        <div className="landing-card start">
          <span className="landing-num" aria-hidden="true">
            ۰۲
          </span>
          <span className="landing-kicker">فاکتور و مالی</span>
          <h2>پولِ توی راه، پولِ توی حساب</h2>
          <p className="landing-support">
            از صدورِ آنی تا گزارش‌گیری لحظه‌ای؛ چرخهٔ مالی کسب‌وکارت را بدونِ خطا و در
            یک محیطِ امن مدیریت کن — از صدور تا تسویه با یک نگاه.
          </p>
          <ul className="landing-points">
            <li>فاکتورتان نباید برایتان دغدغه باشد؛ ریاضیاتش با کسب‌یار است</li>
            <li>حساب‌وکتابِ شفاف؛ یعنی خوابِ راحتِ شب برای مدیر</li>
            <li>پایانِ اختلاف‌حساب‌های آخرِ ماه</li>
          </ul>
          <div className="landing-cta">
            <a className="landing-btn-soft" href="#team">
              نقش‌های تیم
            </a>
          </div>
        </div>
      </section>

      <section className="landing-chapter" id="team" data-chapter>
        <div
          className="landing-bg"
          style={{ backgroundImage: "url('/landing/poster-team.jpg')" }}
        />
        <div className="landing-tint" />
        <div className="landing-card end">
          <span className="landing-num" aria-hidden="true">
            ۰۳
          </span>
          <span className="landing-kicker">نقش‌ها</span>
          <h2>هر نقش، یک تجربهٔ شخصی‌سازی‌شده</h2>
          <p className="landing-support">
            از داشبوردِ مدیریتی تا لیستِ وظایفِ کارمندان؛ کسب‌یار دقیقاً همان‌جایی است
            که هر کس باید باشد تا کارش را عالی انجام دهد.
          </p>
          <ul className="landing-points">
            <li>مدیرِ ارشد یا کارمندِ خطِ‌مقدم؟ هر کدام فضای اختصاصی دارد</li>
            <li>هماهنگی در عینِ تفکیک — بدونِ جلساتِ بی‌پایان</li>
            <li>سلسله‌مراتبِ هوشمند؛ هر نقش فقط آنچه برایش اهمیت دارد</li>
          </ul>
          <div className="landing-cta">
            <a className="landing-btn-soft" href="#packs">
              مناسب صنف شما
            </a>
          </div>
        </div>
      </section>

      <section className="landing-chapter" id="packs" data-chapter>
        <div
          className="landing-bg"
          style={{ backgroundImage: "url('/landing/poster-packs.jpg')" }}
        />
        <div className="landing-tint" />
        <div className="landing-card center">
          <span className="landing-num" aria-hidden="true">
            ۰۴
          </span>
          <span className="landing-kicker">صنف</span>
          <h2>ابزاری که دقیقاً اندازهٔ کسب‌وکار توست</h2>
          <p className="landing-support">
            چه کلینیک باشی، چه خرده‌فروشی؛ کسب‌یار با هسته‌ای قدرتمند، برای نیازهای خاصِ
            صنفِ تو شخصی‌سازی می‌شود.
          </p>
          <ul
            className="landing-points"
            style={{ maxWidth: '42ch', marginInline: 'auto', textAlign: 'start' }}
          >
            <li>یک سیستم‌عامل، هزاران کاربرد؛ از ویزیتِ بیمار تا فروشِ آنلاین</li>
            <li>برای هر صنف، یک اَبَر‌قدرت اختصاصی درون کسب‌یار</li>
            <li>کلینیک · خرده‌فروشی · آژانس — بستهٔ عمودی آماده‌به‌کار</li>
          </ul>
          <div className="landing-cta">
            <a className="landing-btn-soft" href="#start">
              پیشخوان را باز کنید
            </a>
          </div>
        </div>
      </section>

      <section className="landing-chapter" id="start" data-chapter>
        <div
          className="landing-bg"
          style={{ backgroundImage: "url('/landing/poster-start.jpg')" }}
        />
        <div className="landing-tint" />
        <div className="landing-card center">
          <span className="landing-kicker">شروع کار</span>
          <h2>پیچیدگی را به منطق تبدیل کن</h2>
          <p className="landing-support">
            یک محیط یکپارچه برای مدیریتِ بی‌وقفه؛ از CRM تا صورتحساب. ثبت‌نام سریع · ۱۴
            روز رایگان · بدون نیاز به راه‌اندازی پیچیده
          </p>
          <div className="landing-cta">
            <Link className="landing-btn-main" href="/register">
              ساخت پیشخوان رایگان
            </Link>
            <Link className="landing-btn-soft" href="/login">
              ورود به پیشخوان
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <span>کسب‌یار · سیستم‌عامل کسب‌وکار برای ایران</span>
        <Link href="/login">ورود به پیشخوان</Link>
      </footer>
    </div>
  );
}
