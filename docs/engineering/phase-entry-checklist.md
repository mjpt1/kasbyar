# Phase Entry Checklist

قبل از شروع هر فاز توسعه جدید روی KesbYar.

---

## 1. آمادگی مخزن

- [ ] [repository-audit.md](../repository-audit.md) خوانده شده
- [ ] [current-state-map.md](../architecture/current-state-map.md) مرور شده
- [ ] [safe-extension-rules.md](./safe-extension-rules.md) پذیرفته شده
- [ ] فاز قبلی در [MASTER_EXECUTION.md](../MASTER_EXECUTION.md) complete است
- [ ] `npm run ci` سبز روی branch پایه

---

## 2. وابستگی‌ها

- [ ] prerequisite فاز قبلی در کد وجود دارد (نه فقط doc)
- [ ] اگر schema لازم است — migration strategy مشخص است
- [ ] اگر billing لازم است — `Subscription` model و entitlement موجود است
- [ ] اگر pack لازم است — registry pattern موجود است

**Stop condition:** وابستگی نیست → فاز را متوقف کنید، فقط minimal foundation بسازید.

---

## 3. محدوده فاز

- [ ] اهداف فاز در ۳–۷ bullet نوشته شده
- [ ] explicit **out of scope** نوشته شده
- [ ] batch plan (فایل به فایل) وجود دارد

---

## 4. امنیت و tenant (اگر مرتبط)

- [ ] [SECURITY_REVIEW.md](../SECURITY_REVIEW.md) بخش مرتبط
- [ ] tenant-scope برای entity جدید planned
- [ ] destructive flows با guard

---

## 5. خروجی‌های فاز (Definition of Done)

- [ ] build/typecheck
- [ ] tests یا gap documented
- [ ] env/docs به‌روز
- [ ] manual verification listed
- [ ] limitations در KNOWN_LIMITATIONS در صورت نیاز
- [ ] ADR اگر تصمیم major
- [ ] [change-impact-checklist](./change-impact-checklist.md) برای PRهای فاز

---

## 6. Review Gate (پایان فاز)

1. What was implemented
2. Files changed
3. Acceptance criteria met
4. Gaps remaining
5. Assumptions
6. Manual verification steps
7. Safe to continue? yes/no
8. Next phase depends on

---

## 7. لینک سریع فازها

| فاز | پیش‌نیاز کلیدی |
|-----|----------------|
| Foundation | scaffold |
| MVP core | auth + schema |
| Seed | MVP models |
| Hardening | MVP flows |
| AI integration | intelligence service stub |
| Deploy | build healthy |
| Vertical packs | registry + industryPack |
| Billing | Subscription model |
| Demo mode | seed + DEMO_MODE |
| Data safety | tenant-scope |
| V1 polish | core flows stable |

---

## 8. قوانین ممنوع در هر فاز

- rename گسترده بدون دلیل
- rewrite ماژول‌های high-risk audit
- commit secrets
- skip tests بدون مستندسازی gap
- معماری جدید موازی با service layer موجود
