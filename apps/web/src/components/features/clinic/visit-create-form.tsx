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
import { visitRecordSchema } from '@/lib/validators';

type FormValues = z.infer<typeof visitRecordSchema>;

interface CustomerOption {
  id: string;
  name: string;
}

export function VisitCreateForm({
  defaultCustomerId,
}: {
  organizationId?: string;
  defaultCustomerId?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(visitRecordSchema),
    defaultValues: {
      customerId: defaultCustomerId ?? '',
      visitDate: new Date(),
      chiefComplaint: '',
      diagnosis: '',
      treatmentNotes: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    fetch('/api/packs/clinic/patients?pageSize=100')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setCustomers(
            data.data.items.map((p: { id: string; name: string }) => ({
              id: p.id,
              name: p.name,
            })),
          );
        }
      })
      .catch(() => {});
  }, [open]);

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch('/api/packs/clinic/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          visitDate: values.visitDate
            ? new Date(values.visitDate).toISOString()
            : undefined,
          followUpAt: values.followUpAt
            ? new Date(values.followUpAt).toISOString()
            : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ثبت ویزیت ناموفق بود');
        return;
      }
      toast.success('ویزیت ثبت شد');
      reset({
        customerId: defaultCustomerId ?? '',
        visitDate: new Date(),
        chiefComplaint: '',
        diagnosis: '',
        treatmentNotes: '',
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
        ویزیت جدید
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ثبت ویزیت</CardTitle>
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
            <Label htmlFor="visitDate">تاریخ ویزیت</Label>
            <Input
              id="visitDate"
              type="datetime-local"
              {...register('visitDate', { valueAsDate: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="followUpAt">پیگیری</Label>
            <Input
              id="followUpAt"
              type="datetime-local"
              {...register('followUpAt', { valueAsDate: true })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="chiefComplaint">شکایت اصلی</Label>
            <Input id="chiefComplaint" {...register('chiefComplaint')} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="diagnosis">تشخیص</Label>
            <Input id="diagnosis" {...register('diagnosis')} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="treatmentNotes">یادداشت درمان</Label>
            <Textarea id="treatmentNotes" {...register('treatmentNotes')} />
          </div>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'در حال ثبت...' : 'ثبت ویزیت'}
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
