'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { travelBookingSchema } from '@/lib/validators';

type FormValues = z.infer<typeof travelBookingSchema>;

interface CustomerOption {
  id: string;
  name: string;
}

export function BookingsCreateForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(travelBookingSchema),
    defaultValues: {
      customerId: '',
      title: '',
      destination: '',
      departureDate: new Date(),
      travelersCount: 1,
      status: 'INQUIRY',
    },
  });

  useEffect(() => {
    if (!open) return;
    fetch('/api/customers?pageSize=100')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCustomers(data.data.items);
      })
      .catch(() => {});
  }, [open]);

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch('/api/packs/travel/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          departureDate: new Date(values.departureDate).toISOString(),
          returnDate: values.returnDate ? new Date(values.returnDate).toISOString() : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ثبت رزرو ناموفق بود');
        return;
      }
      toast.success('رزرو ثبت شد');
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
        رزرو جدید
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ثبت درخواست رزرو</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="customerId">مسافر / مشتری</Label>
            <select
              id="customerId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...register('customerId')}
            >
              <option value="">انتخاب...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.customerId ? (
              <p className="text-sm text-destructive">{errors.customerId.message}</p>
            ) : null}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">عنوان</Label>
            <Input id="title" placeholder="تور دبی — ۴ نفر" {...register('title')} />
            {errors.title ? <p className="text-sm text-destructive">{errors.title.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination">مقصد</Label>
            <Input id="destination" {...register('destination')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="travelersCount">تعداد مسافر</Label>
            <Input id="travelersCount" type="number" {...register('travelersCount')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="departureDate">تاریخ حرکت</Label>
            <Input
              id="departureDate"
              type="date"
              {...register('departureDate', { valueAsDate: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quotedAmount">مبلغ پیشنهادی (ریال)</Label>
            <Input id="quotedAmount" type="number" {...register('quotedAmount')} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">یادداشت</Label>
            <Textarea id="notes" {...register('notes')} />
          </div>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'در حال ثبت...' : 'ثبت رزرو'}
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
