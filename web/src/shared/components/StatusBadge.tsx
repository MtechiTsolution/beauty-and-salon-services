import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

const statusStyles: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-700',
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  paid: 'bg-green-100 text-green-800',
  unpaid: 'bg-amber-100 text-amber-800',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn('capitalize border', statusStyles[status] ?? '')}>
      {status}
    </Badge>
  );
}
