import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

const inputClassName =
  'block h-11 min-h-11 w-full box-border rounded-lg border border-input bg-background pl-4 pr-4 py-2.5 text-sm leading-normal shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => {
    const [passwordVisible, setPasswordVisible] = React.useState(false);
    const isPasswordField = type === 'password';

    if (isPasswordField) {
      return (
        <div className="relative w-full">
          <input
            {...props}
            ref={ref}
            type={passwordVisible ? 'text' : 'password'}
            className={cn(inputClassName, 'pr-11', className)}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
            onClick={() => setPasswordVisible((current) => !current)}
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
            aria-pressed={passwordVisible}
          >
            {passwordVisible ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(inputClassName, className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
