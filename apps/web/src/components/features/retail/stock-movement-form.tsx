'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { stockMovementSchema } from '@/lib/validators';

type FormValues = z.infer<typeof stockMovementSchema>;

interface ProductOption {
  id: string;
  name: string;
  stockQty: number;
}

export function StockMovementForm({ products }: { products: ProductOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: { productId: '', type: 'IN', quantity: 1, reason: '' },
  });

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch('/api/packs/retail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ثبت گردش ناموفق بود');
        return;
      }
      toast.success('گردش موجودی ثبت شد');
      reset();
      setOpen(false);
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    }
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        ثبت گردش موجودی
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ثبت ورود / خروج</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="productId">محصول</Label>
            <select
              id="productId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...register('productId')}
            >
              <option value="">انتخاب محصول...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (موجودی: {p.stockQty})
                </option>
              ))}
            </select>
            {errors.productId ? (
              <p className="text-sm text-destructive">{errors.productId.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">نوع</Label>
            <select
              id="type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...register('type')}
            >
              <option value="IN">ورود</option>
              <option value="OUT">خروج</option>
              <option value="ADJUSTMENT">تعدیل</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">مقدار</Label>
            <Input id="quantity" type="number" step="0.001" {...register('quantity')} />
            {errors.quantity ? (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            ) : null}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="reason">علت</Label>
            <Input id="reason" placeholder="خرید، فروش، اصلاح انبار..." {...register('reason')} />
          </div>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'در حال ثبت...' : 'ثبت'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              انصراف
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
