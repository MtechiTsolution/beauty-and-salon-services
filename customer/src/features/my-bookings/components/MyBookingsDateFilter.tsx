import { useState } from 'react';
import { BookingDateRangeFilter } from '@mit-salon/shared/components/BookingDateRangeFilter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@mit-salon/shared/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@mit-salon/shared/components/ui/dropdown-menu';
import type { BookingDateQuickPreset } from '@mit-salon/shared/lib/booking-date-filter';
import { cn } from '@mit-salon/shared/lib/utils';
import { CalendarRange, Check } from 'lucide-react';

const QUICK_PRESETS: { id: BookingDateQuickPreset; label: string }[] = [
  { id: 'today', label: "Today's appointments" },
  { id: 'weekly', label: 'This week' },
  { id: 'monthly', label: 'This month' },
  { id: 'three_months', label: 'Last 3 months' },
];

type MyBookingsMobileDateFilterProps = {
  activePreset: BookingDateQuickPreset | 'custom' | null;
  dateFilterActive: boolean;
  from: string;
  to: string;
  showClear: boolean;
  onPresetSelect: (preset: BookingDateQuickPreset) => void;
  onCustomSelect: () => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onApplyCustom: () => void;
  onClear: () => void;
};

export function MyBookingsMobileDateFilter({
  activePreset,
  dateFilterActive,
  from,
  to,
  showClear,
  onPresetSelect,
  onCustomSelect,
  onFromChange,
  onToChange,
  onApplyCustom,
  onClear,
}: MyBookingsMobileDateFilterProps) {
  const [customDialogOpen, setCustomDialogOpen] = useState(false);

  const openCustomDialog = () => {
    onCustomSelect();
    setCustomDialogOpen(true);
  };

  const handleApplyCustom = () => {
    onApplyCustom();
    setCustomDialogOpen(false);
  };

  const isSelected = (value: BookingDateQuickPreset | 'custom' | null) => activePreset === value;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'customer-my-bookings-filter-toggle flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-sm transition-colors',
              dateFilterActive && 'border-primary/40 bg-primary/5 text-primary',
            )}
            aria-label="Filter bookings by date"
          >
            <CalendarRange className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="customer-my-bookings-filter-menu w-48">
          <DropdownMenuItem
            className="justify-between"
            onClick={() => onClear()}
          >
            All bookings
            {isSelected(null) ? <Check className="h-4 w-4 text-primary" /> : <span className="w-4" />}
          </DropdownMenuItem>
          {QUICK_PRESETS.map((preset) => (
            <DropdownMenuItem
              key={preset.id}
              className="justify-between"
              onClick={() => onPresetSelect(preset.id)}
            >
              {preset.label}
              {isSelected(preset.id) ? <Check className="h-4 w-4 text-primary" /> : <span className="w-4" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem className="justify-between" onClick={openCustomDialog}>
            Custom
            {isSelected('custom') ? <Check className="h-4 w-4 text-primary" /> : <span className="w-4" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
        <DialogContent className="customer-my-bookings-custom-dialog max-w-md">
          <DialogHeader>
            <DialogTitle>Custom date range</DialogTitle>
          </DialogHeader>
          <BookingDateRangeFilter
            className="border-0 bg-transparent p-0 shadow-none backdrop-blur-none"
            variant="customer"
            idPrefix="my-bookings-date-mobile"
            from={from}
            to={to}
            onFromChange={onFromChange}
            onToChange={onToChange}
            onApply={handleApplyCustom}
            onClear={
              showClear
                ? () => {
                    onClear();
                    setCustomDialogOpen(false);
                  }
                : undefined
            }
            showClear={showClear}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
