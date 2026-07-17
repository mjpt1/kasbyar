import type { Metadata } from 'next';

import { LandingPage } from '@/components/landing/landing-page';

export const metadata: Metadata = {
  title: 'کسب‌یار — سیستم‌عاملِ رشدِ کسب‌وکار',
  description:
    'مشتری، لید، فاکتور و پرداخت در یک پیشخوان فارسی؛ با تقویم جلالی و مبلغ به تومان. مناسب کلینیک، خرده‌فروشی و آژانس.',
};

export default function HomePage() {
  return <LandingPage />;
}
