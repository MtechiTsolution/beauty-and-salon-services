import { useEffect, useMemo, useState } from 'react';
import {
  BOOKING_DATE_PRESET_OPTIONS,
  detectBookingDateQuickPreset,
  getBookingDateQuickPresetRange,
  hasActiveBookingDateRange,
  type BookingDateFilterPreset,
  type BookingDateQuickPreset,
  type BookingDateRange,
} from '../lib/booking-date-filter';
import { BookingDateRangeFilter } from './BookingDateRangeFilter';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { cn } from '../lib/utils';

type BookingDateRangeFilterPanelProps = {
  from: string;
  to: string;
  appliedRange: BookingDateRange;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onApplyCustom: () => void;
  onPresetApply: (range: BookingDateRange) => void;
  onClear: () => void;
  showClear?: boolean;
  className?: string;
  variant?: 'customer' | 'admin';
  idPrefix?: string;
  label?: string;
  /** Render without outer card — for use inside another filter panel. */
  embedded?: boolean;
  /** Show Apply/Clear on custom date fields. Disable when parent has unified actions. */
  showCustomActions?: boolean;
};

function resolvePresetValue(appliedRange: BookingDateRange, customSelected: boolean): BookingDateFilterPreset {
  if (customSelected) return 'custom';
  if (!hasActiveBookingDateRange(appliedRange)) return 'all';
  return detectBookingDateQuickPreset(appliedRange) ?? 'custom';
}

export function BookingDateRangeFilterPanel({
  from,
  to,
  appliedRange,
  onFromChange,
  onToChange,
  onApplyCustom,
  onPresetApply,
  onClear,
  showClear = false,
  className,
  variant = 'customer',
  idPrefix = 'booking-date',
  label = 'Filter by date',
  embedded = false,
  showCustomActions = true,
}: BookingDateRangeFilterPanelProps) {
  const [customSelected, setCustomSelected] = useState(false);
  const isAdmin = variant === 'admin';

  const presetValue = useMemo(
    () => resolvePresetValue(appliedRange, customSelected),
    [appliedRange, customSelected],
  );

  const handleClear = () => {
    setCustomSelected(false);
    onClear();
  };

  useEffect(() => {
    if (!hasActiveBookingDateRange(appliedRange) && !from && !to) {
      setCustomSelected(false);
    }
  }, [appliedRange, from, to]);

  const selectedLabel =
    BOOKING_DATE_PRESET_OPTIONS.find((option) => option.id === presetValue)?.label ?? 'All dates';

  const handlePresetChange = (value: BookingDateFilterPreset) => {
    if (value === 'all') {
      setCustomSelected(false);
      handleClear();
      return;
    }

    if (value === 'custom') {
      setCustomSelected(true);
      return;
    }

    setCustomSelected(false);
    const range = getBookingDateQuickPresetRange(value as BookingDateQuickPreset);
    onFromChange(range.from ?? '');
    onToChange(range.to ?? '');
    onPresetApply(range);
  };

  const showCustomFields = presetValue === 'custom';

  return (
    <div
      className={cn(
        'booking-date-range-filter-panel',
        !embedded &&
          (isAdmin
            ? 'rounded-xl border border-border/80 bg-card p-4 shadow-sm'
            : 'rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm backdrop-blur-sm'),
        embedded && 'space-y-4',
        className,
      )}
    >
      <div className="booking-date-range-filter-panel__header flex items-center justify-between gap-3">
        <Label htmlFor={`${idPrefix}-preset`} className="shrink-0 text-sm font-medium">
          {label}
        </Label>
        <Select value={presetValue} onValueChange={(value) => handlePresetChange(value as BookingDateFilterPreset)}>
          <SelectTrigger
            id={`${idPrefix}-preset`}
            className="booking-date-range-filter-panel__select h-11 w-full max-w-[14rem] shrink-0 rounded-xl"
          >
            <SelectValue placeholder="All dates">{selectedLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={6} className="booking-date-range-filter-panel__select-content">
            {BOOKING_DATE_PRESET_OPTIONS.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showCustomFields && (
        <BookingDateRangeFilter
          bare
          hideActions={!showCustomActions}
          className="mt-3"
          variant={variant}
          idPrefix={idPrefix}
          from={from}
          to={to}
          onFromChange={onFromChange}
          onToChange={onToChange}
          onApply={onApplyCustom}
          onClear={showClear ? handleClear : undefined}
          showClear={showCustomActions && showClear}
        />
      )}
    </div>
  );
}
