import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { LayoutGrid, LayoutList } from 'lucide-react';

export type ViewToggleMode = 'list' | 'grid';

export type ViewToggleProps = {
  view: ViewToggleMode;
  onViewChange: (view: ViewToggleMode) => void;
  className?: string;
  /** When true, hides List/Grid text on small screens (icons only). */
  compactLabels?: boolean;
  buttonClassName?: string;
};

function toggleItemClass(active: boolean, buttonClassName?: string) {
  return cn(
    'h-8 gap-1.5 rounded-full px-2.5 transition-colors',
    active
      ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground'
      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
    buttonClassName,
  );
}

export function ViewToggle({
  view,
  onViewChange,
  className,
  compactLabels = true,
  buttonClassName,
}: ViewToggleProps) {
  const labelClass = compactLabels ? 'hidden text-xs font-medium sm:inline' : 'text-xs font-medium';

  return (
    <div
      className={cn(
        'mit-view-toggle inline-flex items-center rounded-full border border-border bg-muted/40 p-0.5',
        className,
      )}
      role="group"
      aria-label="View layout"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={toggleItemClass(view === 'list', buttonClassName)}
        onClick={() => onViewChange('list')}
        aria-pressed={view === 'list'}
        aria-label="List view"
      >
        <LayoutList className="h-4 w-4" />
        <span className={labelClass}>List</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={toggleItemClass(view === 'grid', buttonClassName)}
        onClick={() => onViewChange('grid')}
        aria-pressed={view === 'grid'}
        aria-label="Grid view"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className={labelClass}>Grid</span>
      </Button>
    </div>
  );
}
