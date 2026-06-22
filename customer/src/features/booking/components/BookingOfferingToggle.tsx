import { Button } from '@mit-salon/shared/components/ui/button';
import { cn } from '@mit-salon/shared/lib/utils';
import { Gift, Scissors } from 'lucide-react';

export type BookingOfferingType = 'service' | 'package';

type BookingOfferingToggleProps = {
  value: BookingOfferingType;
  onChange: (value: BookingOfferingType) => void;
  className?: string;
};

export function BookingOfferingToggle({ value, onChange, className }: BookingOfferingToggleProps) {
  return (
    <div
      className={cn(
        'inline-flex w-full max-w-md rounded-full border border-border bg-muted/40 p-1',
        className,
      )}
      role="group"
      aria-label="Book a service or package"
    >
      <Button
        type="button"
        variant="ghost"
        className={cn(
          'h-11 flex-1 gap-2 rounded-full font-semibold transition-all',
          value === 'service'
            ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:text-primary-foreground'
            : 'text-muted-foreground',
        )}
        onClick={() => onChange('service')}
        aria-pressed={value === 'service'}
      >
        <Scissors className="h-4 w-4" />
        Service
      </Button>
      <Button
        type="button"
        variant="ghost"
        className={cn(
          'h-11 flex-1 gap-2 rounded-full font-semibold transition-all',
          value === 'package'
            ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:text-primary-foreground'
            : 'text-muted-foreground',
        )}
        onClick={() => onChange('package')}
        aria-pressed={value === 'package'}
      >
        <Gift className="h-4 w-4" />
        Package
      </Button>
    </div>
  );
}
