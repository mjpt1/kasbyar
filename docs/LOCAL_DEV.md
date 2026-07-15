# راه‌اندازی محلی — Windows / Linux / macOS

## خطای رایج: `Authentication failed for user kesbyar`

```
Invalid prisma.user.findUnique() invocation:
Authentication failed ... credentials for `kesbyar` are not valid
```

### علت

پروژه به این اتصال پیش‌فرض می‌خواهد وصل شود:

```
postgresql://kesbyar:kesbyar@localhost:5432/kesbyar
```

اما PostgreSQL روی پورت 5432 یا یوزر/پسورد `kesbyar` ندارد.

### راه‌حل A — Docker (پیشنهادی پروژه)

1. Docker Desktop را باز کنید
2. در ریشه مخزن:

```bash
npm run docker:up
npm run db:push
npm run db:seed
```

### راه‌حل B — PostgreSQL نصب‌شده روی Windows

اگر PostgreSQL محلی روی 5432 در حال اجراست، یوزر و دیتابیس بسازید:

```powershell
$env:PGPASSWORD='YOUR_POSTGRES_SUPERUSER_PASSWORD'
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d postgres -c "CREATE USER kesbyar WITH PASSWORD 'kesbyar' CREATEDB;"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -U postgres -d postgres -c "CREATE DATABASE kesbyar OWNER kesbyar;"
```

سپس:

```bash
npm run db:push
npm run db:seed
```

### راه‌حل C — تغییر DATABASE_URL

در `.env` و `apps/web/.env.local` آدرس واقعی خود را بگذارید:

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DBNAME?schema=public"
```

---

## فایل‌های env

| فایل | مصرف‌کننده |
|------|------------|
| `.env` | Prisma، seed، اسکریپت‌ها |
| `apps/web/.env.local` | Next.js dev server |

هر دو باید `DATABASE_URL` یکسان داشته باشند.

---

## ورود پس از seed

| ایمیل | رمز |
|-------|-----|
| `demo@kesbyar.ir` | `demo1234` |

---

## عیب‌یابی

| علامت | اقدام |
|--------|--------|
| `P1000` authentication | راه‌حل‌های بالا |
| `P1001` can't reach server | postgres/docker را start کنید |
| `EPERM` prisma generate | dev server را ببندید و دوباره `npm run db:generate` |
| ورود 401 | `npm run db:seed` مجدد |
