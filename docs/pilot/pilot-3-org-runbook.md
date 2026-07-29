# Runbook پایلوت ۳ سازمان — کسب‌یار

راهنمای عملی برای onboard همزمان **۳ org پایلوت** در هفته اول.

---

## پیش‌نیاز (یک‌بار)

1. Deploy production با [GO_LIVE_CHECKLIST.md](../GO_LIVE_CHECKLIST.md)
2. `BILLING_*` برای خرید طرح آنلاین (اختیاری — تغییر دستی طرح هم ممکن است)
3. `SMS_KAVENEGAR_API_KEY` برای welcome SMS و magic-link
4. اسکریپت: `node scripts/pilot-setup.mjs --help`

---

## جدول ردیابی ۳ org

| # | نام کسب‌وکار | slug | plan | ADMIN email | وضعیت |
|---|-------------|------|------|-------------|--------|
| 1 | | | BUSINESS | | ☐ آماده |
| 2 | | | BUSINESS | | ☐ آماده |
| 3 | | | STARTER | | ☐ آماده |

---

## مراحل per-org (۲۴–۴۸ ساعت قبل)

### الف — ایجاد workspace

```bash
node scripts/pilot-setup.mjs \
  --name "نام کسب‌وکار" \
  --slug "slug-unique" \
  --admin-email "admin@example.com" \
  --admin-password "TempPass123!" \
  --plan BUSINESS \
  --pack GENERAL \
  --specialty general-freelancer
```

خروجی: `organizationId`، لینک ورود، رمز موقت.

### ب — تنظیمات org (ADMIN مشتری یا ops)

- [ ] آنبوردینگ تکمیل (`/onboarding`)
- [ ] کلید درگاه فاکتور (Zarinpal/IDPay) در `/settings/integrations`
- [ ] کانال SMS/WhatsApp در صورت نیاز
- [ ] یک مشتری + یک فاکتور تست

### ج — تأیید فنی

```bash
# readiness
curl -s $APP_URL/api/health/ready

# با session cookie یا token — inbox health
curl -s -H "Cookie: ..." $APP_URL/api/inbox/health
```

- [ ] CSV export از `/customers` کار می‌کند
- [ ] `/pay/{token}` با درگاه org تست sandbox
- [ ] پورتال `/portal/login` با magic-link

### د — handoff مشتری

1. ارسال [operator-quickstart.md](./operator-quickstart.md)
2. ارسال [pilot-known-limitations.md](./pilot-known-limitations.md)
3. جلسه ۳۰ دقیقه با [sample-first-workflows.md](./sample-first-workflows.md)

---

## هفته ۱ — معیار موفقیت

| معیار | هدف |
|--------|-----|
| کاربران فعال | ≥ ۲ نفر per org |
| فاکتور صادر شده | ≥ ۳ |
| پرداخت (دستی یا IPG) | ≥ ۱ |
| تیکت پشتیبانی | پاسخ < ۲۴h |

---

## خروج از پایلوت

بعد از ۴–۸ هفته: [pilot-onboarding-package.md](./pilot-onboarding-package.md) → Exit criteria.
