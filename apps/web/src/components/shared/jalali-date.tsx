import { formatJalali, formatJalaliDateTime } from '@kesbyar/shared';

interface JalaliDateProps {
  date: Date | string;
  showTime?: boolean;
  className?: string;
}

export function JalaliDate({ date, showTime = false, className }: JalaliDateProps) {
  const formatted = showTime ? formatJalaliDateTime(date) : formatJalali(date);
  return <span className={className}>{formatted}</span>;
}
