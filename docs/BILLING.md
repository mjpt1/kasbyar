# اشتراک و قیمت‌گذاری — کسب‌یار

## مدل محصول

| لایه | مسیر | نقش |
|------|------|-----|
| کاتالوگ طرح | `packages/shared/src/billing/plans.ts` | تعریف قابلیت‌ها و سقف‌ها |
| اشتراک workspace | `Subscription` در Prisma | وضعیت، طرح، دوره آزمایشی |
| سیاست دسترسی | `server/billing/entitlement.service.ts` | ارزیابی feature و quota |
| مصرف | `server/billing/usage.service.ts` | شمارش استفاده فعلی |
| UI | `/pricing`, `/settings/billing` | نمایش و تغییر طرح (دمو: دستی) |

## طرح‌ها

| کد | نام | بسته عمودی | دستیار AI | گزارش |
|----|-----|------------|-----------|--------|
| FREE | رایگان | خیر | خیر | خیر |
| STARTER | استارتر | یک بسته | خیر | پایه |
| BUSINESS | حرفه‌ای | همه | بله | پیشرفته |
| ENTERPRISE | سازمانی | همه | بله | پیشرفته |

## وضعیت اشتراک

`TRIALING` · `ACTIVE` · `PAST_DUE` · `CANCELED` · `EXPIRED`

پس از `CANCELED`/`EXPIRED` یا پایان trial، قابلیت‌ها به سطح FREE محدود می‌شوند.

## اعمال محدودیت (سرور)

```typescript
import { assertFeature, assertQuota } from '@/server/billing/entitlement.service';

await assertFeature(organizationId, 'aiAssistant');
await assertQuota(organizationId, 'customers');
```

خطای `PlanUpgradeRequiredError` با کد `PLAN_UPGRADE_REQUIRED` — جدا از `ForbiddenError` نقش.

## API

| مسیر | توضیح |
|------|--------|
| `GET /api/billing/plans` | کاتالوگ عمومی |
| `GET /api/billing/subscription` | خلاصه + رویدادها (مدیر+) |
| `POST /api/billing/change-plan` | تغییر طرح (دمو / دستی) |

## دمو seed

| سازمان | طرح | وضعیت |
|--------|-----|--------|
| demo-general | BUSINESS | ACTIVE |
| demo-retail | STARTER | ACTIVE |
| demo-clinic | BUSINESS | TRIALING (۷ روز) |
| demo-travel | FREE | ACTIVE — ماژول مسافرتی قفل |

## اتصال درگاه پرداخت (آینده)

آداپتر placeholder: `server/billing/providers/manual.ts`

برای Zarinpal/IDPay: پیاده‌سازی `BillingProvider` و به‌روزرسانی `Subscription` پس از webhook.

## نقش vs طرح

- **نقش:** چه کسی می‌تواند تنظیمات/صورتحساب را ببیند (`canManageBilling` → MANAGER+)
- **طرح:** چه قابلیت‌هایی برای workspace فعال است

پیام‌ها و کدهای خطا این دو را جدا نگه می‌دارند.
