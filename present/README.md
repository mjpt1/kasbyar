# سایت پرزنت کسب‌یار

لندینگ HTML استاتیک، سریع و پارالاکس برای ارائهٔ محصول روی اینترنت.

## ویژگی‌ها

- RTL فارسی + فونت وزیرمتن (لوکال)
- پارالاکس CSS روی فصل‌ها
- صحنهٔ سه‌بعدی سبک (Three.js — فقط نقاط و خطوط، بدون مدل سنگین)
- توکن‌های طراحی برند (sage / blush / peach روی زمینهٔ ink)
- بدون بیلد — فقط فایل استاتیک

## پیش‌نمایش محلی

از ریشهٔ همین پوشه یک سرور استاتیک اجرا کنید:

```bash
# Python
cd present
python -m http.server 5173

# یا Node
npx --yes serve present -p 5173
```

سپس باز کنید: [http://localhost:5173](http://localhost:5173)

> اگر فونت `assets/Vazirmatn-Variable.woff2` نباشد، سیستم به Tahoma برمی‌گردد. برای کیفیت کامل، فایل را از `apps/web/public/fonts/vazirmatn/` کپی کنید.

## استقرار روی اینترنت

### GitHub Pages

1. Settings → Pages → Source: Deploy from branch
2. پوشه `/present` را به‌عنوان root انتخاب کنید، یا محتوای `present/` را به شاخه `gh-pages` بفرستید
3. آدرس چیزی شبیه: `https://mjpt1.github.io/kasbyar/`

### Netlify / Cloudflare Pages

- Build command: خالی
- Publish directory: `present`

### Vercel

- Root Directory: `present`
- Framework: Other

## ساختار

```
present/
  index.html
  css/tokens.css
  css/main.css
  js/parallax.js
  js/scene3d.js
  assets/logo.svg
  assets/Vazirmatn-Variable.woff2
  assets/present-*.jpg            (تصاویر بخش‌ها — پارالاکس و کارت‌ها)
```

## لینک‌های محصول

- اپ: https://kasbyar.vercel.app
- مخزن: https://github.com/mjpt1/kasbyar
- دمو: `demo@kesbyar.ir` / `demo1234`
