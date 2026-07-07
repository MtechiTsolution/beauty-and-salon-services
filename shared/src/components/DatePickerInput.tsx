import { CalendarDays } from 'lucide-react';
import * as React from 'react';
import { cn } from '../lib/utils';
import { Input } from './ui/input';

type DatePickerInputProps = Omit<React.ComponentProps<typeof Input>, 'type'>;

function openDatePicker(input: HTMLInputElement | null) {
  if (!input || input.disabled) return;
  try {
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }
  } catch {
    /* showPicker may throw outside a user gesture in some browsers */
  }
  input.focus();
  input.click();
}

export const DatePickerInput = React.forwardRef<HTMLInputElement, DatePickerInputProps>(
  ({ className, disabled, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    return (
      <div className="date-picker-input relative w-full">
        <Input
          ref={setRefs}
          type="date"
          disabled={disabled}
          className={cn('date-picker-input-native pr-14', className)}
          {...props}
        />
        <button
          type="button"
          className="date-picker-input-trigger"
          disabled={disabled}
          onClick={() => openDatePicker(inputRef.current)}
          aria-label="Open calendar"
          tabIndex={-1}
        >
          <CalendarDays className="date-picker-input-icon" aria-hidden />
        </button>
      </div>
    );
  },
);
DatePickerInput.displayName = 'DatePickerInput';
