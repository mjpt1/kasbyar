import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';

import { PwaProvider } from '@/components/pwa/pwa-provider';
import { Toaster } from '@/components/ui/sonner';

import './globals.css';

const vazirmatn = localFont({
  src: '../../public/fonts/vazirmatn/Vazirmatn-Variable.woff2',
  variable: '--font-vazirmatn',
  display: 'swap',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: {
    default: 'کسب‌یار — سیستم‌عامل هوشمند کسب‌وکار',
    template: '%s | کسب‌یار',
  },
  description: 'مدیریت یکپارچه کسب‌وکار برای بازار ایران — وب‌اپ رسپانسیو قابل نصب روی موبایل و دسکتاپ',
  applicationName: 'کسب‌یار',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'کسب‌یار',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/brand/logo.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-152.png', sizes: '152x152', type: 'image/png' }],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7a9ec4' },
    { media: '(prefers-color-scheme: dark)', color: '#7a9ec4' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className={`${vazirmatn.className} font-sans`}>
        <PwaProvider>
          {children}
          <Toaster position="top-center" dir="rtl" />
        </PwaProvider>
      </body>
    </html>
  );
}
