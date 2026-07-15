# Foundation Phase — کسب‌یار

این سند وضعیت زیرساخت فاز پایه را توصیف می‌کند.

## تکمیل‌شده

### Monorepo
- npm workspaces (`apps/*`, `packages/*`) — وابستگی‌های داخلی با `"*"`
- `postinstall` → `prisma generate`
- Prettier + ESLint base در `@kesbyar/config`
- `pnpm-workspace.yaml` حذف شده؛ فقط npm

### Packages
| Package | مسئولیت |
|---------|---------|
| `@kesbyar/config` | tsconfig, eslint, prettier |
| `@kesbyar/shared` | جلالی، فرمت IRR، constants فارسی، types |
| `@kesbyar/ui` | DataTable (TanStack) |

### Web (`apps/web`)
- Next.js 15 App Router، RTL `lang=fa` `dir=rtl`
- Session auth (bcrypt + HttpOnly cookie)
- Multi-org via `kesbyar_org` cookie
- `/workspace/select` برای tenant switching
- Middleware route protection (Edge-safe: فقط `constants.ts`)
- `lib/env.ts` — اعتبارسنجی env
- `lib/errors.ts` — خطاهای دامنه
- `config/navigation.ts` — ناوبری فارسی متمرکز
- App shell: sidebar + header
- Prisma client singleton

### Database
- `prisma/schema.prisma` — entities کامل
- `prisma/seed.ts` — داده نمونه
- `db:push` / `db:migrate` scripts

### AI Service
- FastAPI + CORS + health
- `/api/v1/insights`, `/api/v1/documents/parse`
- Analytics + orchestration service foundations
- Internal token auth

### Docker
- PostgreSQL + AI service
- Web Dockerfile (standalone) — اختیاری در compose

## دستورات راه‌اندازی

```bash
cp .env.example .env
npm run setup
npm run dev
```

## تأیید build

```bash
npm install
npm run typecheck   # ✓
npm run build       # ✓ Next.js production build
```

## بعد از Foundation

فاز بعدی: تکمیل business modules، آپلود فایل، اتوماسیون اجرایی، vertical packs.
