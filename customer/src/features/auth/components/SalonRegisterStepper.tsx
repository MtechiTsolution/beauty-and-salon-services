import { cn } from '@mit-salon/shared/lib/utils';
import { Check } from 'lucide-react';

const STEPS = [
  { id: 'email', label: 'Email' },
  { id: 'otp', label: 'Verify' },
  { id: 'account', label: 'Account' },
  { id: 'salon', label: 'Salon' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
] as const;

export type SalonRegisterStep = (typeof STEPS)[number]['id'];

type SalonRegisterStepperProps = {
  current: SalonRegisterStep;
};

export function SalonRegisterStepper({ current }: SalonRegisterStepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <ol className="salon-register-stepper mb-8 flex items-center justify-between gap-1">
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <li key={step.id} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-colors',
                done && 'border-primary bg-primary text-primary-foreground',
                active && 'border-primary bg-primary/10 text-primary ring-2 ring-primary/25',
                !done && !active && 'border-border bg-muted/40 text-muted-foreground',
              )}
            >
              {done ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
            </span>
            <span
              className={cn(
                'hidden text-center text-[10px] font-medium uppercase tracking-wide sm:block',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
