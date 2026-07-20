# پیکربندی LLM

سرویس `apps/ai-service` از API سازگار با OpenAI استفاده می‌کند.

## متغیرهای محیط

در ریشه پروژه (`.env` از روی `.env.example`):

```env
AI_SERVICE_URL="http://localhost:8000"
AI_SERVICE_TOKEN="internal-dev-token-change-in-production"
LLM_API_URL="https://api.openai.com/v1"
LLM_API_KEY="sk-..."
LLM_MODEL="gpt-4o-mini"
DATABASE_URL="postgresql://kesbyar:kesbyar@localhost:5432/kesbyar?schema=public"
```

## اجرای سرویس AI

```bash
npm run docker:up   # Postgres (+ در صورت پیکربندی، سرویس‌ها)
npm run dev:ai      # FastAPI روی 8000
npm run dev         # وب روی 3000
```

## بدون کلید LLM

اپ بدون `LLM_API_KEY` هم بالا می‌آید؛ قابلیت‌های وابسته به مدل ممکن است محدود یا با پاسخ جایگزین کار کنند. برای تجربه کامل، کلید را تنظیم کنید.

## امنیت

- `.env` را commit نکنید
- `AI_SERVICE_TOKEN` را در production عوض کنید
- کلیدها را فقط در Secretهای هاست (Vercel / VPS) نگه دارید

مستندات بیشتر: `docs/AI_INTEGRATION.md` و `docs/ENVIRONMENT.md`