import { Badge } from './ui/badge';
import { cn } from '../lib/utils';
import { bookingStatusLabel, paymentStatusLabel } from '../lib/booking-status-display';

const statusStyles: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-muted dark:text-muted-foreground',
  expired: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800',
  pending: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
  completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800',
  cancelled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800',
  no_show: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-muted dark:text-muted-foreground dark:border-border',
  paid: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800',
  unpaid: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
  refunded: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800',
  approved: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800',
  rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800',
  blocked: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800',
};

const entityStatusLabels: Record<string, string> = {
  blocked: 'restricted',
};

type StatusBadgeProps = {
  status: string;
  /** Use for booking lifecycle or payment states so labels read clearly in admin/customer UIs. */
  kind?: 'booking' | 'payment' | 'entity';
  className?: string;
};

function resolveLabel(status: string, kind: StatusBadgeProps['kind'] = 'entity'): string {
  if (kind === 'booking') return bookingStatusLabel(status);
  if (kind === 'payment') return paymentStatusLabel(status);
  return entityStatusLabels[status] ?? status.replace(/_/g, ' ');
}

export function StatusBadge({ status, kind = 'entity', className }: StatusBadgeProps) {
  const label = resolveLabel(status, kind);
  const useCapitalize = kind === 'entity' && !entityStatusLabels[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        'border font-medium',
        useCapitalize && 'capitalize',
        statusStyles[status] ?? '',
        className,
      )}
    >
      {label}
    </Badge>
  );
}
