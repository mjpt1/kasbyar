'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { HelpLink } from '@/components/help/help-link';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type CompanyTwin = {
  organization?: { name: string };
  overallHealth: number;
  finance: Record<string, number | null>;
  sales: Record<string, unknown>;
  operations: Record<string, unknown>;
  customers: {
    count: number;
    sentiment?: { total: number; avgChurnRisk: number };
    churnRisks?: unknown[];
  };
  customerList?: Array<{ id: string; name: string; company?: string | null }>;
  dimensions?: Array<{ dimension: string; score: number }>;
};

type CustomerTwin = {
  customer: { id: string; name: string };
  insights: { healthScore: number; paidTotal: number; nextBestActions: string[] };
};

const DIMENSION_LABELS: Record<string, string> = {
  FINANCIAL: 'مالی',
  SALES: 'فروش',
  OPERATIONS: 'عملیات',
  GROWTH: 'رشد',
  HR: 'منابع انسانی',
};

export function TwinWorkspace() {
  const [company, setCompany] = useState<CompanyTwin | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerTwin, setCustomerTwin] = useState<CustomerTwin | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadCompany() {
    setLoading(true);
    try {
      const res = await fetch('/api/twin/company?include=customers');
      const data = await res.json();
      if (data.success) setCompany(data.data);
      else toast.error('بارگذاری دوقلوی شرکت ناموفق بود');
    } finally {
      setLoading(false);
    }
  }

  async function loadCustomer(id: string) {
    setSelectedCustomerId(id);
    const res = await fetch(`/api/twin/customer/${id}`);
    const data = await res.json();
    if (data.success) setCustomerTwin(data.data);
    else toast.error('بارگذاری دوقلوی مشتری ناموفق بود');
  }

  useEffect(() => {
    void loadCompany();
  }, []);

  if (loading && !company) {
    return <p className="text-muted-foreground text-sm">در حال بارگذاری دوقلوی دیجیتال…</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="دوقلوی دیجیتال"
        description="نمای زنده شرکت و مشتریان"
        actions={
          <>
            <HelpLink section="twin" />
            <Button variant="outline" size="sm" onClick={() => void loadCompany()}>
              بروزرسانی
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            شرکت {company?.organization?.name ?? ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-muted-foreground text-xs">سلامت کلی</p>
            <p className="text-3xl font-bold">{company?.overallHealth ?? '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">فروش ماه</p>
            <p className="text-xl font-semibold">
              {Number(company?.finance?.monthSales ?? 0).toLocaleString('fa-IR')}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">روزهای نقدینگی</p>
            <p className="text-xl font-semibold">{company?.finance?.cashRunwayDays ?? '—'}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(company?.dimensions ?? []).map((d) => (
          <Card key={d.dimension}>
            <CardContent className="p-4">
              <p className="text-muted-foreground text-xs">
                {DIMENSION_LABELS[d.dimension] ?? d.dimension}
              </p>
              <p className="text-2xl font-bold">{d.score}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">مشتریان</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(company?.customerList ?? []).map((c) => (
              <button
                key={c.id}
                type="button"
                className={`w-full rounded-md border p-3 text-right text-sm ${
                  selectedCustomerId === c.id ? 'border-primary bg-muted/40' : ''
                }`}
                onClick={() => void loadCustomer(c.id)}
              >
                <p className="font-medium">{c.name}</p>
                <p className="text-muted-foreground text-xs">{c.company}</p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">دوقلوی مشتری</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {!customerTwin ? (
              <p className="text-muted-foreground">یک مشتری را انتخاب کنید</p>
            ) : (
              <>
                <p className="text-lg font-semibold">{customerTwin.customer.name}</p>
                <p>نمره سلامت: {customerTwin.insights.healthScore}</p>
                <p>
                  مجموع پرداخت:{' '}
                  {customerTwin.insights.paidTotal.toLocaleString('fa-IR')} ریال
                </p>
                <div>
                  <p className="font-medium">اقدامات پیشنهادی</p>
                  <ul className="list-disc pr-5">
                    {customerTwin.insights.nextBestActions.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
