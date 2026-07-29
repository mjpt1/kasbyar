'use client';

import { Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

export function CustomerPortalLinkButton({ customerId }: { customerId: string }) {
  const [loading, setLoading] = useState(false);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);

  async function generateLink() {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}/portal`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ایجاد لینک ناموفق بود');
        return;
      }
      setPortalUrl(data.data.portalUrl);
      await navigator.clipboard.writeText(data.data.portalUrl);
      toast.success('لینک پورتال کپی شد (اعتبار ۳۰ روز)');
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" size="sm" variant="outline" disabled={loading} onClick={generateLink}>
        {loading ? 'در حال ایجاد...' : 'لینک پورتال مشتری'}
      </Button>
      {portalUrl ? (
        <>
          <Button type="button" size="sm" variant="ghost" asChild>
            <a href={portalUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" aria-hidden />
              باز کردن
            </a>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={() => {
              void navigator.clipboard.writeText(portalUrl);
              toast.message('لینک کپی شد');
            }}
            aria-label="کپی لینک"
          >
            <Copy className="size-4" />
          </Button>
        </>
      ) : null}
    </div>
  );
}
