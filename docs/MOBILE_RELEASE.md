# انتشار اندروید — کسب‌یار

راهنمای بیلد release و انتشار در کافه‌بازار / مایکت.

**نسخه فعلی:** همگام با monorepo (`apps/mobile/app.json` → `version`)

---

## پیش‌نیاز

- Node 20+
- حساب [Expo](https://expo.dev)
- EAS CLI: `npm i -g eas-cli`
- برای کافه‌بازار: حساب توسعه‌دهنده + keystore

---

## بیلد با EAS

```bash
cd apps/mobile
eas login
eas build --platform android --profile production
```

پروفایل‌ها در [`eas.json`](./eas.json):

| پروفایل | خروجی | کاربرد |
|---------|--------|--------|
| `development` | APK + dev client | توسعه |
| `preview` | APK داخلی | QA |
| `production` | AAB | کافه‌بازار / Play |

---

## بیلد لوکال (بدون EAS)

```bash
cd apps/mobile
npx expo prebuild --platform android
npx expo run:android --variant release
```

---

## امضای release (Android)

1. تولید keystore (یک‌بار):
   ```bash
   keytool -genkey -v -keystore kesbyar-release.keystore -alias kesbyar -keyalg RSA -keysize 2048 -validity 10000
   ```
2. در EAS: `eas credentials` → Android → upload keystore
3. **هرگز** keystore را commit نکنید

---

## همگام‌سازی نسخه

قبل از هر release:

1. `apps/mobile/app.json` → `expo.version`
2. `apps/mobile/package.json` → `version`
3. root + web نسخه monorepo

---

## چک‌لیست کافه‌بازار

### اطلاعات فروشگاه

| فیلد | پیشنهاد |
|------|---------|
| نام | کسب‌یار — سیستم‌عامل کسب‌وکار |
| دسته | کسب‌وکار |
| توضیح کوتاه | CRM، فاکتور، صندوق پیام و دستیار هوشمند برای SMB ایران |
| توضیح کامل | از [wiki/معرفی](../../wiki/معرفی.md) |

### اسکرین‌شات (حداقل ۴)

1. داشبورد
2. لیست سرنخ / مشتری
3. صندوق پیام (inbox)
4. فاکتور / پرداخت

> placeholder: `docs/mobile/screenshots/` — قبل از ارسال پر شود

### مجوزها

- اینترنت
- اعلان (Push)
- دوربین (اختیاری — QR آینده)

### تست قبل از ارسال

- [ ] ورود با Bearer token
- [ ] inbox + پاسخ
- [ ] deep link `kesbyar://pay/...`
- [ ] آفلاین + sync

---

## چک‌لیست مایکت

مشابه کافه‌بازار — APK یا AAB بسته به سیاست فعلی مایکت.

---

## API production

```
EXPO_PUBLIC_API_URL=https://kasbyar.vercel.app
```

در `eas.json` پروفایل `production` تنظیم شده است.

---

## مرتبط

- [apps/mobile/README.md](../apps/mobile/README.md)
- [GO_LIVE_CHECKLIST.md](./GO_LIVE_CHECKLIST.md)
