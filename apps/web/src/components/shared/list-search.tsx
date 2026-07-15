'use client';

import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ListSearchProps {
  placeholder?: string;
  paramName?: string;
}

export function ListSearch({
  placeholder = 'جستجو...',
  paramName = 'search',
}: ListSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get(paramName) ?? '');

  const applySearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set(paramName, value.trim());
    } else {
      params.delete(paramName);
    }
    params.delete('page');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [paramName, pathname, router, searchParams, value]);

  return (
    <div className="flex max-w-md gap-2">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applySearch()}
          placeholder={placeholder}
          className="pr-9"
        />
      </div>
      <Button type="button" variant="secondary" onClick={applySearch} disabled={pending}>
        {pending ? 'در حال جستجو…' : 'جستجو'}
      </Button>
    </div>
  );
}
