import type { PaymentStatus } from '../types';

/** Pre-paid bookings must be refunded when the appointment is cancelled (any party). */
export function resolvePaymentStatusOnCancel(
  currentPaymentStatus: PaymentStatus | string,
  isCancelling: boolean,
): PaymentStatus | undefined {
  if (!isCancelling) return undefined;
  if (currentPaymentStatus === 'paid') return 'refunded';
  return undefined;
}
