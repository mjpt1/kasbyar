'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { TaskStatusBadge } from '@/components/shared/status-badges';

interface TaskRowActionsProps {
  taskId: string;
  status: string;
}

export function TaskRowActions({ taskId, status }: TaskRowActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleDone() {
    const nextStatus = status === 'DONE' ? 'TODO' : 'DONE';
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error?.message ?? 'به‌روزرسانی ناموفق بود');
        return;
      }
      toast.success(nextStatus === 'DONE' ? 'وظیفه انجام شد' : 'وظیفه بازگشایی شد');
      router.refresh();
    } catch {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <TaskStatusBadge status={status} />
      <Button size="sm" variant="outline" onClick={toggleDone} disabled={loading}>
        {loading ? '...' : status === 'DONE' ? 'بازگشایی' : 'انجام شد'}
      </Button>
    </div>
  );
}
