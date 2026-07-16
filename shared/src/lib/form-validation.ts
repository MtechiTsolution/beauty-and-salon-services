/** Shared form validation — used by customer web; mirror in mobile-customer/src/lib/validation.ts */

export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 128;
export const MAX_NAME_LENGTH = 100;
export const MAX_NOTES_LENGTH = 500;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_CHAT_MESSAGE_LENGTH = 2000;
export const MAX_REVIEW_COMMENT_LENGTH = 1000;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const OTP_RE = /^\d{6}$/;
export const TIME_HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
/** Digits and common phone punctuation; at least 7 digits when provided. */
export const PHONE_DIGITS_RE = /\d/g;

export type ValidationResult = string | null;

export function trimValue(value: string): string {
  return value.trim();
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function validateRequired(value: string, label = 'This field'): ValidationResult {
  if (!trimValue(value)) return `${label} is required`;
  return null;
}

export function validateEmail(value: string, { required = true } = {}): ValidationResult {
  const trimmed = trimValue(value);
  if (!trimmed) return required ? 'Email is required' : null;
  if (!EMAIL_RE.test(trimmed)) return 'Enter a valid email address';
  return null;
}

export function validateOptionalEmail(value: string): ValidationResult {
  return validateEmail(value, { required: false });
}

export function validatePassword(value: string): ValidationResult {
  const trimmed = trimValue(value);
  if (!trimmed) return 'Password is required';
  if (trimmed.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  if (trimmed.length > MAX_PASSWORD_LENGTH) {
    return `Password must be at most ${MAX_PASSWORD_LENGTH} characters`;
  }
  return null;
}

export function validatePasswordMatch(password: string, confirm: string): ValidationResult {
  if (trimValue(confirm) && password !== confirm) return 'Passwords do not match';
  return null;
}

export function validatePasswordPair(password: string, confirm: string): ValidationResult {
  const passwordError = validatePassword(password);
  if (passwordError) return passwordError;
  if (!trimValue(confirm)) return 'Confirm your password';
  if (password !== confirm) return 'Passwords do not match';
  return null;
}

export function validateFullName(value: string): ValidationResult {
  const trimmed = trimValue(value);
  if (!trimmed) return 'Full name is required';
  if (trimmed.length < 2) return 'Full name must be at least 2 characters';
  if (trimmed.length > MAX_NAME_LENGTH) {
    return `Full name must be at most ${MAX_NAME_LENGTH} characters`;
  }
  return null;
}

export function validatePhone(value: string, { required = false } = {}): ValidationResult {
  const trimmed = trimValue(value);
  if (!trimmed) return required ? 'Phone number is required' : null;
  const digits = trimmed.match(PHONE_DIGITS_RE);
  const count = digits?.length ?? 0;
  if (count < 7) return 'Enter a valid phone number (at least 7 digits)';
  if (count > 15) return 'Phone number is too long';
  return null;
}

export function validateOtp(value: string): ValidationResult {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 'Verification code is required';
  if (!OTP_RE.test(digits)) return 'Enter the 6-digit verification code';
  return null;
}

export function validateTimeHHmm(value: string, label = 'Time'): ValidationResult {
  const trimmed = trimValue(value);
  if (!trimmed) return `${label} is required`;
  if (!TIME_HHMM_RE.test(trimmed)) return `Enter a valid ${label.toLowerCase()} (HH:mm)`;
  return null;
}

export function validateTimeRange(opening: string, closing: string): ValidationResult {
  const openError = validateTimeHHmm(opening, 'Opening time');
  if (openError) return openError;
  const closeError = validateTimeHHmm(closing, 'Closing time');
  if (closeError) return closeError;
  if (opening >= closing) return 'Closing time must be after opening time';
  return null;
}

export function validateSalonName(value: string): ValidationResult {
  const trimmed = trimValue(value);
  if (!trimmed) return 'Salon name is required';
  if (trimmed.length < 2) return 'Salon name must be at least 2 characters';
  if (trimmed.length > 120) return 'Salon name must be at most 120 characters';
  return null;
}

export function validateAddress(value: string): ValidationResult {
  const trimmed = trimValue(value);
  if (!trimmed) return 'Address is required';
  if (trimmed.length < 5) return 'Address must be at least 5 characters';
  if (trimmed.length > 200) return 'Address must be at most 200 characters';
  return null;
}

export function validateMaxLength(
  value: string,
  max: number,
  label = 'This field',
  { required = false } = {},
): ValidationResult {
  const trimmed = trimValue(value);
  if (!trimmed) return required ? `${label} is required` : null;
  if (trimmed.length > max) return `${label} must be at most ${max} characters`;
  return null;
}

export function validateNotes(value: string): ValidationResult {
  return validateMaxLength(value, MAX_NOTES_LENGTH, 'Notes');
}

export function validateDescription(value: string): ValidationResult {
  return validateMaxLength(value, MAX_DESCRIPTION_LENGTH, 'Description');
}

export function validateReviewComment(value: string): ValidationResult {
  return validateMaxLength(value, MAX_REVIEW_COMMENT_LENGTH, 'Comment');
}

export function validateChatMessage(value: string): ValidationResult {
  const trimmed = trimValue(value);
  if (!trimmed) return 'Message cannot be empty';
  if (trimmed.length > MAX_CHAT_MESSAGE_LENGTH) {
    return `Message must be at most ${MAX_CHAT_MESSAGE_LENGTH} characters`;
  }
  return null;
}

export function firstError(...errors: ValidationResult[]): ValidationResult {
  for (const err of errors) {
    if (err) return err;
  }
  return null;
}

export type FieldErrors<T extends string> = Partial<Record<T, ValidationResult>>;

export function hasFieldErrors<T extends string>(errors: FieldErrors<T>): boolean {
  return Object.values(errors).some(Boolean);
}
