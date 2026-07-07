import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { cn } from '../lib/utils';

export type NotificationFilterOption<T extends string = string> = {
  id: T;
  label: string;
};

type NotificationCategoryFilterProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: NotificationFilterOption<T>[];
  getCount: (id: T) => number;
  className?: string;
  id?: string;
  /** Hide options with zero count (except `all` and `unread` when present). */
  hideEmpty?: boolean;
  /** Compact sizing for side-by-side filter bars. */
  compact?: boolean;
};

function formatFilterLabel(label: string, count: number): string {
  return `${label} (${count})`;
}

export function NotificationCategoryFilter<T extends string>({
  value,
  onChange,
  options,
  getCount,
  className,
  id = 'notification-category-filter',
  hideEmpty = false,
  compact = false,
}: NotificationCategoryFilterProps<T>) {
  const visibleOptions = options.filter((option) => {
    if (!hideEmpty) return true;
    if (option.id === 'all' || option.id === 'unread') return true;
    return getCount(option.id) > 0;
  });

  const selected = visibleOptions.find((option) => option.id === value) ?? options.find((o) => o.id === value);
  const selectedCount = selected ? getCount(selected.id) : 0;
  const selectedLabel = selected
    ? formatFilterLabel(selected.label, selectedCount)
    : 'All notifications';

  return (
    <Select value={value} onValueChange={(next) => onChange(next as T)}>
      <SelectTrigger
        id={id}
        className={cn(
          'notification-category-filter w-full min-w-0 rounded-lg [&>span]:truncate',
          compact
            ? 'h-10 text-xs sm:h-11 sm:rounded-xl sm:text-sm'
            : 'h-11 rounded-xl sm:min-w-[11rem] sm:w-auto',
          className,
        )}
      >
        <SelectValue placeholder="Filter notifications">{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" sideOffset={6} className="notification-category-filter__content">
        {visibleOptions.map((option) => {
          const count = getCount(option.id);
          return (
            <SelectItem key={option.id} value={option.id}>
              {formatFilterLabel(option.label, count)}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
