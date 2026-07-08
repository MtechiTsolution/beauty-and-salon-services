import { Button } from '@mit-salon/shared/components/ui/button';
import { Card, CardContent } from '@mit-salon/shared/components/ui/card';
import { Input } from '@mit-salon/shared/components/ui/input';
import { Label } from '@mit-salon/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@mit-salon/shared/components/ui/select';
import {
  DEFAULT_SALON_LIST_FILTERS,
  hasActiveSalonFilters,
  SALON_MIN_RATING_OPTIONS,
  type SalonDistanceFilterValue,
  type SalonListFilters,
  type SalonSortOption,
} from '@mit-salon/shared/lib/salon-list-filters';
import { cn } from '@mit-salon/shared/lib/utils';
import { Filter, X } from 'lucide-react';

type SalonFiltersPanelProps = {
  filters: SalonListFilters;
  onChange: (next: SalonListFilters) => void;
  hasLocation: boolean;
  isLocating: boolean;
  resultCount: number;
  totalCount: number;
  className?: string;
};

const SORT_OPTIONS: { value: SalonSortOption; label: string }[] = [
  { value: 'distance', label: 'Nearest first' },
  { value: 'rating', label: 'Top rated' },
  { value: 'name', label: 'Name (A–Z)' },
];

const DISTANCE_OPTIONS: { value: SalonDistanceFilterValue; label: string }[] = [
  { value: 'all', label: 'Any distance' },
  { value: 1, label: 'Within 1 km' },
  { value: 5, label: 'Within 5 km' },
  { value: 10, label: 'Within 10 km' },
  { value: 'custom', label: 'Custom km' },
];

function distanceSelectValue(filters: SalonListFilters): string {
  return String(filters.distance);
}

export function SalonFiltersPanel({
  filters,
  onChange,
  hasLocation,
  isLocating,
  resultCount,
  totalCount,
  className,
}: SalonFiltersPanelProps) {
  const active = hasActiveSalonFilters(filters);
  const patch = (partial: Partial<SalonListFilters>) => onChange({ ...filters, ...partial });
  const distanceNeedsLocation = filters.distance !== 'all' && !hasLocation && !isLocating;

  const setDistance = (raw: string) => {
    if (raw === 'all' || raw === 'custom') {
      patch({
        distance: raw,
        customDistanceKm: raw === 'custom' ? filters.customDistanceKm : '',
      });
      return;
    }
    const km = Number(raw);
    if (km === 1 || km === 5 || km === 10) {
      patch({ distance: km, customDistanceKm: '' });
    }
  };

  return (
    <Card className={cn('customer-salon-filters border-border/70 shadow-sm', className)}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-9 sm:w-9 sm:rounded-xl">
              <Filter className="h-4 w-4" aria-hidden />
            </span>
            <p className="text-xs text-muted-foreground sm:text-sm">
              <span className="font-medium text-foreground">{resultCount}</span> of {totalCount} salons
            </p>
          </div>
          {active ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 gap-1 rounded-full px-2.5 text-xs"
              onClick={() => onChange({ ...DEFAULT_SALON_LIST_FILTERS })}
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          ) : null}
        </div>

        <div className="customer-salon-filters__row mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
          <div className="customer-salon-filters__field min-w-0 space-y-1">
            <Label htmlFor="salon-filter-distance" className="text-[11px] font-medium text-muted-foreground sm:text-xs">
              Distance
            </Label>
            <Select value={distanceSelectValue(filters)} onValueChange={setDistance}>
              <SelectTrigger id="salon-filter-distance" className="customer-salon-filters__select h-10 w-full rounded-xl">
                <SelectValue placeholder="Distance" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={6}>
                {DISTANCE_OPTIONS.map((option) => (
                  <SelectItem key={String(option.value)} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="customer-salon-filters__field min-w-0 space-y-1">
            <Label htmlFor="salon-filter-rating" className="text-[11px] font-medium text-muted-foreground sm:text-xs">
              Rating
            </Label>
            <Select
              value={filters.minRating == null ? 'any' : String(filters.minRating)}
              onValueChange={(value) => patch({ minRating: value === 'any' ? null : Number(value) })}
            >
              <SelectTrigger id="salon-filter-rating" className="customer-salon-filters__select h-10 w-full rounded-xl">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={6}>
                {SALON_MIN_RATING_OPTIONS.map((option) => (
                  <SelectItem key={option.label} value={option.value == null ? 'any' : String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="customer-salon-filters__field min-w-0 space-y-1">
            <Label htmlFor="salon-filter-sort" className="text-[11px] font-medium text-muted-foreground sm:text-xs">
              Sort
            </Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => patch({ sortBy: value as SalonSortOption })}
            >
              <SelectTrigger id="salon-filter-sort" className="customer-salon-filters__select h-10 w-full rounded-xl">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={6}>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filters.distance === 'custom' ? (
            <div className="customer-salon-filters__field customer-salon-filters__field--custom min-w-0 space-y-1 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="salon-filter-custom-km" className="text-[11px] font-medium text-muted-foreground sm:text-xs">
                Custom km
              </Label>
              <Input
                id="salon-filter-custom-km"
                type="number"
                min={0.1}
                step={0.1}
                inputMode="decimal"
                placeholder="e.g. 15"
                value={filters.customDistanceKm}
                onChange={(e) => patch({ customDistanceKm: e.target.value, distance: 'custom' })}
                className="customer-salon-filters__custom-input h-10 rounded-xl"
              />
            </div>
          ) : null}
        </div>

        {distanceNeedsLocation ? (
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
            Enable location above to filter by distance.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
