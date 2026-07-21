import fs from 'fs';
import path from 'path';

const wikiDir = path.join(process.cwd(), 'wiki');
const skipImages = new Set([
  'راهنمای-کاربر.md',
  'معرفی.md',
  'بسته‌های-صنفی.md',
  'Home.md',
]);

for (const file of skipImages) {
  const p = path.join(wikiDir, file);
  if (!fs.existsSync(p)) continue;
  let text = fs.readFileSync(p, 'utf8');
  // Drop markdown images so wiki pages read as documentation, not posters.
  text = text.replace(/\n*!\[([^\]]*)\]\([^)]+\)\n*/g, '\n\n');
  text = text.replace(/\n{3,}/g, '\n\n');
  fs.writeFileSync(p, text.trim() + '\n', 'utf8');
  console.log('stripped images', file);
}

// Enrich a few product pages so the first screen is clearly not empty.
const enrich = {
  'آنبوردینگ-و-تخصص‌ها.md': `# آنبوردینگ و تخصص‌ها

پس از ثبت‌نام، اگر سازمان هنوز \`industrySpecialty\` نداشته باشد، **مالک/مدیر** به \`/onboarding\` هدایت می‌شود. اگر سوپرادمین قبلاً تخصص را ست کرده باشد، این صفحه نشان داده نمی‌شود.

## چرا این مرحله مهم است؟

داشبورد، منو و برچسب‌های مشتری بر اساس **حوزه** (\`industryPack\`) و **تخصص** (\`industrySpecialty\`) تنظیم می‌شوند. بدون تخصص، پیشخوان مناسب باز نمی‌شود.

## جریان ویزارد

1. نام کسب‌وکار  
2. حوزهٔ کاری (\`industryPack\`) — مثلاً عمومی، کلینیک، خرده‌فروشی، …  
3. تخصص دقیق‌تر (\`industrySpecialty\`) — لیست بر اساس همان حوزه فیلتر می‌شود  
4. هدایت به پیشخوان تخصص (\`/v/...\`) یا داشبورد

API: \`GET/POST /api/onboarding\`

## بستهٔ عمومی (\`GENERAL\`)

بستهٔ عمومی دیگر بدون تخصص نیست. گزینه‌ها:

| تخصص | مسیر داشبورد | کاربرد |
|------|--------------|--------|
| کسب‌وکار عمومی | \`/v/general-business\` | پیشخوان عمومی |
| فریلنسر | \`/v/freelancer\` | کارفرما، فاکتور، فرصت پروژه، کارها |
| شرکت برنامه‌نویسی | \`/v/software-house\` | مشتری، لید فروش، تحویل |
| مشاوره | \`/v/consulting-firm\` | قرارداد و جلسات |
| خدمات آنلاین | \`/v/online-services\` | فروش خدمات اینترنتی |
| تولید محتوا | \`/v/content-creator\` | پروژه محتوایی |

منوی سایدبار اپ، آیتم تخصص فعال را نشان می‌دهد. جزئیات بسته‌های عمودی دیگر: [بسته‌های صنفی](بسته‌های-صنفی)
`,
  'اعلان‌ها.md': `# اعلان‌ها

کسب‌یار دو لایه اعلان دارد: **داخل اپ** (زنگوله) و اختیاری **مرورگر** (Web Push).

## داخل اپ

| مورد | مسیر / محل |
|------|------------|
| زنگوله | هدر اپ |
| API لیست / خوانده‌شده | \`/api/notifications\` |
| مدل‌ها | \`InAppNotification\`, \`PushSubscription\` |

منبع اعلان‌ها شامل اتوماسیون (\`NOTIFY_USER\`) و بریفینگ روزانه است.

## Web Push (مرورگر)

برای اعلان مرورگر:

\`\`\`bash
npx web-push generate-vapid-keys
\`\`\`

در \`.env\`:

\`\`\`
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_SUBJECT=mailto:ops@kesbyar.ir
\`\`\`

| مورد | توضیح |
|------|--------|
| اشتراک | \`/api/push/subscribe\` |
| Service Worker | \`apps/web/public/sw.js\` |
| بدون VAPID | اعلان داخل اپ همچنان کار می‌کند |

جزئیات env: [متغیرهای محیط](متغیرهای-محیط)
`,
};

for (const [file, body] of Object.entries(enrich)) {
  fs.writeFileSync(path.join(wikiDir, file), body.trim() + '\n', 'utf8');
  console.log('enriched', file);
}
