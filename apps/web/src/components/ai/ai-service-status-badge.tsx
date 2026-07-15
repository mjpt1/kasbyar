'use client';

import { useEffect, useState } from 'react';

type ServiceStatus = 'ok' | 'degraded' | 'unavailable' | 'loading';

const LABELS: Record<Exclude<ServiceStatus, 'loading'>, string> = {
  ok: 'سرویس هوشمند فعال',
  degraded: 'سرویس هوشمند محدود',
  unavailable: 'سرویس هوشمند آفلاین',
};

export function AiServiceStatusBadge() {
  const [status, setStatus] = useState<ServiceStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/ai/health');
        const data = await res.json();
        if (cancelled) return;
        if (data.success) {
          setStatus(data.data.status ?? 'unavailable');
        } else {
          setStatus('unavailable');
        }
      } catch {
        if (!cancelled) setStatus('unavailable');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'loading') return null;

  const color =
    status === 'ok'
      ? 'bg-emerald-100 text-emerald-800'
      : status === 'degraded'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-muted text-muted-foreground';

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-normal ${color}`}>
      {LABELS[status]}
    </span>
  );
}
