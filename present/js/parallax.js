(function () {
  const progress = document.querySelector('.scroll-progress');
  const header = document.querySelector('.site-header');
  const dots = [...document.querySelectorAll('.section-dots a')];
  const chapters = [...document.querySelectorAll('[data-parallax]')];
  const reveals = [...document.querySelectorAll('.reveal, .card')];
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  const sections = [...document.querySelectorAll('[data-section]')];

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduceMotion = motionQuery.matches;

  /* ── Smooth scroll (easeOutQuint + soft settle) ─────────── */
  let animating = false;
  let animRaf = 0;
  let settleVelocity = 0;
  let queuedDir = 0;

  function easeOutQuint(t) {
    return 1 - Math.pow(1 - t, 5);
  }

  function scrollToY(targetY, duration) {
    if (reduceMotion) {
      window.scrollTo(0, targetY);
      settleVelocity = 0;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      if (animRaf) cancelAnimationFrame(animRaf);
      animating = true;
      const startY = window.scrollY;
      const delta = targetY - startY;
      const ms = duration ?? Math.min(1400, Math.max(720, Math.abs(delta) * 0.65));
      const t0 = performance.now();

      function step(now) {
        const t = Math.min(1, (now - t0) / ms);
        const eased = easeOutQuint(t);
        window.scrollTo(0, startY + delta * eased);

        if (t > 0.82) {
          const remaining = (1 - eased) * delta;
          settleVelocity = remaining * 0.018;
        }

        if (t < 1) {
          animRaf = requestAnimationFrame(step);
        } else {
          animating = false;
          animRaf = 0;
          if (Math.abs(settleVelocity) > 0.15) {
            coastSettle(resolve);
          } else {
            settleVelocity = 0;
            resolve();
          }
        }
      }
      animRaf = requestAnimationFrame(step);
    });
  }

  function coastSettle(done) {
    function coast() {
      if (reduceMotion || Math.abs(settleVelocity) < 0.08) {
        settleVelocity = 0;
        animating = false;
        animRaf = 0;
        done();
        return;
      }
      window.scrollBy(0, settleVelocity);
      settleVelocity *= 0.86;
      animRaf = requestAnimationFrame(coast);
    }
    animating = true;
    animRaf = requestAnimationFrame(coast);
  }

  function sectionTop(el) {
    return Math.max(0, el.offsetTop);
  }

  function goToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    queuedDir = 0;
    scrollToY(sectionTop(el));
    history.replaceState(null, '', `#${id}`);
  }

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')?.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      goToSection(id);
      if (nav) {
        nav.classList.remove('is-open');
        menuToggle?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ── Wheel / keyboard / touch: one full section per step ── */
  let wheelLock = false;
  let lastWheel = 0;
  let wheelAccum = 0;

  function currentSectionIndex() {
    const mid = window.innerHeight * 0.42;
    let idx = 0;
    sections.forEach((s, i) => {
      if (s.getBoundingClientRect().top <= mid) idx = i;
    });
    return idx;
  }

  function getScrollableInner(fromEl) {
    if (!fromEl || typeof fromEl.closest !== 'function') return null;
    const inner = fromEl.closest('.section-inner');
    if (!inner) return null;
    if (inner.scrollHeight <= inner.clientHeight + 2) return null;
    return inner;
  }

  function closestSectionInner(fromEl) {
    if (!fromEl || typeof fromEl.closest !== 'function') return null;
    return fromEl.closest('.section-inner');
  }

  function canInnerScroll(inner, dir) {
    if (!inner) return false;
    if (dir > 0) return inner.scrollTop + inner.clientHeight < inner.scrollHeight - 2;
    return inner.scrollTop > 2;
  }

  function stepSection(dir) {
    if (wheelLock) return;
    if (animating) {
      queuedDir = dir;
      return;
    }
    const idx = currentSectionIndex();
    const next = Math.min(sections.length - 1, Math.max(0, idx + dir));
    if (next === idx) return;
    const target = sections[next];
    if (!target) return;
    wheelLock = true;
    wheelAccum = 0;
    scrollToY(sectionTop(target)).then(() => {
      setTimeout(() => {
        wheelLock = false;
        if (queuedDir) {
          const q = queuedDir;
          queuedDir = 0;
          stepSection(q);
        }
      }, 70);
    });
  }

  if (sections.length) {
    window.addEventListener(
      'wheel',
      (e) => {
        if (reduceMotion) return;

        const inner = getScrollableInner(e.target);
        const dir = e.deltaY > 0 ? 1 : -1;
        if (inner && canInnerScroll(inner, dir)) {
          // Let contained .section-inner scroll first (mobile overflow escape hatch)
          return;
        }

        // Always own the page wheel once we're in section mode
        e.preventDefault();

        if (animating || wheelLock) {
          if (animating) queuedDir = dir;
          return;
        }

        if (Math.abs(e.deltaY) < 12) return;
        const now = performance.now();
        if (now - lastWheel > 220) wheelAccum = 0;
        lastWheel = now;
        wheelAccum += e.deltaY;

        if (Math.abs(wheelAccum) < 28) return;

        const stepDir = wheelAccum > 0 ? 1 : -1;
        wheelAccum = 0;
        stepSection(stepDir);
      },
      { passive: false },
    );

    window.addEventListener('keydown', (e) => {
      if (reduceMotion) return;
      const tag = document.activeElement?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        stepSection(1);
      } else if (e.key === ' ') {
        if (['A', 'BUTTON'].includes(tag)) return;
        e.preventDefault();
        stepSection(1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        stepSection(-1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToSection(sections[0]?.id);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToSection(sections[sections.length - 1]?.id);
      }
    });

    /* Touch swipe → next / prev section */
    let touchStartY = 0;
    let touchStartX = 0;
    let touchStartT = 0;
    let touchLastY = 0;
    let touchFromInner = null;

    window.addEventListener(
      'touchstart',
      (e) => {
        if (reduceMotion || !e.touches[0]) return;
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        touchLastY = touchStartY;
        touchStartT = performance.now();
        touchFromInner = closestSectionInner(e.target);
        if (
          touchFromInner &&
          touchFromInner.scrollHeight <= touchFromInner.clientHeight + 2
        ) {
          touchFromInner = null;
        }
      },
      { passive: true },
    );

    window.addEventListener(
      'touchmove',
      (e) => {
        if (reduceMotion || !e.touches[0]) return;
        const y = e.touches[0].clientY;
        const dir = touchLastY - y > 0 ? 1 : -1;
        touchLastY = y;
        const inner = getScrollableInner(e.target) || touchFromInner;
        if (inner && canInnerScroll(inner, dir)) return;
        // Block native page scroll so chapters stay full-page
        e.preventDefault();
      },
      { passive: false },
    );

    window.addEventListener(
      'touchend',
      (e) => {
        if (reduceMotion || !e.changedTouches[0]) return;
        const dy = touchStartY - e.changedTouches[0].clientY;
        const dx = touchStartX - e.changedTouches[0].clientX;
        const dt = performance.now() - touchStartT;
        if (Math.abs(dy) < 48 || Math.abs(dy) < Math.abs(dx) * 1.2) return;
        if (dt > 700) return;

        const dir = dy > 0 ? 1 : -1;
        if (touchFromInner && canInnerScroll(touchFromInner, dir)) return;

        stepSection(dir);
      },
      { passive: true },
    );
  }

  /* ── Critically-damped parallax spring ──────────────────── */
  const PARALLAX_AMP = 34;
  const GRID_FACTOR = 0.32;
  const MEDIA_SCALE = 1.06;
  const SPRING_OMEGA = 9.5;
  const SPRING_ZETA = 1;

  const parallaxState = chapters.map((el) => ({
    el,
    media: el.querySelector('.chapter-media'),
    grid: el.querySelector('.chapter-grid'),
    current: 0,
    target: 0,
    velocity: 0,
    active: false,
  }));

  let lastSpringTs = performance.now();
  let parallaxRaf = 0;

  function updateParallaxTargets() {
    const vh = window.innerHeight;
    parallaxState.forEach((p) => {
      if (!p.media) return;
      const rect = p.el.getBoundingClientRect();
      const visible = rect.bottom > -vh * 0.15 && rect.top < vh * 1.15;
      p.active = visible;
      if (visible) {
        p.target = (rect.top / vh) * -PARALLAX_AMP;
        p.media.style.willChange = 'transform';
        if (p.grid) p.grid.style.willChange = 'transform';
      } else {
        p.media.style.willChange = 'auto';
        if (p.grid) p.grid.style.willChange = 'auto';
      }
    });
  }

  function springStep(p, dt) {
    const omega = SPRING_OMEGA;
    const zeta = SPRING_ZETA;
    const force = omega * omega * (p.target - p.current);
    const damp = 2 * zeta * omega * p.velocity;
    p.velocity += (force - damp) * dt;
    p.current += p.velocity * dt;

    if (
      Math.abs(p.target - p.current) < 0.05 &&
      Math.abs(p.velocity) < 0.05
    ) {
      p.current = p.target;
      p.velocity = 0;
    }
  }

  function applyParallaxTransforms() {
    parallaxState.forEach((p) => {
      if (!p.media || !p.active) return;
      const y = p.current;
      p.media.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${MEDIA_SCALE})`;
      if (p.grid) {
        p.grid.style.transform = `translate3d(0, ${(y * GRID_FACTOR).toFixed(2)}px, 0)`;
      }
    });
  }

  function tickParallax(now) {
    if (!reduceMotion) {
      const dt = Math.min(0.048, Math.max(0.008, (now - lastSpringTs) / 1000));
      lastSpringTs = now;
      parallaxState.forEach((p) => {
        if (!p.media || !p.active) return;
        springStep(p, dt);
      });
      applyParallaxTransforms();
    }
    parallaxRaf = requestAnimationFrame(tickParallax);
  }

  function stopParallaxMotion() {
    parallaxState.forEach((p) => {
      p.current = 0;
      p.target = 0;
      p.velocity = 0;
      if (p.media) {
        p.media.style.transform = '';
        p.media.style.willChange = 'auto';
      }
      if (p.grid) {
        p.grid.style.transform = '';
        p.grid.style.willChange = 'auto';
      }
    });
  }

  function onMotionPreferenceChange() {
    reduceMotion = motionQuery.matches;
    if (reduceMotion) {
      stopParallaxMotion();
      if (animRaf) cancelAnimationFrame(animRaf);
      animating = false;
      wheelLock = false;
      queuedDir = 0;
      settleVelocity = 0;
    } else {
      lastSpringTs = performance.now();
      updateParallaxTargets();
    }
  }

  if (typeof motionQuery.addEventListener === 'function') {
    motionQuery.addEventListener('change', onMotionPreferenceChange);
  } else if (typeof motionQuery.addListener === 'function') {
    motionQuery.addListener(onMotionPreferenceChange);
  }

  /* ── Progress / dots / header ───────────────────────────── */
  function onScrollUi() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.transform = `scaleX(${ratio})`;
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);

    updateParallaxTargets();

    const mid = window.innerHeight * 0.4;
    let activeId = sections[0]?.id;
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= mid) activeId = section.id;
    });
    dots.forEach((dot) => {
      dot.classList.toggle('is-active', dot.dataset.target === activeId);
    });
  }

  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onScrollUi();
        ticking = false;
      });
    },
    { passive: true },
  );

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            if (entry.target.classList.contains('card')) {
              const siblings = [...entry.target.parentElement.querySelectorAll('.card')];
              const i = siblings.indexOf(entry.target);
              entry.target.style.transitionDelay = `${Math.min(i * 70, 420)}ms`;
            }
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' },
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(open));
    });
  }

  /* Land on hash section without free-scroll drift */
  if (location.hash) {
    const hashId = location.hash.slice(1);
    const hashEl = document.getElementById(hashId);
    if (hashEl && hashEl.hasAttribute('data-section')) {
      requestAnimationFrame(() => {
        window.scrollTo(0, sectionTop(hashEl));
        onScrollUi();
      });
    }
  }

  onScrollUi();
  lastSpringTs = performance.now();
  if (!reduceMotion) {
    parallaxRaf = requestAnimationFrame(tickParallax);
  }
})();
