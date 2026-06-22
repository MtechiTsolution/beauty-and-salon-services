import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

const statusStyles: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-700',
  expired: 'bg-orange-100 text-orange-800 border-orange-200',
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-gray-100 text-gray-700',
  paid: 'bg-green-100 text-green-800',
  unpaid: 'bg-amber-100 text-amber-800',
  refunded: 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn('capitalize border', statusStyles[status] ?? '')}>
      {status}
    </Badge>
  );
}
