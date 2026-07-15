import {
  APPOINTMENT_STATUS_LABELS,
  BOOKING_STATUS_LABELS,
  INVOICE_STATUS_LABELS,
  LEAD_STATUS_LABELS,
  STOCK_MOVEMENT_TYPE_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from '@kesbyar/shared';

import { Badge } from '@/components/ui/badge';

const invoiceVariant: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  SENT: 'default',
  PARTIAL: 'warning',
  PAID: 'success',
  OVERDUE: 'destructive',
  CANCELLED: 'outline',
};

const leadVariant: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  NEW: 'default',
  CONTACTED: 'secondary',
  QUALIFIED: 'warning',
  PROPOSAL: 'warning',
  WON: 'success',
  LOST: 'destructive',
};

export function InvoiceStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={invoiceVariant[status] ?? 'outline'}>
      {INVOICE_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function LeadStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={leadVariant[status] ?? 'outline'}>
      {LEAD_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function TaskStatusBadge({ status }: { status: string }) {
  return <Badge variant="secondary">{TASK_STATUS_LABELS[status] ?? status}</Badge>;
}

export function TaskPriorityBadge({ priority }: { priority: string }) {
  const variant =
    priority === 'URGENT' ? 'destructive' : priority === 'HIGH' ? 'warning' : 'secondary';
  return <Badge variant={variant}>{TASK_PRIORITY_LABELS[priority] ?? priority}</Badge>;
}

const appointmentVariant: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  SCHEDULED: 'default',
  CONFIRMED: 'secondary',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'outline',
  NO_SHOW: 'destructive',
};

export function AppointmentStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={appointmentVariant[status] ?? 'outline'}>
      {APPOINTMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

const bookingVariant: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  INQUIRY: 'default',
  QUOTED: 'warning',
  CONFIRMED: 'secondary',
  DEPARTED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'outline',
};

export function BookingStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={bookingVariant[status] ?? 'outline'}>
      {BOOKING_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function StockMovementTypeBadge({ type }: { type: string }) {
  const variant = type === 'IN' ? 'success' : type === 'OUT' ? 'destructive' : 'warning';
  return <Badge variant={variant}>{STOCK_MOVEMENT_TYPE_LABELS[type] ?? type}</Badge>;
}
