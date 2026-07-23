# کسب‌یار موبایل (Android)

اپ React Native / Expo — همگام با API وب (`kasbyar.vercel.app`).

## اجرا

```bash
# از ریشه مونوریپو
npm install
npm run dev:mobile
```

برای API لوکال:

```bash
# Windows PowerShell
$env:EXPO_PUBLIC_API_URL="http://YOUR_LAN_IP:3000"
npm run dev:mobile
```

## امکانات نسخه 0.5.1

- ورود با Bearer Token
- داشبورد، سرنخ، مشتری، فاکتور (ایجاد/ویرایش)
- وظایف، پرداخت‌ها، اعلان‌ها، تنظیمات
- دستیار هوشمند و اتاق فرمان
- گفتگوی تیم و پشتیبانی
- کش آفلاین + همگام‌سازی هنگام بازگشت به اپ
- Push Notification (Expo)
- Deep Link: `kesbyar://` و `https://kasbyar.vercel.app/pay|invoices`

## بیلد اندروید

```bash
cd apps/mobile
npx expo prebuild --platform android
npx expo run:android
```
