'use client';

import { PAYMENT_METHOD_LABELS } from '@kesbyar/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface CustomerOption {
  id: string;
  name: string;
}

interface InvoiceOption {
  id: string;
  number: string;
  customerId: string;
  remaining?: number;
}

interface PaymentsCreateFormProps {
  customers: CustomerOption[];
  invoices: InvoiceOption[];
  defaultCustomerId?: string;
  defaultInvoiceId?: string;
  defaultAmount?: number;
  autoOpen?: boolean;
}

export function PaymentsCreateForm({
  customers,
  invoices,
  defaultCustomerId,
  defaultInvoiceId,
  defaultAmount,
  autoOpen = false,
}: PaymentsCreateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(autoOpen);
  const [customerId, setCustomerId] = useState(defaultCustomerId ?? '');
  const [invoiceId, setInvoiceId] = useState(defaultInvoiceId ?? '');
  const [method, setMethod] = useState('CASH');
  const [amount, setAmount] = useState(defaultAmount ? String(defaultAmount) : '');

  useEffect(() => {
    if (defaultCustomerId) setCustomerId(defaultCustomerId);
    if (defaultInvoiceId) setInvoiceId(defaultInvoiceId);
    if (defaultAmount) setAmount(String(defaultAmount));
    if (autoOpen) setOpen(true);
  }, [defaultCustomerId, defaultInvoiceId, defaultAmount, autoOpen]);

  const customerInvoices = invoices.filter((inv) => inv.customerId === customerId);

  useEffect(() => {
    if (!invoiceId) return;
    const inv = invoices.find((i) => i.id === invoiceId);
    if (inv?.remaining && !amount) {
      setAmount(String(inv.remaining));
    }
  }, [invoiceId, invoices, amount]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!customerId) {
      toast.error('لطفاً مشتری را انتخاب کنید');
      return;
    }
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          invoiceId: invoiceId || undefined,
          amount: Number(form.get('amount')),
          method,
          reference: form.get('reference') || undefined,
          notes: form.get('notes') || undefined,
          paidAt: form.get('paidAt') || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'ثبت پرداخت ناموفق بود');
        return;
      }
      toast.success('پرداخت با موفقیت ثبت شد');
      setCustomerId('');
      setInvoiceId('');
      setMethod('CASH');
      setAmount('');
      setOpen(false);
      router.refresh();
      router.replace('/payments');
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} disabled={customers.length === 0}>
        پرداخت جدید
      </Button>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">ثبت پرداخت جدید</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          بستن
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>مشتری *</Label>
            <Select
              value={customerId}
              onValueChange={(v) => {
                setCustomerId(v);
                setInvoiceId('');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="انتخاب مشتری" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>فاکتور (اختیاری)</Label>
            <Select
              value={invoiceId}
              onValueChange={setInvoiceId}
              disabled={!customerId}
            >
              <SelectTrigger>
                <SelectValue placeholder="بدون فاکتور" />
              </SelectTrigger>
              <SelectContent>
                {customerInvoices.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.number}
                    {inv.remaining ? ` (مانده: ${inv.remaining.toLocaleString('fa-IR')})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">مبلغ (ریال) *</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min={1}
              required
              dir="ltr"
              className="text-left"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>روش پرداخت</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paidAt">تاریخ پرداخت</Label>
            <Input id="paidAt" name="paidAt" type="date" dir="ltr" className="text-left" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reference">شماره پیگیری</Label>
            <Input id="reference" name="reference" dir="ltr" className="text-left" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">یادداشت</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'در حال ثبت...' : 'ثبت پرداخت'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
