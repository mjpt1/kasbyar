# Safe Extension Rules — KesbYar

قوانین توسعه امن برای جلوگیری از rewrite و architecture churn.

---

## 1. اصل طلایی

**گسترش الگوی موجود > ساخت الگوی جدید > بازنویسی**

مخزن V1 کامل است. هر تغییر باید دلیل شواهد‌دار داشته باشد.

---

## 2. کی توسعه ماژول موجود؟

| شرط | اقدام |
|-----|--------|
| موجودیت در همان دامنه است | فایل را در `server/{domain}/` گسترش دهید |
| UI مشابه لیست/فرم دارد | از `components/features/{domain}/` الگو بگیرید |
| فقط فیلد جدید | schema + validator + form — بدون refactor کل ماژول |
| قابلیت plan جدید | `plans.ts` + `entitlement` — نه UI جداگانه per plan |
| endpoint مشابه | همان `route.ts` با method جدید |

---

## 3. کی ماژول جدید بسازیم؟

| شرط | اقدام |
|-----|--------|
| دامنه business جدید در core | پوشه کامل طبق [conventions.md](./conventions.md) |
| قابلیت pack جدید | `packs/registry.ts` + `server/packs/` + seed |
| adapter سرویس خارجی | `providers/` یا `*.adapter.ts` |
| utility بدون I/O | `packages/shared/src/` |

---

## 4. معیارهای refactor (مجاز)

Refactor فقط وقتی **همه** موارد زیر برقرار است:

1. **شواهد:** باگ امنیتی، نشت tenant، یا شکست تست reproducible
2. **محدوده:** یک ماژول یا یک مسئولیت — نه «تمیزکاری کل پروژه»
3. **سازگاری:** API عمومی (route، service signature) backward-compatible یا migration documented
4. **تست:** قبل/بعد یا تست جدید برای رفتار تغییر‌یافته
5. **ADR:** اگر auth، schema، tenant، billing، یا AI contract عوض می‌شود

### Refactor مجاز (مثال)

- استخراج تابع تکراری در همان service
- جایگزینی `confirm()` با `DestructiveActionButton` در یک صفحه
- افزودن index export بدون حذف export قدیمی (با deprecation)

### Refactor ممنوع (بدون برنامه)

- ادغام همه services در یک فایل
- تغییر session model از cookie به JWT
- Prisma middleware سراسری به‌جای service discipline
- انتقال business logic از server به components
- rename گسترده پوشه‌ها برای «زیباتر شدن»

---

## 5. Rewrite — ممنوع مگر

| شرط | فرآیند |
|-----|--------|
| ماژول در بخش «خطرناک» audit | ADR + migration + QA کامل |
| جایگزینی کامل stack | خارج از scope — stop condition |
| حذف vertical pack | seed + nav + entitlement هم‌زمان |

**لیست rewrite ممنوع فوری:** `schema.prisma`، `session.ts`، `tenant-scope.ts`، `entitlement.service.ts`، `seed/scenarios/*`

---

## 6. مرز import

```
✅ apps/web → @kesbyar/shared, @kesbyar/ui
✅ apps/web/server → apps/web/lib
❌ packages/shared → apps/web
❌ components/features → prisma مستقیم (از API یا server action pattern فعلی)
❌ circular imports بین server services — extract به lib/business
```

---

## 7. فازهای آینده — بدون churn

| قانون | توضیح |
|--------|--------|
| یک concern per PR | نه polish + schema + rename هم‌زمان |
| Feature flag یا plan gate | قابلیت نیمه‌کاره پشت entitlement |
| Demo جدا از prod logic | `demo.service.ts` — نه bypass auth |
| Doc هم‌زمان کد | ENVIRONMENT، ADR، change-impact checklist |

---

## 8. چک قبل از merge (خلاصه)

→ [change-impact-checklist.md](./change-impact-checklist.md)

---

## 9. ارجاع

- [repository-audit.md](../repository-audit.md)
- [conventions.md](./conventions.md)
- [../decisions/](../decisions/)
- [../GUARDRAILS.md](../GUARDRAILS.md)
