# MVP Modules Phase — کسب‌یار

فاز ماژول‌های MVP مشترک تکمیل شد. این سند خلاصه قابلیت‌های قابل استفاده را توصیف می‌کند.

## ماژول‌ها

| ماژول | قابلیت‌ها |
|-------|-----------|
| **داشبورد** | KPIها، نمودار فروش ۷ روز، فاکتورهای معوق، لیدهای بدون پیگیری، وظایف پیش‌رو، فعالیت اخیر، پنل دستیار |
| **مشتریان** | لیست + جستجو + صفحه‌بندی، ایجاد، ویرایش، جزئیات با فاکتور و فعالیت |
| **لیدها** | لیست DataTable + جستجو، ایجاد با پیگیری بعدی، ویرایش وضعیت/مرحله، ثبت follow-up |
| **فاکتورها** | ایجاد با آیتم‌ها، جزئیات، تغییر وضعیت، لینک ثبت پرداخت |
| **پرداخت‌ها** | ثبت و لیست با اتصال به فاکتور/مشتری |
| **وظایف** | ایجاد، علامت‌گذاری انجام‌شده، یادآورها |
| **گزارش‌ها** | ۸ کارت خلاصه + نمودار وضعیت فاکتور + مشتریان برتر |
| **فعالیت‌ها** | تایم‌لاین خودکار رویدادهای CRM |
| **فایل‌ها** | آپلود محلی + لیست + دانلود |
| **اتوماسیون** | CRUD قوانین + فعال/غیرفعال |
| **دستیار** | صفحه `/conversation` + پنل در داشبورد |
| **تنظیمات** | نمایش + ویرایش سازمان (مدیر+) |

## APIهای جدید

```
GET/PATCH/DELETE  /api/customers/[id]
GET/PATCH         /api/leads/[id]
POST              /api/leads/[id]/follow-ups
GET               /api/pipeline-stages
GET/PATCH         /api/invoices/[id]
PATCH             /api/tasks/[id]
GET/POST          /api/reminders
PATCH             /api/automation/[id]
GET/POST/DELETE   /api/files
GET               /api/files/[id]          (دانلود)
GET/PATCH         /api/settings
GET               /api/reports
GET               /api/members
```

## سرویس‌های جدید/به‌روز

- `server/files/file.service.ts` — آپلود و مدیریت پیوست
- `server/settings/settings.service.ts` — تنظیمات سازمان
- `server/leads/lead.service.ts` — follow-up، pipeline stages
- `server/reports/reports.service.ts` — گزارش‌های غنی‌تر

## راه‌اندازی

```bash
npm run setup
npm run dev
```

ورود: `demo@kesbyar.ir` / `demo1234`

## فاز بعدی

- اجرای موتور اتوماسیون (cron/worker)
- آپلود فایل روی entity detail pages
- Kanban لیدها
- کاتالوگ محصول/خدمت در فاکتور
- یکپارچه‌سازی SMS/درگاه پرداخت
