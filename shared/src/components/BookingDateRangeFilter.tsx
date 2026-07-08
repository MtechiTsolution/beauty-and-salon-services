import { Button } from './ui/button';
import { DatePickerInput } from './DatePickerInput';
import { Label } from './ui/label';
import { isBookingDateRangeValid } from '../lib/booking-date-filter';
import { cn } from '../lib/utils';
import { CalendarRange, X } from 'lucide-react';

type BookingDateRangeFilterProps = {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onApply: () => void;
  onClear?: () => void;
  showClear?: boolean;
  className?: string;
  variant?: 'customer' | 'admin';
  idPrefix?: string;
  /** Skip outer card — for embedding inside BookingDateRangeFilterPanel. */
  bare?: boolean;
  /** Hide Apply/Clear buttons — parent provides unified actions. */
  hideActions?: boolean;
};

export function BookingDateRangeFilter({
  from,
  to,
  onFromChange,
  onToChange,
  onApply,
  onClear,
  showClear = false,
  className,
  variant = 'customer',
  idPrefix = 'booking-date',
  bare = false,
  hideActions = false,
}: BookingDateRangeFilterProps) {
  const rangeValid = isBookingDateRangeValid(from, to);
  const isAdmin = variant === 'admin';

  return (
    <div
      className={cn(
        'booking-date-range-filter',
        !bare &&
          (isAdmin
            ? 'rounded-xl border border-border/80 bg-card p-4 shadow-sm'
            : 'rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm backdrop-blur-sm'),
        className,
      )}
    >
      <div className={cn('flex flex-col gap-4', !hideActions && 'lg:flex-row lg:items-end')}>
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-from`} className="text-sm font-medium">
              From date
            </Label>
            <DatePickerInput
              id={`${idPrefix}-from`}
              value={from}
              max={to || undefined}
              onChange={(e) => onFromChange(e.target.value)}
              className={cn('h-11 rounded-xl', isAdmin && 'rounded-xl')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}-to`} className="text-sm font-medium">
              To date
            </Label>
            <DatePickerInput
              id={`${idPrefix}-to`}
              value={to}
              min={from || undefined}
              onChange={(e) => onToChange(e.target.value)}
              className={cn('h-11 rounded-xl', isAdmin && 'rounded-xl')}
            />
          </div>
        </div>
        {!hideActions && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={isAdmin ? 'outline' : 'default'}
              className={cn('h-11 gap-2', isAdmin ? 'rounded-full px-6' : 'rounded-full px-6')}
              onClick={onApply}
            >
              <CalendarRange className="h-4 w-4" />
              Apply filter
            </Button>
            {showClear && onClear && (
              <Button
                type="button"
                variant="ghost"
                className="h-11 gap-2 rounded-full px-4"
                onClick={onClear}
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        )}
      </div>
      {!rangeValid && (
        <p className="mt-3 text-sm text-destructive">End date must be on or after the start date.</p>
      )}
    </div>
  );
}
