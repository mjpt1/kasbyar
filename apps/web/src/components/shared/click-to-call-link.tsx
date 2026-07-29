import { Phone } from 'lucide-react';

import { cn } from '@/lib/utils';

type ClickToCallLinkProps = {
  phone: string;
  className?: string;
};

function toTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('98') && digits.length === 12) {
    return `tel:+${digits}`;
  }
  if (digits.startsWith('09') && digits.length === 11) {
    return `tel:+98${digits.slice(1)}`;
  }
  if (digits.startsWith('9') && digits.length === 10) {
    return `tel:+98${digits}`;
  }
  return `tel:${phone}`;
}

export function ClickToCallLink({ phone, className }: ClickToCallLinkProps) {
  return (
    <a
      href={toTelHref(phone)}
      className={cn(
        'inline-flex items-center gap-1.5 text-primary hover:underline',
        className,
      )}
      dir="ltr"
    >
      <Phone className="size-3.5 shrink-0" aria-hidden />
      <span>{phone}</span>
    </a>
  );
}
