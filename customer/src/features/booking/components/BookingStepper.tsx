import { CUSTOMER_BOOKING_STEPS } from '@/features/booking/lib/booking-steps';
import { cn } from '@mit-salon/shared/lib/utils';
import { Check } from 'lucide-react';

type BookingStepperProps = {
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  /** Step indices that cannot be jumped to (e.g. skipped offering step when a package is prefilled). */
  disabledSteps?: readonly number[];
};

export function BookingStepper({ currentStep, onStepClick, disabledSteps }: BookingStepperProps) {
  const lastIndex = CUSTOMER_BOOKING_STEPS.length - 1;
  const disabled = new Set(disabledSteps ?? []);

  return (
    <nav aria-label="Booking progress" className="booking-stepper mx-auto w-full min-w-0 max-w-full overflow-hidden">
      <ol className="booking-stepper-list mx-auto w-full min-w-0 max-w-full items-start">
        {CUSTOMER_BOOKING_STEPS.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          const leftLineDone = i > 0 && i <= currentStep;
          const rightLineDone = i < lastIndex && i < currentStep;
          const clickable = !!onStepClick && done && !disabled.has(i);

          const dot = (
            <div
              className={cn(
                'booking-stepper-dot flex shrink-0 items-center justify-center rounded-full font-semibold transition-colors',
                done && 'bg-primary text-primary-foreground',
                active && !done && 'bg-accent text-accent-foreground max-md:shadow-sm md:shadow-md md:ring-2 md:ring-accent/30',
                !done && !active && 'bg-muted text-muted-foreground',
                clickable && 'group-hover:brightness-110 group-focus-visible:ring-2 group-focus-visible:ring-primary/40',
              )}
            >
              {done ? <Check className="booking-stepper-check" aria-hidden /> : i + 1}
            </div>
          );

          const label = (
            <span
              className={cn(
                'booking-stepper-label mt-2 block w-full max-w-full px-0 text-center font-medium leading-tight',
                active ? 'text-foreground' : 'text-muted-foreground',
                clickable && 'group-hover:text-foreground',
              )}
            >
              <span className="md:hidden">{step.micro}</span>
              <span className="hidden md:inline">{step.full}</span>
            </span>
          );

          const stepBody = (
            <>
              <div className="booking-stepper-row flex w-full min-w-0 items-center justify-center md:justify-stretch">
                <span
                  aria-hidden
                  className={cn(
                    'booking-stepper-line hidden h-0.5 min-w-0 flex-1 rounded-full transition-colors md:block',
                    i === 0 && 'invisible',
                    leftLineDone ? 'bg-primary' : 'bg-muted',
                  )}
                />
                {dot}
                <span
                  aria-hidden
                  className={cn(
                    'booking-stepper-line hidden h-0.5 min-w-0 flex-1 rounded-full transition-colors md:block',
                    i === lastIndex && 'invisible',
                    rightLineDone ? 'bg-primary' : 'bg-muted',
                  )}
                />
              </div>
              {label}
            </>
          );

          return (
            <li
              key={step.full}
              className="booking-stepper-step flex min-w-0 max-w-full flex-1 flex-col items-center overflow-hidden"
              aria-current={active ? 'step' : undefined}
            >
              {clickable ? (
                <button
                  type="button"
                  className="booking-stepper-button group flex w-full min-w-0 max-w-full flex-col items-center rounded-lg border-0 bg-transparent p-0 text-inherit"
                  onClick={() => onStepClick(i)}
                  aria-label={`Go back to ${step.full}`}
                >
                  {stepBody}
                </button>
              ) : (
                <div className="flex w-full min-w-0 max-w-full flex-col items-center">{stepBody}</div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
