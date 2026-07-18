import type { Metadata, Viewport } from 'next';
import { Vazirmatn } from 'next/font/google';

import { PwaProvider } from '@/components/pwa/pwa-provider';
import { Toaster } from '@/components/ui/sonner';

import './globals.css';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  variable: '--font-vazirmatn',
  display: 'swap',
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
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.variable} font-sans`}>
        <PwaProvider>
          {children}
          <Toaster position="top-center" dir="rtl" />
        </PwaProvider>
      </body>
    </html>
  );
}
