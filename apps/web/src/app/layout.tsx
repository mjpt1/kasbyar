import { Vazirmatn } from 'next/font/google';

import { Toaster } from '@/components/ui/sonner';

import './globals.css';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  variable: '--font-vazirmatn',
  display: 'swap',
});

export const metadata = {
  title: 'کسب‌یار — سیستم‌عامل هوشمند کسب‌وکار',
  description: 'مدیریت یکپارچه کسب‌وکار برای بازار ایران',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.variable} font-sans`}>
        {children}
        <Toaster position="top-center" dir="rtl" />
      </body>
    </html>
  );
}
