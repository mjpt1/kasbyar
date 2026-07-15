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
import { customerUpdateSchema } from '@/lib/validators';

type FormValues = z.infer<typeof customerUpdateSchema>;

interface CustomersEditFormProps {
  customer: {
    id: string;
    name: string;
    company: string | null;
    phone: string | null;
    email: string | null;
    city: string | null;
    address: string | null;
    nationalId: string | null;
    notes: string | null;
    isActive: boolean;
  };
}

export function CustomersEditForm({ customer }: CustomersEditFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(customerUpdateSchema),
    defaultValues: {
      name: customer.name,
      company: customer.company ?? '',
      phone: customer.phone ?? '',
      email: customer.email ?? '',
      city: customer.city ?? '',
      address: customer.address ?? '',
      nationalId: customer.nationalId ?? '',
      notes: customer.notes ?? '',
      isActive: customer.isActive,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'به‌روزرسانی ناموفق بود');
        return;
      }
      toast.success('مشتری به‌روزرسانی شد');
      setOpen(false);
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        ویرایش مشتری
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">ویرایش مشتری</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          بستن
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="edit-name">نام *</Label>
            <Input id="edit-name" {...register('name')} />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-company">شرکت</Label>
            <Input id="edit-company" {...register('company')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phone">تلفن</Label>
            <Input id="edit-phone" dir="ltr" className="text-left" {...register('phone')} />
            {errors.phone ? (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">ایمیل</Label>
            <Input id="edit-email" type="email" dir="ltr" className="text-left" {...register('email')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-city">شهر</Label>
            <Input id="edit-city" {...register('city')} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="edit-address">آدرس</Label>
            <Input id="edit-address" {...register('address')} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="edit-notes">یادداشت</Label>
            <Textarea id="edit-notes" rows={2} {...register('notes')} />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" id="edit-active" {...register('isActive')} />
            <Label htmlFor="edit-active">مشتری فعال</Label>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
