import { DatePickerInput } from '@mit-salon/shared/components/DatePickerInput';
import { PAST_BOOKING_DATE_MESSAGE } from '@mit-salon/shared/lib/booking-slots';
import * as React from 'react';
import { toast } from 'sonner';

type BookingDatePickerInputProps = Omit<
  React.ComponentProps<typeof DatePickerInput>,
  'min' | 'onChange' | 'onBlur'
> & {
  minDate: string;
  value: string;
  onChange: (date: string) => void;
};

function normalizeDateValue(value: string): string {
  return value.slice(0, 10);
}

function isCompleteDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** Customer booking only — blocks manually typed past dates (native min only affects the calendar). */
export function BookingDatePickerInput({
  minDate,
  value,
  onChange,
  onBlur,
  ...props
}: BookingDatePickerInputProps & { onBlur?: React.FocusEventHandler<HTMLInputElement> }) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const revertToValue = React.useCallback(() => {
    if (!inputRef.current) return;
    inputRef.current.value = value;
  }, [value]);

  const rejectPastDate = React.useCallback(() => {
    revertToValue();
    toast.error(PAST_BOOKING_DATE_MESSAGE);
  }, [revertToValue]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = normalizeDateValue(event.target.value);
    if (isCompleteDate(next) && next < minDate) {
      rejectPastDate();
      return;
    }
    onChange(next);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const next = normalizeDateValue(event.target.value);
    if (next && (!isCompleteDate(next) || next < minDate)) {
      revertToValue();
      if (isCompleteDate(next) && next < minDate) {
        rejectPastDate();
      }
    }
    onBlur?.(event);
  };

  return (
    <DatePickerInput
      ref={inputRef}
      min={minDate}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  );
}
