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
import { appointmentSchema } from '@/lib/validators';

type FormValues = z.infer<typeof appointmentSchema>;

interface CustomerOption {
  id: string;
  name: string;
}

export function AppointmentsCreateForm({ organizationId: _orgId }: { organizationId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      customerId: '',
      scheduledAt: new Date(),
      durationMin: 30,
      reason: '',
      notes: '',
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
      const res = await fetch('/api/packs/clinic/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          scheduledAt: new Date(values.scheduledAt).toISOString(),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ثبت نوبت ناموفق بود');
        return;
      }
      toast.success('نوبت ثبت شد');
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
        نوبت جدید
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ثبت نوبت</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="customerId">بیمار</Label>
            <select
              id="customerId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...register('customerId')}
            >
              <option value="">انتخاب بیمار...</option>
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
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">زمان نوبت</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              {...register('scheduledAt', { valueAsDate: true })}
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
            <Label htmlFor="reason">علت مراجعه</Label>
            <Input id="reason" {...register('reason')} />
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
