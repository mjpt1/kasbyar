# API Strategy — کسب‌یار

## اصول

- REST JSON از طریق Next.js Route Handlers
- پاسخ یکپارچه: `{ success, data }` یا `{ success: false, error }`
- اعتبارسنجی Zod در لبه API
- منطق دامنه در `apps/web/src/server/*`
- احراز هویت session + کوکی `kesbyar_org` برای tenant فعال

## Endpoints

| Method | Path | توضیح |
|--------|------|--------|
| POST | `/api/auth/login` | ورود |
| POST | `/api/auth/register` | ثبت‌نام |
| POST | `/api/auth/logout` | خروج |
| GET/POST | `/api/workspace/select` | لیست/انتخاب workspace |
| GET/POST | `/api/customers` | مشتریان |
| GET/POST | `/api/leads` | لیدها |
| GET/POST | `/api/invoices` | فاکتورها |
| GET/POST | `/api/payments` | پرداخت‌ها |
| GET/POST | `/api/tasks` | وظایف |
| GET | `/api/dashboard` | داشبورد |
| POST | `/api/conversation` | دستیار هوشمند |
| GET/POST | `/api/automation` | اتوماسیون |

## AI Service (داخلی)

- `GET /health`
- `POST /api/v1/insights` — با `X-Internal-Token`
- `POST /api/v1/documents/parse`

## امنیت

- Session HttpOnly
- Rate limit پایه روی workspace select
- Audit log برای رویدادهای مهم
- آماده Redis rate limit در production
