import * as React from 'react';
import { cn } from '../../lib/utils';
import { Input } from './input';

export type NumberInputProps = {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  integer?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
};

function clamp(n: number, min?: number, max?: number) {
  let v = n;
  if (min != null) v = Math.max(min, v);
  if (max != null) v = Math.min(max, v);
  return v;
}

function formatDisplay(value: number, integer: boolean) {
  if (!Number.isFinite(value)) return '';
  return integer ? String(Math.round(value)) : String(value);
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onValueChange, min, max, integer = false, className, placeholder, id, disabled }, ref) => {
    const [text, setText] = React.useState(() => formatDisplay(value, integer));
    const focusedRef = React.useRef(false);

    React.useEffect(() => {
      if (!focusedRef.current) setText(formatDisplay(value, integer));
    }, [value, integer]);

    const commit = (raw: string) => {
      const trimmed = raw.trim();
      if (trimmed === '' || trimmed === '-') {
        const fallback = clamp(min ?? 0, min, max);
        onValueChange(fallback);
        setText(formatDisplay(fallback, integer));
        return;
      }
      const parsed = integer ? parseInt(trimmed, 10) : parseFloat(trimmed);
      if (Number.isNaN(parsed)) return;
      const next = clamp(parsed, min, max);
      onValueChange(next);
      setText(formatDisplay(next, integer));
    };

    return (
      <Input
        ref={ref}
        id={id}
        type="text"
        inputMode={integer ? 'numeric' : 'decimal'}
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        className={cn(className)}
        value={text}
        onFocus={() => { focusedRef.current = true; }}
        onBlur={() => { focusedRef.current = false; commit(text); }}
        onChange={(e) => {
          let raw = e.target.value;
          if (integer) raw = raw.replace(/[^\d]/g, '');
          else {
            raw = raw.replace(/[^0-9.-]/g, '');
            const parts = raw.split('.');
            if (parts.length > 2) raw = `${parts[0]}.${parts.slice(1).join('')}`;
          }
          setText(raw);
          if (raw === '' || raw === '-' || raw.endsWith('.')) return;
          const parsed = integer ? parseInt(raw, 10) : parseFloat(raw);
          if (!Number.isNaN(parsed)) onValueChange(clamp(parsed, min, max));
        }}
      />
    );
  },
);
NumberInput.displayName = 'NumberInput';
