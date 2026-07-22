'use client';

import { formatCurrency } from '@kesbyar/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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

interface CatalogProduct {
  id: string;
  name: string;
  unitPrice: number;
  unit: string;
}

interface CatalogService {
  id: string;
  name: string;
  unitPrice: number;
}

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  productId?: string;
  serviceId?: string;
}

interface InvoicesCreateFormProps {
  customers: CustomerOption[];
  products: CatalogProduct[];
  services: CatalogService[];
}

export function InvoicesCreateForm({
  customers,
  products,
  services,
}: InvoicesCreateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);

  function updateItem(
    index: number,
    field: keyof LineItem,
    value: string | number | undefined,
  ) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function applyCatalog(
    index: number,
    type: 'product' | 'service',
    catalogId: string,
  ) {
    if (type === 'product') {
      const product = products.find((p) => p.id === catalogId);
      if (!product) return;
      setItems((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                description: product.name,
                quantity: 1,
                unitPrice: product.unitPrice,
                productId: product.id,
                serviceId: undefined,
              }
            : item,
        ),
      );
    } else {
      const service = services.find((s) => s.id === catalogId);
      if (!service) return;
      setItems((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                description: service.name,
                quantity: 1,
                unitPrice: service.unitPrice,
                serviceId: service.id,
                productId: undefined,
              }
            : item,
        ),
      );
    }
  }

  function addItem() {
    setItems((prev) => [...prev, { description: '', quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  const lineTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!customerId) {
      toast.error('لطفاً مشتری را انتخاب کنید');
      return;
    }
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          dueDate: form.get('dueDate') || undefined,
          notes: form.get('notes') || undefined,
          kind: form.get('kind') || 'SALE',
          items: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            productId: item.productId,
            serviceId: item.serviceId,
          })),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'صدور فاکتور ناموفق بود');
        return;
      }
      toast.success('فاکتور با موفقیت صادر شد');
      setCustomerId('');
      setItems([{ description: '', quantity: 1, unitPrice: 0 }]);
      setOpen(false);
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} disabled={customers.length === 0}>
        فاکتور جدید
      </Button>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">صدور فاکتور جدید</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          بستن
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>مشتری *</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
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
              <Label htmlFor="dueDate">سررسید</Label>
              <Input id="dueDate" name="dueDate" type="date" dir="ltr" className="text-left" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kind">نوع سند</Label>
              <select
                id="kind"
                name="kind"
                defaultValue="SALE"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="SALE">فاکتور قطعی</option>
                <option value="PROFORMA">پیش‌فاکتور</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>آیتم‌های فاکتور</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                افزودن آیتم
              </Button>
            </div>
            {items.map((item, index) => (
              <div key={index} className="space-y-3 rounded-md border p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  {products.length > 0 ? (
                    <div className="space-y-1">
                      <Label>از کاتالوگ محصول</Label>
                      <Select
                        onValueChange={(v) => applyCatalog(index, 'product', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب محصول" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} — {formatCurrency(p.unitPrice)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                  {services.length > 0 ? (
                    <div className="space-y-1">
                      <Label>از کاتالوگ خدمت</Label>
                      <Select
                        onValueChange={(v) => applyCatalog(index, 'service', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب خدمت" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} — {formatCurrency(s.unitPrice)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1 sm:col-span-2">
                    <Label>شرح</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>تعداد</Label>
                    <Input
                      type="number"
                      min={0.001}
                      step="any"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      dir="ltr"
                      className="text-left"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>قیمت واحد (ریال)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={0}
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(index, 'unitPrice', Number(e.target.value))
                        }
                        dir="ltr"
                        className="text-left"
                        required
                      />
                      {items.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                        >
                          ×
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>مالیات٪</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="any"
                      placeholder="پیش‌فرض سازمان"
                      value={item.taxRate ?? ''}
                      onChange={(e) =>
                        updateItem(
                          index,
                          'taxRate',
                          e.target.value === '' ? undefined : Number(e.target.value),
                        )
                      }
                      dir="ltr"
                      className="text-left"
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="text-sm font-medium">
              جمع موقت: {formatCurrency(lineTotal)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">یادداشت</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'در حال صدور...' : 'صدور فاکتور'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
