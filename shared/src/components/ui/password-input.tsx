import * as React from 'react';
import { Input } from './input';

/** Password field with show/hide toggle — use only for password and confirm-password inputs. */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<typeof Input>, 'type'>
>((props, ref) => <Input ref={ref} type="password" {...props} />);

PasswordInput.displayName = 'PasswordInput';
