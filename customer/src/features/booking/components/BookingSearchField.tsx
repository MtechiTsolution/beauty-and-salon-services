import { Input } from '@mit-salon/shared/components/ui/input';
import { cn } from '@mit-salon/shared/lib/utils';
import { Search, X } from 'lucide-react';

type BookingSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  resultCount?: number;
  totalCount?: number;
  resultLabel?: string;
  className?: string;
  id?: string;
};

export function BookingSearchField({
  value,
  onChange,
  placeholder,
  resultCount,
  totalCount,
  resultLabel = 'results',
  className,
  id = 'booking-search',
}: BookingSearchFieldProps) {
  const trimmed = value.trim();
  const showCount =
    trimmed.length > 0 && resultCount !== undefined && totalCount !== undefined;

  return (
    <div className={cn('customer-booking-search mx-auto w-full max-w-xl', className)}>
      <div className="customer-booking-search-wrap relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="customer-booking-search-input h-11 rounded-full border-border/80 bg-card pl-9 pr-10 shadow-sm"
          aria-label={placeholder}
          autoComplete="off"
          enterKeyHint="search"
        />
        {trimmed ? (
          <button
            type="button"
            className="customer-booking-search-clear absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            onClick={() => onChange('')}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>
      {showCount ? (
        <p className="mt-2 text-center text-sm text-muted-foreground sm:text-left">
          {resultCount === 0 ? (
            <>No {resultLabel} match &ldquo;{trimmed}&rdquo;</>
          ) : (
            <>
              Showing {resultCount} of {totalCount} {resultLabel}
            </>
          )}
        </p>
      ) : null}
    </div>
  );
}
