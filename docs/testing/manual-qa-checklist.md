# Manual QA Checklist — KesbYar

چک‌لیست QA دستی سازمان‌یافته بر اساس [testing-strategy.md](./testing-strategy.md). برای UAT تفصیلی V1 هم‌پوشان با [QA_CHECKLIST.md](../QA_CHECKLIST.md) است.

**زمان اجرا:** قبل از پایلوت، پایان فاز major، یا پس از تغییرات گسترده UX/tenant.

**محیط پیشنهادی:** staging با seed (`npm run db:reseed`) یا local با `DEMO_MODE=true`.

---

## 0. Pre-flight

- [ ] `npm run ci` سبز روی branch تحت تست
- [ ] `npm run test:security` سبز
- [ ] نسخه/build شماره‌گذاری شده (git ref در جدول پایین)

---

## 1. Auth & workspace (Manual + Security)

- [ ] ثبت‌نام سازمان جدید
- [ ] ورود / خروج — پیام خطای فارسی برای credential اشتباه
- [ ] انتخاب workspace با `demo@` — ۴ سازمان
- [ ] user دوم (`manager@`) فقط `demo-general`
- [ ] **Security:** URL مستقیم entity org دیگر → 404/not found

---

## 2. Core CRM

### Customers
- [ ] ایجاد با validation (موبایل ایران)
- [ ] جستجو + pagination
- [ ] بایگانی — عدم نمایش در لیست
- [ ] empty state + CTA

### Leads
- [ ] ایجاد، تغییر مرحله، follow-up
- [ ] empty state

### Tasks
- [ ] ایجاد، سررسید، تکمیل

---

## 3. Invoicing & payments

- [ ] فاکتور با چند قلم — جمع صحیح
- [ ] تغییر وضعیت — لغو با confirm
- [ ] ثبت پرداخت → به‌روزرسانی وضعیت فاکتور
- [ ] **Security:** payment با `invoiceId` org دیگر (API tool یا tamper) → reject

---

## 4. Files & upload (Manual + Security)

- [ ] آپلود PDF/تصویر به مشتری
- [ ] دانلود فایل پیوست
- [ ] فایل بزرگ‌تر از limit → خطای فارسی
- [ ] MIME غیرمجاز (مثلاً .exe renamed) → reject
- [ ] **Security:** attach به customerId org دیگر → reject

---

## 5. Billing & gating

- [ ] `/pricing` نمایش طرح‌ها
- [ ] `/settings/billing` — تغییر طرح (ADMIN)
- [ ] staff نمی‌تواند plan عوض کند
- [ ] FREE: `/conversation` قفل + UpgradePrompt
- [ ] FREE: AI summary قفل (اگر در UI exposed)

---

## 6. AI assistant

- [ ] سؤال در conversation — پاسخ فارسی
- [ ] loading state
- [ ] AI service خاموش → degraded + fallback متن
- [ ] **Security:** هیچ action خودکار مالی اجرا نمی‌شود

---

## 7. Vertical packs (یک workspace per pack)

- [ ] `demo-clinic` — نوبت/بیمار
- [ ] `demo-travel` — رزرو
- [ ] `demo-retail` — موجودی
- [ ] org با pack GENERAL — `/clinic` redirect

---

## 8. Dashboard & reports

- [ ] کارت‌های آماری لینک‌دار
- [ ] empty sections
- [ ] نمودار ۷ روز (با داده seed)
- [ ] reports در plan مناسب

---

## 9. Demo mode

- [ ] بنر `NEXT_PUBLIC_DEMO_MODE`
- [ ] سوئیچ سناریو
- [ ] reset — فقط ADMIN
- [ ] staff reset → forbidden
- [ ] **Security:** در config شبیه prod (بدون ALLOW_SEED) reset مسدود

---

## 10. Audit & admin

- [ ] `/settings/audit` — ADMIN+ only
- [ ] staff → 403 یا عدم دسترسی منو
- [ ] رویداد login/payment در لیست (در صورت انجام action)

---

## 11. UX & RTL

- [ ] RTL موبایل و دسکتاپ
- [ ] منوی همبرگر
- [ ] `loading.tsx` در ناوبری
- [ ] `not-found` entity نامعتبر
- [ ] toast موفق/خطا فارسی

---

## 12. Regression gates

- [ ] `npm test` سبز
- [ ] `npm run build` سبز
- [ ] بدون console error آشکار در happy path

---

## ثبت نتیجه

| تاریخ | تست‌کننده | Branch/ref | محیط | Pass/Fail | Blockers |
|-------|-----------|------------|------|-----------|----------|
| | | | staging | | |

**Blockers** → issue + لینک در phase gate / release checklist.

---

## مستندات مرتبط

- [QA_CHECKLIST.md](../QA_CHECKLIST.md) — UAT تفصیلی V1
- [security/tenant-safety-checklist.md](../security/tenant-safety-checklist.md)
- [SECURITY_REVIEW.md](../SECURITY_REVIEW.md)
