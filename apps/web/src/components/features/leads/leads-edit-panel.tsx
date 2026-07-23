'use client';

import { LEAD_LABELS, LEAD_STATUS_LABELS } from '@kesbyar/shared';
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

interface LeadsEditPanelProps {
  leadId: string;
  status: string;
  stageId: string | null;
  nextFollowUpAt: string | null;
  stages: { id: string; name: string }[];
}

export function LeadsEditPanel({
  leadId,
  status,
  stageId,
  nextFollowUpAt,
  stages,
}: LeadsEditPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentStage, setCurrentStage] = useState(stageId ?? 'none');
  const [followUpDate, setFollowUpDate] = useState(
    nextFollowUpAt ? nextFollowUpAt.slice(0, 10) : '',
  );

  async function save() {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: currentStatus,
          stageId: currentStage === 'none' ? null : currentStage,
          nextFollowUpAt: followUpDate || null,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'به‌روزرسانی ناموفق بود');
        return;
      }
      toast.success(`${LEAD_LABELS.singular} به‌روزرسانی شد`);
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">مدیریت {LEAD_LABELS.singular}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>وضعیت</Label>
          <Select value={currentStatus} onValueChange={setCurrentStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>مرحله pipeline</Label>
          <Select value={currentStage} onValueChange={setCurrentStage}>
            <SelectTrigger>
              <SelectValue placeholder="بدون مرحله" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">بدون مرحله</SelectItem>
              {stages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="next-follow-up">پیگیری بعدی</Label>
          <Input
            id="next-follow-up"
            type="date"
            dir="ltr"
            className="text-left"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Button onClick={save} disabled={loading}>
            {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
