'use client';

import { Building2, ChevronsUpDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type WorkspaceRow = {
  organizationId: string;
  organizationName: string;
  role: string;
};

export function OrgSwitcher({
  currentOrganizationId,
  currentOrganizationName,
  className,
}: {
  currentOrganizationId?: string;
  currentOrganizationName: string;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<WorkspaceRow[]>([]);

  useEffect(() => {
    if (!open || items.length > 0) return;
    void (async () => {
      try {
        const res = await fetch('/api/workspace/select');
        const data = await res.json();
        if (data.success) {
          setItems(
            (data.data ?? []).map(
              (w: {
                organizationId: string;
                organizationName: string;
                role: string;
              }) => ({
                organizationId: w.organizationId,
                organizationName: w.organizationName,
                role: w.role,
              }),
            ),
          );
        }
      } catch {
        // ignore
      }
    })();
  }, [open, items.length]);

  async function select(organizationId: string) {
    if (organizationId === currentOrganizationId) {
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/workspace/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'تعویض فضای کاری ناموفق بود');
        return;
      }
      toast.success(`فضای کاری «${data.data.organizationName}» فعال شد`);
      setOpen(false);
      router.push('/dashboard');
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn('relative', className)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-auto w-full justify-between gap-2 px-2 py-1.5 text-start"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="flex min-w-0 items-center gap-2">
          <Building2 className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate text-xs font-medium">{currentOrganizationName}</span>
        </span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      </Button>
      {open ? (
        <div
          className="absolute inset-x-0 z-50 mt-1 max-h-56 overflow-auto rounded-md border bg-popover p-1 shadow-md"
          role="listbox"
          aria-label="فضاهای کاری"
        >
          {items.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">در حال بارگذاری…</p>
          ) : (
            items.map((item) => (
              <button
                key={item.organizationId}
                type="button"
                role="option"
                aria-selected={item.organizationId === currentOrganizationId}
                disabled={loading}
                className={cn(
                  'flex w-full rounded-sm px-2 py-1.5 text-start text-xs hover:bg-accent',
                  item.organizationId === currentOrganizationId && 'bg-accent font-medium',
                )}
                onClick={() => void select(item.organizationId)}
              >
                <span className="truncate">{item.organizationName}</span>
              </button>
            ))
          )}
          <button
            type="button"
            className="mt-1 w-full border-t px-2 py-1.5 text-start text-xs text-primary hover:underline"
            onClick={() => {
              setOpen(false);
              router.push('/workspace/select');
            }}
          >
            مدیریت فضاهای کاری…
          </button>
        </div>
      ) : null}
    </div>
  );
}
