# چک‌لیست Meta App Review و go-live کانال‌ها

این سند **مراحل اپراتوری** است. ارسال App Review از داخل این مخزن امکان‌پذیر نیست — به حساب Meta Business نیاز دارید.

## پیش‌نیازهای in-repo (انجام‌شده در محصول)

- [x] Webhook WhatsApp: `/api/webhooks/whatsapp/...`
- [x] Webhook Instagram: `/api/webhooks/instagram/...`
- [x] ذخیره per-org: Phone Number ID، Access Token، App Secret، Verify Token
- [x] ارسال متن واتساپ از inbox و اتوماسیون `SEND_REMINDER`
- [x] `GET /api/inbox/health` برای وضعیت پیکربندی
- [x] متغیرهای نمونه در `.env.example` و `deploy/env/*.env.example`

## مراحل اپراتور — WhatsApp Cloud API

1. ساخت Meta App با محصول WhatsApp
2. افزودن شماره تست / production در Meta Business Suite
3. تنظیم Webhook URL به `https://<APP_URL>/api/webhooks/whatsapp/<orgSlug>` (یا مسیر مستندشده در تنظیمات)
4. Verify Token مطابق مقدار ذخیره‌شده در org
5. کپی Phone Number ID و Permanent Access Token در تنظیمات یکپارچه‌سازی کسب‌یار
6. افزودن شماره‌های تست برای Development Mode
7. ارسال **App Review** برای مجوزهای لازم (مثلاً `whatsapp_business_messaging`)
8. پس از تأیید، سوئیچ به Live و تست ارسال/دریافت واقعی

## مراحل اپراتور — Instagram Messaging

1. اتصال صفحه اینستاگرام به Meta App
2. Webhook + App Secret در تنظیمات org
3. درخواست مجوزهای messaging در App Review
4. تست DM در حالت Live

## کانال‌های دیگر (غیر Meta)

| کانال | اقدام اپراتور |
|-------|----------------|
| Kavenegar SMS | API key + sender در org یا `SMS_KAVENEGAR_*` روی Vercel |
| Resend Email | `RESEND_API_KEY` + from |
| Telegram Bot | Bot token در تنظیمات org |
| Zarinpal / IDPay | Merchant / API key در تنظیمات org |
| Cron اتوماسیون | `CRON_SECRET` روی Vercel + هم‌خوانی با `vercel.json` |

## امنیت

- هرگز توکن‌های واقعی را در git commit نکنید
- پس از rotate، مقدارهای org و Vercel را هم‌زمان به‌روز کنید
- `CRON_SECRET` را طولانی و تصادفی نگه دارید

## ارجاع

- `docs/ENVIRONMENT.md`
- `wiki/صندوق-ورودی-چندکاناله.md`
- تنظیمات UI: `/settings` → یکپارچه‌سازی‌ها
