# چک‌لیست Go-Live — کسب‌یار (v0.12+)

راهنمای عملیاتی برای استقرار production روی Vercel و آماده‌سازی پایلوت.

---

## ۱. متغیرهای محیط Vercel (الزامی)

| متغیر | توضیح |
|--------|--------|
| `DATABASE_URL` | Neon Postgres (production branch) |
| `SESSION_SECRET` | حداقل ۳۲ بایت تصادفی |
| `NEXT_PUBLIC_APP_URL` | `https://kasbyar.vercel.app` |
| `CRON_SECRET` | توکن برای `/api/cron/*` |
| `ALLOW_SEED` | `false` در production |
| `DEMO_MODE` | `false` یا حذف |

### پرداخت فاکتور (per-org در تنظیمات) + اشتراک SaaS (platform)

| متغیر | توضیح |
|--------|--------|
| `BILLING_PROVIDER` | `zarinpal` یا `idpay` |
| `BILLING_ZARINPAL_MERCHANT_ID` | مرچنت پلتفرم برای خرید طرح |
| `BILLING_IDPAY_API_KEY` | کلید آیدی‌پی پلتفرم |
| `PAYMENT_SANDBOX` | `false` در production واقعی |

### پیامک / ایمیل (platform یا per-org)

| متغیر | توضیح |
|--------|--------|
| `SMS_KAVENEGAR_API_KEY` | پیامک سراسری (fallback) |
| `SMS_KAVENEGAR_SENDER` | خط ارسال |
| `RESEND_API_KEY` | ایمیل (magic-link پورتال) |

### کانال‌های Meta / تلگرام (per-org + webhook)

| متغیر | توضیح |
|--------|--------|
| `META_APP_SECRET` | امضای webhook اینستاگرام (global fallback) |
| `TELEGRAM_WEBHOOK_SECRET` | اختیاری |

### AI (اختیاری — fallback بدون crash)

| متغیر | توضیح |
|--------|--------|
| `AI_SERVICE_URL` | URL سرویس LLM داخلی |
| `AI_SERVICE_TOKEN` | توکن داخلی |

---

## ۲. Health / Monitoring

| Endpoint | نوع | انتظار |
|----------|-----|--------|
| `GET /api/health` | Liveness | `status: ok` — بدون DB |
| `GET /api/health/ready` | Readiness | `database: ok` |
| `GET /api/ai/health` | AI | `ok` یا `degraded` |
| `GET /api/inbox/health` | کانال‌ها (auth) | وضعیت SMS/WhatsApp/… per-org |

**Smoke test سریع (بعد از deploy):**

```bash
curl -s https://kasbyar.vercel.app/api/health | jq .data.status
curl -s https://kasbyar.vercel.app/api/health/ready | jq .data.checks
```

---

## ۳. Cron jobs (Vercel)

| مسیر | زمان‌بندی پیشنهادی |
|------|-------------------|
| `/api/cron/automation` | روزانه |
| `/api/cron/reminders` | روزانه |

هدر: `Authorization: Bearer $CRON_SECRET`

---

## ۴. قبل از دعوت مشتری پایلوت

- [ ] `npm run ci` سبز روی commit مستقرشده
- [ ] `/api/health/ready` → database ok
- [ ] `ALLOW_SEED=false`، `DEMO_MODE` خاموش
- [ ] پشتیبان DB در ۷ روز اخیر ([BACKUP_RESTORE.md](./BACKUP_RESTORE.md))
- [ ] [pilot-known-limitations.md](./pilot/pilot-known-limitations.md) برای مشتری
- [ ] [go-live-readiness.md](./pilot/go-live-readiness.md) امضا شده
- [ ] جداسازی tenant تست شده (cross-org → 404)

---

## ۵. کارهایی که فقط انسان انجام می‌دهد

| مورد | دلیل |
|------|------|
| ثبت Meta App Review | داشبورد Meta Developers |
| نصب secrets روی Vercel | دسترسی admin پروژه |
| حساب کافه‌بازار / مایکت | انتشار APK |
| کلید درگاه production | قرارداد با زرین‌پال/آیدی‌پی |

---

## ۶. پورتال مشتری (magic-link)

وقتی `SMS_KAVENEGAR_API_KEY` یا `RESEND_API_KEY` (یا per-org) تنظیم باشد:

- `POST /api/portal/magic-link` → SMS/ایمیل با لینک `/portal/{token}`
- بدون کانال: پیام راهنما + `portalUrl` فقط در dev

---

## مرتبط

- [pilot/README.md](./pilot/README.md)
- [pilot/pilot-3-org-runbook.md](./pilot/pilot-3-org-runbook.md)
- [wiki/متغیرهای-محیط](../wiki/متغیرهای-محیط.md)
