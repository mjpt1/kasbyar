# چک‌لیست راه‌اندازی V1 — کسب‌یار

راهنمای آماده‌سازی برای پایلوت و لانچ کنترل‌شده.

## قبل از استقرار

### زیرساخت
- [ ] `DATABASE_URL` و `SESSION_SECRET` production تنظیم شده
- [ ] `ALLOW_SEED=false` در production
- [ ] `DEMO_MODE` فقط در محیط فروش جدا (در صورت نیاز)
- [ ] health check: `/api/health` و `/api/health/ready`
- [ ] backup قبل از migration — `npm run db:backup`
- [ ] CI سبز: `npm run ci`

### دیتابیس
- [ ] migration در staging اجرا شده
- [ ] `CONFIRM_MIGRATE_DEPLOY=true npm run db:migrate:deploy` در production
- [ ] seed دمو **فقط** در local/staging

### امنیت
- [ ] HTTPS فعال
- [ ] توکن AI داخلی قوی
- [ ] نقش‌ها و دسترسی audit برای ADMIN بررسی شده

## قبل از پایلوت مشتری

### محصول
- [ ] ورود و انتخاب workspace تست شده
- [ ] جریان مشتری → فاکتور → پرداخت
- [ ] بسته عمودی مرتبط (کلینیک/مسافرتی/خرده) در صورت نیاز
- [ ] صفحه `/help` و تنظیمات قابل دسترس
- [ ] دستیار در طرح مناسب فعال یا پیام ارتقا نمایش داده می‌شود

### دمو
- [ ] `docs/DEMO.md` برای تیم فروش
- [ ] بازنشانی دمو فقط با مجوز ADMIN

### پشتیبانی
- [ ] مسئول پاسخگویی مشخص
- [ ] قالب گزارش باگ (زمان، workspace، مراحل بازتولید)
- [ ] `docs/KNOWN_LIMITATIONS.md` مطالعه شده

## معیار «آماده پایلوت»

| معیار | هدف |
|--------|-----|
| UAT بحرانی | ۱۰۰٪ مسیرهای اصلی |
| خطای ۵۰۰ در smoke | ۰ |
| زمان بارگذاری داشبورد | قابل قبول در شبکه ایران |
| بازیابی backup | تست شده در staging |

## پس از لانچ (هفته اول)

- [ ] پایش health و لاگ‌ها
- [ ] جمع‌آوری بازخورد پایلوت
- [ ] اولویت‌بندی باگ‌ها در `KNOWN_LIMITATIONS`
- [ ] بررسی audit برای عملیات حساس

## مستندات مرتبط

- [QA_CHECKLIST.md](./QA_CHECKLIST.md)
- [PILOT_ONBOARDING.md](./PILOT_ONBOARDING.md)
- [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [DATA_SAFETY.md](./DATA_SAFETY.md)
- [DEMO.md](./DEMO.md)
