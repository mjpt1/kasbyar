'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const beautyAppointmentSchema = z.object({
  customerId: z.string().min(1, 'مراجع الزامی است'),
  serviceName: z.string().min(1, 'نام خدمت الزامی است'),
  scheduledAt: z.coerce.date({ invalid_type_error: 'زمان نوبت نامعتبر است' }),
  durationMin: z.coerce.number().int().min(15).max(480).optional(),
  stylistName: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof beautyAppointmentSchema>;

interface CustomerOption {
  id: string;
  name: string;
}

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function BeautyAppointmentsCreateForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(beautyAppointmentSchema),
    defaultValues: {
      customerId: '',
      serviceName: '',
      scheduledAt: new Date(),
      durationMin: 60,
      stylistName: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    fetch('/api/customers?pageSize=100')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCustomers(data.data.items ?? []);
      })
      .catch(() => {});
  }, [open]);

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch('/api/packs/beauty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          scheduledAt: values.scheduledAt.toISOString(),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ثبت نوبت ناموفق بود');
        return;
      }
      toast.success('نوبت ثبت شد');
      reset({
        customerId: '',
        serviceName: '',
        scheduledAt: new Date(),
        durationMin: 60,
        stylistName: '',
        notes: '',
      });
      setOpen(false);
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    }
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        نوبت جدید
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ثبت نوبت زیبایی</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="customerId">مراجع</Label>
            <select
              id="customerId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...register('customerId')}
            >
              <option value="">انتخاب مراجع...</option>
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
            <Label htmlFor="serviceName">خدمت</Label>
            <Input id="serviceName" placeholder="مثلاً رنگ مو" {...register('serviceName')} />
            {errors.serviceName ? (
              <p className="text-sm text-destructive">{errors.serviceName.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">زمان نوبت</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              defaultValue={toDatetimeLocalValue(new Date())}
              {...register('scheduledAt', {
                setValueAs: (v) => (v ? new Date(String(v)) : undefined),
              })}
            />
            {errors.scheduledAt ? (
              <p className="text-sm text-destructive">{errors.scheduledAt.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="durationMin">مدت (دقیقه)</Label>
            <Input id="durationMin" type="number" {...register('durationMin')} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="stylistName">پرسنل</Label>
            <Input id="stylistName" {...register('stylistName')} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">یادداشت</Label>
            <Textarea id="notes" {...register('notes')} />
          </div>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'در حال ثبت...' : 'ثبت نوبت'}
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
