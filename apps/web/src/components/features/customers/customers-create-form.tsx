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
import { Textarea } from '@/components/ui/textarea';
import { customerSchema } from '@/lib/validators';

type CustomerFormValues = z.infer<typeof customerSchema>;

export function CustomersCreateForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      company: '',
      phone: '',
      email: '',
      city: '',
      notes: '',
    },
  });

  async function onSubmit(values: CustomerFormValues) {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ثبت مشتری ناموفق بود');
        return;
      }
      toast.success('مشتری با موفقیت ثبت شد');
      reset();
      setOpen(false);
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    }
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>مشتری جدید</Button>;
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">ثبت مشتری جدید</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          بستن
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">نام *</Label>
            <Input id="name" {...register('name')} />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">شرکت</Label>
            <Input id="company" {...register('company')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">تلفن</Label>
            <Input id="phone" dir="ltr" className="text-left" {...register('phone')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input id="email" type="email" dir="ltr" className="text-left" {...register('email')} />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">شهر</Label>
            <Input id="city" {...register('city')} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">یادداشت</Label>
            <Textarea id="notes" rows={2} {...register('notes')} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'در حال ثبت...' : 'ثبت مشتری'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
