# اصول پولیش محصول — کسب‌یار

راهنمای کوتاه برای تغییرات UI/UX بعد از V1.

**کارایی و کیفیت درک‌شده:** [performance/README.md](./performance/README.md) · [ui-state-consistency-rules.md](./performance/ui-state-consistency-rules.md)

## زبان و RTL

- همه متن‌های قابل مشاهده فارسی و طبیعی
- اعداد مالی با `formatCurrency` و تاریخ با `JalaliDate`
- فیلدهای LTR (تلفن، ایمیل) با `dir="ltr"`

## حالت‌ها

| حالت | کامپوننت |
|------|----------|
| خالی صفحه | `EmptyState` |
| خالی بخش | `InlineEmpty` |
| بارگذاری | `LoadingState` / `ListPageSkeleton` |
| قفل طرح | `UpgradePrompt` |
| خطا | `ErrorState` / toast |
| مخرب | `DestructiveActionButton` یا `confirm` |

## سلسله‌مراتب عمل

- یک عمل اصلی در هر صفحه (ایجاد، ذخیره)
- عمل‌های مخرب با تأیید و variant `destructive`
- لینک بازگشت در صفحات جزئیات

## ناوبری

- هسته مشترک + بخش «بسته تخصصی» در sidebar
- `/help` برای پشتیبانی عملیاتی
- `aria-current="page"` برای آیتم فعال

## چه چیزی اضافه نکنیم

- انیمیشن‌های سنگین بدون دلیل
- کپی انگلیسی در UI
- empty state بدون راه بعدی برای کاربر
