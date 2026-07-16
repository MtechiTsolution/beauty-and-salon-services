import * as React from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PasswordInput } from './ui/password-input';
import { cn } from '../lib/utils';

export function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p className="text-xs font-medium text-destructive" role="alert">
      {message}
    </p>
  );
}

export function FieldHint({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="text-xs text-muted-foreground">{message}</p>;
}

type FormFieldShellProps = {
  id: string;
  label: React.ReactNode;
  error?: string | null;
  hint?: string | null;
  className?: string;
  labelExtra?: React.ReactNode;
  children: React.ReactNode;
};

export function FormFieldShell({
  id,
  label,
  error,
  hint,
  className,
  labelExtra,
  children,
}: FormFieldShellProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {labelExtra}
      </div>
      {children}
      <FieldError message={error} />
      {!error ? <FieldHint message={hint} /> : null}
    </div>
  );
}

type FormTextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: React.ReactNode;
  error?: string | null;
  hint?: string | null;
  wrapperClassName?: string;
  labelExtra?: React.ReactNode;
};

export function FormTextField({
  id,
  label,
  error,
  hint,
  className,
  wrapperClassName,
  labelExtra,
  ...props
}: FormTextFieldProps) {
  return (
    <FormFieldShell
      id={id}
      label={label}
      error={error}
      hint={hint}
      className={wrapperClassName}
      labelExtra={labelExtra}
    >
      <Input
        id={id}
        aria-invalid={!!error}
        className={cn(error && 'border-destructive focus-visible:border-destructive', className)}
        {...props}
      />
    </FormFieldShell>
  );
}

type FormPasswordFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  id: string;
  label: React.ReactNode;
  error?: string | null;
  hint?: string | null;
  wrapperClassName?: string;
  labelExtra?: React.ReactNode;
};

export function FormPasswordField({
  id,
  label,
  error,
  hint,
  className,
  wrapperClassName,
  labelExtra,
  ...props
}: FormPasswordFieldProps) {
  return (
    <FormFieldShell
      id={id}
      label={label}
      error={error}
      hint={hint}
      className={wrapperClassName}
      labelExtra={labelExtra}
    >
      <PasswordInput
        id={id}
        aria-invalid={!!error}
        className={cn(error && 'border-destructive focus-visible:border-destructive', className)}
        {...props}
      />
    </FormFieldShell>
  );
}
