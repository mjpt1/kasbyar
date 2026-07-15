# تست و اعتبارسنجی — KesbYar

**راهبرد کامل:** [testing/README.md](./testing/README.md)

راهنمای اجرای تست‌ها و افزودن پوشش جدید.

## پشته تست

| ابزار | لایه | کاربرد |
|-------|------|--------|
| **Vitest** | Unit + contract | منطق کسب‌وکار، policy، validators |
| **CI** | Gate | lint + typecheck + test + build |
| **Manual QA** | UAT | [testing/manual-qa-checklist.md](./testing/manual-qa-checklist.md) |
| **Playwright** | E2E | planned post-V1 |

## اجرا

```bash
npm test                  # همه تست‌ها (۸۷+)
npm run test:watch        # watch mode
npm run test:coverage     # گزارش پوشش (محدوده vitest.config)
npm run test:security     # tenant، audit، upload، destructive
npm run verify            # lint + typecheck + test — قبل از PR
npm run ci                # verify + build
```

## ساختار

```
docs/testing/              # strategy، matrix، QA، release verification
packages/shared/src/**/*.test.ts
apps/web/src/lib/**/*.test.ts
apps/web/src/server/**/*.test.ts
apps/web/src/components/**/*.test.ts
```

جزئیات لایه‌ها: [testing/testing-strategy.md](./testing/testing-strategy.md)  
نقشه ماژول‌ها: [testing/test-matrix.md](./testing/test-matrix.md)

## منطق قابل تست (business)

`apps/web/src/lib/business/` — توابع خالص:

- `invoice-math` — جمع خط، وضعیت پرداخت
- `receivables` — مطالبات معوق
- `leads` — لید راکد
- `tasks` — سررسید وظیفه

## افزودن تست جدید

1. بررسی [test-matrix.md](./testing/test-matrix.md) — آیا **R** برای این ماژول؟
2. فایل `*.test.ts` کنار ماژول
3. `npm test` قبل از PR
4. gap → [templates/test-plan-template.md](./templates/test-plan-template.md)

## الگوی API (برای integration آینده)

```ts
export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    if (isApiError(session)) return session;
    // ...
  } catch (error) {
    return handleApiError(error, 'resource.POST');
  }
}
```

## مستندات مرتبط

- [observability/README.md](./observability/README.md) — لاگ، audit، متریک
- [QA_CHECKLIST.md](./QA_CHECKLIST.md) — UAT تفصیلی V1
- [quality/definition-of-done.md](./quality/definition-of-done.md)
- [security/review-gate.md](./security/review-gate.md)
