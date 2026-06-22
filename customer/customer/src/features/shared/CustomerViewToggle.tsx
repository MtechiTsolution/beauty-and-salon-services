import { Button } from '@mit-salon/shared/components/ui/button';
import { cn } from '@mit-salon/shared/lib/utils';
import { LayoutGrid, LayoutList } from 'lucide-react';
import type { CustomerViewMode } from './useCustomerViewMode';

type CustomerViewToggleProps = {
  view: CustomerViewMode;
  onViewChange: (view: CustomerViewMode) => void;
  className?: string;
};

export function CustomerViewToggle({ view, onViewChange, className }: CustomerViewToggleProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-muted/40 p-0.5',
        className,
      )}
      role="group"
      aria-label="View layout"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn('h-8 gap-1.5 rounded-full px-2.5', view === 'list' && 'bg-background shadow-sm')}
        onClick={() => onViewChange('list')}
        aria-pressed={view === 'list'}
      >
        <LayoutList className="h-4 w-4" />
        <span className="hidden sm:inline text-xs font-medium">List</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn('h-8 gap-1.5 rounded-full px-2.5', view === 'grid' && 'bg-background shadow-sm')}
        onClick={() => onViewChange('grid')}
        aria-pressed={view === 'grid'}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline text-xs font-medium">Grid</span>
      </Button>
    </div>
  );
}
